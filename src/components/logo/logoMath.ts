/** Shared timeline helpers for Hamyan logo animation (web port of mobile). */

export const BRAND = '#1463F3'
export const DURATION_MS = 5800
export const HOLD_MS = 900

/** One full play cycle including the end hold — use for app splash timing. */
export const LOGO_ANIMATION_TOTAL_MS = DURATION_MS + HOLD_MS

export const SHAPE_END = 0.55
export const LAST_BAR_PHASE_END = 0.56
export const LINE_START = LAST_BAR_PHASE_END * SHAPE_END
export const LINE_END = 0.6

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function interpolate(
  progress: number,
  inputRange: number[],
  outputRange: number[],
): number {
  if (inputRange.length !== outputRange.length || inputRange.length < 2) {
    return outputRange[0] ?? 0
  }

  if (progress <= inputRange[0]) return outputRange[0]
  if (progress >= inputRange[inputRange.length - 1]) {
    return outputRange[outputRange.length - 1]
  }

  for (let i = 0; i < inputRange.length - 1; i += 1) {
    const i0 = inputRange[i]
    const i1 = inputRange[i + 1]
    if (progress >= i0 && progress <= i1) {
      const t = i1 === i0 ? 0 : (progress - i0) / (i1 - i0)
      return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * t
    }
  }

  return outputRange[outputRange.length - 1]
}

export function barPhase(progress: number, start: number, end: number) {
  return interpolate(progress, [start * SHAPE_END, end * SHAPE_END], [0, 1])
}

export function approxBezierLength(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
) {
  let length = 0
  let px = x0
  let py = y0
  for (let i = 1; i <= 12; i += 1) {
    const t = i / 12
    const u = 1 - t
    const x = u ** 3 * x0 + 3 * u ** 2 * t * x1 + 3 * u * t ** 2 * x2 + t ** 3 * x3
    const y = u ** 3 * y0 + 3 * u ** 2 * t * y1 + 3 * u * t ** 2 * y2 + t ** 3 * y3
    length += Math.hypot(x - px, y - py)
    px = x
    py = y
  }
  return length
}

export type SnakePaths = {
  up: string
  right: string
  down: string
  upLen: number
  rightLen: number
  downLen: number
}

export function buildSnakePaths(
  firstTop: number,
  firstLeft: number,
  secLeft: number,
  secTop: number,
  thirdTop: number,
  thirdLeft: number,
  fourthTop: number,
  fourthLeft: number,
  barW: number,
  barH: number,
): SnakePaths {
  const upSx = firstLeft + barW * 0.55
  const upSy = firstTop + barH
  const upEx = secLeft + barW * 0.6125
  const upEy = secTop
  const upC1x = upSx + barW * 1.05
  const upC1y = upSy + barH * 0.15
  const upC2x = upEx - barW * 0.85
  const upC2y = upEy - barH * 0.75

  const rightSy = secTop + barW * 0.44 + barH * 0.0625
  const rightSx = fourthLeft + barW * 0.15
  const rightEx = secLeft + barW * 0.95
  const rightEy = rightSy
  const rightC1x = rightSx - barW * 0.9
  const rightC1y = rightSy + barH * 0.5
  const rightC2x = rightEx + barW * 0.75
  const rightC2y = rightEy - barH * 0.55

  const downSx = thirdLeft + barW * 0.56
  const downSy = thirdTop
  const downEx = secLeft + barW * 0.6125
  const downEy = secTop + barH
  const downC1x = downSx - barW * 0.95
  const downC1y = downSy - barH * 0.2
  const downC2x = downEx + barW * 0.75
  const downC2y = downEy + barH * 0.85

  return {
    up: `M ${upSx} ${upSy} C ${upC1x} ${upC1y} ${upC2x} ${upC2y} ${upEx} ${upEy}`,
    right: `M ${rightSx} ${rightSy} C ${rightC1x} ${rightC1y} ${rightC2x} ${rightC2y} ${rightEx} ${rightEy}`,
    down: `M ${downSx} ${downSy} C ${downC1x} ${downC1y} ${downC2x} ${downC2y} ${downEx} ${downEy}`,
    upLen: approxBezierLength(upSx, upSy, upC1x, upC1y, upC2x, upC2y, upEx, upEy),
    rightLen: approxBezierLength(rightSx, rightSy, rightC1x, rightC1y, rightC2x, rightC2y, rightEx, rightEy),
    downLen: approxBezierLength(downSx, downSy, downC1x, downC1y, downC2x, downC2y, downEx, downEy),
  }
}

export function morphFromPhase(phase: number) {
  return {
    numberOpacity: interpolate(phase, [0, 0.7, 0.84, 1], [1, 1, 0.15, 0]),
    numberScale: interpolate(phase, [0, 0.7, 0.88, 1], [1, 1, 0.45, 0]),
    squareOpacity: interpolate(phase, [0, 0.7, 0.76, 1], [0, 0, 1, 1]),
    squareScale: interpolate(phase, [0, 0.7, 0.84, 0.94, 1], [0, 0, 0.5, 1.1, 1]),
  }
}

export function snakeDrawOffset(p: number, length: number) {
  return interpolate(p, [0, 0.03, 1], [length, length * 0.96, 0])
}

export function snakeOpacity(p: number) {
  return interpolate(p, [0, 0.72, 0.88, 1], [1, 1, 0.15, 0])
}

export function classicOpacity(p: number) {
  return interpolate(p, [0, 0.68, 0.84, 1], [0, 0, 1, 1])
}

export function classicScale(p: number) {
  return interpolate(p, [0, 0.68, 0.84, 1], [0, 0, 1, 1])
}
