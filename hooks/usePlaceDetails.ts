import { useState, useEffect } from 'react';
import { PlaceDetails } from '../lib/types';
import { fetchPlaceDetails } from '../lib/places';

export function usePlaceDetails(placeId: string | null) {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeId) { setDetails(null); return; }

    let cancelled = false;
    setLoading(true);
    setDetails(null);

    fetchPlaceDetails(placeId)
      .then((d) => { if (!cancelled) setDetails(d); })
      .catch(() => { /* fail silently — venue card still shows */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [placeId]);

  return { details, loading };
}
