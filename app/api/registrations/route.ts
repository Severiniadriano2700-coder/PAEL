import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalOrder } from "@/lib/paypal";

const PRICES = {
  LEAGUE: 70,
  TOURNAMENT: 29.99,
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      competitionType, // "LEAGUE" | "TOURNAMENT"
      teamName,
      captainName,
      captainContact,
      playerNames, // array de strings
      paypalOrderId,
      seasonId,
      tournamentId,
    } = body;

    // Validaciones básicas antes de gastar una llamada a PayPal
    if (!teamName || !captainName || !captainContact || !paypalOrderId) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }
    if (!Array.isArray(playerNames) || playerNames.length < 5 || playerNames.length > 6) {
      return NextResponse.json({ error: "El equipo debe tener entre 5 y 6 jugadores." }, { status: 400 });
    }

    const expectedAmount = PRICES[competitionType as keyof typeof PRICES];
    if (!expectedAmount) {
      return NextResponse.json({ error: "Tipo de competición no válido." }, { status: 400 });
    }

    // Verificación real contra los servidores de PayPal
    const { valid } = await verifyPayPalOrder(paypalOrderId, expectedAmount);
    if (!valid) {
      return NextResponse.json({ error: "El pago no se pudo verificar. Contacta con nosotros por Discord." }, { status: 402 });
    }

    const registration = await prisma.teamRegistration.create({
      data: {
        competitionType,
        seasonId: seasonId ?? null,
        tournamentId: tournamentId ?? null,
        teamName,
        captainName,
        captainContact,
        playerNames: playerNames.join(", "),
        amountDue: expectedAmount,
        paymentMethod: "PAYPAL",
        paymentStatus: "PAID",
        paypalOrderId,
      },
    });

    return NextResponse.json({ success: true, registrationId: registration.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error inesperado al procesar la inscripción." }, { status: 500 });
  }
}
