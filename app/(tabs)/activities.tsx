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

const MOCK_ACTIVITIES = [
  { id: '1',  name: 'Wynwood Walls',          category: 'Art',           neighborhood: 'Wynwood',       distance: '0.8 mi', rating: 4.8 },
  { id: '2',  name: 'Miami Escape Room',       category: 'Entertainment', neighborhood: 'Brickell',      distance: '0.7 mi', rating: 4.6 },
  { id: '3',  name: 'Pottery Miami',           category: 'Entertainment', neighborhood: 'Wynwood',       distance: '1.1 mi', rating: 4.7 },
  { id: '4',  name: 'Lucky Strike Lanes',      category: 'Entertainment', neighborhood: 'Brickell',      distance: '0.5 mi', rating: 4.2 },
  { id: '5',  name: 'Calle Ocho Food Tour',    category: 'Food',          neighborhood: 'Little Havana', distance: '2.2 mi', rating: 4.9 },
  { id: '6',  name: 'Bayfront Park',           category: 'Outdoors',      neighborhood: 'Downtown',      distance: '1.0 mi', rating: 4.4 },
  { id: '7',  name: 'South Pointe Park',       category: 'Outdoors',      neighborhood: 'South Beach',   distance: '2.4 mi', rating: 4.6 },
  { id: '8',  name: 'Miami Beach Boardwalk',   category: 'Outdoors',      neighborhood: 'South Beach',   distance: '3.1 mi', rating: 4.7 },
  { id: '9',  name: 'Perez Art Museum',        category: 'Art',           neighborhood: 'Downtown',      distance: '1.5 mi', rating: 4.5 },
  { id: '10', name: 'Bayside Marketplace',     category: 'Shopping',      neighborhood: 'Downtown',      distance: '1.2 mi', rating: 4.2 },
  { id: '11', name: 'Vizcaya Museum',          category: 'Art',           neighborhood: 'Coconut Grove', distance: '4.2 mi', rating: 4.8 },
  { id: '12', name: 'Whirlyball Miami',        category: 'Sports',        neighborhood: 'Wynwood',       distance: '1.4 mi', rating: 4.5 },
  { id: '13', name: 'Marlins Park',            category: 'Sports',        neighborhood: 'Little Havana', distance: '2.8 mi', rating: 4.1 },
  { id: '14', name: 'Wynwood Brewing Co',      category: 'Food',          neighborhood: 'Wynwood',       distance: '0.9 mi', rating: 4.3 },
  { id: '15', name: 'Coyo Taco Wynwood',       category: 'Food',          neighborhood: 'Wynwood',       distance: '0.8 mi', rating: 4.6 },
  { id: '16', name: 'The Tank Brewing',        category: 'Food',          neighborhood: 'Wynwood',       distance: '1.2 mi', rating: 4.4 },
  { id: '17', name: 'Ocean Drive Walk',        category: 'Outdoors',      neighborhood: 'South Beach',   distance: '3.5 mi', rating: 4.9 },
  { id: '18', name: 'Miami Improv',            category: 'Entertainment', neighborhood: 'Brickell',      distance: '0.6 mi', rating: 4.3 },
  { id: '19', name: 'Jungle Island',           category: 'Outdoors',      neighborhood: 'Downtown',      distance: '2.0 mi', rating: 4.1 },
  { id: '20', name: 'Phillip and Patricia Frost Museum of Science', category: 'Art', neighborhood: 'Downtown', distance: '1.8 mi', rating: 4.4 },
  { id: '21', name: 'Little Havana Food Tour', category: 'Food',          neighborhood: 'Little Havana', distance: '2.5 mi', rating: 4.8 },
  { id: '22', name: 'Axe Throwing Miami',      category: 'Entertainment', neighborhood: 'Wynwood',       distance: '1.0 mi', rating: 4.5 },
  { id: '23', name: 'Top Golf Miami',          category: 'Sports',        neighborhood: 'Brickell',      distance: '1.5 mi', rating: 4.6 },
  { id: '24', name: 'Biscayne Bay Kayak',      category: 'Outdoors',      neighborhood: 'Downtown',      distance: '1.3 mi', rating: 4.7 },
  { id: '25', name: 'Design District Walk',    category: 'Shopping',      neighborhood: 'Design District', distance: '1.8 mi', rating: 4.5 },
];

const TAB_BAR_HEIGHT = 90;

const CATEGORY_ICONS: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  All:           'grid-outline',
  Food:          'restaurant-outline',
  Art:           'color-palette-outline',
  Outdoors:      'leaf-outline',
  Sports:        'football-outline',
  Entertainment: 'game-controller-outline',
  Shopping:      'bag-handle-outline',
};

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
        renderItem={({ item }) => <ActivityRow activity={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function ActivityRow({ activity }: { activity: (typeof MOCK_ACTIVITIES)[0] }) {
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
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={openMaps}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={COLORS.cream} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{activity.name}</Text>
        <Text style={styles.rowMeta}>{activity.category} · {activity.neighborhood}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.distance}>{activity.distance}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color="#f59e0b" />
          <Text style={styles.rating}>{activity.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
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
    paddingBottom: TAB_BAR_HEIGHT + 20,
    paddingTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(240,237,228,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  rowMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  distance: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.cream,
  },
});
