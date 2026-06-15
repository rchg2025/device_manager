export function normalizeForSearch(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD') // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ các dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Loại bỏ khoảng trắng thừa
}

export function generateSearchString(...args: (string | null | undefined)[]): string {
  return args
    .filter(Boolean)
    .map(normalizeForSearch)
    .join(' ');
}
