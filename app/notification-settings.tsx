import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';

interface NotifSetting {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const SETTINGS: NotifSetting[] = [
  { id: 'followers',  icon: 'person-add',       iconColor: COLORS.blue,  label: 'New Followers',           description: 'When someone follows you',                      defaultOn: true  },
  { id: 'likes',      icon: 'heart',             iconColor: '#ef4444',    label: 'Post Likes & Comments',   description: 'When someone reacts to your posts',             defaultOn: true  },
  { id: 'crowd',      icon: 'flame',             iconColor: '#f59e0b',    label: 'Crowd Alerts',            description: 'When a saved venue hits 75%+ capacity',         defaultOn: true  },
  { id: 'events',     icon: 'ticket',            iconColor: '#a855f7',    label: 'Events Near You',         description: 'New events within your selected radius',        defaultOn: true  },
  { id: 'friends',    icon: 'people',            iconColor: '#22c55e',    label: 'Friend Activity',         description: 'When friends check in at venues nearby',        defaultOn: false },
  { id: 'checkins',   icon: 'location',          iconColor: '#22c55e',    label: 'Check-in Reminders',      description: 'Prompts to check in when you\'re at a venue',  defaultOn: false },
  { id: 'digest',     icon: 'newspaper-outline', iconColor: COLORS.muted, label: 'Weekly Top Spots',        description: 'Friday email with trending Miami spots',        defaultOn: false },
];

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(SETTINGS.map((s) => [s.id, s.defaultOn]))
  );

  function toggle(id: string) {
    setPrefs((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>

        {SETTINGS.map((s, idx) => (
          <View
            key={s.id}
            style={[
              styles.row,
              idx === 0 && styles.rowFirst,
              idx === SETTINGS.length - 1 && styles.rowLast,
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: s.iconColor + '22' }]}>
              <Ionicons name={s.icon} size={20} color={s.iconColor} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.description}>{s.description}</Text>
            </View>
            <Switch
              value={prefs[s.id]}
              onValueChange={() => toggle(s.id)}
              trackColor={{ false: 'rgba(240,237,228,0.1)', true: COLORS.blue }}
              thumbColor={COLORS.white}
            />
          </View>
        ))}

        <Text style={styles.footer}>
          Push notifications require permission from your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 60,
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#1a1917',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: COLORS.cream,
  },
  description: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  footer: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(240,237,228,0.3)',
    textAlign: 'center',
    marginTop: 28,
    marginHorizontal: 32,
    lineHeight: 18,
  },
});
