import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');

  async function checkUsername(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', clean)
      .maybeSingle();
    setUsernameStatus(data ? 'taken' : 'available');
  }

  async function handleSignup() {
    if (!fullName || !username || !email || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (usernameStatus === 'taken') {
      Alert.alert('Username taken', 'Please choose a different username.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert('Signup failed', error.message);
      return;
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        username: username.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        avatar_color: '#2a2eef',
        onboarding_complete: false,
        followers_count: 0,
        following_count: 0,
        followed_venues: [],
        venue_types: [],
        neighborhoods: [],
      });
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the ayá community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.inputInner}
                value={username}
                onChangeText={(v) => {
                  setUsername(v);
                  setUsernameStatus('idle');
                }}
                onBlur={() => checkUsername(username)}
                placeholder="@handle"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {usernameStatus === 'checking' && (
                <ActivityIndicator size="small" color={COLORS.muted} style={styles.inputIcon} />
              )}
              {usernameStatus === 'available' && (
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" style={styles.inputIcon} />
              )}
              {usernameStatus === 'taken' && (
                <Ionicons name="close-circle" size={20} color="#ef4444" style={styles.inputIcon} />
              )}
            </View>
            {usernameStatus === 'available' && (
              <Text style={styles.statusAvailable}>Username is available</Text>
            )}
            {usernameStatus === 'taken' && (
              <Text style={styles.statusTaken}>Username is already taken</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.inputInner}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.darkText} />
            ) : (
              <Text style={styles.btnText}>Create account</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchLink}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 48,
  },
  back: {
    marginBottom: 32,
  },
  backText: {
    color: COLORS.cream,
    fontSize: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 34,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 6,
  },
  form: {
    gap: 20,
    flex: 1,
    marginBottom: 32,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: 'rgba(240,237,228,0.07)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240,237,228,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
  },
  inputIcon: {
    marginRight: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusAvailable: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: '#22c55e',
    paddingLeft: 4,
  },
  statusTaken: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: '#ef4444',
    paddingLeft: 4,
  },
  btn: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  pressed: {
    opacity: 0.75,
  },
  switchText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  switchLink: {
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
