import { View, Text, StyleSheet, Pressable, Share, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';

const INVITE_LINK = 'https://ayaapp.io/invite';

const SHARE_OPTIONS = [
  { id: 'messages', label: 'Messages',  icon: 'chatbubble',         color: '#22c55e',  url: `sms:?body=Check out ayá, Miami's nightlife app! ${INVITE_LINK}` },
  { id: 'whatsapp', label: 'WhatsApp',  icon: 'logo-whatsapp',      color: '#25D366',  url: `whatsapp://send?text=Check out ayá, Miami's nightlife app! ${INVITE_LINK}` },
  { id: 'twitter',  label: 'X / Twitter', icon: 'logo-twitter',     color: '#1DA1F2',  url: `twitter://post?message=Check out @ayaapp — Miami nightlife discovery 🌙 ${INVITE_LINK}` },
  { id: 'email',    label: 'Email',     icon: 'mail',               color: '#f59e0b',  url: `mailto:?subject=Join me on ayá&body=Hey! Check out ayá, Miami's nightlife app: ${INVITE_LINK}` },
] as const;

export default function InviteScreen() {
  const { profile } = useAuth();

  async function shareNative() {
    await Share.share({
      message: `Join me on ayá — Miami's nightlife app 🌙\n${INVITE_LINK}`,
      url: INVITE_LINK,
    });
  }

  function copyLink() {
    // Clipboard would require expo-clipboard; for now show share sheet
    shareNative();
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>Invite Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={42} color={COLORS.blue} />
          </View>
          <Text style={styles.heroTitle}>Bring your crew to ayá</Text>
          <Text style={styles.heroSub}>
            Invite friends to discover Miami's best spots together. See where they're headed tonight.
          </Text>
        </View>

        {/* Invite link */}
        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>YOUR INVITE LINK</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{INVITE_LINK}</Text>
            <Pressable style={styles.copyBtn} onPress={copyLink}>
              <Ionicons name="copy-outline" size={16} color={COLORS.cream} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </Pressable>
          </View>
        </View>

        {/* Share via */}
        <Text style={styles.sectionLabel}>SHARE VIA</Text>
        <View style={styles.shareGrid}>
          {SHARE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.75 }]}
              onPress={() =>
                Linking.canOpenURL(opt.url)
                  .then((ok) => ok ? Linking.openURL(opt.url) : shareNative())
                  .catch(() => shareNative())
              }
            >
              <View style={[styles.shareBtnIcon, { backgroundColor: opt.color + '22' }]}>
                <Ionicons name={opt.icon as any} size={26} color={opt.color} />
              </View>
              <Text style={styles.shareBtnLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* More options */}
        <Pressable style={styles.moreBtn} onPress={shareNative}>
          <Ionicons name="share-outline" size={20} color={COLORS.cream} />
          <Text style={styles.moreBtnText}>More Options</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: COLORS.cream,
  },
  content: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 12,
  },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.blue + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: COLORS.cream,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  linkCard: {
    backgroundColor: '#1a1917',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
    marginBottom: 28,
  },
  linkLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.cream,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(240,237,228,0.1)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  copyBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.cream,
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  shareBtn: {
    width: '22%',
    minWidth: 70,
    alignItems: 'center',
    gap: 8,
  },
  shareBtnIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnLabel: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 16,
  },
  moreBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
});
