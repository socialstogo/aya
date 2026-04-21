import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../lib/constants';
import { Venue } from '../../lib/types';
import { useVenues } from '../../hooks/useVenues';
import VenueProfile from '../../components/VenueProfile';

type SortKey = 'crowd' | 'wait' | 'rating';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'crowd', label: 'Hottest' },
  { key: 'wait', label: 'Shortest wait' },
  { key: 'rating', label: 'Top rated' },
];

const TAB_BAR_HEIGHT = 90;

export default function TrendingScreen() {
  const { venues, loading } = useVenues();
  const [sort, setSort] = useState<SortKey>('crowd');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const ranked = [...venues].sort((a, b) => {
    if (sort === 'crowd') return b.crowd - a.crowd;
    if (sort === 'wait') return a.wait - b.wait;
    return b.rating - a.rating;
  });

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Trending</Text>
          <Text style={styles.subtitle}>Miami right now</Text>
        </View>

        <View style={styles.sortRow}>
          {SORTS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.sortPill, sort === key && styles.sortPillActive]}
              onPress={() => setSort(key)}
            >
              <Text style={[styles.sortText, sort === key && styles.sortTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.cream} />
        </View>
      ) : (
        <FlatList
          data={ranked}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TrendingRow
              venue={item}
              rank={index + 1}
              sortKey={sort}
              onPress={() => setSelectedVenue(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <VenueProfile
        venue={selectedVenue}
        visible={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </View>
  );
}

function TrendingRow({
  venue,
  rank,
  sortKey,
  onPress,
}: {
  venue: Venue;
  rank: number;
  sortKey: SortKey;
  onPress: () => void;
}) {
  const statValue =
    sortKey === 'crowd'
      ? `${venue.crowd}%`
      : sortKey === 'wait'
      ? venue.wait === 0 ? 'No wait' : `${venue.wait}m`
      : venue.rating.toFixed(1);

  const statLabel = sortKey === 'crowd' ? 'crowd' : sortKey === 'wait' ? 'wait' : 'rating';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.rank, rank <= 3 && styles.rankTop]}>{rank}</Text>
      <Image source={{ uri: venue.image }} style={styles.thumb} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>{venue.name}</Text>
        <Text style={styles.rowMeta}>
          {venue.type} · {venue.neighborhood}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{statValue}</Text>
        <Text style={styles.statLabel}>{statLabel}</Text>
      </View>
    </Pressable>
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
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  sortPillActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  sortText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
  sortTextActive: {
    color: COLORS.darkText,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  rank: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.muted,
    width: 24,
    textAlign: 'center',
  },
  rankTop: {
    color: COLORS.cream,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  rowMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  stat: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.cream,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
});
