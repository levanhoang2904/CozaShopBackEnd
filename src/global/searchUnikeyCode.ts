/* eslint-disable prettier/prettier */
const unikeyToUnicodeMap = {
  a: [
    'a',
    'à',
    'á',
    'ả',
    'ã',
    'ạ',
    'ă',
    'ằ',
    'ắ',
    'ẳ',
    'ẵ',
    'ặ',
    'â',
    'ầ',
    'ấ',
    'ẩ',
    'ẫ',
    'ậ',
  ],
  d: ['d', 'đ'],
  e: ['e', 'è', 'é', 'ẻ', 'ẽ', 'ẹ', 'ê', 'ề', 'ế', 'ể', 'ễ', 'ệ'],
  i: ['i', 'ì', 'í', 'ỉ', 'ĩ', 'ị'],
  o: [
    'o',
    'ò',
    'ó',
    'ỏ',
    'õ',
    'ọ',
    'ô',
    'ồ',
    'ố',
    'ổ',
    'ỗ',
    'ộ',
    'ơ',
    'ờ',
    'ớ',
    'ở',
    'ỡ',
    'ợ',
  ],
  u: ['u', 'ù', 'ú', 'ủ', 'ũ', 'ụ', 'ư', 'ừ', 'ứ', 'ử', 'ữ', 'ự'],
  y: ['y', 'ỳ', 'ý', 'ỷ', 'ỹ', 'ỵ'],
};

export const convertToSearchableFormat = (str) => {
  const searchKey = str.toLowerCase();
  let regexPattern = '';

  for (let i = 0; i < searchKey.length; i++) {
    const char = searchKey[i];
    const chars = unikeyToUnicodeMap[char] || [char];
    regexPattern += `[${chars.join('')}]`;
  }

  return regexPattern;
};
