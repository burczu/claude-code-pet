import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '../theme/colors';

const PRESSED_OPACITY_IOS = 0.7;
const FONT_SIZE_MULTIPLIER = 0.38;

interface CalcButtonProps {
  label: string;
  type?: 'number' | 'operator' | 'function' | 'scientific';
  onPress: () => void;
  wide?: boolean | undefined;
  buttonSize: number;
  buttonHeight?: number | undefined;
  theme: Theme;
  hapticsEnabled?: boolean;
}

function CalcButton({
  label,
  type = 'number',
  onPress,
  wide = false,
  buttonSize,
  buttonHeight,
  theme,
  hapticsEnabled = true,
}: CalcButtonProps) {
  function handlePress() {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const bg: Record<string, string> = {
    number: theme.numberBtn,
    operator: theme.operatorBtn,
    function: theme.functionBtn,
    scientific: theme.scientificBtn,
  };

  const textColor: Record<string, string> = {
    number: theme.numberText,
    operator: theme.operatorText,
    function: theme.functionText,
    scientific: theme.scientificText,
  };

  const h = buttonHeight ?? buttonSize;
  const width = wide ? buttonSize * 2 + 12 : buttonSize;

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          width,
          height: h,
          borderRadius: Math.min(width, h) / 2,
          backgroundColor: bg[type],
          opacity: Platform.OS === 'ios' && pressed ? PRESSED_OPACITY_IOS : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor[type], fontSize: h * FONT_SIZE_MULTIPLIER }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(CalcButton);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '400',
  },
});