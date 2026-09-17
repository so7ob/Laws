/**
 * Word-level diff utility for comparing Arabic legal text.
 * Uses a simple LCS-based algorithm to identify added/removed/unchanged words.
 */

export interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

/**
 * Split Arabic text into words while preserving whitespace and punctuation.
 */
function tokenize(text: string): string[] {
  // Split on whitespace but keep tokens including attached punctuation
  return text.match(/\S+/g) || []
}

/**
 * Compute LCS (Longest Common Subsequence) table for two word arrays.
 */
function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp
}

/**
 * Backtrack through LCS table to produce diff segments.
 */
function backtrack(
  dp: number[][],
  a: string[],
  b: string[],
  i: number,
  j: number
): DiffSegment[] {
  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    return [...backtrack(dp, a, b, i - 1, j - 1), { type: 'unchanged', text: a[i - 1] }]
  }
  if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    return [...backtrack(dp, a, b, i, j - 1), { type: 'added', text: b[j - 1] }]
  }
  if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
    return [...backtrack(dp, a, b, i - 1, j), { type: 'removed', text: a[i - 1] }]
  }
  return []
}

/**
 * Compute word-level diff between two texts.
 * Returns an array of segments: added (in new text), removed (in old text), unchanged.
 */
export function diffTexts(oldText: string, newText: string): DiffSegment[] {
  if (!oldText && !newText) return []
  if (!oldText) return [{ type: 'added', text: newText }]
  if (!newText) return [{ type: 'removed', text: oldText }]

  const tokensA = tokenize(oldText)
  const tokensB = tokenize(newText)
  const dp = lcsTable(tokensA, tokensB)
  return backtrack(dp, tokensA, tokensB, tokensA.length, tokensB.length)
}

/**
 * Merge consecutive segments of the same type into one.
 */
export function mergeSegments(segments: DiffSegment[]): DiffSegment[] {
  if (segments.length === 0) return []
  const merged: DiffSegment[] = [{ ...segments[0] }]
  for (let i = 1; i < segments.length; i++) {
    const last = merged[merged.length - 1]
    if (last.type === segments[i].type) {
      last.text += ' ' + segments[i].text
    } else {
      merged.push({ ...segments[i] })
    }
  }
  return merged
}

/**
 * Get diff statistics.
 */
export function getDiffStats(oldText: string, newText: string): {
  added: number
  removed: number
  unchanged: number
  total: number
  similarity: number
} {
  const segments = diffTexts(oldText, newText)
  let added = 0
  let removed = 0
  let unchanged = 0
  for (const s of segments) {
    if (s.type === 'added') added++
    else if (s.type === 'removed') removed++
    else unchanged++
  }
  const total = added + removed + unchanged
  return {
    added,
    removed,
    unchanged,
    total,
    similarity: total > 0 ? Math.round((unchanged / total) * 100) : 100,
  }
}
