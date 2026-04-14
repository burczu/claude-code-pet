import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GestureDetector, PanGesture } from 'react-native-gesture-handler';
import { formatNumber } from '../calculator/formatNumber';
import { PORTRAIT_SCI_DISPLAY_HEIGHT } from '../calculator/useCalcLayout';
import { ThemedText, useTheme } from '../theme/restyleTheme';
import type { AngleMode } from '../calculator/mathEngine';

interface CalcDisplayProps {
  expressionText: string;
  current: string;
  precision: number;
  memory: string;
  angleMode: AngleMode;
  showScientific: boolean;
  isLandscape: boolean;
  swipe: PanGesture;
}

const CalcDisplay = memo(function CalcDisplay({
  expressionText,
  current,
  precision,
  memory,
  angleMode,
  showScientific,
  isLandscape,
  swipe,
}: CalcDisplayProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <GestureDetector gesture={swipe}>
      <View
        style={[
          styles.display,
          isLandscape && styles.displayLandscape,
          !isLandscape && showScientific && { flex: 0, height: PORTRAIT_SCI_DISPLAY_HEIGHT },
        ]}
      >
        <View style={[styles.indicators, isLandscape && styles.indicatorsLandscape]}>
          {memory !== '0' && (
            <ThemedText
              variant={isLandscape ? 'indicatorLandscape' : 'indicator'}
              style={{ color: colors.expressionText }}
            >
              {t('display.memory')}
            </ThemedText>
          )}
          {showScientific && angleMode === 'rad' && (
            <ThemedText
              variant={isLandscape ? 'indicatorLandscape' : 'indicator'}
              style={{ color: colors.expressionText }}
            >
              {t('display.radians')}
            </ThemedText>
          )}
        </View>
        <ThemedText
          variant={isLandscape ? 'expressionLandscape' : 'expression'}
          style={{ color: colors.expressionText }}
          numberOfLines={1}
        >
          {expressionText}
        </ThemedText>
        <ThemedText
          variant={isLandscape ? 'currentLandscape' : 'current'}
          style={[styles.currentBase, { color: colors.currentText }]}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.4}
        >
          {formatNumber(current, precision)}
        </ThemedText>
      </View>
    </GestureDetector>
  );
});

export default CalcDisplay;

const styles = StyleSheet.create({
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  displayLandscape: {
    paddingBottom: 2,
    overflow: 'hidden',
  },
  indicators: { flexDirection: 'row', gap: 8, alignSelf: 'flex-end', marginBottom: 2 },
  indicatorsLandscape: { marginBottom: 0 },
  currentBase: { width: '100%', textAlign: 'right' },
});
