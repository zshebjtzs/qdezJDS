import iconv from 'iconv-lite';

export function toUTF8(str) {
  if (!str) return '';
  try {
    // 1. 将当前的乱码字符串视为 Latin1 编码，还原为 Buffer
    const buffer = Buffer.from(str, 'latin1');
    // 2. 用 UTF-8 解码
    const decoded = iconv.decode(buffer, 'utf8');
    // 如果解码后包含中文字符，返回
    if (/[\u4e00-\u9fa5]/.test(decoded)) {
      return decoded;
    }
    // 否则回退到原字符串
    return str;
  } catch (e) {
    console.error('Encoding conversion error:', e);
    return str;
  }
}