import type { RecordedStroke, StrokePoint } from '../types/learning';
import type {
  NormalizedStroke,
  PreprocessedDrawing,
  ReferencePoint,
} from '../types/evaluation';

const RESAMPLED_POINTS_PER_STROKE = 30;
const MINIMUM_POINTS_THRESHOLD = 6;
const MINIMUM_DRAWING_SPAN_PX = 15;

/**
 * Resamples a polyline curve into exactly N uniformly spaced points along arc length.
 * Eliminates drawing speed variation and provides uniform spatial sampling.
 */
function resampleStrokePoints(
  rawPoints: StrokePoint[],
  canvasWidth: number,
  canvasHeight: number,
  targetCount = RESAMPLED_POINTS_PER_STROKE
): ReferencePoint[] {
  if (rawPoints.length === 0) return [];
  if (rawPoints.length === 1) {
    const single = {
      x: rawPoints[0].x / canvasWidth,
      y: rawPoints[0].y / canvasHeight,
    };
    return Array.from({ length: targetCount }, () => ({ ...single }));
  }

  // 1. Convert to normalized points [0, 1]
  const normPoints: ReferencePoint[] = rawPoints.map((pt) => ({
    x: Math.min(1, Math.max(0, pt.x / canvasWidth)),
    y: Math.min(1, Math.max(0, pt.y / canvasHeight)),
  }));

  // 2. Compute cumulative arc lengths
  const cumLengths: number[] = [0];
  let totalLength = 0;

  for (let i = 1; i < normPoints.length; i++) {
    const p1 = normPoints[i - 1];
    const p2 = normPoints[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const seg = Math.sqrt(dx * dx + dy * dy);
    totalLength += seg;
    cumLengths.push(totalLength);
  }

  if (totalLength <= 0.0001) {
    const pt = normPoints[0];
    return Array.from({ length: targetCount }, () => ({ ...pt }));
  }

  // 3. Sample exactly targetCount equidistant points along cumulative length
  const resampled: ReferencePoint[] = [{ ...normPoints[0] }];
  const step = totalLength / (targetCount - 1);
  let currentSegIndex = 1;

  for (let i = 1; i < targetCount - 1; i++) {
    const targetDist = i * step;

    while (
      currentSegIndex < cumLengths.length - 1 &&
      cumLengths[currentSegIndex] < targetDist
    ) {
      currentSegIndex++;
    }

    const d0 = cumLengths[currentSegIndex - 1];
    const d1 = cumLengths[currentSegIndex];
    const segmentSpan = d1 - d0;
    const t = segmentSpan > 0 ? (targetDist - d0) / segmentSpan : 0;

    const p0 = normPoints[currentSegIndex - 1];
    const p1 = normPoints[currentSegIndex];

    resampled.push({
      x: p0.x + t * (p1.x - p0.x),
      y: p0.y + t * (p1.y - p0.y),
    });
  }

  resampled.push({ ...normPoints[normPoints.length - 1] });
  return resampled;
}

/**
 * Preprocesses raw user strokes from PracticeCanvas into normalized geometry.
 *
 * Implements:
 * 1. Empty/anti-cheat input validation
 * 2. Coordinate normalization to [0, 1] space
 * 3. Bounding box & centroid calculations
 * 4. Stroke directions and lengths
 * 5. Uniform equidistant resampling
 * 6. Preserves stroke order
 */
export function preprocessUserStrokes(
  strokes: RecordedStroke[],
  canvasWidth: number,
  canvasHeight: number
): PreprocessedDrawing {
  // 1. Anti-cheat: No strokes submitted
  if (!strokes || strokes.length === 0) {
    return {
      strokes: [],
      totalStrokeCount: 0,
      totalPointsCount: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      centerOfMass: { x: 0.5, y: 0.5 },
      isValid: false,
      validationError: 'Please write before checking.',
    };
  }

  // 2. Anti-cheat: Extremely few points or degenerate dot
  const totalPointsCount = strokes.reduce((acc, s) => acc + s.points.length, 0);
  if (totalPointsCount < MINIMUM_POINTS_THRESHOLD) {
    return {
      strokes: [],
      totalStrokeCount: strokes.length,
      totalPointsCount,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      centerOfMass: { x: 0.5, y: 0.5 },
      isValid: false,
      validationError: 'Please write before checking.',
    };
  }

  // Check physical drawing bounding box span in pixels
  let rawMinX = Infinity;
  let rawMinY = Infinity;
  let rawMaxX = -Infinity;
  let rawMaxY = -Infinity;

  strokes.forEach((s) => {
    s.points.forEach((pt) => {
      rawMinX = Math.min(rawMinX, pt.x);
      rawMinY = Math.min(rawMinY, pt.y);
      rawMaxX = Math.max(rawMaxX, pt.x);
      rawMaxY = Math.max(rawMaxY, pt.y);
    });
  });

  const rawWidth = rawMaxX - rawMinX;
  const rawHeight = rawMaxY - rawMinY;

  // Accidental tiny tap/dot
  if (rawWidth < MINIMUM_DRAWING_SPAN_PX && rawHeight < MINIMUM_DRAWING_SPAN_PX) {
    return {
      strokes: [],
      totalStrokeCount: strokes.length,
      totalPointsCount,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      centerOfMass: { x: 0.5, y: 0.5 },
      isValid: false,
      validationError: 'Please write before checking.',
    };
  }

  // 3. Process each stroke in order
  const normalizedStrokes: NormalizedStroke[] = strokes.map((s, strokeIndex) => {
    const resampled = resampleStrokePoints(
      s.points,
      canvasWidth,
      canvasHeight,
      RESAMPLED_POINTS_PER_STROKE
    );

    let sMinX = 1;
    let sMinY = 1;
    let sMaxX = 0;
    let sMaxY = 0;
    let length = 0;

    for (let i = 0; i < resampled.length; i++) {
      const pt = resampled[i];
      sMinX = Math.min(sMinX, pt.x);
      sMinY = Math.min(sMinY, pt.y);
      sMaxX = Math.max(sMaxX, pt.x);
      sMaxY = Math.max(sMaxY, pt.y);

      if (i > 0) {
        const prev = resampled[i - 1];
        const dx = pt.x - prev.x;
        const dy = pt.y - prev.y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
    }

    const startPoint = resampled[0];
    const endPoint = resampled[resampled.length - 1];
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const directionAngle = Math.atan2(dy, dx);

    return {
      strokeIndex,
      rawPointsCount: s.points.length,
      resampledPoints: resampled,
      startPoint,
      endPoint,
      directionAngle,
      length,
      boundingBox: {
        minX: sMinX,
        minY: sMinY,
        maxX: sMaxX,
        maxY: sMaxY,
      },
    };
  });

  // 4. Calculate global bounding box & center of mass
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  let sumX = 0;
  let sumY = 0;
  let totalSampledPts = 0;

  normalizedStrokes.forEach((ns) => {
    minX = Math.min(minX, ns.boundingBox.minX);
    minY = Math.min(minY, ns.boundingBox.minY);
    maxX = Math.max(maxX, ns.boundingBox.maxX);
    maxY = Math.max(maxY, ns.boundingBox.maxY);

    ns.resampledPoints.forEach((pt) => {
      sumX += pt.x;
      sumY += pt.y;
      totalSampledPts++;
    });
  });

  return {
    strokes: normalizedStrokes,
    totalStrokeCount: normalizedStrokes.length,
    totalPointsCount,
    boundingBox: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0.01, maxX - minX),
      height: Math.max(0.01, maxY - minY),
    },
    centerOfMass: {
      x: totalSampledPts > 0 ? sumX / totalSampledPts : 0.5,
      y: totalSampledPts > 0 ? sumY / totalSampledPts : 0.5,
    },
    isValid: true,
  };
}

