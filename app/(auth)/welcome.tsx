import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../lib/constants';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>ayá</Text>
        <Text style={styles.tagline}>Miami nightlife, discovered.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.primaryBtnText}>Get started</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryBtnText}>Log in</Text>
        </Pressable>
      </View>

      <Text style={styles.legal}>
        By continuing you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.18,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'flex-start',
  },
  wordmark: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 72,
    color: COLORS.cream,
    lineHeight: 72,
    letterSpacing: -2,
  },
  tagline: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 18,
    color: COLORS.muted,
    marginTop: 12,
    lineHeight: 26,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.cream,
  },
  pressed: {
    opacity: 0.75,
  },
  legal: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(240,237,228,0.3)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
