"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Copy, Download, ExternalLink } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getPublicPetRoute } from "@/constants/routes";
import { cn } from "@/lib/utils";

type PublicQrProfileCardProps = {
  publicQrId: string;
  petName: string;
  className?: string;
};

type CopyStatus = "idle" | "copied" | "unavailable";

function subscribeToOrigin() {
  return () => undefined;
}

function getClientOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function buildPublicPetUrl(publicQrId: string, origin?: string) {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const publicPath = getPublicPetRoute(publicQrId);
  const baseUrl = configuredAppUrl
    ? trimTrailingSlash(configuredAppUrl)
    : origin
      ? trimTrailingSlash(origin)
      : "";

  return `${baseUrl}${publicPath}`;
}

export function PublicQrProfileCard({
  publicQrId,
  petName,
  className,
}: PublicQrProfileCardProps) {
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getClientOrigin,
    getServerOrigin,
  );
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const publicPath = getPublicPetRoute(publicQrId);
  const publicUrl = useMemo(
    () => buildPublicPetUrl(publicQrId, origin),
    [origin, publicQrId],
  );

  useEffect(() => {
    if (copyStatus === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopyStatus("idle"), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  async function handleCopyLink() {
    if (!navigator.clipboard) {
      setCopyStatus("unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("unavailable");
    }
  }

  function handleDownloadQrCode() {
    const canvas = qrCodeRef.current;
    if (!canvas) {
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `${publicQrId}-qr.png`;
    downloadLink.click();
  }

  return (
    <section
      aria-labelledby="public-qr-profile-title"
      className={cn(
        "rounded-[14px] border border-[#1a202c] bg-[#fffaf3] p-4 text-[#1a202c] sm:p-5",
        className,
      )}
    >
      <div className="grid gap-5 sm:grid-cols-[156px_minmax(0,1fr)] sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <div
            className="rounded-[12px] border border-[#e5d8c7] bg-white p-3 shadow-sm"
            data-testid="public-qr-code"
          >
            <QRCodeCanvas
              ref={qrCodeRef}
              value={publicUrl}
              size={132}
              marginSize={1}
              title={`Public QR code for ${petName}`}
            />
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="space-y-2">
            <h2
              id="public-qr-profile-title"
              className="text-[1.1rem] leading-tight font-semibold"
            >
              Public QR profile
            </h2>
            <p className="rounded-[10px] border border-[#e5d8c7] bg-white px-3 py-2 text-sm font-medium break-all text-[#4d443d]">
              {publicUrl}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#ff8a24] px-4 text-sm font-semibold text-white transition hover:bg-[#e87918] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy link
            </button>
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#1a202c] bg-white px-4 text-sm font-semibold text-[#1a202c] transition hover:bg-[#f6efe5] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open public profile
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#1a202c] bg-white px-4 text-sm font-semibold text-[#1a202c] transition hover:bg-[#f6efe5] focus-visible:ring-2 focus-visible:ring-[#1a202c]/25 focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={handleDownloadQrCode}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download QR
            </button>
          </div>

          <p className="min-h-5 text-sm font-medium" aria-live="polite">
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "unavailable"
                ? "Copy unavailable"
                : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
