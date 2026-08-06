// Crea (o actualiza la contraseña de) un administrador.
// Uso: npx tsx prisma/create-admin.ts <email> <contraseña> [nombre]
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const [emailArg, password, name] = process.argv.slice(2);
  if (!emailArg || !password) {
    console.error("Uso: npx tsx prisma/create-admin.ts <email> <contraseña> [nombre]");
    process.exit(1);
  }
  const email = emailArg.trim().toLowerCase();

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, ...(name ? { name } : {}) },
    create: { email, passwordHash, name: name ?? null },
  });

  console.log(`✅ Admin listo: ${admin.email} (${admin.name ?? "sin nombre"})`);
}

main().finally(() => prisma.$disconnect());
