import { Venue } from './types';
import { GOOGLE_MAPS_API_KEY } from './constants';

const BASE = 'https://maps.googleapis.com/maps/api/place';

// Stable pseudo-random from a string seed — gives each venue consistent mock crowd/wait
function stableRand(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return min + (Math.abs(h) % (max - min + 1));
}

export function getPhotoUrl(ref: string, maxWidth = 800): string {
  return `${BASE}/photo?maxwidth=${maxWidth}&photoreference=${ref}&key=${GOOGLE_MAPS_API_KEY}`;
}

function mapType(types: string[]): string {
  if (types.includes('night_club')) return 'Nightclub';
  if (types.includes('bar')) return 'Bar';
  if (types.includes('restaurant')) return 'Restaurant';
  if (types.includes('lodging')) return 'Lounge';
  return 'Bar';
}

function extractNeighborhood(vicinity: string): string {
  const parts = vicinity.split(',');
  return parts.length >= 2 ? parts[parts.length - 1].trim() : vicinity;
}

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  price_level?: number;
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now: boolean };
  types: string[];
}

export function mapPlaceToVenue(place: GooglePlace): Venue {
  // Crowd and wait are not in Places API — generate stable values per venue
  const crowd = stableRand(place.place_id + 'c', 18, 97);
  const rawWait = stableRand(place.place_id + 'w', 0, 40);

  return {
    id: place.place_id,
    name: place.name,
    type: mapType(place.types),
    neighborhood: extractNeighborhood(place.vicinity),
    address: place.vicinity,
    crowd,
    wait: rawWait < 8 ? 0 : rawWait,
    rating: place.rating ?? 4.0,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    image: place.photos?.[0]
      ? getPhotoUrl(place.photos[0].photo_reference)
      : `https://picsum.photos/seed/${place.place_id}/800/500`,
    hours: 'See Google Maps',
    priceLevel: place.price_level ?? 2,
    isOpen: place.opening_hours?.open_now ?? true,
  };
}

// Places API only accepts one type per request, so we fetch in parallel
async function fetchByType(lat: number, lng: number, type: string): Promise<GooglePlace[]> {
  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: '5000',
    type,
    key: GOOGLE_MAPS_API_KEY,
  });

  const res = await fetch(`${BASE}/nearbysearch/json?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API: ${data.status} — ${data.error_message ?? ''}`);
  }

  return data.results ?? [];
}

// Simple 5-minute in-memory cache keyed by "lat,lng"
interface CacheEntry { venues: Venue[]; at: number }
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchNearbyVenues(lat: number, lng: number): Promise<Venue[]> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = cache[key];
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.venues;

  const [bars, clubs, restaurants] = await Promise.all([
    fetchByType(lat, lng, 'bar'),
    fetchByType(lat, lng, 'night_club'),
    fetchByType(lat, lng, 'restaurant'),
  ]);

  const seen = new Set<string>();
  const venues: Venue[] = [];

  for (const place of [...bars, ...clubs, ...restaurants]) {
    if (!seen.has(place.place_id)) {
      seen.add(place.place_id);
      venues.push(mapPlaceToVenue(place));
    }
  }

  cache[key] = { venues, at: Date.now() };
  return venues;
}
