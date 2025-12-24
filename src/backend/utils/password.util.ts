// Password Utility / 密码工具
// Password hashing and validation using bcryptjs
// 使用 bcryptjs 进行密码哈希和验证

import * as bcrypt from "bcryptjs";

/**
 * Salt rounds for bcrypt hashing
 * bcrypt 哈希的 salt rounds
 *
 * Higher value = more secure but slower
 * 更高的值 = 更安全但更慢
 * 10 is a good balance between security and performance
 * 10 是安全性和性能之间的良好平衡
 */
const SALT_ROUNDS = 10;

/**
 * Minimum password requirements
 * 最小密码要求
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireLetters: true,
};

/**
 * Hash a plain text password
 * 哈希明文密码
 *
 * @param password - Plain text password / 明文密码
 * @returns Hashed password / 哈希后的密码
 *
 * @example
 * const hashedPassword = await hashPassword("user123456");
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(
      `Failed to hash password: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Verify a password against a hash
 * 验证密码是否匹配哈希值
 *
 * @param password - Plain text password to verify / 要验证的明文密码
 * @param hashedPassword - Hashed password to compare against / 要比较的哈希密码
 * @returns True if password matches / 如果密码匹配则返回 true
 *
 * @example
 * const isValid = await verifyPassword("user123456", hashedPassword);
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    throw new Error(
      `Failed to verify password: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate password strength
 * 验证密码强度
 *
 * @param password - Password to validate / 要验证的密码
 * @returns Object with isValid flag and error message / 返回包含 isValid 标志和错误消息的对象
 *
 * @example
 * const validation = validatePasswordStrength("user123456");
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  // Check minimum length / 检查最小长度
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    };
  }

  // Check for numbers / 检查是否包含数字
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  // Check for letters / 检查是否包含字母
  if (PASSWORD_REQUIREMENTS.requireLetters && !/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one letter",
    };
  }

  return { isValid: true };
}

/**
 * Generate a random password
 * 生成随机密码
 *
 * @param length - Password length (default: 12) / 密码长度（默认：12）
 * @returns Random password / 随机密码
 *
 * @example
 * const randomPassword = generateRandomPassword(16);
 */
export function generateRandomPassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + special;
  let password = "";

  // Ensure at least one character from each category / 确保每个类别至少有一个字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters / 用随机字符填充剩余部分
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password / 打乱密码顺序
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
