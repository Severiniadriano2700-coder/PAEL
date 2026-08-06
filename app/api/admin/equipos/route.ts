import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const { name, shortName, primaryColor, secondaryColor, logoUrl } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre del equipo es obligatorio." }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        primaryColor: primaryColor?.trim() || null,
        secondaryColor: secondaryColor?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
      },
    });

    return NextResponse.json({ team });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un equipo con ese nombre." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al crear el equipo." }, { status: 500 });
  }
}
