import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { fetchNearbyVenues } from '../lib/places';
import { Venue } from '../lib/types';

const MIAMI_FALLBACK = { lat: 25.7879, lng: -80.1878 };

export interface VenuesState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  locationDenied: boolean;
  refresh: () => void;
}

export function useVenues(): VenuesState {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let lat = MIAMI_FALLBACK.lat;
      let lng = MIAMI_FALLBACK.lng;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
          if (!cancelled) setLocationDenied(false);
        } else {
          if (!cancelled) setLocationDenied(true);
        }
      } catch {
        // Location failed — fall back to Miami center silently
        if (!cancelled) setLocationDenied(true);
      }

      try {
        const data = await fetchNearbyVenues(lat, lng);
        if (!cancelled) setVenues(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load venues');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  return { venues, loading, error, locationDenied, refresh };
}
