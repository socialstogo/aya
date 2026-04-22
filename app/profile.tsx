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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';
import { useVenues } from '../hooks/useVenues';
import VenueProfile from '../components/VenueProfile';
import { Venue } from '../lib/types';

const TABS = ['Liked Places', 'Posts', 'Check-ins'] as const;
type Tab = (typeof TABS)[number];

const MOCK_POSTS = [
  { id: '1', venue: 'LIV Miami',         content: 'Vibe is insane tonight',        time: '2h ago',  likes: 24 },
  { id: '2', venue: 'Ball & Chain',       content: 'Latin band playing live rn',    time: '1d ago',  likes: 11 },
  { id: '3', venue: 'Sugar (East Hotel)', content: 'Views are unreal up here',      time: '3d ago',  likes: 33 },
];
const MOCK_CHECKINS = [
  { id: '1', venue: 'Wynwood Walls',    time: '1w ago', note: 'Art walk with the crew' },
  { id: '2', venue: 'LIV Miami',        time: '2w ago', note: 'Birthday night out'     },
  { id: '3', venue: 'The Broken Shaker',time: '3w ago', note: 'Garden is so good'      },
];
const MOCK_FOLLOWERS = [
  { id: 'f1', name: 'Sofia M.',  color: '#2a2eef', username: 'sofiamia'  },
  { id: 'f2', name: 'Nico R.',   color: '#ef2a6a', username: 'nicor'     },
  { id: 'f3', name: 'Diego F.',  color: '#efb82a', username: 'diegof'    },
];
const MOCK_FOLLOWING = [
  { id: 'g1', name: 'Camila V.', color: '#2aef9e', username: 'camilav'   },
  { id: 'g2', name: 'Maria L.',  color: '#9e2aef', username: 'marial'    },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { venues } = useVenues();
  const [activeTab, setActiveTab]       = useState<Tab>('Liked Places');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const likedVenues = venues.filter((v) =>
    (profile?.followed_venues ?? []).includes(v.id)
  );

  const avatarInitial  = (profile?.full_name ?? 'U').charAt(0).toUpperCase();
  const avatarColor    = profile?.avatar_color ?? COLORS.blue;
  const followersCount = profile?.followers_count ?? 0;
  const followingCount = profile?.following_count ?? 0;

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
          </Pressable>
          <Text style={styles.headerHandle}>@{profile?.username ?? ''}</Text>
          <Pressable style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.cream} />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            {/* Avatar with story ring */}
            <View style={styles.storyRing}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarPhoto} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{MOCK_POSTS.length}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <Pressable style={styles.stat} onPress={() => setFollowersOpen(true)}>
                <Text style={styles.statNum}>{followersCount}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </Pressable>
              <Pressable style={styles.stat} onPress={() => setFollowingOpen(true)}>
                <Text style={styles.statNum}>{followingCount}</Text>
                <Text style={styles.statLabel}>following</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.displayName}>{profile?.full_name ?? 'User'}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>

            {profile?.instagram_handle ? (
              <Pressable
                style={styles.igBtn}
                onPress={() =>
                  Linking.openURL(`https://instagram.com/${profile.instagram_handle}`)
                }
              >
                <Ionicons name="logo-instagram" size={20} color="#fff" />
                <Text style={styles.socialBtnText}>Follow</Text>
              </Pressable>
            ) : null}

            {profile?.tiktok_handle ? (
              <Pressable
                style={styles.ttBtn}
                onPress={() =>
                  Linking.openURL(`https://tiktok.com/@${profile.tiktok_handle}`)
                }
              >
                <Ionicons name="logo-tiktok" size={20} color="#fff" />
                <Text style={styles.socialBtnText}>Follow</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === 'Liked Places' ? 'heart-outline'
                  : tab === 'Posts' ? 'chatbubble-outline'
                  : 'location-outline'
                }
                size={18}
                color={activeTab === tab ? COLORS.cream : COLORS.muted}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.tabDivider} />

        {/* Tab content */}
        {activeTab === 'Liked Places' && (
          likedVenues.length === 0 ? (
            <EmptyState icon="heart-outline" message="No liked places yet" sub="Heart a venue to save it here" />
          ) : (
            <View>
              {likedVenues.map((v) => (
                <Pressable
                  key={v.id}
                  style={styles.venueRow}
                  onPress={() => setSelectedVenue(v)}
                >
                  <Image source={{ uri: v.image }} style={styles.venueThumb} resizeMode="cover" />
                  <View style={styles.venueInfo}>
                    <Text style={styles.venueName}>{v.name}</Text>
                    <Text style={styles.venueMeta}>{v.type} · {v.neighborhood}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
                </Pressable>
              ))}
            </View>
          )
        )}

        {activeTab === 'Posts' && (
          <View>
            {MOCK_POSTS.map((post) => (
              <View key={post.id} style={styles.postRow}>
                <View style={styles.postHeader}>
                  <Text style={styles.postVenue}>at {post.venue}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postFooter}>
                  <Ionicons name="heart-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.postLikes}>{post.likes}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Check-ins' && (
          <View>
            {MOCK_CHECKINS.map((ci) => (
              <View key={ci.id} style={styles.postRow}>
                <View style={styles.postHeader}>
                  <Text style={styles.postVenue}>{ci.venue}</Text>
                  <Text style={styles.postTime}>{ci.time}</Text>
                </View>
                <Text style={styles.postContent}>{ci.note}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Followers modal */}
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
  visible,
  title,
  people,
  onClose,
}: {
  visible: boolean;
  title: string;
  people: { id: string; name: string; color: string; username: string }[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.cream} />
          </Pressable>
        </View>
        <FlatList
          data={people}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={modalStyles.personRow}>
              <View style={[modalStyles.avatar, { backgroundColor: item.color }]}>
                <Text style={modalStyles.avatarInit}>{item.name.charAt(0)}</Text>
              </View>
              <View style={modalStyles.personInfo}>
                <Text style={modalStyles.personName}>{item.name}</Text>
                <Text style={modalStyles.personHandle}>@{item.username}</Text>
              </View>
              <Pressable style={modalStyles.followBtn}>
                <Text style={modalStyles.followBtnText}>Follow</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerHandle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.cream,
  },
  profileSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 14 },
  storyRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.blue,
    padding: 3,
  },
  avatarPhoto: { width: '100%', height: '100%', borderRadius: 42 },
  avatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    color: COLORS.white,
  },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statNum: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: COLORS.cream,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  displayName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: COLORS.cream,
    marginBottom: 4,
  },
  bio: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 14,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  editBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
  },
  igBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C13584',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  ttBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#010101',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  socialBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.cream,
  },
  tabDivider: { height: 1, backgroundColor: COLORS.border },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  venueThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  venueInfo: { flex: 1, gap: 3 },
  venueName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  venueMeta: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  postRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between' },
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
    fontSize: 15,
    color: COLORS.cream,
    lineHeight: 22,
  },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  postLikes: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
});

const modalStyles = StyleSheet.create({
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
  personRow: {
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
  personInfo: { flex: 1, gap: 2 },
  personName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  personHandle: {
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
