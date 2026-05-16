"use client";

import { QRCodeSVG } from "qrcode.react";
import type { Pet } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function PetQrCode({
  pet,
  url,
}: {
  pet: Pick<Pet, "name" | "publicQrId">;
  url: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Public QR page</CardTitle>
        <CardDescription>
          Share this code to open the public-facing pet profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-lg border border-border bg-white p-4">
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#ffffff"
            fgColor="#102038"
            includeMargin
            title={`${pet.name} public QR code`}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{pet.name}</p>
          <p className="max-w-xs break-all text-xs text-muted">{url}</p>
        </div>
      </CardContent>
    </Card>
  );
}
