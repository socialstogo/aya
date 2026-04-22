import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

const CATEGORIES = ['All', 'Food', 'Art', 'Outdoors', 'Sports', 'Entertainment', 'Shopping'];

interface Activity {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  distance: string;
  rating: number;
  description: string;
  hours: string;
  priceLevel: number;
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1',  name: 'Wynwood Walls',              category: 'Art',           neighborhood: 'Wynwood',          distance: '0.8 mi', rating: 4.8, description: 'World-famous outdoor street art museum featuring rotating murals by global artists.', hours: 'Mon–Sun 10am–11pm', priceLevel: 1 },
  { id: '2',  name: 'Miami Escape Room',           category: 'Entertainment', neighborhood: 'Brickell',         distance: '0.7 mi', rating: 4.6, description: 'Immersive puzzle rooms for groups of 2–10. Book in advance on weekends.', hours: 'Daily 12pm–12am', priceLevel: 2 },
  { id: '3',  name: 'Pottery Miami',               category: 'Entertainment', neighborhood: 'Wynwood',          distance: '1.1 mi', rating: 4.7, description: 'Wheel throwing and hand-building classes. Walk-ins welcome when space allows.', hours: 'Tue–Sun 11am–9pm', priceLevel: 2 },
  { id: '4',  name: 'Lucky Strike Lanes',          category: 'Entertainment', neighborhood: 'Brickell',         distance: '0.5 mi', rating: 4.2, description: 'Upscale bowling, arcade games, and full bar. Great for groups.', hours: 'Mon–Fri 4pm–2am, Sat–Sun 12pm–2am', priceLevel: 3 },
  { id: '5',  name: 'Calle Ocho Food Tour',        category: 'Food',          neighborhood: 'Little Havana',    distance: '2.2 mi', rating: 4.9, description: 'Walking tour of authentic Cuban spots — from ventanitas to mojito bars.', hours: 'Fri–Sun 11am–3pm', priceLevel: 2 },
  { id: '6',  name: 'Bayfront Park',               category: 'Outdoors',      neighborhood: 'Downtown',         distance: '1.0 mi', rating: 4.4, description: '32-acre waterfront park with an amphitheater and city views. Great for sunset.', hours: 'Daily 6am–10pm', priceLevel: 1 },
  { id: '7',  name: 'South Pointe Park',           category: 'Outdoors',      neighborhood: 'South Beach',      distance: '2.4 mi', rating: 4.6, description: 'Scenic tip-of-the-beach park with views of cruise ships and the ocean inlet.', hours: 'Daily 6am–10pm', priceLevel: 1 },
  { id: '8',  name: 'Miami Beach Boardwalk',       category: 'Outdoors',      neighborhood: 'South Beach',      distance: '3.1 mi', rating: 4.7, description: '4-mile oceanfront promenade connecting South Beach to Mid-Beach. Iconic.', hours: 'Always open', priceLevel: 1 },
  { id: '9',  name: 'Perez Art Museum Miami',      category: 'Art',           neighborhood: 'Downtown',         distance: '1.5 mi', rating: 4.5, description: 'Contemporary and modern art in a stunning waterfront building. Free Sundays.', hours: 'Tue–Sun 11am–6pm', priceLevel: 2 },
  { id: '10', name: 'Bayside Marketplace',         category: 'Shopping',      neighborhood: 'Downtown',         distance: '1.2 mi', rating: 4.2, description: 'Waterfront open-air mall with shops, live music, and bay boat tours.', hours: 'Mon–Thu 10am–10pm, Fri–Sat 10am–11pm', priceLevel: 2 },
  { id: '11', name: 'Vizcaya Museum & Gardens',    category: 'Art',           neighborhood: 'Coconut Grove',    distance: '4.2 mi', rating: 4.8, description: 'Gilded Age villa on the bay with ornate European-inspired gardens.', hours: 'Wed–Mon 9:30am–4:30pm', priceLevel: 2 },
  { id: '12', name: 'Whirlyball Miami',            category: 'Sports',        neighborhood: 'Wynwood',          distance: '1.4 mi', rating: 4.5, description: 'Bumper car + lacrosse hybrid sport. Hilarious for groups. Full bar on site.', hours: 'Wed–Sun 5pm–midnight', priceLevel: 3 },
  { id: '13', name: 'loanDepot Park (Marlins)',    category: 'Sports',        neighborhood: 'Little Havana',    distance: '2.8 mi', rating: 4.1, description: 'Home of the Miami Marlins. Retractable roof keeps games cool.', hours: 'Game days only', priceLevel: 2 },
  { id: '14', name: 'Wynwood Brewing Co.',         category: 'Food',          neighborhood: 'Wynwood',          distance: '0.9 mi', rating: 4.3, description: 'Miami\'s first craft brewery with award-winning ales and a shaded outdoor patio.', hours: 'Mon–Thu 4–10pm, Fri–Sun 12–11pm', priceLevel: 2 },
  { id: '15', name: 'Coyo Taco Wynwood',           category: 'Food',          neighborhood: 'Wynwood',          distance: '0.8 mi', rating: 4.6, description: 'Mexican street food with a mezcal bar. Late night kitchen until 5am on weekends.', hours: 'Daily 11am–5am', priceLevel: 2 },
  { id: '16', name: 'The Tank Brewing',            category: 'Food',          neighborhood: 'Wynwood',          distance: '1.2 mi', rating: 4.4, description: 'Local craft beers in a massive warehouse space with DJs on weekends.', hours: 'Mon–Thu 2–11pm, Fri–Sun 12pm–12am', priceLevel: 2 },
  { id: '17', name: 'Ocean Drive Walk',            category: 'Outdoors',      neighborhood: 'South Beach',      distance: '3.5 mi', rating: 4.9, description: 'The definitive Art Deco strip — pastel hotels, sidewalk cafés, neon lights at night.', hours: 'Always open', priceLevel: 1 },
  { id: '18', name: 'Miami Improv',                category: 'Entertainment', neighborhood: 'Brickell',         distance: '0.6 mi', rating: 4.3, description: 'Stand-up comedy club with national headliners every weekend. Two-drink minimum.', hours: 'Thu–Sun 7pm–11pm', priceLevel: 2 },
  { id: '19', name: 'Jungle Island',               category: 'Outdoors',      neighborhood: 'Downtown',         distance: '2.0 mi', rating: 4.1, description: 'Interactive zoological park with parrots, lemurs, and flamingos on Watson Island.', hours: 'Daily 10am–5pm', priceLevel: 3 },
  { id: '20', name: 'Frost Museum of Science',     category: 'Art',           neighborhood: 'Downtown',         distance: '1.8 mi', rating: 4.4, description: 'Five-story aquarium, planetarium, and science exhibits. Great for curious minds.', hours: 'Daily 9am–6pm', priceLevel: 2 },
  { id: '21', name: 'Little Havana Food Tour',     category: 'Food',          neighborhood: 'Little Havana',    distance: '2.5 mi', rating: 4.8, description: 'Guided 3-hour taste tour through Miami\'s Cuban heartland. Cigars included.', hours: 'Sat–Sun 10am–1pm', priceLevel: 3 },
  { id: '22', name: 'Axe Throwing Miami',          category: 'Entertainment', neighborhood: 'Wynwood',          distance: '1.0 mi', rating: 4.5, description: 'Urban axe throwing with coached sessions and craft cocktails. Great date night.', hours: 'Tue–Sun 3pm–midnight', priceLevel: 2 },
  { id: '23', name: 'Top Golf Miami',              category: 'Sports',        neighborhood: 'Brickell',         distance: '1.5 mi', rating: 4.6, description: 'Multi-level golf bays with gamified targets. Full bar and kitchen.', hours: 'Mon–Thu 9am–12am, Fri–Sun 9am–2am', priceLevel: 3 },
  { id: '24', name: 'Biscayne Bay Kayak',          category: 'Outdoors',      neighborhood: 'Downtown',         distance: '1.3 mi', rating: 4.7, description: 'Guided kayak tours through mangroves and the bay at sunrise or sunset.', hours: 'Daily by reservation', priceLevel: 2 },
  { id: '25', name: 'Design District Walk',        category: 'Shopping',      neighborhood: 'Design District',  distance: '1.8 mi', rating: 4.5, description: 'Open-air luxury shopping district with public art installations and rooftop gardens.', hours: 'Mon–Sat 10am–9pm, Sun 12–6pm', priceLevel: 4 },
];

