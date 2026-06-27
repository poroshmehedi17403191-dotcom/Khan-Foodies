import { prisma } from './prisma';

type SuperAdminCredentials = {
  email: string;
  phone: string;
  password: string;
};

let cached: SuperAdminCredentials | null = null;
let cacheTime = 0;
const CACHE_MS = 30_000;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizePhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.startsWith('880') && digits.length >= 13) {
    return digits.slice(-11);
  }
  return digits.slice(-11);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function fromEnv(): SuperAdminCredentials | null {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim() || '';
  const phone = process.env.SUPER_ADMIN_PHONE?.trim() || '';
  const password = process.env.ADMIN_PASSWORD?.trim() || '';
  if (!email || !phone || !password) return null;
  return { email, phone, password };
}

export async function getSuperAdminCredentials(): Promise<SuperAdminCredentials | null> {
  const now = Date.now();
  if (cached && now - cacheTime < CACHE_MS) {
    return cached;
  }

  try {
    const row = await prisma.superAdmin.findUnique({ where: { id: 'main' } });
    if (row?.email && row.phone && row.password) {
      cached = { email: row.email, phone: row.phone, password: row.password };
      cacheTime = now;
      return cached;
    }
  } catch {
    // fall through to env
  }

  const envCreds = fromEnv();
  if (envCreds) {
    cached = envCreds;
    cacheTime = now;
  }
  return envCreds;
}

export async function verifySuperAdminLogin(
  email: string,
  phone: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  const expected = await getSuperAdminCredentials();

  if (!expected) {
    return { success: false, error: 'Admin credentials are not configured.' };
  }

  if (normalizeEmail(email) !== normalizeEmail(expected.email)) {
    return { success: false, error: 'Invalid email or credentials.' };
  }

  if (normalizePhone(phone) !== normalizePhone(expected.phone)) {
    return { success: false, error: 'Invalid phone or credentials.' };
  }

  if (password !== expected.password) {
    return { success: false, error: 'Incorrect password.' };
  }

  return { success: true };
}

export async function verifyAdminSessionPassword(password: string): Promise<boolean> {
  const expected = await getSuperAdminCredentials();
  return Boolean(expected && password === expected.password);
}
