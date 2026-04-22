import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';
import { Venue, FilterType } from '../../lib/types';
import { useVenues } from '../../hooks/useVenues';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import VenueCard from '../../components/VenueCard';
import VenueProfile from '../../components/VenueProfile';

const FILTERS: FilterType[] = ['All', 'Bar', 'Nightclub', 'Restaurant', 'Rooftop', 'Live Music'];
const TAB_BAR_HEIGHT = 90;

const MOCK_STORIES = [
  { id: 'me',  name: 'Your Story', isMe: true,  hasStory: false, color: '#333' },
  { id: 's1',  name: 'Sofia M.',   isMe: false, hasStory: true,  color: '#2a2eef' },
  { id: 's2',  name: 'Nico R.',    isMe: false, hasStory: true,  color: '#ef2a6a' },
  { id: 's3',  name: 'Camila V.',  isMe: false, hasStory: true,  color: '#2aef9e' },
  { id: 's4',  name: 'Diego F.',   isMe: false, hasStory: true,  color: '#efb82a' },
  { id: 's5',  name: 'Maria L.',   isMe: false, hasStory: false, color: '#9e2aef' },
  { id: 's6',  name: 'Carlos E.',  isMe: false, hasStory: true,  color: '#2aadef' },
];

const MENU_ITEMS = [
  { id: 'profile',       label: 'My Profile',            icon: 'person-outline'        },
  { id: 'saved',         label: 'Saved Places',          icon: 'bookmark-outline'      },
  { id: 'notifications', label: 'Notification Settings', icon: 'notifications-outline' },
  { id: 'account',       label: 'Account Settings',      icon: 'settings-outline'      },
  { id: 'invite',        label: 'Invite Friends',        icon: 'people-outline'        },
  { id: 'help',          label: 'Help & Support',        icon: 'help-circle-outline'   },
] as const;

export default function DiscoverScreen() {
  const { venues, loading, error, locationDenied, refresh } = useVenues();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const matchesFilter = activeFilter === 'All' || v.type === activeFilter;
      const matchesSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.neighborhood.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [venues, search, activeFilter]);

  async function handleRefresh() {
    setRefreshing(true);
    refresh();
    await new Promise((r) => setTimeout(r, 300));
    setRefreshing(false);
  }

  async function handleSignOut() {
    setProfileMenuOpen(false);
    await supabase.auth.signOut();
  }

  const avatarInitial = (profile?.full_name ?? profile?.username ?? 'U').charAt(0).toUpperCase();
  const avatarColor = profile?.avatar_color ?? COLORS.blue;

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.wordmark}>ayá</Text>
          <View style={styles.headerRight}>
            {locationDenied && (
              <Text style={styles.locationNote}>Miami, FL</Text>
            )}
            <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.cream} />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable
              style={styles.avatarBtn}
              onPress={() => setProfileMenuOpen(true)}
            >
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search venues..."
              placeholderTextColor={COLORS.muted}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>

      {loading && !refreshing ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VenueCard venue={item} onPress={() => setSelectedVenue(item)} />
          )}
          ListHeaderComponent={<StoriesBar />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.cream}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No venues found</Text>
            </View>
          }
        />
      )}

      <VenueProfile
        venue={selectedVenue}
        visible={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />

      <ProfileMenu
        visible={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        avatarInitial={avatarInitial}
        avatarColor={avatarColor}
        displayName={profile?.full_name ?? 'Profile'}
        username={profile?.username ?? ''}
        onSignOut={handleSignOut}
      />
    </View>
  );
}

function StoriesBar() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={storiesStyles.scroll}
      contentContainerStyle={storiesStyles.content}
    >
      {MOCK_STORIES.map((story) => (
        <Pressable key={story.id} style={storiesStyles.item}>
          <View style={[storiesStyles.ring, story.hasStory && storiesStyles.ringActive]}>
            <View style={[storiesStyles.avatar, { backgroundColor: story.isMe ? 'rgba(240,237,228,0.1)' : story.color }]}>
              {story.isMe ? (
                <Ionicons name="add" size={22} color={COLORS.cream} />
              ) : (
                <Text style={storiesStyles.initial}>{story.name.charAt(0)}</Text>
              )}
            </View>
          </View>
          <Text style={storiesStyles.name} numberOfLines={1}>{story.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ProfileMenu({
  visible,
  onClose,
  avatarInitial,
  avatarColor,
  displayName,
  username,
  onSignOut,
}: {
  visible: boolean;
  onClose: () => void;
  avatarInitial: string;
  avatarColor: string;
  displayName: string;
  username: string;
  onSignOut: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={menuStyles.backdrop} onPress={onClose} />
      <View style={menuStyles.sheet}>
        <View style={menuStyles.handle} />

        <View style={menuStyles.profileRow}>
          <View style={[menuStyles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={menuStyles.avatarText}>{avatarInitial}</Text>
          </View>
          <View>
            <Text style={menuStyles.displayName}>{displayName}</Text>
            {username ? <Text style={menuStyles.username}>@{username}</Text> : null}
          </View>
        </View>

        <View style={menuStyles.divider} />

        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              menuStyles.menuItem,
              idx === MENU_ITEMS.length - 1 && menuStyles.menuItemLast,
              pressed && menuStyles.menuItemPressed,
            ]}
            onPress={() => {
              onClose();
              if (item.id === 'profile')       router.push('/profile');
              else if (item.id === 'notifications') router.push('/notification-settings');
              else if (item.id === 'saved')    router.push('/saved-places');
              else if (item.id === 'account')  router.push('/account-settings');
              else if (item.id === 'invite')   router.push('/invite');
              else if (item.id === 'help')     router.push('/help');
              else Alert.alert(item.label, 'Coming soon');
            }}
          >
            <Ionicons name={item.icon as any} size={20} color={COLORS.cream} />
            <Text style={menuStyles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </Pressable>
        ))}

        <View style={menuStyles.divider} />

        <Pressable
          style={({ pressed }) => [menuStyles.menuItem, pressed && menuStyles.menuItemPressed]}
          onPress={onSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef6b2a" />
          <Text style={[menuStyles.menuLabel, menuStyles.signOutLabel]}>Sign Out</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function LoadingState() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color={COLORS.cream} />
      <Text style={loadingStyles.text}>Finding venues near you...</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Could not load venues</Text>
      <Text style={errorStyles.message}>{message}</Text>
      <Pressable style={errorStyles.retryBtn} onPress={onRetry}>
        <Text style={errorStyles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginRight: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(240,237,228,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  avatarBtn: {},
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240,237,228,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: 12,
  },
  searchIcon: {
    marginLeft: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
  },
  filtersScroll: {
    maxHeight: 48,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  filterPillActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  filterText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.muted,
  },
  filterTextActive: {
    color: COLORS.darkText,
  },
  listContent: {
    paddingBottom: TAB_BAR_HEIGHT + 20,
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

const storiesStyles = StyleSheet.create({
  scroll: {
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  item: {
    alignItems: 'center',
    width: 64,
    gap: 5,
  },
  ring: {
    padding: 2.5,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringActive: {
    borderColor: COLORS.blue,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  initial: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.white,
  },
  name: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    width: '100%',
  },
});

const menuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1a1917',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,237,228,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: COLORS.white,
  },
  displayName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
  },
  username: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  menuItemLast: {
    marginBottom: 4,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.cream,
  },
  signOutLabel: {
    color: '#ef6b2a',
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.cream,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  retryText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.darkText,
  },
});
