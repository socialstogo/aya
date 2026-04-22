import { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, ScrollView, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';
import { Venue, FilterType } from '../../lib/types';
import { useVenues } from '../../hooks/useVenues';
import { useLocation, distanceMi } from '../../hooks/useLocation';
import VenueProfile from '../../components/VenueProfile';

const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const MIAMI = {
  latitude: 25.7879,
  longitude: -80.1878,
  latitudeDelta: 0.12,
  longitudeDelta: 0.08,
};

const FILTERS: FilterType[] = ['All', 'Bar', 'Nightclub', 'Restaurant', 'Rooftop', 'Live Music'];
const RADII = [0.5, 1, 2, 5, 10] as const;
type Radius = typeof RADII[number];

function crowdPin(crowd: number) {
  if (crowd >= 80) return '#ef4444';
  if (crowd >= 55) return '#f59e0b';
  return '#22c55e';
}

export default function MapScreen() {
  const { venues, loading } = useVenues();
  const userCoords = useLocation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [activeRadius, setActiveRadius] = useState<Radius>(5);
  const [radiusOpen, setRadiusOpen] = useState(false);

  const center = userCoords ?? { lat: MIAMI.latitude, lng: MIAMI.longitude };

  function locateMe() {
    const target = userCoords ?? { lat: MIAMI.latitude, lng: MIAMI.longitude };
    mapRef.current?.animateToRegion({
      latitude: target.lat,
      longitude: target.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.03,
    }, 600);
  }

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const typeOk = activeFilter === 'All' || v.type === activeFilter;
      const dist = distanceMi(center.lat, center.lng, v.lat, v.lng);
      return typeOk && dist <= activeRadius;
    });
  }, [venues, activeFilter, activeRadius, center.lat, center.lng]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={MAP_PROVIDER}
        initialRegion={MIAMI}
        customMapStyle={MAP_PROVIDER ? darkMapStyle : undefined}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filtered.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            title={venue.name}
            description={`${venue.crowd}% crowd · ${venue.isOpen ? 'Open' : 'Closed'}`}
            pinColor={crowdPin(venue.crowd)}
            onPress={() => setSelectedVenue(venue)}
          />
        ))}
      </MapView>

      {/* Filter bar */}
      <View style={[styles.filterBar, { top: insets.top + 12 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.pill, activeFilter === f && styles.pillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Locate me button */}
      <Pressable
        style={[styles.locateBtn, { bottom: 166 + insets.bottom }]}
        onPress={locateMe}
      >
        <Ionicons name="locate" size={20} color={COLORS.cream} />
      </Pressable>

      {/* Radius selector */}
      <View style={[styles.radiusWrap, { bottom: 110 + insets.bottom }]}>
        {radiusOpen && (
          <View style={styles.radiusMenu}>
            {RADII.map((r) => (
              <Pressable
                key={r}
                style={[styles.radiusItem, activeRadius === r && styles.radiusItemActive]}
                onPress={() => {
                  setActiveRadius(r);
                  setRadiusOpen(false);
                }}
              >
                <Text style={[styles.radiusItemText, activeRadius === r && styles.radiusItemTextActive]}>
                  {r} mi
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <Pressable style={styles.radiusBtn} onPress={() => setRadiusOpen((o) => !o)}>
          <Text style={styles.radiusBtnText}>{activeRadius} mi</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={COLORS.cream} />
            <Text style={styles.loadingText}>Loading venues...</Text>
          </View>
        </View>
      )}

      <VenueProfile
        venue={selectedVenue}
        visible={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  filterBar: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(13,12,10,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  pillActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  pillText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.cream,
  },
  pillTextActive: {
    color: COLORS.background,
  },
  radiusWrap: {
    position: 'absolute',
    right: 14,
    alignItems: 'flex-end',
  },
  radiusMenu: {
    backgroundColor: 'rgba(13,12,10,0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  radiusItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  radiusItemActive: {
    backgroundColor: COLORS.cream,
  },
  radiusItemText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.cream,
  },
  radiusItemTextActive: {
    color: COLORS.background,
  },
  radiusBtn: {
    backgroundColor: 'rgba(13,12,10,0.82)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  radiusBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.cream,
  },
  locateBtn: {
    position: 'absolute',
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13,12,10,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(13,12,10,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.cream,
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1917' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#262420' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2137' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];
