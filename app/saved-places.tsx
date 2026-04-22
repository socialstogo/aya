import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';
import { useVenues } from '../hooks/useVenues';
import VenueProfile from '../components/VenueProfile';
import { Venue } from '../lib/types';
import StatChip from '../components/StatChip';

function crowdLabel(pct: number) {
  if (pct >= 80) return 'Packed';
  if (pct >= 55) return 'Busy';
  if (pct >= 30) return 'Moderate';
  return 'Quiet';
}

export default function SavedPlacesScreen() {
  const { profile } = useAuth();
  const { venues, loading } = useVenues();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const saved = venues.filter((v) =>
    (profile?.followed_venues ?? []).includes(v.id)
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>Saved Places</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : saved.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={52} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptyText}>
            Heart any venue from the Discover screen to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => (
            <SavedCard venue={item} onPress={() => setSelectedVenue(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.countLabel}>{saved.length} saved</Text>
          }
        />
      )}

      <VenueProfile
        venue={selectedVenue}
        visible={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </SafeAreaView>
  );
}

function SavedCard({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Image source={{ uri: venue.image }} style={styles.cardImg} resizeMode="cover" />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName} numberOfLines={1}>{venue.name}</Text>
          <View style={[styles.statusDot, venue.isOpen ? styles.dotOpen : styles.dotClosed]} />
        </View>
        <Text style={styles.cardMeta}>{venue.type} · {venue.neighborhood}</Text>
        <View style={styles.chips}>
          <StatChip label="crowd" value={crowdLabel(venue.crowd)} highlight={venue.crowd >= 80} />
          <StatChip label="rating" value={venue.rating.toFixed(1)} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.cream,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.cream,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  countLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#1a1917',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardImg: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 19,
    color: COLORS.cream,
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOpen: { backgroundColor: '#22c55e' },
  dotClosed: { backgroundColor: '#ef4444' },
  cardMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});
