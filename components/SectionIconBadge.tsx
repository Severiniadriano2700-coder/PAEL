import type { LucideIcon } from "lucide-react";

export default function SectionIconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}
