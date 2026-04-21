import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../../lib/constants';
import { Venue, FilterType } from '../../lib/types';
import { useVenues } from '../../hooks/useVenues';
import VenueCard from '../../components/VenueCard';
import VenueProfile from '../../components/VenueProfile';

const FILTERS: FilterType[] = ['All', 'Bar', 'Nightclub', 'Restaurant', 'Rooftop', 'Live Music'];
const TAB_BAR_HEIGHT = 90;

export default function DiscoverScreen() {
  const { venues, loading, error, locationDenied, refresh } = useVenues();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const matchesFilter = activeFilter === 'All' || v.type === activeFilter;
      const matchesSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.neighborhood.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [venues, search, activeFilter]);

  async function handleRefresh() {
    setRefreshing(true);
    refresh();
    // Give the hook a moment to pick up the tick change
    await new Promise((r) => setTimeout(r, 300));
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.wordmark}>ayá</Text>
          {locationDenied && (
            <Text style={styles.locationNote}>Miami, FL</Text>
          )}
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search venues..."
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
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
        </ScrollView>
      </SafeAreaView>

      {loading && !refreshing ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VenueCard venue={item} onPress={() => setSelectedVenue(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.cream}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No venues found</Text>
            </View>
          }
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

function LoadingState() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={COLORS.cream} />
      <Text style={loadingStyles.text}>Finding venues near you...</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Could not load venues</Text>
      <Text style={errorStyles.message}>{message}</Text>
      <Pressable style={errorStyles.retryBtn} onPress={onRetry}>
        <Text style={errorStyles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  locationNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(240,237,228,0.08)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersScroll: {
    maxHeight: 48,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 18,
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
  listContent: {
    paddingTop: 16,
    paddingBottom: TAB_BAR_HEIGHT + 20,
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.cream,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  retryText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.darkText,
  },
});
