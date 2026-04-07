import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ACTIONS, CalculatorAction } from '../calculator/reducer';
import { ScientificFn, Operator, AngleMode } from '../calculator/mathEngine';
import { ThemedText, useTheme } from '../theme/restyleTheme';

type ActionKind =
  | { kind: 'fn'; fn: ScientificFn }
  | { kind: 'op'; op: Operator }
  | { kind: 'constant'; constant: string }
  | { kind: 'toggle_angle' }
  | { kind: 'toggle_second' }
  | { kind: 'memory_add' }
  | { kind: 'memory_sub' }
  | { kind: 'memory_recall' }
  | { kind: 'memory_clear' }
  | { kind: 'ee' }
  | { kind: 'paren_open' }
  | { kind: 'paren_close' };

interface ButtonDef {
  pl: string;
  sl: string;
  pa: ActionKind;
  sa: ActionKind;
  angleLabel?: boolean;
  memoryBtn?: boolean;
}

const SCIENTIFIC_BTN_HEIGHT_RATIO = 0.72;
const DIMMED_OPACITY = 0.35;
const PRESSED_OPACITY = 0.6;
const SCI_FONT_SIZE_MULTIPLIER = 0.28;
const LANDSCAPE_GAP = 12;
const PORTRAIT_GAP = 6;

// Landscape: 4 cols × 5 rows
const ROWS_LANDSCAPE: ButtonDef[][] = [
  [
    { pl: '2nd', sl: '2nd', pa: { kind: 'toggle_second' }, sa: { kind: 'toggle_second' } },
    { pl: 'x²', sl: '√x', pa: { kind: 'fn', fn: 'x²' }, sa: { kind: 'fn', fn: '√' } },
    { pl: 'x³', sl: '³√x', pa: { kind: 'fn', fn: 'x³' }, sa: { kind: 'fn', fn: '³√' } },
    { pl: 'xʸ', sl: 'ʸ√x', pa: { kind: 'op', op: 'xʸ' }, sa: { kind: 'op', op: 'y√x' } },
  ],
  [
    { pl: '1/x', sl: '1/x', pa: { kind: 'fn', fn: '1/x' }, sa: { kind: 'fn', fn: '1/x' } },
    { pl: 'eˣ', sl: 'ln', pa: { kind: 'fn', fn: 'eˣ' }, sa: { kind: 'fn', fn: 'ln' } },
    { pl: '10ˣ', sl: 'log', pa: { kind: 'fn', fn: '10ˣ' }, sa: { kind: 'fn', fn: 'log' } },
    { pl: 'x!', sl: 'x!', pa: { kind: 'fn', fn: 'x!' }, sa: { kind: 'fn', fn: 'x!' } },
  ],
  [
    { pl: 'sin', sl: 'sin⁻¹', pa: { kind: 'fn', fn: 'sin' }, sa: { kind: 'fn', fn: 'asin' } },
    { pl: 'cos', sl: 'cos⁻¹', pa: { kind: 'fn', fn: 'cos' }, sa: { kind: 'fn', fn: 'acos' } },
    { pl: 'tan', sl: 'tan⁻¹', pa: { kind: 'fn', fn: 'tan' }, sa: { kind: 'fn', fn: 'atan' } },
    {
      pl: 'Deg',
      sl: 'Deg',
      pa: { kind: 'toggle_angle' },
      sa: { kind: 'toggle_angle' },
      angleLabel: true,
    },
  ],
  [
    { pl: 'sinh', sl: 'sinh⁻¹', pa: { kind: 'fn', fn: 'sinh' }, sa: { kind: 'fn', fn: 'asinh' } },
    { pl: 'cosh', sl: 'cosh⁻¹', pa: { kind: 'fn', fn: 'cosh' }, sa: { kind: 'fn', fn: 'acosh' } },
    { pl: 'tanh', sl: 'tanh⁻¹', pa: { kind: 'fn', fn: 'tanh' }, sa: { kind: 'fn', fn: 'atanh' } },
    {
      pl: 'π',
      sl: 'π',
      pa: { kind: 'constant', constant: 'π' },
      sa: { kind: 'constant', constant: 'π' },
    },
  ],
  [
    {
      pl: 'mc',
      sl: 'mc',
      pa: { kind: 'memory_clear' },
      sa: { kind: 'memory_clear' },
      memoryBtn: true,
    },
    {
      pl: 'm+',
      sl: 'm+',
      pa: { kind: 'memory_add' },
      sa: { kind: 'memory_add' },
      memoryBtn: true,
    },
    {
      pl: 'm−',
      sl: 'm−',
      pa: { kind: 'memory_sub' },
      sa: { kind: 'memory_sub' },
      memoryBtn: true,
    },
    {
      pl: 'mr',
      sl: 'mr',
      pa: { kind: 'memory_recall' },
      sa: { kind: 'memory_recall' },
      memoryBtn: true,
    },
  ],
];

