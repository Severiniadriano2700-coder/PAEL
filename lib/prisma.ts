import { PrismaClient } from "@prisma/client";

// Evita crear una nueva conexión a la base de datos en cada recarga
// durante el desarrollo (Next.js recarga módulos constantemente).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
