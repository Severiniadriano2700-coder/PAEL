"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted hover:text-white hover:bg-surface transition-colors w-full"
    >
      <LogOut size={15} strokeWidth={2} />
      <span className="uppercase text-[11px] tracking-wide font-semibold">Salir</span>
    </button>
  );
}
