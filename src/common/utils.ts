import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
) {
  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
}
