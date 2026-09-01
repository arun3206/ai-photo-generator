import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { relationships } from "@/config/relationships";
import { PhotoUploadPage } from "@/features/photo-upload/components/photo-upload-page";
import type { ImageQualityAnalyzer } from "@/features/photo-upload/quality-analyzer";
import type { ImageQualityResult } from "@/features/photo-upload/types";
import { PORTRAIT_FLOW_STORAGE_KEY } from "@/features/portrait-flow/storage";

const mocks = vi.hoisted(() => ({
  startGeneration: vi.fn(),
  push: vi.fn(),
  normalize: vi.fn(),
  prepare: vi.fn(),
  send: vi.fn(),
  finalize: vi.fn(),
  remove: vi.fn(),
  preview: vi.fn(),
  createPaymentOrder: vi.fn(),
  openRazorpayCheckout: vi.fn(),
  verifyPayment: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/features/portrait-flow/generation-client", () => ({
  startGeneration: mocks.startGeneration,
}));
vi.mock("@/features/portrait-flow/payment-client", () => ({
  createPaymentOrder: mocks.createPaymentOrder,
  openRazorpayCheckout: mocks.openRazorpayCheckout,
  verifyPayment: mocks.verifyPayment,
}));
vi.mock("@/features/photo-upload/normalization", () => ({
  normalizePhoto: mocks.normalize,
}));
vi.mock("@/features/photo-upload/upload-client", () => ({
  prepareUpload: mocks.prepare,
  sendPreparedUpload: mocks.send,
  finalizeUpload: mocks.finalize,
  deleteUpload: mocks.remove,
  getPreview: mocks.preview,
}));

const passAnalyzer: ImageQualityAnalyzer = {
  analyze: vi.fn(async (): Promise<ImageQualityResult> => ({
    status: "pass",
    faceCount: 1,
    faceBoundingBox: { x: 0.1, y: 0.1, width: 0.7, height: 0.7 },
    faceSizeRatio: 0.49,
    faceSharpness: 120,
    overallSharpness: 100,
    brightness: 120,
    reasons: [],
  })),
};
const selectedFile = new File([new Uint8Array([1, 2, 3])], "portrait.jpg", {
  type: "image/jpeg",
});

