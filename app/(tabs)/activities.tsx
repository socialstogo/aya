import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../lib/constants';

const CATEGORIES = ['All', 'Food', 'Art', 'Outdoors', 'Sports', 'Nightlife', 'Shopping'];

const MOCK_ACTIVITIES = [
  { id: '1', name: 'Wynwood Walls', category: 'Art', neighborhood: 'Wynwood', distance: '0.8 mi', rating: 4.8 },
  { id: '2', name: 'Bayside Marketplace', category: 'Shopping', neighborhood: 'Downtown', distance: '1.2 mi', rating: 4.2 },
  { id: '3', name: 'South Pointe Park', category: 'Outdoors', neighborhood: 'South Beach', distance: '2.4 mi', rating: 4.6 },
  { id: '4', name: 'Perez Art Museum', category: 'Art', neighborhood: 'Downtown', distance: '1.5 mi', rating: 4.5 },
  { id: '5', name: 'Miami Beach Boardwalk', category: 'Outdoors', neighborhood: 'South Beach', distance: '3.1 mi', rating: 4.7 },
  { id: '6', name: 'Calle Ocho Food Tour', category: 'Food', neighborhood: 'Little Havana', distance: '2.2 mi', rating: 4.9 },
  { id: '7', name: 'Bayfront Park', category: 'Outdoors', neighborhood: 'Downtown', distance: '1.0 mi', rating: 4.4 },
  { id: '8', name: 'Marlins Park', category: 'Sports', neighborhood: 'Little Havana', distance: '2.8 mi', rating: 4.1 },
];

const TAB_BAR_HEIGHT = 90;

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
          <Text style={styles.subtitle}>Things to do nearby</Text>
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
              <Text style={[styles.pillText, activeCategory === c && styles.pillTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow activity={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function ActivityRow({ activity }: { activity: (typeof MOCK_ACTIVITIES)[0] }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>{categoryIcon(activity.category)}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{activity.name}</Text>
        <Text style={styles.rowMeta}>{activity.category} · {activity.neighborhood}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.distance}>{activity.distance}</Text>
        <Text style={styles.rating}>{activity.rating.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
}

function categoryIcon(cat: string) {
  const map: Record<string, string> = {
    Art: 'A',
    Food: 'F',
    Outdoors: 'O',
    Sports: 'S',
    Nightlife: 'N',
    Shopping: 'Sh',
  };
  return map[cat] ?? '?';
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
    maxHeight: 48,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  pill: {
    paddingHorizontal: 16,
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
  iconText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.cream,
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
    gap: 2,
  },
  distance: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  rating: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: COLORS.cream,
  },
});
