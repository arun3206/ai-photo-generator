"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobilePageContainer } from "@/components/layout/mobile-page-container";
import { Card } from "@/components/ui/card";
import {
  clearPendingGenerationIntent,
  readPendingGenerationIntent,
  toStartGenerationInput,
  updatePendingGenerationIntent,
  type PendingGenerationIntent,
} from "@/features/portrait-flow/generation-intent-storage";
import {
  getGeneration,
  startGeneration,
} from "@/features/portrait-flow/generation-client";
import {
  createPaymentOrder,
  openRazorpayCheckout,
  verifyPayment,
} from "@/features/portrait-flow/payment-client";
import styles from "./generation-progress.module.css";

type ExperiencePhase = PendingGenerationIntent["phase"] | "POLLING";

const phaseCopy: Record<
  Exclude<ExperiencePhase, "FAILED">,
  { eyebrow: string; title: string; message: string }
> = {
  PREPARING_PAYMENT: {
    eyebrow: "Creating your memory",
    title: "Creating your special moment…",
    message: "Preparing your portrait experience",
  },
  PAYMENT_OPEN: {
    eyebrow: "Secure payment",
    title: "Complete your payment",
    message: "Razorpay Test Checkout is ready for your payment.",
  },
  PAYMENT_VERIFICATION: {
    eyebrow: "Secure payment",
    title: "Confirming your payment…",
    message: "Please keep this page open for a moment.",
  },
  GENERATING: {
    eyebrow: "Creating your memory",
    title: "Creating your special moment…",
    message: "This may take a little while.",
  },
  POLLING: {
    eyebrow: "Creating your memory",
    title: "Creating your special moment…",
    message: "This may take a little while.",
  },
};