describe("PhotoUploadPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => `blob:${crypto.randomUUID()}`),
    });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    mocks.normalize.mockResolvedValue({
      file: selectedFile,
      width: 800,
      height: 900,
      sourceFormat: "jpeg",
    });
    mocks.prepare.mockImplementation(async ({ role }: { role: string }) => ({
      uploadId:
        role === "first"
          ? "27de847e-8e05-4f44-a78b-b1d19dc0b223"
          : "37de847e-8e05-4f44-a78b-b1d19dc0b224",
      uploadUrl: "/raw",
      uploadKind: "binary",
      uploadHeaders: {},
    }));
    mocks.send.mockImplementation(
      async (_prepared: unknown, _file: File, progress: (value: number) => void) =>
        progress(100),
    );
    mocks.finalize.mockImplementation(async ({ role }: { role: "first" | "second" }) => ({
      assetId:
        role === "first"
          ? "47de847e-8e05-4f44-a78b-b1d19dc0b225"
          : "57de847e-8e05-4f44-a78b-b1d19dc0b226",
      role,
      validationStatus: "pass",
      width: 800,
      height: 900,
    }));
    mocks.startGeneration.mockResolvedValue({
      jobToken: "67de847e-8e05-4f44-a78b-b1d19dc0b227",
      templateId: "rakhi-brother-sister-traditional-001",
      status: "queued",
    });
    mocks.createPaymentOrder.mockResolvedValue({
      paymentId: "67de847e-8e05-4f44-a78b-b1d19dc0b227",
      razorpayOrderId: "order_test",
      razorpayKeyId: "rzp_test_example",
      amount: 4900,
      currency: "INR",
      displayAmount: "₹49",
    });
    mocks.openRazorpayCheckout.mockResolvedValue({
      razorpay_payment_id: "pay_test",
      razorpay_order_id: "order_test",
      razorpay_signature: "a".repeat(64),
    });
    mocks.verifyPayment.mockResolvedValue({ paid: true });
  });

  function selectRelationship(id: string) {
    window.localStorage.setItem(
      PORTRAIT_FLOW_STORAGE_KEY,
      JSON.stringify({ version: 1, relationship: id }),
    );
  }

  it.each(relationships)("uses configured labels for $title", async (relationship) => {
    selectRelationship(relationship.id);
    const view = render(<PhotoUploadPage analyzer={passAnalyzer} />);
    expect(
      await screen.findByRole("heading", { name: relationship.firstPersonLabel }),
    ).toBeVisible();
    if (relationship.photoCount === 2)
      expect(
        screen.getByRole("heading", { name: relationship.secondPersonLabel }),
      ).toBeVisible();
    else
      expect(
        screen.queryByRole("heading", { name: relationship.secondPersonLabel }),
      ).not.toBeInTheDocument();
    view.unmount();
  });

  it("starts the unified flow with relationship selection when state is absent", async () => {
    const { container } = render(<PhotoUploadPage analyzer={passAnalyzer} />);
    expect(
      await screen.findByRole("heading", {
        name: "Choose your portrait experience",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("radio", { name: /&/i })).toHaveLength(4);
    expect(
      container.querySelector(`img[src="${relationships[0]!.image}"]`),
    ).toBeInTheDocument();
  });

  it("provides explicit front-camera inputs with a gallery fallback", async () => {
    selectRelationship("brother-sister");
    const { container } = render(<PhotoUploadPage analyzer={passAnalyzer} />);
    await screen.findByText("Add both photographs");
    const cameraInputs = container.querySelectorAll('input[type="file"][capture="user"]');
    expect(cameraInputs).toHaveLength(2);
    expect(container.querySelectorAll('input[type="file"]:not([capture])')).toHaveLength(
      2,
    );
  });

  it("accepts desktop drag and drop", async () => {
    selectRelationship("mother-child");
    const failAnalyzer: ImageQualityAnalyzer = {
      analyze: vi.fn(async (): Promise<ImageQualityResult> => ({
        status: "fail",
        faceCount: 0,
        faceBoundingBox: null,
        faceSizeRatio: 0,
        faceSharpness: 0,
        overallSharpness: 0,
        brightness: 0,
        reasons: ["no-face"],
      })),
    };
    render(<PhotoUploadPage analyzer={failAnalyzer} />);
    const card = (await screen.findByRole("heading", { name: "Mother’s Photo" })).closest(
      "section",
    );
    fireEvent.drop(card!, { dataTransfer: { files: [selectedFile] } });
    await waitFor(() =>
      expect(mocks.normalize).toHaveBeenCalledWith(selectedFile, expect.any(Function)),
    );
    await screen.findByText(/couldn’t clearly detect a face/i);
  });

  it("explains that both photos must upload before generation", async () => {
    const user = userEvent.setup();
    selectRelationship("brother-sister");
    render(<PhotoUploadPage analyzer={passAnalyzer} />);
    await user.click(await screen.findByRole("button", { name: /Generate/ }));
    expect(
      screen.getByText("Please add and successfully upload both photos first."),
    ).toHaveAttribute("role", "status");
  });

  it("shows a clear browser message when face validation fails", async () => {
    const user = userEvent.setup();
    const failAnalyzer: ImageQualityAnalyzer = {
      analyze: vi.fn(async (): Promise<ImageQualityResult> => ({
        status: "fail",
        faceCount: 0,
        faceBoundingBox: null,
        faceSizeRatio: 0,
        faceSharpness: 0,
        overallSharpness: 0,
        brightness: 0,
        reasons: ["no-face"],
      })),
    };
    selectRelationship("brother-sister");
    render(<PhotoUploadPage analyzer={failAnalyzer} />);
    await user.upload(
      (await screen.findAllByLabelText(/^Choose .+Photo$/))[0]!,
      selectedFile,
    );
    await user.click(screen.getByRole("button", { name: /Generate/ }));
    const messages = screen.getAllByText(
      "We couldn’t clearly detect a face. Please choose a front-facing photograph.",
    );
    expect(messages).toHaveLength(2);
    expect(messages[1]).toHaveAttribute("role", "status");
  });

  it("uploads a photo automatically when quality has only a warning", async () => {
    const user = userEvent.setup();
    const warningAnalyzer: ImageQualityAnalyzer = {
      analyze: vi.fn(async (): Promise<ImageQualityResult> => ({
        status: "warning",
        faceCount: 1,
        faceBoundingBox: { x: 0.35, y: 0.2, width: 0.15, height: 0.2 },
        faceSizeRatio: 0.03,
        faceSharpness: 120,
        overallSharpness: 100,
        brightness: 120,
        reasons: ["face-too-small"],
      })),
    };
    selectRelationship("brother-sister");
    render(<PhotoUploadPage analyzer={warningAnalyzer} />);

    await user.upload(
      (await screen.findAllByLabelText(/^Choose .+Photo$/))[0]!,
      selectedFile,
    );

    await waitFor(() =>
      expect(mocks.finalize).toHaveBeenCalledWith(
        expect.objectContaining({ clientQualityStatus: "warning-accepted" }),
      ),
    );
    expect(
      await screen.findByText(
        "Photo uploaded. A closer or clearer photo may give a better result.",
      ),
    ).toBeVisible();
  });

  it("retries storage without making the user select the photo again", async () => {
    const user = userEvent.setup();
    mocks.prepare.mockRejectedValueOnce(
      new Error("Photo storage is temporarily unavailable. Please retry in a moment."),
    );
    selectRelationship("brother-sister");
    render(<PhotoUploadPage analyzer={passAnalyzer} />);

    await user.upload(
      (await screen.findAllByLabelText(/^Choose .+Photo$/))[0]!,
      selectedFile,
    );
    await user.click(await screen.findByRole("button", { name: "Retry Upload" }));

    expect(await screen.findByText("Photo looks good")).toBeVisible();
    expect(mocks.prepare).toHaveBeenCalledTimes(2);
  });

  it("starts Rakhi generation after the unified flow is complete", async () => {
    const user = userEvent.setup();
    selectRelationship("brother-sister");
    render(<PhotoUploadPage analyzer={passAnalyzer} />);
    const inputs = await screen.findAllByLabelText(/^Choose .+Photo$/);
    await user.upload(inputs[0]!, selectedFile);
    await user.upload(inputs[1]!, selectedFile);
    const generateButton = await screen.findByRole("button", { name: /Generate/ });
    expect(generateButton).toBeEnabled();
    await user.click(
      screen.getByRole("radio", { name: "Traditional Rakhi Celebration" }),
    );
    await user.click(generateButton);
    expect(
      screen.getByText("Please confirm that you have permission to use the photos."),
    ).toHaveAttribute("role", "status");
    await user.click(screen.getByRole("checkbox", { name: /permission/i }));
    await user.click(generateButton);
    await waitFor(() =>
      expect(mocks.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: "rakhi-brother-sister-traditional-001",
          brotherAssetId: "47de847e-8e05-4f44-a78b-b1d19dc0b225",
          sisterAssetId: "57de847e-8e05-4f44-a78b-b1d19dc0b226",
        }),
      ),
    );
    expect(mocks.createPaymentOrder).toHaveBeenCalledWith(
      expect.any(String),
      "rakhi-brother-sister-traditional-001",
    );
    expect(mocks.verifyPayment).toHaveBeenCalledOnce();
    expect(mocks.verifyPayment.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.startGeneration.mock.invocationCallOrder[0]!,
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/create/generating?jobToken=67de847e-8e05-4f44-a78b-b1d19dc0b227",
    );
  });

  it("does not generate when Razorpay Checkout is cancelled", async () => {
    const user = userEvent.setup();
    selectRelationship("janmashtami-child");
    mocks.openRazorpayCheckout.mockRejectedValueOnce(
      new Error("Payment was not completed."),
    );
    render(<PhotoUploadPage analyzer={passAnalyzer} />);
    await user.upload(await screen.findByLabelText("Choose Child’s Photo"), selectedFile);
    await user.click(screen.getByRole("radio", { name: "Makhan Chor Krishna" }));
    await user.click(screen.getByRole("checkbox", { name: /permission/i }));
    await user.click(screen.getByRole("button", { name: /Generate Portrait/ }));
    expect(await screen.findByText("Payment was not completed.")).toBeVisible();
    expect(mocks.verifyPayment).not.toHaveBeenCalled();
    expect(mocks.startGeneration).not.toHaveBeenCalled();
  });

  it("starts Janmashtami generation with exactly one child photo", async () => {
    const user = userEvent.setup();
    selectRelationship("janmashtami-child");
    mocks.startGeneration.mockResolvedValueOnce({
      jobToken: "77de847e-8e05-4f44-a78b-b1d19dc0b228",
      templateId: "janmashtami-krishna-makhan-001",
      status: "complete",
    });
    const { container } = render(<PhotoUploadPage analyzer={passAnalyzer} />);
    expect(
      await screen.findByRole("radio", { name: "Makhan Chor Krishna" }),
    ).toBeVisible();
    expect(container.querySelectorAll('input[type="file"]:not([capture])')).toHaveLength(
      1,
    );
    await user.upload(screen.getByLabelText("Choose Child’s Photo"), selectedFile);
    await user.click(screen.getByRole("radio", { name: "Makhan Chor Krishna" }));
    await user.click(screen.getByRole("checkbox", { name: /permission/i }));
    await user.click(screen.getByRole("button", { name: /Generate/ }));
    await waitFor(() =>
      expect(mocks.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          templateId: "janmashtami-krishna-makhan-001",
          childAssetId: "47de847e-8e05-4f44-a78b-b1d19dc0b225",
        }),
      ),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      "/create/generating?jobToken=77de847e-8e05-4f44-a78b-b1d19dc0b228",
    );
  });

  it("shows photo privacy, price, and linked child-photo consent before generation", async () => {
    selectRelationship("janmashtami-child");
    render(<PhotoUploadPage analyzer={passAnalyzer} />);
    await screen.findByText("Add the child photograph");
    expect(screen.getByText("₹49")).toBeVisible();
    expect(screen.getByText("1 AI Portrait Generation")).toBeVisible();
    expect(screen.getByRole("button", { name: "Generate Portrait — ₹49" })).toBeVisible();
    expect(
      screen.getByText(/Sanitized uploads are kept privately for up to 24 hours/i),
    ).toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: /parent or legal guardian/i }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy-policy",
    );
    expect(screen.getByRole("link", { name: "Terms & Conditions" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("revokes local previews when the component is removed", async () => {
    const user = userEvent.setup();
    selectRelationship("father-child");
    const view = render(<PhotoUploadPage analyzer={passAnalyzer} />);
    await user.upload(
      (await screen.findAllByLabelText(/^Choose .+Photo$/))[0]!,
      selectedFile,
    );
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
