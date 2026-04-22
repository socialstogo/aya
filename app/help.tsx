import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';

const FAQ = [
  {
    q: 'How is the crowd data calculated?',
    a: 'Crowd levels are estimated using a combination of time-of-day patterns, day-of-week trends, and real-time check-in data from the community. Data refreshes every few minutes.',
  },
  {
    q: 'How do I claim my venue?',
    a: 'Tap any venue on the Discover or Map screen, then tap "Own this venue? Claim your profile" at the bottom of the Info tab. We\'ll reach out within 48 hours.',
  },
  {
    q: 'Can I post without being at the venue?',
    a: 'Yes — the Live Thread accepts posts from anywhere. However, check-ins use your device location to confirm you\'re nearby.',
  },
  {
    q: 'How do I delete a post?',
    a: 'Long-press any of your posts in the Live Thread or on your profile to bring up delete options.',
  },
  {
    q: 'Why isn\'t my venue showing up on the map?',
    a: 'Venues are sourced from Google Places. If a venue is missing, it may not be listed there yet. You can suggest it via the Claim Venue flow.',
  },
  {
    q: 'How do I turn off crowd alerts?',
    a: 'Go to Discover → tap your avatar → Notification Settings → toggle off "Crowd Alerts".',
  },
  {
    q: 'Is ayá only for Miami?',
    a: 'Currently yes — ayá is built specifically for Miami nightlife. We\'re planning to expand to more cities in 2025.',
  },
] as const;

const CONTACT_LINKS = [
  { id: 'email',    label: 'Email Support',    icon: 'mail-outline',       color: '#f59e0b', url: 'mailto:support@ayaapp.io?subject=Support%20Request' },
  { id: 'bug',      label: 'Report a Bug',     icon: 'bug-outline',        color: '#ef4444', url: 'mailto:bugs@ayaapp.io?subject=Bug%20Report' },
  { id: 'feedback', label: 'Send Feedback',    icon: 'chatbubble-outline', color: COLORS.blue, url: 'mailto:hello@ayaapp.io?subject=Feedback' },
] as const;

export default function HelpScreen() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Contact cards */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactRow}>
          {CONTACT_LINKS.map((c) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [styles.contactCard, pressed && { opacity: 0.75 }]}
              onPress={() => Linking.openURL(c.url)}
            >
              <View style={[styles.contactIcon, { backgroundColor: c.color + '22' }]}>
                <Ionicons name={c.icon as any} size={22} color={c.color} />
              </View>
              <Text style={styles.contactLabel}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* FAQ */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>FREQUENTLY ASKED</Text>
        <View style={styles.faqList}>
          {FAQ.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.faqItem,
                idx === 0 && styles.faqFirst,
                idx === FAQ.length - 1 && styles.faqLast,
              ]}
            >
              <Pressable
                style={styles.faqQ}
                onPress={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <Text style={styles.faqQText}>{item.q}</Text>
                <Ionicons
                  name={openFaq === idx ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={COLORS.muted}
                />
              </Pressable>
              {openFaq === idx && (
                <Text style={styles.faqAText}>{item.a}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>ayá · Version 1.0.0 · Miami, FL</Text>
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
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1a1917',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: COLORS.cream,
    textAlign: 'center',
  },
  faqList: {
    backgroundColor: '#1a1917',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqFirst: {},
  faqLast: { borderBottomWidth: 0 },
  faqQ: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  faqQText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
    color: COLORS.cream,
    lineHeight: 20,
  },
  faqAText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  version: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(240,237,228,0.25)',
    textAlign: 'center',
    marginTop: 36,
  },
});
