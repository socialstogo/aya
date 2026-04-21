import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Try the cached last-known position first (fast, no UI delay)
    Location.getLastKnownPositionAsync().then((pos) => {
      if (pos) setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  return coords;
}

export function distanceMi(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
