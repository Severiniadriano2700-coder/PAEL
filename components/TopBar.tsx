import { Bell, MessageCircle, Image as ImageIcon } from "lucide-react";

export default function TopBar({
  userName,
  userRole = "Admin",
}: {
  userName: string;
  userRole?: string;
}) {
  return (
    // En móvil el menú vive en una barra fija propia (ver Sidebar), así que
    // este bloque se desplaza hacia abajo para no quedar tapado por ella.
    <div className="flex items-center justify-end gap-4 px-4 sm:px-6 py-3.5 border-b border-border mt-[57px] md:mt-0">
      <Bell size={17} className="text-muted" />
      <MessageCircle size={17} className="text-muted" />
      <ImageIcon size={17} className="text-muted hidden sm:block" />
      <div className="flex items-center gap-2 pl-3 border-l border-border">
        <div className="w-7 h-7 rounded-full bg-border" />
        <div className="leading-tight">
          <div className="text-xs font-semibold">{userName}</div>
          <div className="text-[10px] text-muted">{userRole}</div>
        </div>
      </div>
    </div>
  );
}
