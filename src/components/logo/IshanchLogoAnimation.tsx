import { useMemo, type CSSProperties } from 'react'

import {
  BRAND,
  HOLD_MS,
  LINE_END,
  LINE_START,
  LAST_BAR_PHASE_END,
  barPhase,
  buildSnakePaths,
  classicOpacity,
  classicScale,
  interpolate,
  morphFromPhase,
  snakeDrawOffset,
  snakeOpacity,
} from './logoMath'
import { useLogoProgress } from './useLogoProgress'

export { LOGO_ANIMATION_TOTAL_MS } from './logoMath'

type Props = {
  size?: number
  className?: string
  style?: CSSProperties
  loop?: boolean
  holdMs?: number
}

function BarCell({
  digit,
  barH,
  phase,
  containerOpacity,
  transform,
}: {
  digit: string
  barH: number
  phase: number
  containerOpacity: number
  transform: string
}) {
  const morph = morphFromPhase(phase)

  return (
    <div
      className="ishanch-logo__bar-cell"
      style={{ opacity: containerOpacity, transform }}
    >
      <div
        className="ishanch-logo__bar-square"
        style={{
          opacity: morph.squareOpacity,
          transform: `scale(${morph.squareScale})`,
        }}
      />
      <div
        className="ishanch-logo__bar-number-wrap"
        style={{
          opacity: morph.numberOpacity,
          transform: `scale(${morph.numberScale})`,
        }}
      >
        <span className="ishanch-logo__bar-number" style={{ fontSize: barH * 0.82 }}>
          {digit}
        </span>
      </div>
    </div>
  )
}