// Portrait: 6 cols × 5 rows (Apple-style layout)
const ROWS_PORTRAIT: ButtonDef[][] = [
  [
    { pl: '(', sl: '(', pa: { kind: 'paren_open' }, sa: { kind: 'paren_open' } },
    { pl: ')', sl: ')', pa: { kind: 'paren_close' }, sa: { kind: 'paren_close' } },
    {
      pl: 'mc',
      sl: 'mc',
      pa: { kind: 'memory_clear' },
      sa: { kind: 'memory_clear' },
      memoryBtn: true,
    },
    {
      pl: 'm+',
      sl: 'm+',
      pa: { kind: 'memory_add' },
      sa: { kind: 'memory_add' },
      memoryBtn: true,
    },
    {
      pl: 'm−',
      sl: 'm−',
      pa: { kind: 'memory_sub' },
      sa: { kind: 'memory_sub' },
      memoryBtn: true,
    },
    {
      pl: 'mr',
      sl: 'mr',
      pa: { kind: 'memory_recall' },
      sa: { kind: 'memory_recall' },
      memoryBtn: true,
    },
  ],
  [
    { pl: '2nd', sl: '2nd', pa: { kind: 'toggle_second' }, sa: { kind: 'toggle_second' } },
    { pl: 'x²', sl: '√x', pa: { kind: 'fn', fn: 'x²' }, sa: { kind: 'fn', fn: '√' } },
    { pl: 'x³', sl: '³√x', pa: { kind: 'fn', fn: 'x³' }, sa: { kind: 'fn', fn: '³√' } },
    { pl: 'xʸ', sl: 'ʸ√x', pa: { kind: 'op', op: 'xʸ' }, sa: { kind: 'op', op: 'y√x' } },
    { pl: 'eˣ', sl: 'ln', pa: { kind: 'fn', fn: 'eˣ' }, sa: { kind: 'fn', fn: 'ln' } },
    { pl: '10ˣ', sl: 'log', pa: { kind: 'fn', fn: '10ˣ' }, sa: { kind: 'fn', fn: 'log' } },
  ],
  [
    { pl: '1/x', sl: '1/x', pa: { kind: 'fn', fn: '1/x' }, sa: { kind: 'fn', fn: '1/x' } },
    { pl: '²√x', sl: 'x²', pa: { kind: 'fn', fn: '√' }, sa: { kind: 'fn', fn: 'x²' } },
    { pl: '³√x', sl: 'x³', pa: { kind: 'fn', fn: '³√' }, sa: { kind: 'fn', fn: 'x³' } },
    { pl: 'ʸ√x', sl: 'xʸ', pa: { kind: 'op', op: 'y√x' }, sa: { kind: 'op', op: 'xʸ' } },
    { pl: 'ln', sl: 'eˣ', pa: { kind: 'fn', fn: 'ln' }, sa: { kind: 'fn', fn: 'eˣ' } },
    { pl: 'log', sl: '10ˣ', pa: { kind: 'fn', fn: 'log' }, sa: { kind: 'fn', fn: '10ˣ' } },
  ],
  [
    { pl: 'x!', sl: 'x!', pa: { kind: 'fn', fn: 'x!' }, sa: { kind: 'fn', fn: 'x!' } },
    { pl: 'sin', sl: 'sin⁻¹', pa: { kind: 'fn', fn: 'sin' }, sa: { kind: 'fn', fn: 'asin' } },
    { pl: 'cos', sl: 'cos⁻¹', pa: { kind: 'fn', fn: 'cos' }, sa: { kind: 'fn', fn: 'acos' } },
    { pl: 'tan', sl: 'tan⁻¹', pa: { kind: 'fn', fn: 'tan' }, sa: { kind: 'fn', fn: 'atan' } },
    {
      pl: 'e',
      sl: 'e',
      pa: { kind: 'constant', constant: 'e' },
      sa: { kind: 'constant', constant: 'e' },
    },
    { pl: 'EE', sl: 'EE', pa: { kind: 'ee' }, sa: { kind: 'ee' } },
  ],
  [
    { pl: 'Rand', sl: 'Rand', pa: { kind: 'fn', fn: 'Rand' }, sa: { kind: 'fn', fn: 'Rand' } },
    { pl: 'sinh', sl: 'sinh⁻¹', pa: { kind: 'fn', fn: 'sinh' }, sa: { kind: 'fn', fn: 'asinh' } },
    { pl: 'cosh', sl: 'cosh⁻¹', pa: { kind: 'fn', fn: 'cosh' }, sa: { kind: 'fn', fn: 'acosh' } },
    { pl: 'tanh', sl: 'tanh⁻¹', pa: { kind: 'fn', fn: 'tanh' }, sa: { kind: 'fn', fn: 'atanh' } },
    {
      pl: 'π',
      sl: 'π',
      pa: { kind: 'constant', constant: 'π' },
      sa: { kind: 'constant', constant: 'π' },
    },
    {
      pl: 'Deg',
      sl: 'Deg',
      pa: { kind: 'toggle_angle' },
      sa: { kind: 'toggle_angle' },
      angleLabel: true,
    },
  ],
];

