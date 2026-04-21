import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Linking,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';
import { AppEvent } from '../../lib/events';
import { useEvents } from '../../hooks/useEvents';

const TAB_BAR_HEIGHT = 90;

// Generate next 30 days starting from today
function buildDateStrip(count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const numLabel = String(d.getDate());
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayLabel, numLabel, monthLabel };
  });
}

const DATE_STRIP = buildDateStrip();

const SOURCE_COLORS: Record<string, string> = {
  ticketmaster: '#026cdf',
  eventbrite:   '#f05537',
};

export default function EventsScreen() {
  const [selectedDate, setSelectedDate] = useState(DATE_STRIP[0].dateStr);
  const stripRef = useRef<ScrollView>(null);
  const { events, loading, error } = useEvents(selectedDate);

  const selectedMeta = DATE_STRIP.find((d) => d.dateStr === selectedDate)!;

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Miami · {selectedMeta.dayLabel} {selectedMeta.numLabel} {selectedMeta.monthLabel}</Text>
        </View>

        {/* Date strip */}
        <ScrollView
          ref={stripRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
          style={styles.strip}
        >
          {DATE_STRIP.map((d) => {
            const active = d.dateStr === selectedDate;
            return (
              <Pressable
                key={d.dateStr}
                style={[styles.dateCell, active && styles.dateCellActive]}
                onPress={() => setSelectedDate(d.dateStr)}
              >
                <Text style={[styles.dateDayLabel, active && styles.dateLabelActive]}>
                  {d.dayLabel}
                </Text>
                <Text style={[styles.dateNum, active && styles.dateLabelActive]}>
                  {d.numLabel}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.cream} />
          <Text style={styles.loadingText}>Loading events…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.muted} />
          <Text style={styles.emptyText}>Couldn't load events</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState date={selectedMeta.dayLabel} />}
        />
      )}
    </View>
  );
}

function EventCard({ event }: { event: AppEvent }) {
  function openTickets() {
    if (event.ticketUrl) Linking.openURL(event.ticketUrl);
  }

  return (
    <View style={cardStyles.card}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={cardStyles.image} resizeMode="cover" />
      ) : (
        <View style={[cardStyles.imagePlaceholder, { backgroundColor: genreColor(event.genre) }]}>
          <Text style={cardStyles.placeholderText}>{event.genre}</Text>
        </View>
      )}

      <View style={cardStyles.body}>
        <View style={cardStyles.topRow}>
          <View style={[cardStyles.sourceBadge, { backgroundColor: SOURCE_COLORS[event.source] + '22' }]}>
            <Text style={[cardStyles.sourceText, { color: SOURCE_COLORS[event.source] }]}>
              {event.source === 'ticketmaster' ? 'Ticketmaster' : 'Eventbrite'}
            </Text>
          </View>
          <Text style={cardStyles.price}>{event.price}</Text>
        </View>

        <Text style={cardStyles.name} numberOfLines={2}>{event.name}</Text>

        <View style={cardStyles.metaRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.muted} />
          <Text style={cardStyles.metaText} numberOfLines={1}>{event.venue}</Text>
        </View>

        <View style={cardStyles.metaRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.muted} />
          <Text style={cardStyles.metaText}>{event.date}{event.time ? ` · ${event.time}` : ''}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [cardStyles.ticketBtn, pressed && { opacity: 0.75 }]}
          onPress={openTickets}
        >
          <Ionicons name="ticket-outline" size={15} color={COLORS.darkText} />
          <Text style={cardStyles.ticketBtnText}>Get Tickets</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.darkText} />
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({ date }: { date: string }) {
  return (
    <View style={styles.center}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.muted} />
      <Text style={styles.emptyText}>No events found for {date}</Text>
      <Text style={styles.emptySubtext}>Try a different date or check back later</Text>
    </View>
  );
}

function genreColor(genre: string): string {
  const map: Record<string, string> = {
    'Hip-Hop/Rap': '#7c3aed',
    'Electronic':  '#2a2eef',
    'Latin':       '#ef4444',
    'Rock':        '#dc2626',
    'Jazz':        '#d97706',
    'R&B':         '#db2777',
    'Pop':         '#0891b2',
    'Reggaeton':   '#16a34a',
  };
  return map[genre] ?? '#333';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 2,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  strip: {
    maxHeight: 76,
  },
  stripContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
  },
  dateCell: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.05)',
    minWidth: 52,
  },
  dateCellActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  dateDayLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
  },
  dateNum: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
    marginTop: 1,
  },
  dateLabelActive: {
    color: COLORS.darkText,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  emptyText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(240,237,228,0.05)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sourceText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
  },
  price: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    flex: 1,
  },
  ticketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 4,
  },
  ticketBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.darkText,
    flex: 1,
    textAlign: 'center',
  },
});