/** Animated Hamyan logo — bars first, snake lines crawl in, then settle to classic shape. */
export function HamyanLogoAnimation({
  size = 100,
  className,
  style,
  loop = false,
  holdMs = HOLD_MS,
}: Props) {
  const progress = useLogoProgress(loop, holdMs)
  const pct = (value: number) => (size * value) / 100

  const barW = pct(11.8)
  const barH = pct(12.1)
  const r = size / 2

  const firstTop = pct(20.3)
  const firstLeft = pct(33.5)
  const secLeft = pct(33.5)
  const secTop = pct(44.6)
  const thirdTop = pct(67)
  const thirdLeft = pct(33.5)
  const fourthTop = pct(44.6)
  const fourthLeft = pct(65)

  const snakePaths = useMemo(
    () =>
      buildSnakePaths(
        firstTop,
        firstLeft,
        secLeft,
        secTop,
        thirdTop,
        thirdLeft,
        fourthTop,
        fourthLeft,
        barW,
        barH,
      ),
    [barH, barW, firstLeft, firstTop, fourthLeft, fourthTop, secLeft, secTop, thirdLeft, thirdTop],
  )

  const circlePhase = barPhase(progress, 0, 0.46)

  const circleOuterScale = interpolate(circlePhase, [0, 0.45, 0.72, 0.88, 1], [0, 0.62, 0.96, 1.07, 1])
  const circleOpacity = interpolate(circlePhase, [0, 0.1, 1], [0, 1, 1])
  const circleRotate = interpolate(circlePhase, [0, 0.55, 0.82, 1], [-14, 4, -1.5, 0])
  const circleInnerScale = interpolate(circlePhase, [0, 0.25, 0.5, 0.75, 1], [0.4, 0.4, 0.65, 0.85, 1])
  const tlRadius = interpolate(circlePhase, [0, 0.5, 0.75, 1], [0, size * 0.25, size * 0.25, r])
  const trRadius = interpolate(circlePhase, [0, 0.5, 0.75, 1], [0, 0, size * 0.5, r])
  const blRadius = interpolate(circlePhase, [0, 0.5, 0.75, 1], [0, 0, size * 0.5, r])
  const brRadius = interpolate(circlePhase, [0, 0.5, 0.75, 1], [0, size * 0.25, size * 0.25, r])

  const secPhase = barPhase(progress, 0.06, 0.4)
  const firstPhase = barPhase(progress, 0.12, 0.46)
  const fourthPhase = barPhase(progress, 0.2, 0.52)
  const thirdPhase = barPhase(progress, 0.28, LAST_BAR_PHASE_END)

  const secRotate = interpolate(secPhase, [0, 1], [180, 0])
  const secTranslateY = interpolate(secPhase, [0, 0.6, 0.82, 1], [barH * 0.8, -barH * 0.18, barH * 0.06, 0])
  const secOpacity = interpolate(secPhase, [0, 0.04, 1], [0, 1, 1])

  const firstTranslateY = interpolate(firstPhase, [0, 0.72, 0.86, 1], [-barH * 3.2, barH * 0.22, -barH * 0.1, 0])
  const firstTranslateX = interpolate(firstPhase, [0, 0.5, 0.78, 1], [-barW * 0.35, barW * 0.2, -barW * 0.08, 0])
  const firstRotate = interpolate(firstPhase, [0, 0.7, 1], [-18, 6, 0])
  const firstOpacity = interpolate(firstPhase, [0, 0.04, 1], [0, 1, 1])

  const fourthTranslateX = interpolate(fourthPhase, [0, 0.72, 0.88, 1], [size * 0.55, -barW * 0.25, barW * 0.12, 0])
  const fourthTranslateY = interpolate(fourthPhase, [0, 0.6, 0.85, 1], [-barH * 0.35, barH * 0.15, -barH * 0.05, 0])
  const fourthRotate = interpolate(fourthPhase, [0, 0.75, 1], [58, -5, 0])
  const fourthOpacity = interpolate(fourthPhase, [0, 0.04, 1], [0, 1, 1])

  const thirdTranslateY = interpolate(thirdPhase, [0, 0.72, 0.86, 1], [barH * 3.2, -barH * 0.22, barH * 0.1, 0])
  const thirdTranslateX = interpolate(thirdPhase, [0, 0.5, 0.78, 1], [barW * 0.35, -barW * 0.2, barW * 0.08, 0])
  const thirdRotate = interpolate(thirdPhase, [0, 0.7, 1], [18, -6, 0])
  const thirdOpacity = interpolate(thirdPhase, [0, 0.04, 1], [0, 1, 1])

  const lineProgressUp = interpolate(progress, [LINE_START, LINE_END], [0, 1])
  const lineProgressRight = interpolate(progress, [LINE_START + 0.01, LINE_END], [0, 1])
  const lineProgressDown = interpolate(progress, [LINE_START + 0.02, LINE_END], [0, 1])

  const snakeUpOffset = snakeDrawOffset(lineProgressUp, snakePaths.upLen)
  const snakeRightOffset = snakeDrawOffset(lineProgressRight, snakePaths.rightLen)
  const snakeDownOffset = snakeDrawOffset(lineProgressDown, snakePaths.downLen)

  const lineUpRotate = interpolate(lineProgressUp, [0.68, 0.84, 1], [0, -20, -26])
  const lineDownRotate = interpolate(lineProgressDown, [0.68, 0.84, 1], [0, 12, 16])

  const classicUpOpacity = classicOpacity(lineProgressUp)
  const classicRightOpacity = classicOpacity(lineProgressRight)
  const classicDownOpacity = classicOpacity(lineProgressDown)
  const classicUpScale = classicScale(lineProgressUp)
  const classicRightScale = classicScale(lineProgressRight)
  const classicDownScale = classicScale(lineProgressDown)

  const barFrame = (top: number, left: number): CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width: barW,
    height: barH,
  })

  return (
    <div
      className={['ishanch-logo', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <div
        className="ishanch-logo__outer"
        style={{
          width: size,
          height: size,
          opacity: circleOpacity,
          transform: `scale(${circleOuterScale}) rotate(${circleRotate}deg)`,
        }}
      >
        <div
          className="ishanch-logo__circle"
          style={{
            width: size,
            height: size,
            backgroundColor: BRAND,
            transform: `scale(${circleInnerScale})`,
            borderTopLeftRadius: tlRadius,
            borderTopRightRadius: trRadius,
            borderBottomLeftRadius: blRadius,
            borderBottomRightRadius: brRadius,
          }}
        >
          <div style={barFrame(firstTop, firstLeft)}>
            <BarCell
              digit="1"
              barH={barH}
              phase={firstPhase}
              containerOpacity={firstOpacity}
              transform={`translate(${firstTranslateX}px, ${firstTranslateY}px) rotate(${firstRotate}deg)`}
            />
          </div>

          <div style={barFrame(secTop, secLeft)}>
            <BarCell
              digit="2"
              barH={barH}
              phase={secPhase}
              containerOpacity={secOpacity}
              transform={`translateY(${secTranslateY}px) rotate(${secRotate}deg)`}
            />
          </div>

          <div style={barFrame(thirdTop, thirdLeft)}>
            <BarCell
              digit="3"
              barH={barH}
              phase={thirdPhase}
              containerOpacity={thirdOpacity}
              transform={`translate(${thirdTranslateX}px, ${thirdTranslateY}px) rotate(${thirdRotate}deg)`}
            />
          </div>

          <div style={barFrame(fourthTop, fourthLeft)}>
            <BarCell
              digit="4"
              barH={barH}
              phase={fourthPhase}
              containerOpacity={fourthOpacity}
              transform={`translate(${fourthTranslateX}px, ${fourthTranslateY}px) rotate(${fourthRotate}deg)`}
            />
          </div>

          <div className="ishanch-logo__snake" aria-hidden="true">
            <svg width={size} height={size}>
              <path
                d={snakePaths.up}
                stroke="#fff"
                strokeWidth={barW * 0.125}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={snakePaths.upLen}
                strokeDashoffset={snakeUpOffset}
                opacity={snakeOpacity(lineProgressUp)}
              />
              <path
                d={snakePaths.right}
                stroke="#fff"
                strokeWidth={barH * 0.125}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={snakePaths.rightLen}
                strokeDashoffset={snakeRightOffset}
                opacity={snakeOpacity(lineProgressRight)}
              />
              <path
                d={snakePaths.down}
                stroke="#fff"
                strokeWidth={barW * 0.125}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={snakePaths.downLen}
                strokeDashoffset={snakeDownOffset}
                opacity={snakeOpacity(lineProgressDown)}
              />
            </svg>
          </div>

          <div
            className="ishanch-logo__classic-lines"
            style={{ left: secLeft, top: secTop, width: barW, height: barH }}
          >
            <div
              className="ishanch-logo__line-up"
              style={{
                left: barW * 0.55,
                top: -barW * 1.2,
                width: barW * 0.125,
                height: barH * 1.5,
                opacity: classicUpOpacity,
                transform: `rotate(${lineUpRotate}deg)`,
              }}
            >
              <div
                className="ishanch-logo__line-fill ishanch-logo__line-fill--up"
                style={{ transform: `scale(${classicUpScale})` }}
              />
            </div>
            <div
              className="ishanch-logo__line-right"
              style={{
                top: barW * 0.44,
                left: 0,
                width: barW * 3,
                height: barH * 0.125,
                opacity: classicRightOpacity,
              }}
            >
              <div
                className="ishanch-logo__line-fill ishanch-logo__line-fill--right"
                style={{ transform: `scale(${classicRightScale})` }}
              />
            </div>
            <div
              className="ishanch-logo__line-down"
              style={{
                left: barW * 0.56,
                top: 0,
                width: barW * 0.125,
                height: barH * 2,
                opacity: classicDownOpacity,
                transform: `rotate(${lineDownRotate}deg)`,
              }}
            >
              <div
                className="ishanch-logo__line-fill ishanch-logo__line-fill--down"
                style={{ transform: `scale(${classicDownScale})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
