import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText, useTheme } from '../theme/restyleTheme';

const ROW_MIN_HEIGHT = 52;

interface SettingRowProps {
  icon?: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  last?: boolean | undefined;
  onPress?: (() => void) | undefined;
}

const SettingRow = memo(function SettingRow({
  icon,
  label,
  children,
  last = false,
  onPress,
}: SettingRowProps) {
  const { colors } = useTheme();
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.separator,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        {icon}
        <ThemedText variant="rowLabel" style={{ color: colors.historyText }}>
          {label}
        </ThemedText>
      </View>
      <View style={styles.rowRight}>{children}</View>
    </Container>
  );
});

export default SettingRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: ROW_MIN_HEIGHT,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowRight: { alignItems: 'flex-end' },
});