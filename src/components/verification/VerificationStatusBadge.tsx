import { Badge } from "@/components/ui/Badge";
import type { PetVerificationStatus } from "@/types";

const statusLabels: Record<PetVerificationStatus, string> = {
  unverified: "Not verified",
  pending: "Pending verification",
  verified: "Verified by veterinary clinic",
  rejected: "Verification rejected",
};

const statusVariants: Record<
  PetVerificationStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  unverified: "neutral",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

type VerificationStatusBadgeProps = {
  status?: PetVerificationStatus | null;
  className?: string;
};

export function getVerificationStatusLabel(
  status?: PetVerificationStatus | null,
) {
  return statusLabels[status ?? "unverified"];
}

export function VerificationStatusBadge({
  status = "unverified",
  className,
}: VerificationStatusBadgeProps) {
  const safeStatus = status ?? "unverified";

  return (
    <Badge variant={statusVariants[safeStatus]} className={className}>
      {statusLabels[safeStatus]}
    </Badge>
  );
}
