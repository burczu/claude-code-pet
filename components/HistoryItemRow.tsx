import { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { formatNumber } from '../calculator/formatNumber';
import { ThemedText, useTheme } from '../theme/restyleTheme';
import type { HistoryItem } from '../services/historyService';

interface HistoryItemRowProps {
  item: HistoryItem;
  onPress: (result: string) => void;
  precision: number;
}

const HistoryItemRow = memo(function HistoryItemRow({
  item,
  onPress,
  precision,
}: HistoryItemRowProps) {
  const { colors } = useTheme();
  const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';

  return (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: colors.historyBg }]}
      onPress={() => onPress(item.result)}
      activeOpacity={0.6}
    >
      {item.equation ? (
        <ThemedText variant="equation" style={{ color: colors.historySubText }} numberOfLines={1}>
          {item.equation}
        </ThemedText>
      ) : null}
      <ThemedText variant="historyResult" style={{ color: colors.historyText }}>
        {formatNumber(item.result, precision)}
      </ThemedText>
      <ThemedText variant="date" style={{ color: colors.historySubText }}>
        {dateStr}
      </ThemedText>
    </TouchableOpacity>
  );
});

export default HistoryItemRow;

const styles = StyleSheet.create({
  historyItem: { paddingHorizontal: 20, paddingVertical: 14 },
});