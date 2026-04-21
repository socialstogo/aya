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
  StatusBar,
} from 'react-native';
import { COLORS } from '../lib/constants';
import { Venue } from '../lib/types';
import StatChip from './StatChip';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;
const SHEET_BORDER = 24;

const TABS = ['Info', 'Photos', 'Events', 'Menu', 'Live Thread'] as const;
type Tab = (typeof TABS)[number];

interface VenueProfileProps {
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

export default function VenueProfile({ venue, visible, onClose }: VenueProfileProps) {
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Info');

  if (!venue) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Hero photo */}
        <Image source={{ uri: venue.image }} style={styles.hero} resizeMode="cover" />

        {/* Overlay buttons */}
        <View style={styles.overlayButtons}>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.circleBtnText}>←</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
            onPress={() => setLiked(!liked)}
          >
            <Text style={styles.circleBtnText}>{liked ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        {/* White sheet */}
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Venue header */}
          <View style={styles.venueHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <View style={[styles.statusDot, styles.openDot]} />
            </View>
            <Text style={styles.venueMeta}>
              {venue.type} · {venue.neighborhood}
            </Text>

            <View style={styles.statsRow}>
              <StatChip label="crowd" value={crowdLabel(venue.crowd)} highlight={venue.crowd >= 80} />
              <StatChip label="wait" value={venue.wait === 0 ? 'No wait' : `${venue.wait}m`} />
              <StatChip label="rating" value={venue.rating.toFixed(1)} />
            </View>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
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
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentInner}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'Info' && <InfoTab venue={venue} />}
            {activeTab === 'Photos' && <PlaceholderTab label="Photos coming soon" />}
            {activeTab === 'Events' && <PlaceholderTab label="Events will appear here" />}
            {activeTab === 'Menu' && <PlaceholderTab label="Menu not available" />}
            {activeTab === 'Live Thread' && <PlaceholderTab label="Be the first to post tonight" />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoTab({ venue }: { venue: Venue }) {
  return (
    <View style={infoStyles.container}>
      <InfoRow label="Address" value={venue.address} />
      <InfoRow label="Hours" value={venue.hours} />
      <InfoRow label="Type" value={venue.type} />
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

function PlaceholderTab({ label }: { label: string }) {
  return (
    <View style={infoStyles.placeholder}>
      <Text style={infoStyles.placeholderText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
  },
  overlayButtons: {
    position: 'absolute',
    top: (StatusBar.currentHeight ?? 44) + 8,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  circleBtnText: {
    fontSize: 18,
    color: COLORS.darkText,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.75,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: HERO_HEIGHT - SHEET_BORDER,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SHEET_BORDER,
    borderTopRightRadius: SHEET_BORDER,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  venueHeader: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: COLORS.darkText,
    flex: 1,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 2,
  },
  openDot: {
    backgroundColor: '#22c55e',
  },
  venueMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(26,25,24,0.55)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  tabsScroll: {
    maxHeight: 44,
  },
  tabsContent: {
    paddingHorizontal: 18,
    gap: 4,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  tabActive: {
    backgroundColor: COLORS.darkText,
  },
  tabText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: 'rgba(26,25,24,0.5)',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginTop: 4,
  },
  tabContent: {
    flex: 1,
  },
  tabContentInner: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
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
    fontSize: 12,
    color: 'rgba(26,25,24,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.darkText,
    lineHeight: 22,
  },
  placeholder: {
    paddingTop: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: 'rgba(26,25,24,0.35)',
  },
});
