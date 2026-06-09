/**
 * 校验密码强度
 * 规则：至少8位，且满足以下条件之一：
 *   - 包含大写字母、小写字母、数字
 *   - 包含大写字母、小写字母、特殊符号（非字母数字）
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: '密码长度至少为8位' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // 必须同时包含大小写
  if (!hasUpper || !hasLower) {
    return { valid: false, message: '密码必须同时包含大小写字母' };
  }

  // 组合条件：大写+小写+数字 或 大写+小写+特殊符号
  if ((hasUpper && hasLower && hasDigit) || (hasUpper && hasLower && hasSpecial)) {
    return { valid: true, message: '密码强度合格' };
  }

  return { valid: false, message: '密码必须包含数字或特殊符号（至少一种）' };
}