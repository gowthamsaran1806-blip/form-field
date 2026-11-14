import * as turf from "@turf/turf";

/**
 * Calculate accurate field area in hectares and local Bangladeshi bigha (1 ha ≈ 7.47 bigha).
 */
export function calculateFieldArea(coords: [number, number][]): {
  areaM2: number;
  areaHa: number;
  areaBigha: number;
} {
  if (coords.length < 3) {
    return { areaM2: 0, areaHa: 0, areaBigha: 0 };
  }

  // Ensure closed ring for GeoJSON polygon
  const ring = [...coords];
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push(first);
  }

  // GeoJSON coordinates are [longitude, latitude]
  const geojsonCoords = ring.map(([lat, lon]) => [lon, lat]);
  const poly = turf.polygon([geojsonCoords]);
  const areaM2 = turf.area(poly);
  const areaHa = areaM2 / 10000;
  const areaBigha = areaHa * 7.4749; // standard Bengal bigha

  return {
    areaM2: Math.round(areaM2),
    areaHa: Math.round(areaHa * 100) / 100,
    areaBigha: Math.round(areaBigha * 10) / 10,
  };
}

/**
 * Calculate accurate field perimeter in kilometers using Turf.js
 */
export function calculateFieldPerimeterKm(coords: [number, number][]): number {
  if (coords.length < 2) return 0;
  const ring = [...coords];
  if (
    ring[0][0] !== ring[ring.length - 1][0] ||
    ring[0][1] !== ring[ring.length - 1][1]
  ) {
    ring.push(ring[0]);
  }
  const geojsonCoords = ring.map(([lat, lon]) => [lon, lat]);
  const line = turf.lineString(geojsonCoords);
  const lengthKm = turf.length(line, { units: "kilometers" });
  return Math.round(lengthKm * 100) / 100;
}

/**
 * Computes exact geodesic distance between two points in kilometers
 */
export function turfDistanceKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): number {
  const pt1 = turf.point([from.lon, from.lat]);
  const pt2 = turf.point([to.lon, to.lat]);
  const dist = turf.distance(pt1, pt2, { units: "kilometers" });
  return Math.round(dist * 10) / 10;
}
