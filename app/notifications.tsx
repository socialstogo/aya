import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';

interface Notif {
  id: string;
  type: 'like' | 'follow' | 'checkin' | 'event' | 'crowd';
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const MOCK: Notif[] = [
  {
    id: 'n1',
    type: 'follow',
    icon: 'person-add',
    iconColor: COLORS.blue,
    title: 'Sofia M. followed you',
    body: 'You have a new follower.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'like',
    icon: 'heart',
    iconColor: '#ef4444',
    title: 'Nico R. liked your post',
    body: '"Vibe at LIV is unreal tonight 🔥"',
    time: '18m ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'crowd',
    icon: 'flame',
    iconColor: '#f59e0b',
    title: 'E11EVEN is getting busy',
    body: 'Crowd just hit 75% — head out now to beat the rush.',
    time: '34m ago',
    unread: true,
  },
  {
    id: 'n4',
    type: 'checkin',
    icon: 'location',
    iconColor: '#22c55e',
    title: 'Camila V. checked in nearby',
    body: 'Sugar (East Hotel) · Brickell',
    time: '1h ago',
    unread: false,
  },
  {
    id: 'n5',
    type: 'event',
    icon: 'ticket',
    iconColor: '#a855f7',
    title: 'Latin Night at Ball & Chain',
    body: 'Doors open tonight at 10 PM — tickets still available.',
    time: '3h ago',
    unread: false,
  },
  {
    id: 'n6',
    type: 'follow',
    icon: 'person-add',
    iconColor: COLORS.blue,
    title: 'Diego F. followed you',
    body: 'You have a new follower.',
    time: '5h ago',
    unread: false,
  },
  {
    id: 'n7',
    type: 'crowd',
    icon: 'flame',
    iconColor: '#f59e0b',
    title: 'LIV Miami just hit 90%',
    body: 'Packed tonight — long wait expected at the door.',
    time: '7h ago',
    unread: false,
  },
  {
    id: 'n8',
    type: 'like',
    icon: 'heart',
    iconColor: '#ef4444',
    title: 'Maria L. liked your post',
    body: '"Drinks strong as ever at Ball & Chain"',
    time: 'Yesterday',
    unread: false,
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotifRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function NotifRow({ item }: { item: Notif }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, item.unread && styles.rowUnread, pressed && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.iconColor + '22' }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.cream,
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  rowUnread: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  notifTitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
  },
  notifBody: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  notifTime: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(240,237,228,0.3)',
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginTop: 6,
    flexShrink: 0,
  },
  sep: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 76,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
  },
});
