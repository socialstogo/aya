const TM_KEY = process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;
const EB_TOKEN = process.env.EXPO_PUBLIC_EVENTBRITE_TOKEN;

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

export async function fetchEventsForDate(dateStr: string): Promise<AppEvent[]> {
  const hit = _cache[dateStr];
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.events;

  const [tm, eb] = await Promise.allSettled([
    fetchTicketmaster(dateStr),
    fetchEventbrite(dateStr),
  ]);

  const events: AppEvent[] = [
    ...(tm.status === 'fulfilled' ? tm.value : []),
    ...(eb.status === 'fulfilled' ? eb.value : []),
  ].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  _cache[dateStr] = { events, ts: Date.now() };
  return events;
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
