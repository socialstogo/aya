import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../lib/constants';
import { Venue } from '../lib/types';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { useLocation, distanceMi } from '../hooks/useLocation';
import StatChip from './StatChip';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;
const SHEET_RADIUS = 24;
const PHOTO_SIZE = (width - 4) / 2;

const TABS = ['Info', 'Photos', 'Reviews', 'Live Thread'] as const;
type Tab = (typeof TABS)[number];

interface Props {
  venue: Venue | null;
  visible: boolean;
  onClose: () => void;
}

function crowdLabel(pct: number) {
  if (pct >= 80) return 'Packed';
  if (pct >= 55) return 'Busy';
  if (pct >= 30) return 'Moderate';
  return 'Quiet';
}

function priceLabel(level: number) {
  return '$'.repeat(Math.max(1, level));
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={i <= Math.round(rating) ? '#f59e0b' : 'rgba(26,25,24,0.3)'}
        />
      ))}
    </View>
  );
}

export default function VenueProfile({ venue, visible, onClose }: Props) {
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Info');
  const insets = useSafeAreaInsets();
  const userCoords = useLocation();
  const { details, loading: detailsLoading } = usePlaceDetails(visible ? venue?.id ?? null : null);

  if (!venue) return null;

  const distance =
    userCoords
      ? distanceMi(userCoords.lat, userCoords.lng, venue.lat, venue.lng).toFixed(1) + ' mi'
      : null;

  const heroPhotos =
    details?.photos && details.photos.length > 0
      ? details.photos
      : [venue.image];

  function call() {
    if (details?.formatted_phone_number) {
      Linking.openURL(`tel:${details.formatted_phone_number.replace(/\D/g, '')}`);
    }
  }

  function openDirections() {
    const url = details?.maps_url
      ?? `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;
    Linking.openURL(url);
  }

  function openWebsite() {
    if (details?.website) Linking.openURL(details.website);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={styles.root}>

        {/* Hero */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.heroScroll}
        >
          {heroPhotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.heroImage} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Overlay controls */}
        <View style={[styles.controls, { top: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.75 }]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.darkText} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.75 }]}
            onPress={() => setLiked((l) => !l)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? '#ef4444' : COLORS.darkText}
            />
          </Pressable>
        </View>

        {/* White sheet */}
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Venue header */}
          <View style={styles.header}>
            <View style={styles.nameLine}>
              <Text style={styles.name} numberOfLines={2}>{venue.name}</Text>
              <View style={[styles.dot, venue.isOpen ? styles.dotOpen : styles.dotClosed]} />
            </View>

            <View style={styles.metaLine}>
              <Text style={styles.metaText}>
                {venue.type} · {venue.neighborhood}
                {distance ? ` · ${distance}` : ''}
              </Text>
            </View>

            <View style={styles.ratingLine}>
              <Stars rating={venue.rating} />
              <Text style={styles.ratingNum}>{venue.rating.toFixed(1)}</Text>
              <Text style={styles.priceText}>{priceLabel(venue.priceLevel)}</Text>
            </View>

            <View style={styles.chips}>
              <StatChip label="crowd" value={crowdLabel(venue.crowd)} highlight={venue.crowd >= 80} />
              <StatChip label="wait" value={venue.wait === 0 ? 'No wait' : `${venue.wait}m`} />
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <ActionBtn
              icon="call"
              label="Call"
              disabled={!details?.formatted_phone_number}
              onPress={call}
            />
            <ActionBtn icon="navigate" label="Directions" onPress={openDirections} />
            <ActionBtn
              icon="globe-outline"
              label="Website"
              disabled={!details?.website}
              onPress={openWebsite}
            />
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Tab content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            {detailsLoading && (
              <View style={styles.detailsLoading}>
                <ActivityIndicator size="small" color="rgba(26,25,24,0.3)" />
              </View>
            )}

            {activeTab === 'Info' && (
              <InfoTab venue={venue} details={details} />
            )}
            {activeTab === 'Photos' && (
              <PhotosTab photos={details?.photos ?? [venue.image]} />
            )}
            {activeTab === 'Reviews' && (
              <ReviewsTab reviews={details?.reviews ?? []} loading={detailsLoading} />
            )}
            {activeTab === 'Live Thread' && (
              <EmptyTab message="Be the first to post tonight" />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        actionStyles.btn,
        disabled && actionStyles.btnDisabled,
        pressed && !disabled && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color={disabled ? 'rgba(26,25,24,0.3)' : COLORS.darkText} />
      <Text style={[actionStyles.label, disabled && actionStyles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

function InfoTab({ venue, details }: { venue: Venue; details: ReturnType<typeof usePlaceDetails>['details'] }) {
  return (
    <View style={infoStyles.container}>
      {details?.formatted_address && (
        <InfoRow label="Address" value={details.formatted_address} />
      )}
      {details?.formatted_phone_number && (
        <InfoRow label="Phone" value={details.formatted_phone_number} />
      )}
      {details?.website && (
        <InfoRow
          label="Website"
          value={details.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        />
      )}
      {details?.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
        <View style={infoStyles.hoursBlock}>
          <Text style={infoStyles.label}>Hours</Text>
          {details.opening_hours.weekday_text.map((line, i) => {
            const [day, ...rest] = line.split(': ');
            return (
              <View key={i} style={infoStyles.hoursRow}>
                <Text style={infoStyles.hoursDay}>{day}</Text>
                <Text style={infoStyles.hoursTime}>{rest.join(': ')}</Text>
              </View>
            );
          })}
        </View>
      )}
      {!details && (
        <>
          <InfoRow label="Address" value={venue.address} />
          <InfoRow label="Type" value={venue.type} />
        </>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

function PhotosTab({ photos }: { photos: string[] }) {
  if (photos.length === 0) return <EmptyTab message="No photos yet" />;

  return (
    <View style={photoStyles.grid}>
      {photos.map((uri, i) => (
        <Image key={i} source={{ uri }} style={photoStyles.photo} resizeMode="cover" />
      ))}
    </View>
  );
}

function ReviewsTab({
  reviews,
  loading,
}: {
  reviews: NonNullable<import('../lib/types').PlaceDetails['reviews']>;
  loading: boolean;
}) {
  if (loading) return null;
  if (reviews.length === 0) return <EmptyTab message="No reviews yet" />;

  return (
    <View style={reviewStyles.container}>
      {reviews.map((r, i) => (
        <View key={i} style={reviewStyles.card}>
          <View style={reviewStyles.top}>
            <View style={reviewStyles.avatar}>
              {r.profile_photo_url ? (
                <Image source={{ uri: r.profile_photo_url }} style={reviewStyles.avatarImg} />
              ) : (
                <Text style={reviewStyles.avatarInitial}>
                  {r.author_name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={reviewStyles.authorInfo}>
              <Text style={reviewStyles.authorName}>{r.author_name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Stars rating={r.rating} />
                <Text style={reviewStyles.timeAgo}>{r.relative_time_description}</Text>
              </View>
            </View>
          </View>
          {r.text ? <Text style={reviewStyles.text}>{r.text}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <View style={{ paddingTop: 48, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, color: 'rgba(26,25,24,0.35)' }}>
        {message}
      </Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#111',
  },
  heroScroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
  },
  heroImage: {
    width,
    height: HERO_HEIGHT,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: HERO_HEIGHT - SHEET_RADIUS,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 7,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: 32,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 11,
  },
  dotOpen: { backgroundColor: '#22c55e' },
  dotClosed: { backgroundColor: '#ef4444' },
  metaLine: {},
  metaText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.5)',
  },
  ratingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNum: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.darkText,
  },
  priceText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: 'rgba(26,25,24,0.4)',
    marginLeft: 'auto',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingBottom: 14,
    gap: 10,
  },
  tabsRow: {
    paddingHorizontal: 18,
    gap: 2,
    alignItems: 'center',
    height: 44,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
  },
  tabActive: {
    backgroundColor: COLORS.darkText,
  },
  tabText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: 'rgba(26,25,24,0.45)',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 48,
  },
  detailsLoading: {
    position: 'absolute',
    top: 12,
    right: 22,
  },
});

const actionStyles = StyleSheet.create({
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(26,25,24,0.05)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(26,25,24,0.08)',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: COLORS.darkText,
  },
  labelDisabled: {
    color: 'rgba(26,25,24,0.35)',
  },
});

const infoStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  row: {
    gap: 4,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: 'rgba(26,25,24,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  value: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.darkText,
    lineHeight: 22,
  },
  hoursBlock: {
    gap: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  hoursDay: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.darkText,
    width: 100,
  },
  hoursTime: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.6)',
    flex: 1,
    textAlign: 'right',
  },
});

const photoStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -22, // bleed to sheet edges
    gap: 2,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 0.75,
  },
});

const reviewStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    gap: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(26,25,24,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 38,
    height: 38,
  },
  avatarInitial: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: 'rgba(26,25,24,0.5)',
  },
  authorInfo: {
    flex: 1,
    gap: 3,
  },
  authorName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.darkText,
  },
  timeAgo: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(26,25,24,0.4)',
  },
  text: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.75)',
    lineHeight: 21,
  },
});
