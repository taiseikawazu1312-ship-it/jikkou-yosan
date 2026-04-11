import { PrismaClient } from '.prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance;

  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  prismaInstance = new PrismaClient({ adapter } as any);

  return prismaInstance;
}
