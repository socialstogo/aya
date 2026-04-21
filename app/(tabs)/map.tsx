import { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../../lib/constants';
import { Venue } from '../../lib/types';
import { useVenues } from '../../hooks/useVenues';
import VenueProfile from '../../components/VenueProfile';

const MAP_PROVIDER = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

const MIAMI = {
  latitude: 25.7879,
  longitude: -80.1878,
  latitudeDelta: 0.12,
  longitudeDelta: 0.08,
};

function crowdPin(crowd: number) {
  if (crowd >= 80) return '#ef4444';
  if (crowd >= 55) return '#f59e0b';
  return '#22c55e';
}

export default function MapScreen() {
  const { venues, loading } = useVenues();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={MAP_PROVIDER}
        initialRegion={MIAMI}
        customMapStyle={MAP_PROVIDER ? darkMapStyle : undefined}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {venues.map((venue) => (
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
