import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/restyleTheme';

const CARD_BORDER_RADIUS = 12;

interface SectionCardProps {
  children: React.ReactNode;
}

const SectionCard = memo(function SectionCard({ children }: SectionCardProps) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.historyBg }]}>{children}</View>;
});

export default SectionCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
  },
});