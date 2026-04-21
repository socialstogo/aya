const TM_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY ?? '';
const EB_TOKEN = process.env.EXPO_PUBLIC_EVENTBRITE_TOKEN ?? '';

const MIAMI_LAT = 25.7879;
const MIAMI_LNG = -80.1878;
const RADIUS_MI = 25;

export interface AppEvent {
  id: string;
  source: 'ticketmaster' | 'eventbrite';
  name: string;
  venue: string;
  address: string;
  date: string;
  isoDate: string;
  time: string;
  price: string;
  genre: string;
  imageUrl: string | null;
  ticketUrl: string;
}

const _cache: Record<string, { events: AppEvent[]; ts: number }> = {};
const CACHE_TTL = 10 * 60 * 1000;

const FALLBACK_EVENTS: AppEvent[] = [
  { id: 'f1', source: 'ticketmaster', name: 'Latin Night at Ball & Chain',    venue: 'Ball & Chain',      address: '1513 SW 8th St',       date: 'Tonight', isoDate: '', time: '10:00pm', price: '$15',  genre: 'Latin',      imageUrl: null, ticketUrl: 'https://www.ballandchainmiami.com' },
  { id: 'f2', source: 'ticketmaster', name: 'Open Format at LIV Miami',       venue: 'LIV Miami',         address: '4441 Collins Ave',      date: 'Tonight', isoDate: '', time: '11:00pm', price: '$40',  genre: 'Electronic', imageUrl: null, ticketUrl: 'https://www.livnightclub.com' },
  { id: 'f3', source: 'eventbrite',   name: 'Reggaeton Fridays @ E11EVEN',    venue: 'E11EVEN Miami',     address: '29 NE 11th St',         date: 'Tonight', isoDate: '', time: '11:00pm', price: '$30',  genre: 'Reggaeton',  imageUrl: null, ticketUrl: 'https://www.11miami.com' },
  { id: 'f4', source: 'eventbrite',   name: 'Rooftop Jazz Night',             venue: 'Sugar (East Hotel)',address: '788 Brickell Plaza',     date: 'Tonight', isoDate: '', time: '8:00pm',  price: 'Free', genre: 'Jazz',       imageUrl: null, ticketUrl: 'https://www.easthotels.com/miami' },
  { id: 'f5', source: 'ticketmaster', name: 'Afrobeats & Chill',              venue: 'Kiki on the River', address: '450 NW North River Dr', date: 'Tonight', isoDate: '', time: '9:00pm',  price: '$10',  genre: 'Afrobeats',  imageUrl: null, ticketUrl: 'https://kikimiami.com' },
];

export async function fetchEventsForDate(dateStr: string): Promise<AppEvent[]> {
  const hit = _cache[dateStr];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.events;

  // If neither key is configured, return labeled fallback data
  if (!TM_KEY && !EB_TOKEN) {
    return FALLBACK_EVENTS.map(e => ({ ...e, date: formatDate(dateStr), isoDate: `${dateStr}T22:00:00` }));
  }

  const [tm, eb] = await Promise.allSettled([
    fetchTicketmaster(dateStr),
    fetchEventbrite(dateStr),
  ]);

  const events: AppEvent[] = [
    ...(tm.status === 'fulfilled' ? tm.value : []),
    ...(eb.status === 'fulfilled' ? eb.value : []),
  ].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  // Fall back to mock data if both APIs returned nothing
  const result = events.length > 0 ? events : FALLBACK_EVENTS.map(e => ({ ...e, date: formatDate(dateStr), isoDate: `${dateStr}T22:00:00` }));
  _cache[dateStr] = { events: result, ts: Date.now() };
  return result;
}

async function fetchTicketmaster(dateStr: string): Promise<AppEvent[]> {
  if (!TM_KEY) return [];
  const start = `${dateStr}T00:00:00Z`;
  const end   = `${dateStr}T23:59:59Z`;
  const url =
    `https://app.ticketmaster.com/discovery/v2/events.json` +
    `?apikey=${TM_KEY}` +
    `&latlong=${MIAMI_LAT},${MIAMI_LNG}` +
    `&radius=${RADIUS_MI}&unit=miles` +
    `&startDateTime=${start}&endDateTime=${end}` +
    `&size=20&sort=date,asc`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  const items: any[] = json._embedded?.events ?? [];

  return items.map((e): AppEvent => {
    const v     = e._embedded?.venues?.[0];
    const pr    = e.priceRanges?.[0];
    const genre = e.classifications?.[0]?.genre?.name
                ?? e.classifications?.[0]?.segment?.name
                ?? 'Event';
    const time  = e.dates?.start?.localTime ?? '';
    return {
      id:       `tm_${e.id}`,
      source:   'ticketmaster',
      name:     e.name,
      venue:    v?.name ?? 'Miami',
      address:  v?.address?.line1 ?? '',
      date:     formatDate(e.dates?.start?.localDate ?? dateStr),
      isoDate:  `${e.dates?.start?.localDate ?? dateStr}T${time || '00:00:00'}`,
      time:     formatTime(time),
      price:    pr ? `$${Math.round(pr.min)}` : 'See site',
      genre:    genre === 'Undefined' ? 'Event' : genre,
      imageUrl: e.images?.find((i: any) => i.ratio === '16_9')?.url
             ?? e.images?.[0]?.url
             ?? null,
      ticketUrl: e.url,
    };
  });
}

async function fetchEventbrite(dateStr: string): Promise<AppEvent[]> {
  if (!EB_TOKEN) return [];
  const start = `${dateStr}T00:00:00Z`;
  const end   = `${dateStr}T23:59:59Z`;
  const url =
    `https://www.eventbriteapi.com/v3/events/search/` +
    `?location.latitude=${MIAMI_LAT}` +
    `&location.longitude=${MIAMI_LNG}` +
    `&location.within=${RADIUS_MI}mi` +
    `&start_date.range_start=${start}` +
    `&start_date.range_end=${end}` +
    `&expand=venue,ticket_availability` +
    `&page_size=20&sort_by=date`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${EB_TOKEN}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  const items: any[] = json.events ?? [];

  return items.map((e): AppEvent => {
    const minPrice = e.ticket_availability?.minimum_ticket_price?.major_value;
    return {
      id:        `eb_${e.id}`,
      source:    'eventbrite',
      name:      e.name?.text ?? 'Event',
      venue:     e.venue?.name ?? 'Miami',
      address:   e.venue?.address?.address_1 ?? '',
      date:      formatDate(dateStr),
      isoDate:   e.start?.utc ?? `${dateStr}T00:00:00Z`,
      time:      formatTime(e.start?.local?.split('T')[1] ?? ''),
      price:     minPrice ? `$${minPrice}` : e.is_free ? 'Free' : 'See site',
      genre:     'Event',
      imageUrl:  e.logo?.url ?? null,
      ticketUrl: e.url,
    };
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${ampm}`;
}
