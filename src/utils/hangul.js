const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

export function getChosung(str) {
  return Array.from(str)
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00
      if (code < 0 || code > 11171) return ch
      return CHOSUNG[Math.floor(code / 588)]
    })
    .join('')
}