export function GenerationProgress({ jobToken }: { jobToken: string }) {
  const router = useRouter();
  const running = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<ExperiencePhase>("PREPARING_PAYMENT");
  const [message, setMessage] = useState(phaseCopy.PREPARING_PAYMENT.message);
  const [failureKind, setFailureKind] = useState<"PAYMENT" | "GENERATION" | null>(null);

  useEffect(() => {
    if (running.current) return;
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const showPhase = (nextPhase: Exclude<ExperiencePhase, "FAILED">) => {
      if (!active) return;
      setFailureKind(null);
      setPhase(nextPhase);
      setMessage(phaseCopy[nextPhase].message);
    };

    const finish = (resultToken: string) => {
      clearPendingGenerationIntent(window.localStorage);
      router.replace(`/result/${encodeURIComponent(resultToken)}`);
    };

    const poll = async () => {
      try {
        const job = await getGeneration(jobToken);
        if (!active) return;
        if (job.status === "complete") {
          finish(job.jobToken);
          return;
        }
        if (job.status === "failed")
          throw new Error(job.errorMessage ?? "We couldn’t finish this portrait.");
        showPhase("POLLING");
        timeout = setTimeout(() => void poll(), 3_000);
      } catch (error) {
        if (!active) return;
        running.current = false;
        setFailureKind("GENERATION");
        setPhase("FAILED");
        setMessage(
          error instanceof Error ? error.message : "We couldn’t finish this portrait.",
        );
      }
    };

    const generate = async (intent: PendingGenerationIntent) => {
      showPhase("GENERATING");
      const job = await startGeneration(toStartGenerationInput(intent));
      if (!active) return;
      if (job.status === "complete") {
        finish(job.jobToken);
        return;
      }
      if (job.status === "failed")
        throw new Error(job.errorMessage ?? "We couldn’t finish this portrait.");
      await poll();
    };

    const payAndGenerate = async (initialIntent: PendingGenerationIntent) => {
      let intent = updatePendingGenerationIntent(window.localStorage, initialIntent, {
        phase: "PREPARING_PAYMENT",
        autoStart: false,
        failureKind: undefined,
      });
      showPhase("PREPARING_PAYMENT");
      try {
        const order = await createPaymentOrder(intent.requestId, intent.templateId);
        if (!active) return;
        intent = updatePendingGenerationIntent(window.localStorage, intent, {
          phase: "PAYMENT_OPEN",
        });
        showPhase("PAYMENT_OPEN");
        const checkoutResult = await openRazorpayCheckout(order);
        if (!active) return;
        intent = updatePendingGenerationIntent(window.localStorage, intent, {
          phase: "PAYMENT_VERIFICATION",
        });
        showPhase("PAYMENT_VERIFICATION");
        await verifyPayment(order.paymentId, checkoutResult);
        if (!active) return;
        intent = updatePendingGenerationIntent(window.localStorage, intent, {
          phase: "GENERATING",
        });
        await generate(intent);
      } catch (error) {
        if (!active) return;
        const kind = intent.phase === "GENERATING" ? "GENERATION" : "PAYMENT";
        updatePendingGenerationIntent(window.localStorage, intent, {
          phase: "FAILED",
          autoStart: false,
          failureKind: kind,
        });
        running.current = false;
        setFailureKind(kind);
        setPhase("FAILED");
        setMessage(
          error instanceof Error
            ? error.message
            : kind === "PAYMENT"
              ? "We couldn’t complete your payment."
              : "We couldn’t finish this portrait.",
        );
      }
    };

    const intent = readPendingGenerationIntent(window.localStorage);
    if (intent?.requestId === jobToken) {
      if (intent.phase === "GENERATING") {
        timeout = setTimeout(() => {
          if (!active) return;
          running.current = true;
          void generate(intent).catch((error: unknown) => {
            if (!active) return;
            updatePendingGenerationIntent(window.localStorage, intent, {
              phase: "FAILED",
              failureKind: "GENERATION",
            });
            running.current = false;
            setFailureKind("GENERATION");
            setPhase("FAILED");
            setMessage(
              error instanceof Error
                ? error.message
                : "We couldn’t finish this portrait.",
            );
          });
        }, 0);
      } else if (intent.autoStart || attempt > 0) {
        timeout = setTimeout(() => {
          if (!active) return;
          running.current = true;
          void payAndGenerate(intent);
        }, 0);
      } else {
        setFailureKind(intent.failureKind ?? "PAYMENT");
        setPhase("FAILED");
        setMessage(
          intent.failureKind === "GENERATION"
            ? "We couldn’t finish this portrait."
            : "Payment was not completed.",
        );
      }
    } else {
      showPhase("POLLING");
      timeout = setTimeout(() => {
        if (!active) return;
        running.current = true;
        void poll();
      }, 0);
    }

    return () => {
      active = false;
      running.current = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [attempt, jobToken, router]);

  const failed = phase === "FAILED";
  const copy = failed
    ? {
        eyebrow: failureKind === "PAYMENT" ? "Payment paused" : "Generation paused",
        title:
          failureKind === "PAYMENT"
            ? "Payment was not completed"
            : "We couldn’t finish this portrait",
      }
    : phaseCopy[phase];

  return (
    <>
      <AppHeader backHref="/create" />
      <MobilePageContainer className={styles.page}>
        <Card className={styles.card}>
          {!failed ? (
            <LoaderCircle className={styles.spinner} aria-hidden="true" />
          ) : null}
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="muted" role="status" aria-live="polite">
            {message}
          </p>
          {failed ? (
            <div className={styles.actions}>
              {failureKind === "PAYMENT" ? (
                <button
                  className="button"
                  type="button"
                  onClick={() => setAttempt((current) => current + 1)}
                >
                  Try Payment Again
                </button>
              ) : null}
              <Link className={styles.secondary} href="/create">
                Back
              </Link>
            </div>
          ) : (
            <small>You can keep this page open while we prepare your portrait.</small>
          )}
        </Card>
      </MobilePageContainer>
    </>
  );
}
