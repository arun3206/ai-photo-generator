"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobilePageContainer } from "@/components/layout/mobile-page-container";
import { Card } from "@/components/ui/card";
import { getGeneration } from "@/features/portrait-flow/generation-client";
import styles from "./generation-progress.module.css";

export function GenerationProgress({ jobToken }: { jobToken: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("Preparing your festive portrait…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      try {
        const job = await getGeneration(jobToken);
        if (!active) return;
        if (job.status === "complete") {
          router.replace(`/result/${job.jobToken}`);
          return;
        }
        if (job.status === "failed") {
          setFailed(true);
          setMessage(job.errorMessage ?? "Portrait generation failed. Please retry.");
          return;
        }
        setMessage(
          job.status === "rendering"
            ? "Creating your portrait while preserving the uploaded identity…"
            : "Your portrait is queued and will begin shortly…",
        );
        timeout = setTimeout(() => void poll(), 3_000);
      } catch (error) {
        if (!active) return;
        setFailed(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Portrait status is temporarily unavailable.",
        );
      }
    }
    void poll();
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [jobToken, router]);

  return (
    <>
      <AppHeader backHref="/create" />
      <MobilePageContainer className={styles.page}>
        <Card className={styles.card}>
          {!failed ? (
            <LoaderCircle className={styles.spinner} aria-hidden="true" />
          ) : null}
          <p className="eyebrow">
            {failed ? "Generation paused" : "Creating your memory"}
          </p>
          <h1>
            {failed
              ? "We couldn’t finish this portrait"
              : "A special moment is taking shape"}
          </h1>
          <p className="muted" role="status" aria-live="polite">
            {message}
          </p>
          {failed ? (
            <Link className="button" href="/create">
              Return to creator
            </Link>
          ) : (
            <small>You can keep this page open. This usually takes a few moments.</small>
          )}
        </Card>
      </MobilePageContainer>
    </>
  );
}
