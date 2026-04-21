import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Linking,
} from 'react-native';
import { COLORS } from '../../lib/constants';

type DateFilter = 'Tonight' | 'Tomorrow' | 'This weekend';

const DATE_FILTERS: DateFilter[] = ['Tonight', 'Tomorrow', 'This weekend'];

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Latin Night at Ball & Chain',
    venue: 'Ball & Chain',
    neighborhood: 'Little Havana',
    date: 'Tonight · 10pm',
    price: '$15',
    genre: 'Latin',
    url: null,
    dateKey: 'Tonight',
  },
  {
    id: '2',
    name: 'Open Format DJ Set',
    venue: 'LIV Miami',
    neighborhood: 'South Beach',
    date: 'Tonight · 11pm',
    price: '$40',
    genre: 'Electronic',
    url: null,
    dateKey: 'Tonight',
  },
  {
    id: '3',
    name: 'Reggaeton Fridays',
    venue: 'E11EVEN Miami',
    neighborhood: 'Downtown',
    date: 'Tomorrow · 11pm',
    price: '$30',
    genre: 'Reggaeton',
    url: null,
    dateKey: 'Tomorrow',
  },
  {
    id: '4',
    name: 'Rooftop Jazz Night',
    venue: 'Sugar (East Hotel)',
    neighborhood: 'Brickell',
    date: 'Sat · 8pm',
    price: 'Free',
    genre: 'Jazz',
    url: null,
    dateKey: 'This weekend',
  },
  {
    id: '5',
    name: 'Afrobeats & Chill',
    venue: 'Kiki on the River',
    neighborhood: 'Wynwood',
    date: 'Sat · 9pm',
    price: '$10',
    genre: 'Afrobeats',
    url: null,
    dateKey: 'This weekend',
  },
];

const TAB_BAR_HEIGHT = 90;

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState<DateFilter>('Tonight');

  const events = MOCK_EVENTS.filter((e) => e.dateKey === activeFilter);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>
        <View style={styles.filterRow}>
          {DATE_FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />
    </View>
  );
}

function EventCard({ event }: { event: (typeof MOCK_EVENTS)[0] }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{event.genre}</Text>
        </View>
        <Text style={styles.price}>{event.price}</Text>
      </View>
      <Text style={styles.eventName}>{event.name}</Text>
      <Text style={styles.venueName}>{event.venue}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.dateText}>{event.date} · {event.neighborhood}</Text>
        <Pressable style={styles.ticketBtn}>
          <Text style={styles.ticketBtnText}>Tickets</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  filterPillActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  filterText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.muted,
  },
  filterTextActive: {
    color: COLORS.darkText,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  card: {
    backgroundColor: 'rgba(240,237,228,0.05)',
    borderRadius: 18,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreBadge: {
    backgroundColor: 'rgba(42,46,239,0.15)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  genreText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: COLORS.blue,
  },
  price: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
  },
  eventName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
  },
  venueName: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    flex: 1,
  },
  ticketBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ticketBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.darkText,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
  },
});
