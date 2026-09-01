import React from "react";
import { Badge } from "../ui/Badge";
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getBadgeProps = () => {
    switch (status) {
      case "paid":
      case "settled":
      case "talent_disbursed":
        return {
          variant: "success" as const,
          label: status === "talent_disbursed" ? "Disbursed" : "Settled",
          icon: <CheckCircle2 className="h-3 w-3 shrink-0" />,
        };
      case "processing":
        return {
          variant: "secondary" as const,
          label: "Processing",
          icon: <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />,
        };
      case "overdue":
      case "rejected":
        return {
          variant: "error" as const,
          label: status === "rejected" ? "Rejected" : "Overdue",
          icon: <AlertCircle className="h-3 w-3 shrink-0" />,
        };
      case "awaiting_approval":
      case "pending":
      default:
        return {
          variant: "warning" as const,
          label: status === "awaiting_approval" ? "Awaiting Brand" : "Pending",
          icon: <Clock className="h-3 w-3 shrink-0" />,
        };
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <Badge variant={badgeProps.variant} size="sm" className="gap-1">
      {badgeProps.icon}
      {badgeProps.label}
    </Badge>
  );
}
