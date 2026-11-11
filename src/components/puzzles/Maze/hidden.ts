import type { Point } from './grids';
import { shapeVertices, type DotShape } from '../DotMarker/generator';

/** A line for the answer route to follow: a shape's outline */
export interface HiddenLine {
  points: Point[];
  /** An outline, which goes all the way round */
  closed: boolean;
}

/** Shapes the route can draw; Dot Marker's, less the square, which would just run round the edge */
export const HIDDEN_PICTURES: { id: DotShape; label: string }[] = [
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'circle', label: 'Circle' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'house', label: 'House' },
  { id: 'fish', label: 'Fish' },
  { id: 'tree', label: 'Tree' },
  { id: 'pumpkin', label: 'Pumpkin' },
  { id: 'cloud', label: 'Cloud' },
];

/** The outline for a picture setting: a shape's id */
export function hiddenLine(picture: string): HiddenLine | null {
  const shape = HIDDEN_PICTURES.find((p) => p.id === picture);
  return shape ? { points: shapeVertices(shape.id), closed: true } : null;
}
