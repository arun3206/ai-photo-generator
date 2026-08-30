import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PortraitDownloadButton } from "@/features/portrait-flow/components/portrait-download-button";

describe("PortraitDownloadButton", () => {
  const imageUrl = "/api/generations/job-token/output";
  let downloadedFileName: string | undefined;

  beforeEach(() => {
    downloadedFileName = undefined;
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:portrait"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      downloadedFileName =
        document.querySelector<HTMLAnchorElement>("a[download]")?.download;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ["image/png", "my-krishna-portrait.png"],
    ["image/jpeg", "my-krishna-portrait.jpg"],
  ])(
    "downloads the displayed %s output with the correct extension",
    async (type, name) => {
      const blob = new Blob([new Uint8Array([1, 2, 3])], { type });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(blob),
      });
      vi.stubGlobal("fetch", fetchMock);
      render(<PortraitDownloadButton imageUrl={imageUrl} />);

      fireEvent.click(screen.getByRole("button", { name: "Download Portrait" }));

      expect(screen.getByRole("button", { name: "Downloading..." })).toBeDisabled();
      await waitFor(() => expect(downloadedFileName).toBe(name));
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledWith(imageUrl, { credentials: "same-origin" });
      expect(screen.getByRole("button", { name: "Download Portrait" })).toBeEnabled();
    },
  );

  it("shows an actionable message when the portrait cannot be downloaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );
    render(<PortraitDownloadButton imageUrl={imageUrl} />);

    fireEvent.click(screen.getByRole("button", { name: "Download Portrait" }));

    expect(
      await screen.findByText("Unable to download the portrait. Please try again."),
    ).toHaveAttribute("role", "alert");
    expect(screen.getByRole("button", { name: "Download Portrait" })).toBeEnabled();
  });
});
