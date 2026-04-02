import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ACTIONS } from '../calculator/reducer';

// action kinds: 'fn' | 'op' | 'constant' | 'toggle_angle' | 'toggle_second'
//               'memory_add' | 'memory_sub' | 'memory_recall' | 'memory_clear'
//               'ee' | 'paren_open' | 'paren_close'

// Landscape: 4 cols × 5 rows
const ROWS_LANDSCAPE = [
  [
    { pl: '2nd',  sl: '2nd',    pa: { kind: 'toggle_second' },             sa: { kind: 'toggle_second' } },
    { pl: 'x²',   sl: '√x',     pa: { kind: 'fn', fn: 'x²' },             sa: { kind: 'fn', fn: '√' } },
    { pl: 'x³',   sl: '³√x',    pa: { kind: 'fn', fn: 'x³' },             sa: { kind: 'fn', fn: '³√' } },
    { pl: 'xʸ',   sl: 'ʸ√x',    pa: { kind: 'op', op: 'xʸ' },            sa: { kind: 'op', op: 'y√x' } },
  ],
  [
    { pl: '1/x',  sl: '1/x',    pa: { kind: 'fn', fn: '1/x' },            sa: { kind: 'fn', fn: '1/x' } },
    { pl: 'eˣ',   sl: 'ln',     pa: { kind: 'fn', fn: 'eˣ' },             sa: { kind: 'fn', fn: 'ln' } },
    { pl: '10ˣ',  sl: 'log',    pa: { kind: 'fn', fn: '10ˣ' },            sa: { kind: 'fn', fn: 'log' } },
    { pl: 'x!',   sl: 'x!',     pa: { kind: 'fn', fn: 'x!' },             sa: { kind: 'fn', fn: 'x!' } },
  ],
  [
    { pl: 'sin',  sl: 'sin⁻¹',  pa: { kind: 'fn', fn: 'sin' },            sa: { kind: 'fn', fn: 'asin' } },
    { pl: 'cos',  sl: 'cos⁻¹',  pa: { kind: 'fn', fn: 'cos' },            sa: { kind: 'fn', fn: 'acos' } },
    { pl: 'tan',  sl: 'tan⁻¹',  pa: { kind: 'fn', fn: 'tan' },            sa: { kind: 'fn', fn: 'atan' } },
    { pl: 'Deg',  sl: 'Deg',    pa: { kind: 'toggle_angle' },              sa: { kind: 'toggle_angle' }, angleLabel: true },
  ],
  [
    { pl: 'sinh', sl: 'sinh⁻¹', pa: { kind: 'fn', fn: 'sinh' },           sa: { kind: 'fn', fn: 'asinh' } },
    { pl: 'cosh', sl: 'cosh⁻¹', pa: { kind: 'fn', fn: 'cosh' },           sa: { kind: 'fn', fn: 'acosh' } },
    { pl: 'tanh', sl: 'tanh⁻¹', pa: { kind: 'fn', fn: 'tanh' },           sa: { kind: 'fn', fn: 'atanh' } },
    { pl: 'π',    sl: 'π',      pa: { kind: 'constant', constant: 'π' },  sa: { kind: 'constant', constant: 'π' } },
  ],
  [
    { pl: 'mc',   sl: 'mc',     pa: { kind: 'memory_clear' },              sa: { kind: 'memory_clear' }, memoryBtn: true },
    { pl: 'm+',   sl: 'm+',     pa: { kind: 'memory_add' },                sa: { kind: 'memory_add' }, memoryBtn: true },
    { pl: 'm−',   sl: 'm−',     pa: { kind: 'memory_sub' },                sa: { kind: 'memory_sub' }, memoryBtn: true },
    { pl: 'mr',   sl: 'mr',     pa: { kind: 'memory_recall' },             sa: { kind: 'memory_recall' }, memoryBtn: true },
  ],
];

