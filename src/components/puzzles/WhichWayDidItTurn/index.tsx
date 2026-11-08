import { useMemo } from 'react';
import type { PuzzleProps } from '../../../types/puzzle';
import { sketchedLoop } from '../../../utils/sketchedLoop';
import { CircleStroke } from '../../AnswerCircle';
import { generateTurns, figurePath, turnArrow, turnArrowEnd, TURN_RADIUS, turnLayout, type Shape, type ShapeFamily, type ShapeStyle, type TurnKind } from './generator';
import styles from './WhichWayDidItTurn.module.css';

export interface WhichWayDidItTurnConfig {
  workedExample: boolean;
  turns: TurnKind[];
  shapes: ShapeStyle;
}

// All four pictures share a colour: it never identifies the answer.
const ROW_COLOURS = [
  { shape: '#9ebbd0', card: '#eff4f8', border: '#809bae' },
  { shape: '#a9bfa1', card: '#f0f5ed', border: '#859b7b' },
  { shape: '#d8bb7f', card: '#fbf5e9', border: '#aa905b' },
  { shape: '#bca8c9', card: '#f5f0f8', border: '#9783a4' },
];

function ExampleCircle({ seed, cx, cy, radius }: { seed: number; cx: number; cy: number; radius: number }) {
  const { d, finish } = sketchedLoop(`${seed}:turn:example`, { cx, cy, rx: radius, ry: radius });
  return <g data-worked-example fill="none" stroke="#62646a" strokeWidth={0.45} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
    <path d={finish} strokeWidth={0.3} />
  </g>;
}

function Picture({ shape, family, x, y, size, fill }: { shape: Shape; family: ShapeFamily; x: number; y: number; size: number; fill: string }) {
  return <g transform={`translate(${x} ${y}) scale(${size / 4.2})`}>
    <path data-turn-picture="shape" d={figurePath(shape, family)} fill={fill} stroke="#30343b" strokeWidth={0.1} strokeLinejoin="round" />
  </g>;
}

export default function WhichWayDidItTurn({ gridWidth, gridHeight, seed, config, showAnswers = false }: PuzzleProps<WhichWayDidItTurnConfig>) {
  const workedExample = config?.workedExample ?? true;
  const turns = config?.turns;
  const shapes = config?.shapes ?? 'blocks';
  const { width, height, slot, rowHeight, rowCount } = turnLayout(gridWidth, gridHeight);
  const questions = useMemo(() => generateTurns(seed, rowCount, turns, shapes), [seed, rowCount, turns, shapes]);
  const left = (width - (slot * 4 + 14)) / 2;

  return <svg className={styles.puzzle} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Which way did it turn? Follow each turning arrow. Circle the matching picture.">
    <text x={width / 2} y={5} textAnchor="middle" fontSize={3.1}>Turn the picture this way. Circle what it will look like.</text>
    {questions.map((question, row) => {
      const colour = ROW_COLOURS[row % ROW_COLOURS.length];
      const example = workedExample && row === 0;
      const top = 9 + row * rowHeight;
      const cy = top + slot / 2;
      const modelX = left + slot / 2;
      const [endX, endY] = turnArrowEnd(question.turn);
      return <g key={row} data-turn-row={row}>
        <rect x={left} y={top} width={slot} height={slot} rx={2} fill={colour.card} stroke={colour.border} strokeWidth={0.4} />
        {example && <text x={modelX} y={top + 2.7} textAnchor="middle" fontSize={2.1} fill="#555b62">Example</text>}
        <Picture fill={colour.shape} family={question.family} shape={question.model} x={modelX} y={cy} size={slot} />
        <g transform={`translate(${left + slot + 7} ${cy})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle r={TURN_RADIUS} stroke="#bbc5cd" strokeWidth={0.25} />
          <path d={`M 0 ${-TURN_RADIUS} L 0 0 L ${endX} ${endY}`} stroke="#bbc5cd" strokeWidth={0.25} />
          <circle r={0.35} fill="#9ca7ae" />
          <circle cy={-TURN_RADIUS} r={0.55} fill="#3d4b56" />
          <path data-turn-cue={question.turn} d={turnArrow(question.turn)} stroke="#3d4b56" strokeWidth={0.75} />
        </g>
        {question.choices.map((choice, index) => {
          const cx = left + slot + 14 + slot * (index + 0.5);
          const correct = index === question.answer;
          return <g key={index} data-turn-choice={index}>
            <Picture fill={colour.shape} family={question.family} shape={choice} x={cx} y={cy} size={slot} />
            {example && correct && <ExampleCircle seed={seed} cx={cx} cy={cy} radius={slot * 0.46} />}
            {!example && showAnswers && correct && <CircleStroke seed={`${seed}:turn:${row}`} cx={cx} cy={cy} rx={slot * 0.46} ry={slot * 0.46} width={0.5} dash="1.2 1" />}
          </g>;
        })}
      </g>;
    })}
  </svg>;
}
