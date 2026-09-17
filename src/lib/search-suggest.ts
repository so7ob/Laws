/**
 * Arabic text normalization and "Did you mean?" suggestion utility.
 * Handles common Arabic spelling variations and typos.
 */

/**
 * Normalize Arabic text for comparison.
 * - Removes diacritics (tashkeel)
 * - Normalizes alef variants (أ، إ، آ → ا)
 * - Normalizes ya variants (ى → ي)
 * - Normalizes ta marbuta (ة → ه)
 * - Removes tatweel (ـ)
 */
export function normalizeArabic(text: string): string {
  return text
    // Remove tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    // Normalize alef variants
    .replace(/[أإآ]/g, 'ا')
    // Normalize ya variants
    .replace(/ى/g, 'ي')
    // Normalize ta marbuta to ha (for fuzzy matching)
    .replace(/ة/g, 'ه')
    // Remove tatweel
    .replace(/ـ/g, '')
    // Trim and lowercase
    .trim()
    .toLowerCase()
}

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }

  return dp[m][n]
}

/**
 * Generate "Did you mean?" suggestions for a search query.
 * Compares against a dictionary of known terms.
 */
export function suggestQuery(
  query: string,
  dictionary: string[],
  maxDistance: number = 2,
  maxSuggestions: number = 3
): string[] {
  if (!query || query.trim().length < 2) return []
  const normalizedQuery = normalizeArabic(query)

  const suggestions = dictionary
    .map((term) => {
      const normalizedTerm = normalizeArabic(term)
      const distance = levenshtein(normalizedQuery, normalizedTerm)
      const similarity = 1 - distance / Math.max(normalizedQuery.length, normalizedTerm.length)
      return { term, distance, similarity }
    })
    .filter((s) => s.distance <= maxDistance && s.similarity > 0.6)
    .sort((a, b) => a.distance - b.distance || b.similarity - a.similarity)
    .slice(0, maxSuggestions)
    .map((s) => s.term)

  // Remove duplicates
  return [...new Set(suggestions)]
}

/**
 * Common legal terms dictionary for suggestions.
 */
export const LEGAL_TERMS_DICTIONARY = [
  'قانون', 'دستور', 'لائحة', 'قرار', 'مرسوم', 'نظام',
  'مدني', 'جنائي', 'تجاري', 'إداري', 'دولي', 'عمالي',
  'ضريبة', 'ضرائب', 'جمارك', 'مصرف', 'بنك', 'استثمار',
  'عمل', 'عامل', 'أجور', 'إجازة', 'تقاعد', 'تأمين',
  'محكمة', 'قضاء', 'قاضي', 'محامي', 'مرافعة', 'حكم',
  'عقوبة', 'جزاء', 'سجن', 'غرامة', 'إعدام', 'حبس',
  'زواج', 'طلاق', 'ميراث', 'وصية', 'حضانة', 'نفقة',
  'أراضي', 'ملكية', 'عقار', 'إيجار', 'بيع', 'شراء',
  'شركة', 'مؤسسة', 'تجارة', 'تصفية', 'إفلاس', 'وكالة',
  'بيئة', 'صحة', 'تعليم', 'ثقافة', 'رياضة', 'شباب',
  'دفاع', 'أمن', 'شرطة', 'جيش', 'حدود', 'جواز',
  'حكومة', 'وزارة', 'مجلس', 'برلمان', 'نواب', 'شورى',
  'بلدية', 'محلي', 'إقليم', 'محافظة', 'مديرية', 'قرية',
  'ميزانية', 'حساب', 'مالية', 'اقتصاد', 'تنمية', 'مشروع',
  'عقود', 'التزام', 'مسؤولية', 'تعويض', 'ضرر', 'خطأ',
  'حريات', 'حقوق', 'واجبات', 'مواطن', 'أجنبي', 'جنسية',
  'مرور', 'سير', 'مركبة', 'رخصة', 'نقل', 'طرق',
  'زراعة', 'ري', 'ثروة', 'حيوان', 'صيد', 'غابات',
  'كهرباء', 'مياه', 'اتصالات', 'نقل', 'موانئ', 'طيران',
  'إرهاب', 'غسيل', 'أموال', 'مخدرات', 'تهريب', 'تزوير',
]

/**
 * Extract unique words from a list of legislation titles for dictionary expansion.
 */
export function expandDictionary(titles: string[]): string[] {
  const words = new Set<string>(LEGAL_TERMS_DICTIONARY)
  titles.forEach((title) => {
    title.split(/\s+/).forEach((word) => {
      const cleaned = word.replace(/[^\u0600-\u06FF]/g, '').trim()
      if (cleaned.length >= 3) words.add(cleaned)
    })
  })
  return Array.from(words)
}
