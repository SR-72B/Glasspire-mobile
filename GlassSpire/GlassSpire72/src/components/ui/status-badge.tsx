import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: 'received' | 'cut' | 'tempered' | 'ready';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "received": return "secondary";
      case "cut": return "outline";
      case "tempered": return "secondary";
      case "ready": return "default";
      default: return "secondary";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "received": return "Order Received";
      case "cut": return "Glass Cut";
      case "tempered": return "Glass Tempered";
      case "ready": return "Ready for Pickup";
      default: return status;
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getLabel()}
    </Badge>
  );
}