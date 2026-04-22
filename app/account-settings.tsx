import { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../lib/constants';
import { useAuth } from '../hooks/useAuth';

type Section = 'main' | 'editName' | 'editEmail' | 'changePassword' | 'privacy';

export default function AccountSettingsScreen() {
  const { profile } = useAuth();
  const [section, setSection] = useState<Section>('main');
  const [privateAccount, setPrivateAccount] = useState(false);
  const [activityVisible, setActivityVisible] = useState(true);

  function back() {
    if (section !== 'main') {
      setSection('main');
    } else {
      router.back();
    }
  }

  const titles: Record<Section, string> = {
    main:           'Account Settings',
    editName:       'Edit Name',
    editEmail:      'Change Email',
    changePassword: 'Change Password',
    privacy:        'Privacy',
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={back}>
          <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
        </Pressable>
        <Text style={styles.title}>{titles[section]}</Text>
        <View style={{ width: 40 }} />
      </View>

      {section === 'main' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Section label="PROFILE">
            <SettingsRow label="Display Name"    value={profile?.full_name}   onPress={() => setSection('editName')}       />
            <SettingsRow label="Username"        value={`@${profile?.username ?? ''}`} chevron={false} />
            <SettingsRow label="Email"           value={profile?.email}       onPress={() => setSection('editEmail')}      />
            <SettingsRow label="Change Password"                              onPress={() => setSection('changePassword')} />
          </Section>

          <Section label="PRIVACY">
            <ToggleRow
              label="Private Account"
              description="Only approved followers see your activity"
              value={privateAccount}
              onToggle={() => setPrivateAccount((v) => !v)}
            />
            <ToggleRow
              label="Show Activity Status"
              description="Let others see when you were last active"
              value={activityVisible}
              onToggle={() => setActivityVisible((v) => !v)}
            />
            <SettingsRow label="Blocked Users"  onPress={() => Alert.alert('Blocked Users', 'Coming soon')} />
          </Section>

          <Section label="SECURITY">
            <SettingsRow label="Two-Factor Authentication" onPress={() => Alert.alert('2FA', 'Coming soon')} />
            <SettingsRow label="Login Activity"            onPress={() => Alert.alert('Login Activity', 'Coming soon')} />
          </Section>

          <Section label="DANGER ZONE">
            <Pressable
              style={styles.dangerBtn}
              onPress={() =>
                Alert.alert(
                  'Delete Account',
                  'This will permanently delete your account and all data. This cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => {} },
                  ]
                )
              }
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={styles.dangerBtnText}>Delete Account</Text>
            </Pressable>
          </Section>
        </ScrollView>
      )}

      {section === 'editName' && (
        <EditField
          label="Display Name"
          placeholder={profile?.full_name ?? 'Your name'}
          onSave={() => { setSection('main'); }}
        />
      )}

      {section === 'editEmail' && (
        <EditField
          label="Email Address"
          placeholder={profile?.email ?? 'your@email.com'}
          keyboardType="email-address"
          onSave={() => { setSection('main'); }}
        />
      )}

      {section === 'changePassword' && (
        <ChangePasswordForm onSave={() => setSection('main')} />
      )}
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  );
}

function SettingsRow({
  label, value, chevron = true, onPress,
}: {
  label: string; value?: string; chevron?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [sectionStyles.row, pressed && sectionStyles.pressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={sectionStyles.rowLabel}>{label}</Text>
      <View style={sectionStyles.rowRight}>
        {value ? <Text style={sectionStyles.rowValue} numberOfLines={1}>{value}</Text> : null}
        {chevron && onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />}
      </View>
    </Pressable>
  );
}

function ToggleRow({
  label, description, value, onToggle,
}: {
  label: string; description: string; value: boolean; onToggle: () => void;
}) {
  return (
    <View style={sectionStyles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={sectionStyles.rowLabel}>{label}</Text>
        <Text style={sectionStyles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(240,237,228,0.1)', true: COLORS.blue }}
        thumbColor={COLORS.white}
      />
    </View>
  );
}

function EditField({
  label, placeholder, keyboardType = 'default', onSave,
}: {
  label: string; placeholder: string; keyboardType?: any; onSave: () => void;
}) {
  const [value, setValue] = useState('');
  return (
    <View style={editStyles.container}>
      <Text style={editStyles.label}>{label}</Text>
      <TextInput
        style={editStyles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoFocus
      />
      <Pressable style={editStyles.saveBtn} onPress={onSave}>
        <Text style={editStyles.saveBtnText}>Save Changes</Text>
      </Pressable>
    </View>
  );
}

function ChangePasswordForm({ onSave }: { onSave: () => void }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  return (
    <View style={editStyles.container}>
      <Text style={editStyles.label}>Current Password</Text>
      <TextInput
        style={editStyles.input}
        value={cur}
        onChangeText={setCur}
        secureTextEntry
        placeholder="Current password"
        placeholderTextColor={COLORS.muted}
        autoFocus
      />
      <Text style={[editStyles.label, { marginTop: 20 }]}>New Password</Text>
      <TextInput
        style={editStyles.input}
        value={next}
        onChangeText={setNext}
        secureTextEntry
        placeholder="New password"
        placeholderTextColor={COLORS.muted}
      />
      <Text style={[editStyles.label, { marginTop: 20 }]}>Confirm New Password</Text>
      <TextInput
        style={editStyles.input}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Confirm new password"
        placeholderTextColor={COLORS.muted}
      />
      <Pressable style={editStyles.saveBtn} onPress={onSave}>
        <Text style={editStyles.saveBtnText}>Update Password</Text>
      </Pressable>
    </View>
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
  list: { paddingBottom: 60 },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dangerBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    color: '#ef4444',
  },
});

const sectionStyles = StyleSheet.create({
  wrap: { marginTop: 28 },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1a1917',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  pressed: { backgroundColor: 'rgba(240,237,228,0.04)' },
  rowLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    color: COLORS.cream,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 160,
  },
  rowValue: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  rowDesc: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 17,
  },
});

const editStyles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 28 },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1917',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: COLORS.cream,
  },
  saveBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 15,
    color: COLORS.darkText,
  },
});
