import { useState, useRef, useEffect } from 'react';
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
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../lib/constants';
import { Venue } from '../lib/types';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { useLocation, distanceMi } from '../hooks/useLocation';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import StatChip from './StatChip';

const { width, height } = Dimensions.get('window');
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
  return 'Chill';
}

function waitLabel(mins: number) {
  return mins === 0 ? 'No wait' : `${mins}m`;
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
  const [followed, setFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Info');
  const insets = useSafeAreaInsets();
  const userCoords = useLocation();
  const { session } = useAuth();
  const { details, loading: detailsLoading } = usePlaceDetails(visible ? venue?.id ?? null : null);

  const COMPACT_TOP = height * 0.40;
  const EXPANDED_TOP = insets.top + 60;

  // Keep snap positions in refs so PanResponder closures always read current values
  const snapRef = useRef({ compact: COMPACT_TOP, expanded: EXPANDED_TOP });
  snapRef.current = { compact: COMPACT_TOP, expanded: EXPANDED_TOP };

  const lastY = useRef(COMPACT_TOP);
  const sheetY = useRef(new Animated.Value(COMPACT_TOP)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => sheetY.stopAnimation(),
      onPanResponderMove: (_, g) => {
        const { compact, expanded } = snapRef.current;
        const next = Math.max(expanded, Math.min(compact, lastY.current + g.dy));
        sheetY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const { compact, expanded } = snapRef.current;
        const shouldExpand = g.dy < -50 || g.vy < -0.5;
        const target = shouldExpand ? expanded : compact;
        lastY.current = target;
        Animated.spring(sheetY, {
          toValue: target,
          useNativeDriver: false,
          damping: 18,
          stiffness: 180,
          mass: 1,
        }).start();
      },
    })
  ).current;

  const heroOpacity = sheetY.interpolate({
    inputRange: [EXPANDED_TOP, COMPACT_TOP],
    outputRange: [0.15, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      sheetY.setValue(COMPACT_TOP);
      lastY.current = COMPACT_TOP;
      setActiveTab('Info');
    }
  }, [visible]);

  if (!venue) return null;

  const distance = userCoords
    ? distanceMi(userCoords.lat, userCoords.lng, venue.lat, venue.lng).toFixed(1) + ' mi'
    : null;

  const heroPhotos =
    details?.photos && details.photos.length > 0 ? details.photos : [venue.image];

  function call() {
    if (details?.formatted_phone_number) {
      Linking.openURL(`tel:${details.formatted_phone_number.replace(/\D/g, '')}`);
    }
  }

  function openDirections() {
    const url =
      details?.maps_url ??
      `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;
    Linking.openURL(url);
  }

  function openWebsite() {
    if (details?.website) Linking.openURL(details.website);
  }

  function openUber() {
    const uberDeep = `uber://?action=setPickup&dropoff[latitude]=${venue.lat}&dropoff[longitude]=${venue.lng}&dropoff[nickname]=${encodeURIComponent(venue.name)}`;
    const uberWeb = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${venue.lat}&dropoff[longitude]=${venue.lng}&dropoff[nickname]=${encodeURIComponent(venue.name)}`;
    Linking.canOpenURL(uberDeep).then((ok) => Linking.openURL(ok ? uberDeep : uberWeb));
  }

  function openLyft() {
    const lyftDeep = `lyft://ridetype?id=lyft&destination[latitude]=${venue.lat}&destination[longitude]=${venue.lng}`;
    const lyftWeb = `https://www.lyft.com/ride?destination[lat]=${venue.lat}&destination[lng]=${venue.lng}`;
    Linking.canOpenURL(lyftDeep).then((ok) => Linking.openURL(ok ? lyftDeep : lyftWeb));
  }

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    if (!session) return;
    const { data: row } = await supabase
      .from('users')
      .select('followed_venues')
      .eq('id', session.user.id)
      .single();
    const current: string[] = row?.followed_venues ?? [];
    const updated = next
      ? [...current, venue.id]
      : current.filter((id) => id !== venue.id);
    await supabase
      .from('users')
      .update({ followed_venues: updated })
      .eq('id', session.user.id);
  }

  const HERO_HEIGHT = COMPACT_TOP;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={styles.root}>

        {/* Hero photo gallery */}
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={[styles.heroScroll, { height: HERO_HEIGHT, opacity: heroOpacity }]}
        >
          {heroPhotos.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={{ width, height: HERO_HEIGHT }}
              resizeMode="cover"
            />
          ))}
        </Animated.ScrollView>

        {/* Back + heart controls */}
        <View style={[styles.controls, { top: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.75 }]}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.darkText} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.75 }]}
            onPress={toggleLike}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? '#ef4444' : COLORS.darkText}
            />
          </Pressable>
        </View>

        {/* Draggable white sheet */}
        <Animated.View style={[styles.sheet, { top: sheetY }]}>

          {/* Drag zone — handle pill + full header area */}
          <View {...panResponder.panHandlers}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          {/* Venue header */}
          <View style={styles.header}>
            <View style={styles.nameLine}>
              <Text style={styles.name} numberOfLines={2}>{venue.name}</Text>
              <View style={[styles.dot, venue.isOpen ? styles.dotOpen : styles.dotClosed]} />
            </View>

            <Text style={styles.metaText}>
              {venue.type} · {venue.neighborhood}
              {distance ? ` · ${distance}` : ''}
            </Text>

            <Pressable
              style={styles.ratingLine}
              onPress={() => setActiveTab('Reviews')}
              hitSlop={8}
            >
              <Stars rating={venue.rating} />
              <Text style={styles.ratingNum}>{venue.rating.toFixed(1)}</Text>
              <Ionicons name="chevron-forward" size={12} color="rgba(26,25,24,0.35)" style={{ marginLeft: -2 }} />
              <Text style={styles.priceText}>{priceLabel(venue.priceLevel)}</Text>
            </Pressable>

            {/* Follow row */}
            <View style={styles.followRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.followBtn,
                  followed && styles.followingBtn,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => setFollowed((f) => !f)}
              >
                <Text style={[styles.followBtnText, followed && styles.followingBtnText]}>
                  {followed ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
              <View style={styles.followersChip}>
                <Text style={styles.followersCount}>847</Text>
                <Text style={styles.followersLabel}>followers</Text>
              </View>
            </View>

            <View style={styles.chips}>
              <StatChip label="crowd" value={crowdLabel(venue.crowd)} highlight={venue.crowd >= 80} />
              <StatChip label="wait" value={waitLabel(venue.wait)} />
              <StatChip label="status" value={venue.isOpen ? 'Open' : 'Closed'} />
            </View>
          </View>
          </View>{/* end drag zone */}

          {/* Action buttons */}
          <View style={styles.actionsGrid}>
            <View style={styles.actionsRow}>
              <ActionBtn icon="call" label="Call" disabled={!details?.formatted_phone_number} onPress={call} />
              <ActionBtn icon="navigate" label="Directions" onPress={openDirections} />
              <ActionBtn icon="globe-outline" label="Website" disabled={!details?.website} onPress={openWebsite} />
            </View>
            <View style={styles.actionsRow}>
              <RideBtn brand="uber" onPress={openUber} />
              <RideBtn brand="lyft" onPress={openLyft} />
            </View>
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
            {activeTab === 'Info' && <InfoTab venue={venue} details={details} />}
            {activeTab === 'Photos' && <PhotosTab photos={details?.photos ?? [venue.image]} />}
            {activeTab === 'Reviews' && (
              <ReviewsTab reviews={details?.reviews ?? []} loading={detailsLoading} />
            )}
            {activeTab === 'Live Thread' && <LiveThreadTab venueName={venue.name} />}
          </ScrollView>
        </Animated.View>
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
      <Ionicons name={icon} size={18} color={disabled ? 'rgba(26,25,24,0.3)' : COLORS.darkText} />
      <Text style={[actionStyles.label, disabled && actionStyles.labelDisabled]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function RideBtn({ brand, onPress }: { brand: 'uber' | 'lyft'; onPress: () => void }) {
  const isUber = brand === 'uber';
  const bg = isUber ? '#000000' : '#FF00BF';
  const label = isUber ? 'Uber' : 'Lyft';
  const icon: keyof typeof Ionicons.glyphMap = isUber ? 'car-outline' : 'car-sport-outline';
  return (
    <Pressable
      style={({ pressed }) => [rideStyles.btn, { backgroundColor: bg }, pressed && { opacity: 0.8 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={18} color="#ffffff" />
      <Text style={rideStyles.label}>{label}</Text>
    </Pressable>
  );
}

function InfoTab({
  venue,
  details,
}: {
  venue: Venue;
  details: ReturnType<typeof usePlaceDetails>['details'];
}) {
  return (
    <View style={infoStyles.container}>
      {/* Live Now card */}
      <View style={infoStyles.liveCard}>
        <Text style={infoStyles.liveTitle}>LIVE RIGHT NOW</Text>
        <View style={infoStyles.liveGrid}>
          <View style={infoStyles.liveStat}>
            <Text style={infoStyles.liveStatLabel}>Wait</Text>
            <Text style={infoStyles.liveStatValue}>{waitLabel(venue.wait)}</Text>
          </View>
          <View style={infoStyles.liveStat}>
            <Text style={infoStyles.liveStatLabel}>Crowd</Text>
            <Text style={infoStyles.liveStatValue}>{crowdLabel(venue.crowd)}</Text>
          </View>
          <View style={infoStyles.liveStat}>
            <Text style={infoStyles.liveStatLabel}>Price</Text>
            <Text style={infoStyles.liveStatValue}>{priceLabel(venue.priceLevel)}</Text>
          </View>
          <View style={infoStyles.liveStat}>
            <Text style={infoStyles.liveStatLabel}>Status</Text>
            <Text style={[infoStyles.liveStatValue, venue.isOpen && infoStyles.openText]}>
              {venue.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <View style={infoStyles.crowdBarBg}>
          <View style={[infoStyles.crowdBarFill, { width: `${venue.crowd}%` as any }]} />
        </View>
        <Text style={infoStyles.crowdPct}>{venue.crowd}%</Text>
      </View>

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

      {/* Claim venue */}
      <Pressable
        style={({ pressed }) => [infoStyles.claimBtn, pressed && { opacity: 0.75 }]}
        onPress={() =>
          Linking.openURL('mailto:venues@ayaapp.io?subject=Claim%20My%20Venue')
        }
      >
        <Ionicons name="business-outline" size={16} color="rgba(26,25,24,0.4)" />
        <Text style={infoStyles.claimText}>Own this venue? Claim your profile</Text>
      </Pressable>
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

function LiveThreadTab({ venueName }: { venueName: string }) {
  const MOCK_THREAD = [
    { id: '1', author: 'Sofia M.', color: '#2a2eef', time: '8m ago', text: 'Vibe is incredible right now, DJ just dropped 🔥' },
    { id: '2', author: 'Nico R.',  color: '#ef2a6a', time: '15m ago', text: 'No line outside, walked right in.' },
    { id: '3', author: 'Diego F.', color: '#efb82a', time: '32m ago', text: 'Drinks are strong tonight. Worth it.' },
  ];

  return (
    <View style={threadStyles.container}>
      {MOCK_THREAD.map((post) => (
        <View key={post.id} style={threadStyles.post}>
          <View style={[threadStyles.avatar, { backgroundColor: post.color }]}>
            <Text style={threadStyles.avatarInit}>{post.author.charAt(0)}</Text>
          </View>
          <View style={threadStyles.postBody}>
            <View style={threadStyles.postTop}>
              <Text style={threadStyles.author}>{post.author}</Text>
              <Text style={threadStyles.time}>{post.time}</Text>
            </View>
            <Text style={threadStyles.postText}>{post.text}</Text>
          </View>
        </View>
      ))}
      <Pressable style={threadStyles.postBtn}>
        <Ionicons name="create-outline" size={16} color="rgba(26,25,24,0.5)" />
        <Text style={threadStyles.postBtnText}>What's happening at {venueName}?</Text>
      </Pressable>
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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  handleWrap: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    gap: 7,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: COLORS.darkText,
    flex: 1,
    lineHeight: 30,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 10,
  },
  dotOpen:   { backgroundColor: '#22c55e' },
  dotClosed: { backgroundColor: '#ef4444' },
  metaText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
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
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  followBtn: {
    flex: 1,
    backgroundColor: COLORS.darkText,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(26,25,24,0.2)',
  },
  followBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  followingBtnText: {
    color: 'rgba(26,25,24,0.5)',
  },
  followersChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(26,25,24,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followersCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  followersLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: 'rgba(26,25,24,0.4)',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsGrid: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 13,
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
    paddingTop: 18,
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
    gap: 4,
    backgroundColor: 'rgba(26,25,24,0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(26,25,24,0.08)',
  },
  btnDisabled: {
    opacity: 0.3,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.darkText,
    textAlign: 'center',
  },
  labelDisabled: {
    color: 'rgba(26,25,24,0.35)',
  },
});

const rideStyles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingVertical: 11,
  },
  label: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

const infoStyles = StyleSheet.create({
  container: {
    gap: 20,
  },
  liveCard: {
    backgroundColor: 'rgba(26,25,24,0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  liveTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: 'rgba(26,25,24,0.4)',
    letterSpacing: 1.2,
  },
  liveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  liveStat: {
    width: '45%',
    gap: 2,
  },
  liveStatLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(26,25,24,0.4)',
  },
  liveStatValue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.darkText,
  },
  openText: {
    color: '#22c55e',
  },
  crowdBarBg: {
    height: 4,
    backgroundColor: 'rgba(26,25,24,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  crowdBarFill: {
    height: 4,
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  crowdPct: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: '#22c55e',
    textAlign: 'right',
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
    marginBottom: 4,
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
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,25,24,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  claimText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: 'rgba(26,25,24,0.45)',
  },
});

const photoStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -22,
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

const threadStyles = StyleSheet.create({
  container: {
    gap: 16,
  },
  post: {
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInit: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  postBody: {
    flex: 1,
    gap: 4,
  },
  postTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.darkText,
  },
  time: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: 'rgba(26,25,24,0.4)',
  },
  postText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.75)',
    lineHeight: 20,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,25,24,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  postBtnText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.4)',
    flex: 1,
  },
});
