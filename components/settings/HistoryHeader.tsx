import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Clock } from 'lucide-react-native';
import { ThemedText, useTheme } from '../../theme/restyleTheme';

interface HistoryHeaderProps {
  accentColor: string;
  hasHistory: boolean;
  onClearAll: () => void;
}

export default function HistoryHeader({ accentColor, hasHistory, onClearAll }: HistoryHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.historyHeader}>
      <View style={styles.left}>
        <Clock size={18} color={accentColor} />
        <ThemedText
          variant="sectionTitle"
          style={{ color: colors.historySubText, marginTop: 0, marginLeft: 8 }}
        >
          HISTORY
        </ThemedText>
      </View>
      {hasHistory && (
        <TouchableOpacity onPress={onClearAll}>
          <ThemedText variant="clearBtn">Clear All</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});