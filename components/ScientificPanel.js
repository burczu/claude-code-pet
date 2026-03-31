import { StyleSheet, View } from 'react-native';
import CalcButton from './CalcButton';
import { ACTIONS } from '../calculator/reducer';

const SCIENTIFIC_BUTTONS = [
  { label: 'sin', fn: 'sin' },
  { label: 'cos', fn: 'cos' },
  { label: 'tan', fn: 'tan' },
  { label: 'log', fn: 'log' },
  { label: 'ln',  fn: 'ln'  },
  { label: '√',   fn: '√'   },
  { label: 'x²',  fn: 'x²'  },
  { label: '1/x', fn: '1/x' },
];

export default function ScientificPanel({ dispatch, buttonSize, theme }) {
  return (
    <View style={styles.panel}>
      {SCIENTIFIC_BUTTONS.map((btn) => (
        <CalcButton
          key={btn.fn}
          label={btn.label}
          type="scientific"
          buttonSize={buttonSize}
          theme={theme}
          onPress={() => dispatch({ type: ACTIONS.SCIENTIFIC_FN, fn: btn.fn })}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    gap: 12,
    paddingHorizontal: 8,
  },
});
