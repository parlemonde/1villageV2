import { geoDistance, geoInterpolate } from 'd3-geo';
import earcut from 'earcut';
import type { Geometry, Position } from 'geojson';
import { BufferGeometry, Float32BufferAttribute } from 'three';

import { polar2Cartesian } from './coords-utils';

type Group = { indices: number[]; vertices: number[] };

export class GeoJsonGeometry extends BufferGeometry {
  constructor(geoJson: Geometry, radius = 1, resolution = 5) {
    super();

    if (geoJson.type !== 'Polygon') {
      console.warn(`Geometry supported only for a polygon. Got no supported type:`, geoJson.type);
      return;
    }

    let group: Group = { indices: [], vertices: [] };
    const groups = getPolygon(geoJson.coordinates, radius, resolution);

    let groupCnt = 0;
    groups.forEach((newG) => {
      if (newG === undefined) {
        return;
      }
      const prevIndCnt = group.indices.length;
      group = concatGroup(group, newG);
      this.addGroup(prevIndCnt, group.indices.length - prevIndCnt, groupCnt++);
    });

    if (group.indices.length > 0) {
      this.setIndex(group.indices);
    }
    if (group.vertices.length > 0) {
      this.setAttribute('position', new Float32BufferAttribute(group.vertices, 3));
    }
  }
}

function interpolateLine(lineCoords: Array<Position> = [], maxDegDistance = 1) {
  const result: Array<Position> = [lineCoords[0]];
  for (let i = 1; i < lineCoords.length; i++) {
    const point = lineCoords[i];
    const prevPoint = lineCoords[i - 1];
    if (point.length < 2 || prevPoint.length < 2) {
      continue;
    }

    const dist = (geoDistance(point as [number, number], prevPoint as [number, number]) * 180) / Math.PI;
    if (dist > maxDegDistance) {
      const interpol = geoInterpolate(prevPoint as [number, number], point as [number, number]);
      const tStep = 1 / Math.ceil(dist / maxDegDistance);

      let t = tStep;
      while (t < 1) {
        result.push(interpol(t));
        t += tStep;
      }
    }
    result.push(lineCoords[i]);
  }
  return result;
}

function getPolygon(coords: Array<Array<Position>>, radius: number, resolution: number) {
  const coords3d = coords.map((coordsSegment) =>
    interpolateLine(coordsSegment, resolution)
      .map(([lng, lat]) => polar2Cartesian(lat, lng, radius))
      .map(({ x, y, z }) => [x, y, z]),
  );

  // Each point generates 3 vertice items (x,y,z).
  // Manually flatten coords3d since earcut.flatten is not available in newer versions
  const vertices: number[] = [];
  const holes: number[] = [];
  let holeIndex = 0;

  for (let i = 0; i < coords3d.length; i++) {
    const polygon = coords3d[i];
    if (i > 0) {
      holes.push(vertices.length / 3);
    }
    for (let j = 0; j < polygon.length; j++) {
      vertices.push(...polygon[j]);
    }
  }

  const firstHoleIdx = holes[0] || Infinity;
  const outerVertices = vertices.slice(0, firstHoleIdx);
  const holeVertices = vertices.slice(firstHoleIdx);

  const holesIdx = new Set(holes);

  const numPoints = Math.round(vertices.length / 3);

  const outerIndices: number[] = [];
  const holeIndices: number[] = [];
  for (let vIdx = 1; vIdx < numPoints; vIdx++) {
    if (!holesIdx.has(vIdx)) {
      if (vIdx < firstHoleIdx) {
        outerIndices.push(vIdx - 1, vIdx);
      } else {
        holeIndices.push(vIdx - 1 - firstHoleIdx, vIdx - firstHoleIdx);
      }
    }
  }

  const groups: [Group, Group?] = [{ indices: outerIndices, vertices: outerVertices }];
  if (holes.length) {
    groups.push({ indices: holeIndices, vertices: holeVertices });
  }
  return groups;
}

function concatGroup(a: Group, b: Group): Group {
  const prevVertCnt = Math.round(a.vertices.length / 3);
  return {
    vertices: a.vertices.concat(b.vertices),
    indices: a.indices.concat(b.indices.map((ind) => ind + prevVertCnt)),
  };
}