// Portrait: 6 cols × 5 rows (Apple-style layout)
const ROWS_PORTRAIT = [
  [
    { pl: '(',    sl: '(',      pa: { kind: 'paren_open' },                sa: { kind: 'paren_open' } },
    { pl: ')',    sl: ')',      pa: { kind: 'paren_close' },               sa: { kind: 'paren_close' } },
    { pl: 'mc',  sl: 'mc',     pa: { kind: 'memory_clear' },              sa: { kind: 'memory_clear' }, memoryBtn: true },
    { pl: 'm+',  sl: 'm+',     pa: { kind: 'memory_add' },                sa: { kind: 'memory_add' }, memoryBtn: true },
    { pl: 'm−',  sl: 'm−',     pa: { kind: 'memory_sub' },                sa: { kind: 'memory_sub' }, memoryBtn: true },
    { pl: 'mr',  sl: 'mr',     pa: { kind: 'memory_recall' },             sa: { kind: 'memory_recall' }, memoryBtn: true },
  ],
  [
    { pl: '2nd',  sl: '2nd',   pa: { kind: 'toggle_second' },             sa: { kind: 'toggle_second' } },
    { pl: 'x²',   sl: '√x',    pa: { kind: 'fn', fn: 'x²' },             sa: { kind: 'fn', fn: '√' } },
    { pl: 'x³',   sl: '³√x',   pa: { kind: 'fn', fn: 'x³' },             sa: { kind: 'fn', fn: '³√' } },
    { pl: 'xʸ',   sl: 'ʸ√x',   pa: { kind: 'op', op: 'xʸ' },            sa: { kind: 'op', op: 'y√x' } },
    { pl: 'eˣ',   sl: 'ln',    pa: { kind: 'fn', fn: 'eˣ' },             sa: { kind: 'fn', fn: 'ln' } },
    { pl: '10ˣ',  sl: 'log',   pa: { kind: 'fn', fn: '10ˣ' },            sa: { kind: 'fn', fn: 'log' } },
  ],
  [
    { pl: '1/x',  sl: '1/x',   pa: { kind: 'fn', fn: '1/x' },            sa: { kind: 'fn', fn: '1/x' } },
    { pl: '²√x',  sl: 'x²',    pa: { kind: 'fn', fn: '√' },              sa: { kind: 'fn', fn: 'x²' } },
    { pl: '³√x',  sl: 'x³',    pa: { kind: 'fn', fn: '³√' },             sa: { kind: 'fn', fn: 'x³' } },
    { pl: 'ʸ√x',  sl: 'xʸ',    pa: { kind: 'op', op: 'y√x' },            sa: { kind: 'op', op: 'xʸ' } },
    { pl: 'ln',   sl: 'eˣ',    pa: { kind: 'fn', fn: 'ln' },             sa: { kind: 'fn', fn: 'eˣ' } },
    { pl: 'log',  sl: '10ˣ',   pa: { kind: 'fn', fn: 'log' },            sa: { kind: 'fn', fn: '10ˣ' } },
  ],
  [
    { pl: 'x!',   sl: 'x!',    pa: { kind: 'fn', fn: 'x!' },             sa: { kind: 'fn', fn: 'x!' } },
    { pl: 'sin',  sl: 'sin⁻¹', pa: { kind: 'fn', fn: 'sin' },            sa: { kind: 'fn', fn: 'asin' } },
    { pl: 'cos',  sl: 'cos⁻¹', pa: { kind: 'fn', fn: 'cos' },            sa: { kind: 'fn', fn: 'acos' } },
    { pl: 'tan',  sl: 'tan⁻¹', pa: { kind: 'fn', fn: 'tan' },            sa: { kind: 'fn', fn: 'atan' } },
    { pl: 'e',    sl: 'e',     pa: { kind: 'constant', constant: 'e' },  sa: { kind: 'constant', constant: 'e' } },
    { pl: 'EE',   sl: 'EE',    pa: { kind: 'ee' },                        sa: { kind: 'ee' } },
  ],
  [
    { pl: 'Rand', sl: 'Rand',  pa: { kind: 'fn', fn: 'Rand' },            sa: { kind: 'fn', fn: 'Rand' } },
    { pl: 'sinh', sl: 'sinh⁻¹', pa: { kind: 'fn', fn: 'sinh' },          sa: { kind: 'fn', fn: 'asinh' } },
    { pl: 'cosh', sl: 'cosh⁻¹', pa: { kind: 'fn', fn: 'cosh' },          sa: { kind: 'fn', fn: 'acosh' } },
    { pl: 'tanh', sl: 'tanh⁻¹', pa: { kind: 'fn', fn: 'tanh' },          sa: { kind: 'fn', fn: 'atanh' } },
    { pl: 'π',    sl: 'π',     pa: { kind: 'constant', constant: 'π' },  sa: { kind: 'constant', constant: 'π' } },
    { pl: 'Deg',  sl: 'Deg',   pa: { kind: 'toggle_angle' },              sa: { kind: 'toggle_angle' }, angleLabel: true },
  ],
];

