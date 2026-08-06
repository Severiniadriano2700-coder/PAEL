import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const registration = await prisma.teamRegistration.findUnique({ where: { id: params.id } });
    if (!registration) return NextResponse.json({ error: "Esa inscripción ya no existe." }, { status: 404 });
    if (registration.approvedTeamId) {
      return NextResponse.json({ error: "No se puede rechazar una inscripción ya aprobada." }, { status: 409 });
    }

    await prisma.teamRegistration.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al rechazar la inscripción." }, { status: 500 });
  }
}