const TAB_BAR_HEIGHT = 90;

const CATEGORY_COLORS: Record<string, string> = {
  Food:          '#f97316',
  Art:           '#a855f7',
  Outdoors:      '#22c55e',
  Sports:        '#3b82f6',
  Entertainment: '#ef4444',
  Shopping:      '#eab308',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All:           'grid-outline',
  Food:          'restaurant-outline',
  Art:           'color-palette-outline',
  Outdoors:      'leaf-outline',
  Sports:        'football-outline',
  Entertainment: 'game-controller-outline',
  Shopping:      'bag-handle-outline',
};

function priceLabel(level: number) {
  return '$'.repeat(Math.max(1, level));
}

export default function ActivitiesScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const activities = MOCK_ACTIVITIES.filter(
    (a) => activeCategory === 'All' || a.category === activeCategory
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Activities</Text>
          <Text style={styles.subtitle}>Things to do in Miami</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.pill, activeCategory === c && styles.pillActive]}
              onPress={() => setActiveCategory(c)}
            >
              <Ionicons
                name={CATEGORY_ICONS[c] ?? 'ellipse-outline'}
                size={13}
                color={activeCategory === c ? COLORS.darkText : COLORS.muted}
              />
              <Text style={[styles.pillText, activeCategory === c && styles.pillTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FlatList
        style={styles.list}
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const color = CATEGORY_COLORS[activity.category] ?? COLORS.blue;
  const icon = CATEGORY_ICONS[activity.category] ?? 'ellipse-outline';

  function openMaps() {
    const q = encodeURIComponent(`${activity.name} Miami FL`);
    const apple = `maps:?q=${q}`;
    const google = `https://www.google.com/maps/search/?q=${q}`;
    Linking.canOpenURL(apple)
      .then((ok) => Linking.openURL(ok ? apple : google))
      .catch(() => Linking.openURL(google));
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={openMaps}
    >
      {/* Hero block */}
      <View style={[styles.hero, { backgroundColor: color + '22' }]}>
        <View style={[styles.iconCircle, { backgroundColor: color + '33' }]}>
          <Ionicons name={icon} size={36} color={color} />
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: color }]}>
          <Text style={styles.categoryBadgeText}>{activity.category}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{activity.name}</Text>
          <Text style={styles.price}>{priceLabel(activity.priceLevel)}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={COLORS.muted} />
            <Text style={styles.metaText}>{activity.neighborhood}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="navigate-outline" size={13} color={COLORS.muted} />
            <Text style={styles.metaText}>{activity.distance}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.ratingText}>{activity.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>

        <View style={styles.footer}>
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.muted} />
            <Text style={styles.hoursText} numberOfLines={1}>{activity.hours}</Text>
          </View>
          <View style={styles.directionsBtn}>
            <Ionicons name="navigate" size={13} color={color} />
            <Text style={[styles.directionsBtnText, { color }]}>Directions</Text>
          </View>
        </View>
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
  filtersScroll: {
    maxHeight: 52,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  pillActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  pillText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
  pillTextActive: {
    color: COLORS.darkText,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: TAB_BAR_HEIGHT + 20,
    gap: 16,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1a1917',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  hero: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.3,
  },
  info: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 10,
    backgroundColor: COLORS.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 19,
    color: COLORS.cream,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  ratingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.cream,
  },
  description: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(240,237,228,0.65)',
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  hoursText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    flex: 1,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(240,237,228,0.12)',
  },
  directionsBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
  },
});