function ScientificButton({ label, onPress, buttonSize, buttonHeight, theme, active, dimmed }) {
  const h = buttonHeight ?? buttonSize * 0.72;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          width: buttonSize,
          height: h,
          borderRadius: 6,
          backgroundColor: active ? theme.scientificText : theme.scientificBtn,
          opacity: dimmed ? 0.35 : pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: active ? theme.scientificBtn : theme.scientificText, fontSize: Math.min(buttonSize, h) * 0.28 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default memo(function ScientificPanel({ dispatch, buttonSize, buttonHeight, theme, angleMode = 'deg', memory = '0', orientation = 'landscape' }) {
  const [second, setSecond] = useState(false);
  const hasMemory = memory !== '0';
  const rows = orientation === 'portrait' ? ROWS_PORTRAIT : ROWS_LANDSCAPE;

  const handlePress = useCallback((btn) => {
    const action = second ? btn.sa : btn.pa;

    switch (action.kind) {
      case 'toggle_second': setSecond((s) => !s); return;
      case 'fn':            dispatch({ type: ACTIONS.SCIENTIFIC_FN, fn: action.fn }); break;
      case 'op':            dispatch({ type: ACTIONS.CHOOSE_OPERATION, operator: action.op }); break;
      case 'constant':      dispatch({ type: ACTIONS.INSERT_CONSTANT, constant: action.constant }); break;
      case 'toggle_angle':  dispatch({ type: ACTIONS.TOGGLE_ANGLE }); break;
      case 'memory_clear':  dispatch({ type: ACTIONS.MEMORY_CLEAR }); break;
      case 'memory_add':    dispatch({ type: ACTIONS.MEMORY_ADD }); break;
      case 'memory_sub':    dispatch({ type: ACTIONS.MEMORY_SUB }); break;
      case 'memory_recall': dispatch({ type: ACTIONS.MEMORY_RECALL }); break;
      case 'ee':            dispatch({ type: ACTIONS.ADD_EE }); break;
      case 'paren_open':    dispatch({ type: ACTIONS.PAREN_OPEN }); break;
      case 'paren_close':   dispatch({ type: ACTIONS.PAREN_CLOSE }); break;
    }
    setSecond(false);
  }, [second, dispatch]);

  return (
    <View style={[styles.panel, orientation === 'portrait' && styles.panelPortrait, { gap: orientation === 'portrait' ? 6 : 12 }]}>
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.row, { gap: buttonSize * 0.12 }]}>
          {row.map((btn, ci) => {
            const isAngleBtn = btn.angleLabel;
            const label = isAngleBtn
              ? angleMode.toUpperCase()
              : second ? btn.sl : btn.pl;
            const isSecondActive = btn.pa.kind === 'toggle_second' && second;
            const isMemoryDimmed = btn.memoryBtn && !hasMemory && (btn.pa.kind === 'memory_clear' || btn.pa.kind === 'memory_recall');

            return (
              <ScientificButton
                key={btn.pl}
                label={label}
                buttonSize={buttonSize}
                buttonHeight={buttonHeight}
                theme={theme}
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