/**
 * Clusters a multi-character drawing's strokes along the horizontal writing axis.
 * Divides strokes into N character subgroups (for words like 日本, ありがとう).
 */
export function clusterMultiCharacterStrokes(
  strokes: RecordedStroke[],
  characterCount: number,
  canvasWidth: number,
  canvasHeight: number
): PreprocessedDrawing[] {
  if (characterCount <= 1 || strokes.length === 0) {
    return [preprocessUserStrokes(strokes, canvasWidth, canvasHeight)];
  }

  // Calculate center X of each stroke
  const strokeCenters = strokes.map((s, idx) => {
    let sMinX = Infinity;
    let sMaxX = -Infinity;
    s.points.forEach((p) => {
      sMinX = Math.min(sMinX, p.x);
      sMaxX = Math.max(sMaxX, p.x);
    });
    return {
      index: idx,
      stroke: s,
      centerX: (sMinX + sMaxX) / 2,
    };
  });

  // Sort by horizontal position
  strokeCenters.sort((a, b) => a.centerX - b.centerX);

  // Divide into characterCount partitions
  const partitions: RecordedStroke[][] = Array.from({ length: characterCount }, () => []);
  const strokesPerChar = Math.max(1, Math.round(strokes.length / characterCount));

  strokeCenters.forEach((item, i) => {
    const targetCharIdx = Math.min(
      characterCount - 1,
      Math.floor(i / strokesPerChar)
    );
    partitions[targetCharIdx].push(item.stroke);
  });

  // Re-sort strokes within each partition back to original temporal order
  partitions.forEach((group) => {
    group.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  });

  return partitions.map((group) =>
    preprocessUserStrokes(group, canvasWidth, canvasHeight)
  );
}
