import { Menu, Bell, MessageCircle, Image as ImageIcon } from "lucide-react";

export default function TopBar({
  userName,
  userRole = "Admin",
}: {
  userName: string;
  userRole?: string;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-border">
      <Menu size={18} className="text-muted" />
      <div className="flex items-center gap-4">
        <Bell size={17} className="text-muted" />
        <MessageCircle size={17} className="text-muted" />
        <ImageIcon size={17} className="text-muted" />
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-border" />
          <div className="leading-tight">
            <div className="text-xs font-semibold">{userName}</div>
            <div className="text-[10px] text-muted">{userRole}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
