import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, MOCK_VENUES, GOOGLE_MAPS_API_KEY } from '../../lib/constants';
import { Venue } from '../../lib/types';
import VenueProfile from '../../components/VenueProfile';

const MIAMI = {
  latitude: 25.7879,
  longitude: -80.1878,
  latitudeDelta: 0.12,
  longitudeDelta: 0.08,
};

export default function MapScreen() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={MIAMI}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {MOCK_VENUES.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            onPress={() => setSelectedVenue(venue)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, venue.crowd >= 80 && styles.markerBusy]}>
                <Text style={styles.markerText}>{venue.crowd}%</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

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
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  markerBusy: {
    backgroundColor: '#ef4444',
  },
  markerText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    color: COLORS.darkText,
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