interface ScientificButtonProps {
  label: string;
  onPress: () => void;
  buttonSize: number;
  buttonHeight?: number | undefined;
  active?: boolean | undefined;
  dimmed?: boolean | undefined;
}

function ScientificButton({
  label,
  onPress,
  buttonSize,
  buttonHeight,
  active = false,
  dimmed = false,
}: ScientificButtonProps) {
  const { colors, borderRadii } = useTheme();
  const h = buttonHeight ?? buttonSize * SCIENTIFIC_BTN_HEIGHT_RATIO;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          width: buttonSize,
          height: h,
          borderRadius: borderRadii.s,
          backgroundColor: active ? colors.scientificText : colors.scientificBtn,
          opacity: dimmed ? DIMMED_OPACITY : pressed ? PRESSED_OPACITY : 1,
        },
      ]}
    >
      <ThemedText
        variant="buttonLabel"
        style={{
          color: active ? colors.scientificBtn : colors.scientificText,
          fontSize: Math.min(buttonSize, h) * SCI_FONT_SIZE_MULTIPLIER,
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface ScientificPanelProps {
  dispatch: (action: CalculatorAction) => void;
  buttonSize: number;
  buttonHeight?: number | undefined;
  angleMode?: AngleMode | undefined;
  memory?: string | undefined;
  orientation?: 'landscape' | 'portrait' | undefined;
}

export default memo(function ScientificPanel({
  dispatch,
  buttonSize,
  buttonHeight,
  angleMode = 'deg',
  memory = '0',
  orientation = 'landscape',
}: ScientificPanelProps) {
  const [second, setSecond] = useState(false);
  const hasMemory = memory !== '0';
  const rows = orientation === 'portrait' ? ROWS_PORTRAIT : ROWS_LANDSCAPE;

  const handlePress = useCallback(
    (btn: ButtonDef) => {
      const action = second ? btn.sa : btn.pa;

      switch (action.kind) {
        case 'toggle_second':
          setSecond((s) => !s);
          return;
        case 'fn':
          dispatch({ type: ACTIONS.SCIENTIFIC_FN, fn: action.fn });
          break;
        case 'op':
          dispatch({ type: ACTIONS.CHOOSE_OPERATION, operator: action.op });
          break;
        case 'constant':
          dispatch({ type: ACTIONS.INSERT_CONSTANT, constant: action.constant });
          break;
        case 'toggle_angle':
          dispatch({ type: ACTIONS.TOGGLE_ANGLE });
          break;
        case 'memory_clear':
          dispatch({ type: ACTIONS.MEMORY_CLEAR });
          break;
        case 'memory_add':
          dispatch({ type: ACTIONS.MEMORY_ADD });
          break;
        case 'memory_sub':
          dispatch({ type: ACTIONS.MEMORY_SUB });
          break;
        case 'memory_recall':
          dispatch({ type: ACTIONS.MEMORY_RECALL });
          break;
        case 'ee':
          dispatch({ type: ACTIONS.ADD_EE });
          break;
        case 'paren_open':
          dispatch({ type: ACTIONS.PAREN_OPEN });
          break;
        case 'paren_close':
          dispatch({ type: ACTIONS.PAREN_CLOSE });
          break;
      }
      setSecond(false);
    },
    [second, dispatch],
  );

  return (
    <View
      style={[
        styles.panel,
        orientation === 'portrait' && styles.panelPortrait,
        { gap: orientation === 'portrait' ? PORTRAIT_GAP : LANDSCAPE_GAP },
      ]}
    >
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.row, { gap: buttonSize * 0.12 }]}>
          {row.map((btn) => {
            const isAngleBtn = btn.angleLabel;
            const label = isAngleBtn ? angleMode.toUpperCase() : second ? btn.sl : btn.pl;
            const isSecondActive = btn.pa.kind === 'toggle_second' && second;
            const isMemoryDimmed =
              btn.memoryBtn === true &&
              !hasMemory &&
              (btn.pa.kind === 'memory_clear' || btn.pa.kind === 'memory_recall');

            return (
              <ScientificButton
                key={btn.pl}
                label={label}
                buttonSize={buttonSize}
                buttonHeight={buttonHeight}
                active={isSecondActive}
                dimmed={isMemoryDimmed}
                onPress={() => handlePress(btn)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  panelPortrait: {
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '400',
  },
});