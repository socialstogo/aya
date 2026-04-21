import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { COLORS } from '../lib/constants';
import { Venue } from '../lib/types';
import StatChip from './StatChip';

const { width } = Dimensions.get('window');

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
}

function crowdLabel(pct: number) {
  if (pct >= 80) return 'Packed';
  if (pct >= 55) return 'Busy';
  if (pct >= 30) return 'Moderate';
  return 'Quiet';
}

function priceLabel(level: number) {
  return '$'.repeat(level);
}

export default function VenueCard({ venue, onPress }: VenueCardProps) {
  const isOpen = venue.isOpen;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image
        source={{ uri: venue.image }}
        style={styles.photo}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
          <Text style={styles.price}>{priceLabel(venue.priceLevel)}</Text>
        </View>

        <View style={styles.meta}>
          <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
          <Text style={styles.metaText}>
            {isOpen ? 'Open' : 'Closed'} · {venue.type} · {venue.neighborhood}
          </Text>
        </View>

        <View style={styles.chips}>
          <StatChip
            label="crowd"
            value={crowdLabel(venue.crowd)}
            highlight={venue.crowd >= 80}
          />
          <StatChip
            label="wait"
            value={venue.wait === 0 ? 'No wait' : `${venue.wait}m`}
          />
          <StatChip
            label="rating"
            value={venue.rating.toFixed(1)}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.cream,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  photo: {
    width: '100%',
    height: 220,
  },
  info: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.darkText,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: 'rgba(26,25,24,0.45)',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  openDot: {
    backgroundColor: '#22c55e',
  },
  closedDot: {
    backgroundColor: '#ef4444',
  },
  metaText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: 'rgba(26,25,24,0.6)',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
