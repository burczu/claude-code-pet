import { memo } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText, useTheme } from '../theme/restyleTheme';

const PRESSED_OPACITY_IOS = 0.7;
const FONT_SIZE_MULTIPLIER = 0.38;

interface CalcButtonProps {
  label: string;
  type?: 'number' | 'operator' | 'function' | 'scientific';
  onPress: () => void;
  wide?: boolean | undefined;
  buttonSize: number;
  buttonHeight?: number | undefined;
  hapticsEnabled?: boolean | undefined;
}

function CalcButton({
  label,
  type = 'number',
  onPress,
  wide = false,
  buttonSize,
  buttonHeight,
  hapticsEnabled = true,
}: CalcButtonProps) {
  const theme = useTheme();

  function handlePress() {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  const bgColor: Record<string, string> = {
    number: theme.colors.numberBtn,
    operator: theme.colors.operatorBtn,
    function: theme.colors.functionBtn,
    scientific: theme.colors.scientificBtn,
  };

  const textColor: Record<string, string> = {
    number: theme.colors.numberText,
    operator: theme.colors.operatorText,
    function: theme.colors.functionText,
    scientific: theme.colors.scientificText,
  };

  const h = buttonHeight ?? buttonSize;
  const width = wide ? buttonSize * 2 + theme.spacing.m : buttonSize;

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
          backgroundColor: bgColor[type],
          opacity: Platform.OS === 'ios' && pressed ? PRESSED_OPACITY_IOS : 1,
        },
      ]}
    >
      <ThemedText
        variant="buttonLabel"
        style={{ color: textColor[type], fontSize: h * FONT_SIZE_MULTIPLIER }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default memo(CalcButton);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});