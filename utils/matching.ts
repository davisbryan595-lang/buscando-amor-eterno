import type { ProfileData } from '@/hooks/useProfile'

// Haversine formula - distance between two lat/lng points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Resolves whether a "looking_for" value matches a given gender value
function lookingForMatchesGender(lookingFor: string, gender: string): boolean {
  const lf = lookingFor.toLowerCase().trim()
  const g = gender.toLowerCase().trim()
  if (['everyone', 'any', 'all', 'anyone'].includes(lf)) return true
  if (lf === 'men' && (g === 'man' || g === 'male')) return true
  if (lf === 'women' && (g === 'woman' || g === 'female')) return true
  return lf === g
}

// Hard filter: both parties must be interested in each other's gender
export function isOrientationCompatible(current: ProfileData, candidate: ProfileData): boolean {
  const cGender = current.gender
  const cLookingFor = current.looking_for
  const dGender = candidate.gender
  const dLookingFor = candidate.looking_for

  // If either side has no data, don't hard-block
  if (!cGender || !cLookingFor || !dGender || !dLookingFor) return true

  return (
    lookingForMatchesGender(cLookingFor, dGender) &&
    lookingForMatchesGender(dLookingFor, cGender)
  )
}

// Jaccard similarity on keywords extracted from free-text prompts
function calculateTextSimilarity(text1: string | null, text2: string | null): number {
  if (!text1 || !text2) return 0

  const keywords = (text: string): Set<string> =>
    new Set(
      text
        .toLowerCase()
        .split(/[\s,.\-!?;:()[\]]+/)
        .filter((w) => w.length >= 3)
    )

  const set1 = keywords(text1)
  const set2 = keywords(text2)
  if (set1.size === 0 && set2.size === 0) return 0

  const intersection = [...set1].filter((w) => set2.has(w)).length
  const union = new Set([...set1, ...set2]).size
  return intersection / union
}

/**
 * Returns a 0-100 compatibility score between the current user and a candidate.
 * Returns 0 immediately when sexual orientation is incompatible (hard filter).
 *
 * Weights:
 *   Sexual Orientation  25 pts  (hard requirement — 0 if incompatible)
 *   Age preference      20 pts  (10 per direction, small flexibility buffer)
 *   Distance            20 pts  (closer = higher, 0 outside radius)
 *   Religion            15 pts  (same = full, different = 30%)
 *   Want Kids           10 pts  (conflict = 0, same = full, other = 70%)
 *   Interests/Values    10 pts  (Jaccard text similarity on prompts)
 */
export function calculateCompatibilityPercentage(
  current: ProfileData,
  candidate: ProfileData
): number {
  // --- Orientation (25 pts, hard filter) ---
  if (!isOrientationCompatible(current, candidate)) return 0
  let score = 25

  // --- Age (20 pts) ---
  if (current.birthday && candidate.birthday) {
    const thisYear = new Date().getFullYear()
    const currentAge = thisYear - new Date(current.birthday).getFullYear()
    const candidateAge = thisYear - new Date(candidate.birthday).getFullYear()

    const myMin = current.age_range_min ?? 18
    const myMax = current.age_range_max ?? 99
    const theirMin = candidate.age_range_min ?? 18
    const theirMax = candidate.age_range_max ?? 99

    // Is candidate within my age preference?
    if (candidateAge >= myMin && candidateAge <= myMax) {
      score += 10
    } else {
      const gap = Math.min(Math.abs(candidateAge - myMin), Math.abs(candidateAge - myMax))
      score += Math.max(0, 10 - gap * 2)
    }

    // Am I within candidate's age preference?
    if (currentAge >= theirMin && currentAge <= theirMax) {
      score += 10
    } else {
      const gap = Math.min(Math.abs(currentAge - theirMin), Math.abs(currentAge - theirMax))
      score += Math.max(0, 10 - gap * 2)
    }
  } else {
    score += 14 // Partial credit when data is missing
  }

  // --- Distance (20 pts) ---
  if (
    current.latitude != null &&
    current.longitude != null &&
    candidate.latitude != null &&
    candidate.longitude != null
  ) {
    const dist = calculateDistance(
      current.latitude,
      current.longitude,
      candidate.latitude,
      candidate.longitude
    )
    const radius = current.distance_radius ?? 100
    if (dist <= radius) {
      // Linear decay; minimum 4 pts if at the edge of radius
      score += Math.max(4, 20 * (1 - dist / radius))
    }
    // Outside radius: 0 pts
  } else {
    score += 10 // Partial credit when location is missing
  }

  // --- Religion (15 pts) ---
  if (current.religion && candidate.religion) {
    score += current.religion === candidate.religion ? 15 : 15 * 0.3
  } else {
    score += 8 // Partial credit
  }

  // --- Want Kids (10 pts) ---
  if (current.wants_kids && candidate.wants_kids) {
    const mine = current.wants_kids.toLowerCase()
    const theirs = candidate.wants_kids.toLowerCase()
    const hardConflict =
      (mine === 'yes' && theirs === 'no') || (mine === 'no' && theirs === 'yes')

    if (mine === theirs) {
      score += 10
    } else if (hardConflict) {
      score += 0
    } else {
      score += 10 * 0.7
    }
  } else {
    score += 7 // Partial credit
  }

  // --- Interests / Values (10 pts, Jaccard text similarity) ---
  const myText =
    [current.prompt_1, current.prompt_2, current.prompt_3, current.prompt_4]
      .filter(Boolean)
      .join(' ') || null

  const theirText =
    [candidate.prompt_1, candidate.prompt_2, candidate.prompt_3, candidate.prompt_4]
      .filter(Boolean)
      .join(' ') || null

  score += calculateTextSimilarity(myText, theirText) * 10

  return Math.round(Math.min(100, Math.max(0, score)))
}
