import type { PetVerificationStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

export function PetStatusBadge({
  isLost,
  verificationStatus,
}: {
  isLost: boolean;
  verificationStatus: PetVerificationStatus;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={isLost ? "danger" : "success"}>
        {isLost ? "Lost" : "Safe"}
      </Badge>
      <Badge variant={verificationStatus === "verified" ? "default" : "warning"}>
        {verificationStatus === "verified" ? "Verified" : "Unverified"}
      </Badge>
    </div>
  );
}
