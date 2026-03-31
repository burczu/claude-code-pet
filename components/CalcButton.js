import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

function CalcButton({ label, type = 'number', onPress, wide = false, buttonSize, buttonHeight, theme, hapticsEnabled = true }) {
  function handlePress() {
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }
  const bg = {
    number:     theme?.numberBtn     ?? '#333',
    operator:   theme?.operatorBtn   ?? '#ff9f0a',
    function:   theme?.functionBtn   ?? '#a5a5a5',
    scientific: theme?.scientificBtn ?? '#1c1c1e',
  }[type];

  const textColor = {
    number:     theme?.numberText     ?? '#fff',
    operator:   theme?.operatorText   ?? '#fff',
    function:   theme?.functionText   ?? '#000',
    scientific: theme?.scientificText ?? '#fff',
  }[type];

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
          backgroundColor: bg,
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontSize: h * 0.38 }]}>
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