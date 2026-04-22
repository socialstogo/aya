import { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Linking,
  Modal,
  FlatList,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';
import { useVenues } from '../hooks/useVenues';
import VenueProfile from '../components/VenueProfile';
import { Venue } from '../lib/types';

const TABS = ['Saved', 'Posts', 'Check-ins'] as const;
type Tab = (typeof TABS)[number];

const MOCK_POSTS = [
  { id: '1', venue: 'LIV Miami',          content: 'Vibe is insane tonight 🔥',       time: '2h ago',  likes: 24 },
  { id: '2', venue: 'Ball & Chain',        content: 'Latin band playing live rn',      time: '1d ago',  likes: 11 },
  { id: '3', venue: 'Sugar (East Hotel)',  content: 'Views are unreal up here',        time: '3d ago',  likes: 33 },
];
const MOCK_CHECKINS = [
  { id: '1', venue: 'Wynwood Walls',     time: '1w ago',  note: 'Art walk with the crew' },
  { id: '2', venue: 'LIV Miami',         time: '2w ago',  note: 'Birthday night out'     },
  { id: '3', venue: 'The Broken Shaker', time: '3w ago',  note: 'Garden is so good'      },
];
const MOCK_FOLLOWERS = [
  { id: 'f1', name: 'Sofia M.',  color: '#2a2eef', username: 'sofiamia'  },
  { id: 'f2', name: 'Nico R.',   color: '#ef2a6a', username: 'nicor'     },
  { id: 'f3', name: 'Diego F.',  color: '#efb82a', username: 'diegof'    },
];
const MOCK_FOLLOWING = [
  { id: 'g1', name: 'Camila V.', color: '#2aef9e', username: 'camilav'  },
  { id: 'g2', name: 'Maria L.',  color: '#9e2aef', username: 'marial'   },
];

const THREE_DOT_MENU = [
  { id: 'edit',     label: 'Edit Profile',      icon: 'create-outline'      },
  { id: 'share',    label: 'Share Profile',      icon: 'share-outline'       },
  { id: 'qr',       label: 'QR Code',            icon: 'qr-code-outline'     },
  { id: 'nearby',   label: 'Add Friends Nearby', icon: 'person-add-outline'  },
  { id: 'privacy',  label: 'Privacy Settings',   icon: 'shield-outline'      },
  { id: 'help',     label: 'Help & Support',     icon: 'help-circle-outline' },
  { id: 'report',   label: 'Report an Issue',    icon: 'flag-outline'        },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { venues } = useVenues();
  const [activeTab, setActiveTab]         = useState<Tab>('Saved');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);

  const likedVenues = venues.filter((v) =>
    (profile?.followed_venues ?? []).includes(v.id)
  );

  const avatarInitial  = (profile?.full_name ?? 'U').charAt(0).toUpperCase();
  const avatarColor    = profile?.avatar_color ?? COLORS.blue;
  const followersCount = profile?.followers_count ?? 0;
  const followingCount = profile?.following_count ?? 0;

  async function handleMenuAction(id: string) {
    setMenuOpen(false);
    if (id === 'share') {
      await Share.share({ message: `Check out @${profile?.username ?? 'me'} on ayá — Miami\'s nightlife app` });
    } else if (id === 'help') {
      router.push('/help');
    } else if (id === 'privacy') {
      router.push('/account-settings');
    }
    // edit, qr, nearby — coming soon (Toast would go here)
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
          </Pressable>
          <Text style={styles.topHandle}>@{profile?.username ?? ''}</Text>
          <Pressable style={styles.topBtn} onPress={() => setMenuOpen(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.cream} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar + identity */}
        <View style={styles.identityBlock}>
          <View style={[styles.avatarWrap, { borderColor: avatarColor }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarPhoto} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{profile?.full_name ?? 'User'}</Text>
          <Text style={styles.handleText}>@{profile?.username ?? ''}</Text>
          {profile?.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          {/* Social handle pills */}
          {(profile?.instagram_handle || profile?.tiktok_handle) ? (
            <View style={styles.socialsRow}>
              {profile?.instagram_handle ? (
                <Pressable
                  style={[styles.socialPill, { borderColor: '#C13584' }]}
                  onPress={() => Linking.openURL(`https://instagram.com/${profile.instagram_handle}`)}
                >
                  <Ionicons name="logo-instagram" size={15} color="#C13584" />
                  <Text style={[styles.socialPillText, { color: '#C13584' }]}>
                    @{profile.instagram_handle}
                  </Text>
                </Pressable>
              ) : null}
              {profile?.tiktok_handle ? (
                <Pressable
                  style={[styles.socialPill, { borderColor: 'rgba(240,237,228,0.3)' }]}
                  onPress={() => Linking.openURL(`https://tiktok.com/@${profile.tiktok_handle}`)}
                >
                  <Ionicons name="logo-tiktok" size={15} color={COLORS.cream} />
                  <Text style={[styles.socialPillText, { color: COLORS.cream }]}>
                    @{profile.tiktok_handle}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{likedVenues.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{MOCK_POSTS.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable style={styles.statItem} onPress={() => setFollowersOpen(true)}>
            <Text style={styles.statNum}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable style={styles.statItem} onPress={() => setFollowingOpen(true)}>
            <Text style={styles.statNum}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
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
        </View>

        {/* Tab content */}
        {activeTab === 'Saved' && (
          likedVenues.length === 0 ? (
            <EmptyState icon="heart-outline" message="No saved places yet" sub="Heart a venue to save it here" />
          ) : (
            <View style={styles.savedGrid}>
              {likedVenues.map((v) => (
                <Pressable
                  key={v.id}
                  style={({ pressed }) => [styles.savedCard, pressed && { opacity: 0.85 }]}
                  onPress={() => setSelectedVenue(v)}
                >
                  <Image source={{ uri: v.image }} style={styles.savedImg} resizeMode="cover" />
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedName} numberOfLines={2}>{v.name}</Text>
                    <Text style={styles.savedMeta}>{v.type} · {v.neighborhood}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )
        )}

        {activeTab === 'Posts' && (
          <View>
            {MOCK_POSTS.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={[styles.postAvatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.postAvatarInit}>{avatarInitial}</Text>
                </View>
                <View style={styles.postBody}>
                  <View style={styles.postTop}>
                    <Text style={styles.postVenue}>{post.venue}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                  <Text style={styles.postContent}>{post.content}</Text>
                  <View style={styles.postFooter}>
                    <Ionicons name="heart-outline" size={14} color={COLORS.muted} />
                    <Text style={styles.postLikes}>{post.likes}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Check-ins' && (
          <View>
            {MOCK_CHECKINS.map((ci) => (
              <View key={ci.id} style={styles.checkinRow}>
                <View style={styles.checkinIcon}>
                  <Ionicons name="location" size={18} color={avatarColor} />
                </View>
                <View style={styles.checkinBody}>
                  <View style={styles.checkinTop}>
                    <Text style={styles.checkinVenue}>{ci.venue}</Text>
                    <Text style={styles.checkinTime}>{ci.time}</Text>
                  </View>
                  <Text style={styles.checkinNote}>{ci.note}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Three-dot bottom sheet */}
      <Modal visible={menuOpen} animationType="slide" transparent>
        <Pressable style={sheetStyles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.handle} />
          <Text style={sheetStyles.sheetTitle}>Profile Options</Text>
          {THREE_DOT_MENU.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [sheetStyles.item, pressed && sheetStyles.itemPressed]}
              onPress={() => handleMenuAction(item.id)}
            >
              <Ionicons name={item.icon as any} size={20} color={COLORS.cream} />
              <Text style={sheetStyles.itemLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
            </Pressable>
          ))}
          <View style={{ height: 20 }} />
        </View>
      </Modal>

      {/* Followers / Following modals */}
      <PeopleModal
        visible={followersOpen}
        title="Followers"
        people={MOCK_FOLLOWERS}
        onClose={() => setFollowersOpen(false)}
      />
      <PeopleModal
        visible={followingOpen}
        title="Following"
        people={MOCK_FOLLOWING}
        onClose={() => setFollowingOpen(false)}
      />

      <VenueProfile
        venue={selectedVenue}
        visible={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
      />
    </View>
  );
}

function PeopleModal({
  visible, title, people, onClose,
}: {
  visible: boolean;
  title: string;
  people: { id: string; name: string; color: string; username: string }[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={peopleStyles.container}>
        <View style={peopleStyles.header}>
          <Text style={peopleStyles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.cream} />
          </Pressable>
        </View>
        <FlatList
          data={people}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={peopleStyles.row}>
              <View style={[peopleStyles.avatar, { backgroundColor: item.color }]}>
                <Text style={peopleStyles.avatarInit}>{item.name.charAt(0)}</Text>
              </View>
              <View style={peopleStyles.info}>
                <Text style={peopleStyles.name}>{item.name}</Text>
                <Text style={peopleStyles.handle}>@{item.username}</Text>
              </View>
              <Pressable style={peopleStyles.followBtn}>
                <Text style={peopleStyles.followBtnText}>Follow</Text>
              </Pressable>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );
}

function EmptyState({ icon, message, sub }: { icon: any; message: string; sub: string }) {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name={icon} size={44} color={COLORS.muted} />
      <Text style={emptyStyles.message}>{message}</Text>
      <Text style={emptyStyles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 40 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topHandle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.cream,
  },

  /* Identity block — centered */
  identityBlock: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: 3,
    marginBottom: 16,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 36,
    color: COLORS.white,
  },
  displayName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 4,
  },
  handleText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 10,
  },
  bio: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: 'rgba(240,237,228,0.7)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 14,
    maxWidth: 280,
  },
  socialsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  socialPillText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
  },

  /* Stats */
  statsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    marginHorizontal: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: COLORS.cream,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.cream,
  },
  tabText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.muted,
  },
  tabTextActive: {
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  /* Saved grid */
  savedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  savedCard: {
    width: '50%',
    borderWidth: 2,
    borderColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  savedImg: {
    width: '100%',
    height: 140,
  },
  savedInfo: {
    padding: 10,
    gap: 2,
  },
  savedName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.cream,
  },
  savedMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 11,
    color: COLORS.muted,
  },

  /* Posts */
  postCard: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  postAvatarInit: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  postBody: { flex: 1, gap: 5 },
  postTop: { flexDirection: 'row', justifyContent: 'space-between' },
  postVenue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.blue,
  },
  postTime: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  postContent: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.cream,
    lineHeight: 21,
  },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  postLikes: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },

  /* Check-ins */
  checkinRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkinIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(240,237,228,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkinBody: { flex: 1, gap: 4 },
  checkinTop: { flexDirection: 'row', justifyContent: 'space-between' },
  checkinVenue: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
  },
  checkinTime: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  checkinNote: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
});

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1a1917',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,237,228,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  itemPressed: {
    backgroundColor: 'rgba(240,237,228,0.05)',
  },
  itemLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.cream,
  },
});

const peopleStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.cream,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInit: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.white,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  handle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  followBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  followBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.cream,
  },
});

const emptyStyles = StyleSheet.create({
  container: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  message: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
