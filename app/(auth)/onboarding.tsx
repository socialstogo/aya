import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, AVATAR_COLORS, VIBES, NEIGHBORHOODS, VENUE_TYPES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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

    let avatarUrl: string | null = null;

    // Upload photo to Supabase Storage if one was selected
    if (photoUri) {
      try {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const path = `${user.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
          avatarUrl = publicUrl;
        }
      } catch {
        // Storage upload failed — fall back to avatar color
      }
    }

    // Core update — only columns guaranteed to exist in the schema
    const { error } = await supabase
      .from('users')
      .update({
        avatar_color: avatarColor,
        venue_types: selectedVenueTypes,
        neighborhoods: selectedNeighborhoods,
        onboarding_complete: true,
      })
      .eq('id', user.id);

    // Optional columns — silently ignored if columns don't exist yet
    if (!error) {
      await supabase.from('users').update({
        ...(avatarUrl  ? { avatar_url: avatarUrl }                             : {}),
        ...(instagram  ? { instagram_handle: instagram.replace(/^@/, '') }     : {}),
        ...(tiktok     ? { tiktok_handle:    tiktok.replace(/^@/, '')    }     : {}),
      }).eq('id', user.id).then(() => {}); // ignore error
    }

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
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <StepAvatar
            color={avatarColor}
            setColor={setAvatarColor}
            photoUri={photoUri}
            setPhotoUri={setPhotoUri}
          />
        )}
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

function StepAvatar({
  color,
  setColor,
  photoUri,
  setPhotoUri,
}: {
  color: string;
  setColor: (c: string) => void;
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
}) {
  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a profile picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  return (
    <View style={stepStyles.container}>
      <Text style={stepStyles.title}>Your profile</Text>
      <Text style={stepStyles.subtitle}>Add a photo or choose a color</Text>

      {/* Avatar preview */}
      <View style={stepStyles.avatarPreview}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={stepStyles.avatarPhoto} />
        ) : (
          <View style={[stepStyles.avatarCircle, { backgroundColor: color }]} />
        )}
      </View>

      {/* Photo buttons */}
      <View style={stepStyles.photoRow}>
        <Pressable
          style={({ pressed }) => [stepStyles.photoBtn, pressed && { opacity: 0.7 }]}
          onPress={pickPhoto}
        >
          <Ionicons name="image-outline" size={18} color={COLORS.cream} />
          <Text style={stepStyles.photoBtnText}>Choose Photo</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [stepStyles.photoBtn, pressed && { opacity: 0.7 }]}
          onPress={takePhoto}
        >
          <Ionicons name="camera-outline" size={18} color={COLORS.cream} />
          <Text style={stepStyles.photoBtnText}>Take Photo</Text>
        </Pressable>
        {photoUri && (
          <Pressable
            style={({ pressed }) => [stepStyles.photoBtnAlt, pressed && { opacity: 0.7 }]}
            onPress={() => setPhotoUri(null)}
          >
            <Ionicons name="close" size={16} color={COLORS.muted} />
          </Pressable>
        )}
      </View>

      <Text style={stepStyles.orDivider}>— or pick a color —</Text>

      <View style={stepStyles.colorGrid}>
        {AVATAR_COLORS.map((c) => (
          <Pressable
            key={c}
            style={[
              stepStyles.colorDot,
              { backgroundColor: c },
              !photoUri && color === c && stepStyles.colorDotActive,
            ]}
            onPress={() => { setColor(c); setPhotoUri(null); }}
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
      <Text style={stepStyles.subtitle}>
        Shown on your profile — people can tap to visit your pages
      </Text>
      <View style={stepStyles.socialFields}>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="logo-instagram" size={16} color={COLORS.muted} />
            <Text style={styles.label}>Instagram</Text>
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={styles.inputInner}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="yourhandle"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {instagram.length > 0 && (
              <Pressable
                style={styles.openLink}
                onPress={() => Linking.openURL(`https://instagram.com/${instagram.replace(/^@/, '')}`)}
              >
                <Ionicons name="open-outline" size={16} color={COLORS.muted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="logo-tiktok" size={16} color={COLORS.muted} />
            <Text style={styles.label}>TikTok</Text>
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={styles.inputInner}
              value={tiktok}
              onChangeText={setTiktok}
              placeholder="yourhandle"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {tiktok.length > 0 && (
              <Pressable
                style={styles.openLink}
                onPress={() => Linking.openURL(`https://tiktok.com/@${tiktok.replace(/^@/, '')}`)}
              >
                <Ionicons name="open-outline" size={16} color={COLORS.muted} />
              </Pressable>
            )}
          </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240,237,228,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  atSign: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    color: COLORS.muted,
    paddingLeft: 16,
  },
  inputInner: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    color: COLORS.cream,
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
  },
  openLink: {
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    marginBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    justifyContent: 'center',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.07)',
  },
  photoBtnAlt: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(240,237,228,0.07)',
  },
  photoBtnText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    color: COLORS.cream,
  },
  orDivider: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
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
