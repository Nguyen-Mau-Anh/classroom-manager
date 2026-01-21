import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}
