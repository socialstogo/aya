import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../lib/constants';

interface StatChipProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export default function StatChip({ label, value, highlight }: StatChipProps) {
  return (
    <View style={[styles.chip, highlight && styles.chipHighlight]}>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
      <Text style={[styles.label, highlight && styles.labelHighlight]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(26,25,24,0.08)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(26,25,24,0.1)',
  },
  chipHighlight: {
    backgroundColor: 'rgba(42,46,239,0.12)',
    borderColor: 'rgba(42,46,239,0.2)',
  },
  value: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    color: COLORS.darkText,
  },
  valueHighlight: {
    color: COLORS.blue,
  },
  label: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    color: 'rgba(26,25,24,0.55)',
  },
  labelHighlight: {
    color: 'rgba(42,46,239,0.7)',
  },
});
