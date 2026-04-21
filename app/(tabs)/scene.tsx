import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, AVATAR_COLORS } from '../../lib/constants';
import { ScenePost } from '../../lib/types';

const MOCK_POSTS: ScenePost[] = [
  {
    id: '1',
    user_id: 'u1',
    venue_id: '1',
    venue_name: 'LIV Miami',
    content: 'Absolutely insane vibe tonight. DJ is fire.',
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    likes: 24,
    author_name: 'Sofia M.',
    author_avatar_color: AVATAR_COLORS[0],
  },
  {
    id: '2',
    user_id: 'u2',
    venue_id: '2',
    venue_name: 'The Broken Shaker',
    content: 'Garden is open, no wait at the bar. Come through.',
    created_at: new Date(Date.now() - 28 * 60000).toISOString(),
    likes: 11,
    author_name: 'Nico R.',
    author_avatar_color: AVATAR_COLORS[3],
  },
  {
    id: '3',
    user_id: 'u3',
    venue_id: '4',
    venue_name: 'Ball & Chain',
    content: 'Latin band is playing live right now. Line moved fast.',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    likes: 18,
    author_name: 'Camila V.',
    author_avatar_color: AVATAR_COLORS[1],
  },
  {
    id: '4',
    user_id: 'u4',
    venue_id: '5',
    venue_name: 'Sugar (East Hotel)',
    content: 'Views are unreal tonight. Worth it.',
    created_at: new Date(Date.now() - 72 * 60000).toISOString(),
    likes: 33,
    author_name: 'Diego F.',
    author_avatar_color: AVATAR_COLORS[4],
  },
];

const TAB_BAR_HEIGHT = 90;

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function SceneScreen() {
  const [posts, setPosts] = useState<ScenePost[]>(MOCK_POSTS);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + (liked.has(id) ? -1 : 1) } : p
      )
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Scene</Text>
          <Pressable style={styles.postBtn} onPress={() => setComposeOpen(true)}>
            <Text style={styles.postBtnText}>Post</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isLiked={liked.has(item.id)}
            onLike={() => toggleLike(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </View>
  );
}

function PostCard({
  post,
  isLiked,
  onLike,
}: {
  post: ScenePost;
  isLiked: boolean;
  onLike: () => void;
}) {
  return (
    <View style={postStyles.card}>
      <View style={postStyles.top}>
        <View style={[postStyles.avatar, { backgroundColor: post.author_avatar_color }]} />
        <View style={postStyles.authorInfo}>
          <Text style={postStyles.authorName}>{post.author_name}</Text>
          <Text style={postStyles.venueName}>at {post.venue_name}</Text>
        </View>
        <Text style={postStyles.time}>{timeAgo(post.created_at)}</Text>
      </View>
      <Text style={postStyles.content}>{post.content}</Text>
      <Pressable style={postStyles.likeBtn} onPress={onLike}>
        <Text style={[postStyles.likeIcon, isLiked && postStyles.likeIconActive]}>
          {isLiked ? '♥' : '♡'}
        </Text>
        <Text style={[postStyles.likeCount, isLiked && postStyles.likeCountActive]}>
          {post.likes}
        </Text>
      </Pressable>
    </View>
  );
}

function ComposeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('');

  function submit() {
    if (!text.trim()) return;
    Alert.alert('Posted!', 'Your post has been shared.');
    setText('');
    onClose();
  }

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <View style={composeStyles.container}>
        <View style={composeStyles.header}>
          <Pressable onPress={onClose}>
            <Text style={composeStyles.cancel}>Cancel</Text>
          </Pressable>
          <Text style={composeStyles.title}>Share to Scene</Text>
          <Pressable style={composeStyles.submitBtn} onPress={submit}>
            <Text style={composeStyles.submitText}>Post</Text>
          </Pressable>
        </View>
        <TextInput
          style={composeStyles.input}
          value={text}
          onChangeText={setText}
          placeholder="What's the vibe tonight?"
          placeholderTextColor="rgba(240,237,228,0.35)"
          multiline
          autoFocus
          maxLength={280}
        />
        <Text style={composeStyles.count}>{text.length}/280</Text>
      </View>
    </Modal>
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
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  postBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  postBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.darkText,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
  },
});

const postStyles = StyleSheet.create({
  card: {
    paddingVertical: 18,
    gap: 10,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
  },
  venueName: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  time: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
  content: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.cream,
    lineHeight: 22,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 18,
    color: COLORS.muted,
  },
  likeIconActive: {
    color: '#ef4444',
  },
  likeCount: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.muted,
  },
  likeCountActive: {
    color: '#ef4444',
  },
});

const composeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: COLORS.muted,
  },
  title: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.cream,
  },
  submitBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  submitText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.darkText,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 17,
    textAlignVertical: 'top',
  },
  count: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    paddingHorizontal: 20,
    paddingBottom: 20,
    textAlign: 'right',
  },
});
