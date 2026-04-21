import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, AVATAR_COLORS, VIBES, NEIGHBORHOODS, VENUE_TYPES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');

  function toggleItem(item: string, list: string[], setList: (l: string[]) => void) {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  }

  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  async function finish() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { error } = await supabase
      .from('users')
      .update({
        avatar_color: avatarColor,
        venue_types: selectedVenueTypes,
        neighborhoods: selectedNeighborhoods,
        instagram_handle: instagram,
        tiktok_handle: tiktok,
        onboarding_complete: true,
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else router.replace('/(tabs)/discover');
  }

  const canProceed = step === 1 || step === 5 || step === 6
    ? true
    : step === 2 ? selectedVibes.length > 0
    : step === 3 ? selectedNeighborhoods.length > 0
    : selectedVenueTypes.length > 0;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && <StepAvatar color={avatarColor} setColor={setAvatarColor} />}
        {step === 2 && (
          <StepMultiSelect
            title="What's your vibe?"
            subtitle="Pick all that apply"
            items={VIBES}
            selected={selectedVibes}
            onToggle={(v) => toggleItem(v, selectedVibes, setSelectedVibes)}
          />
        )}
        {step === 3 && (
          <StepMultiSelect
            title="Your neighborhoods"
            subtitle="Where do you go out?"
            items={NEIGHBORHOODS}
            selected={selectedNeighborhoods}
            onToggle={(n) => toggleItem(n, selectedNeighborhoods, setSelectedNeighborhoods)}
          />
        )}
        {step === 4 && (
          <StepMultiSelect
            title="Favorite spots"
            subtitle="What kind of venues do you love?"
            items={VENUE_TYPES}
            selected={selectedVenueTypes}
            onToggle={(v) => toggleItem(v, selectedVenueTypes, setSelectedVenueTypes)}
          />
        )}
        {step === 5 && (
          <StepSocials
            instagram={instagram}
            tiktok={tiktok}
            setInstagram={setInstagram}
            setTiktok={setTiktok}
          />
        )}
        {step === 6 && <StepReady />}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            onPress={back}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            !canProceed && styles.nextBtnDisabled,
            pressed && styles.pressed,
            step === 1 && styles.nextBtnFull,
          ]}
          onPress={next}
          disabled={!canProceed || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.darkText} />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === TOTAL_STEPS ? "Let's go" : 'Continue'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function StepAvatar({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Choose your color</Text>
      <Text style={stepStyles.subtitle}>This is how you'll appear on ayá</Text>
      <View style={stepStyles.avatarPreview}>
        <View style={[stepStyles.avatarCircle, { backgroundColor: color }]} />
      </View>
      <View style={stepStyles.colorGrid}>
        {AVATAR_COLORS.map((c) => (
          <Pressable
            key={c}
            style={[stepStyles.colorDot, { backgroundColor: c }, color === c && stepStyles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>
    </View>
  );
}

function StepMultiSelect({
  title,
  subtitle,
  items,
  selected,
  onToggle,
}: {
  title: string;
  subtitle: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>{title}</Text>
      <Text style={stepStyles.subtitle}>{subtitle}</Text>
      <View style={stepStyles.chips}>
        {items.map((item) => (
          <Pressable
            key={item}
            style={[stepStyles.chip, selected.includes(item) && stepStyles.chipActive]}
            onPress={() => onToggle(item)}
          >
            <Text style={[stepStyles.chipText, selected.includes(item) && stepStyles.chipTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepSocials({
  instagram,
  tiktok,
  setInstagram,
  setTiktok,
}: {
  instagram: string;
  tiktok: string;
  setInstagram: (v: string) => void;
  setTiktok: (v: string) => void;
}) {
  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Your socials</Text>
      <Text style={stepStyles.subtitle}>Optional — link your accounts</Text>
      <View style={stepStyles.socialFields}>
        <View style={styles.field}>
          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            value={instagram}
            onChangeText={setInstagram}
            placeholder="@yourhandle"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>TikTok</Text>
          <TextInput
            style={styles.input}
            value={tiktok}
            onChangeText={setTiktok}
            placeholder="@yourhandle"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
}

function StepReady() {
  return (
    <View style={[stepStyles.container, stepStyles.readyContainer]}>
      <Text style={stepStyles.readyTitle}>You're all set</Text>
      <Text style={stepStyles.readySubtitle}>
        Miami nightlife is waiting.{'\n'}Let's find your next spot.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 56,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(240,237,228,0.1)',
    marginHorizontal: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.cream,
    borderRadius: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 16,
  },
  backBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    color: COLORS.cream,
  },
  nextBtn: {
    flex: 2,
    backgroundColor: COLORS.cream,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextBtnFull: {
    flex: 1,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 16,
    color: COLORS.darkText,
  },
  pressed: {
    opacity: 0.75,
  },
  field: {
    gap: 8,
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
});

const stepStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 30,
    color: COLORS.cream,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 32,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: COLORS.cream,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.06)',
  },
  chipActive: {
    backgroundColor: COLORS.cream,
    borderColor: COLORS.cream,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.cream,
  },
  chipTextActive: {
    color: COLORS.darkText,
  },
  socialFields: {
    gap: 20,
  },
  readyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  readyTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 42,
    color: COLORS.cream,
    letterSpacing: -1,
    textAlign: 'center',
  },
  readySubtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 17,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
});
