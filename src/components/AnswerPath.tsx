/** A solution line with a paper halo so it remains visible over artwork. */
export default function AnswerPath({ d, width = 0.65, dashed = true }: {
  d: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <g aria-label="Answer route" pointerEvents="none">
      <path d={d} fill="none" stroke="white" strokeWidth={width * 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} data-answer="path" strokeWidth={width} strokeDasharray={dashed ? `${width * 3} ${width * 2.5}` : undefined} />
    </g>
  );
}
