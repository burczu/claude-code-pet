import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CalcButton from '../components/CalcButton';
import CalcDisplay from '../components/CalcDisplay';
import ScientificPanel from '../components/ScientificPanel';
import { ACTIONS, CalculatorAction, calculatorReducer, initialState } from '../calculator/reducer';
import { formatNumber } from '../calculator/formatNumber';
import { useSettings } from '../store/SettingsContext';
import { GAP, useCalcLayout } from '../calculator/useCalcLayout';
import { useHistoryPush } from '../calculator/useHistoryPush';
import { useSwipeToDelete } from '../calculator/useSwipeToDelete';
import { ThemedText, useTheme } from '../theme/restyleTheme';

const TAB_BAR_HEIGHT_ESTIMATE = 83;

const BUTTONS = [
  { label: 'AC', type: 'function' as const, action: { type: ACTIONS.CLEAR } },
  {
    label: '+/-',
    type: 'function' as const,
    action: { type: ACTIONS.ADD_DIGIT, digit: '-' },
  },
  { label: '%', type: 'function' as const, action: { type: ACTIONS.PERCENT } },
  {
    label: '÷',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '÷' as const },
  },

  { label: '7', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '7' } },
  { label: '8', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '8' } },
  { label: '9', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '9' } },
  {
    label: '×',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '×' as const },
  },

  { label: '4', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '4' } },
  { label: '5', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '5' } },
  { label: '6', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '6' } },
  {
    label: '-',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '-' as const },
  },

  { label: '1', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '1' } },
  { label: '2', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '2' } },
  { label: '3', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '3' } },
  {
    label: '+',
    type: 'operator' as const,
    action: { type: ACTIONS.CHOOSE_OPERATION, operator: '+' as const },
  },

  {
    label: '0',
    type: 'number' as const,
    wide: true,
    action: { type: ACTIONS.ADD_DIGIT, digit: '0' },
  },
  { label: '.', type: 'number' as const, action: { type: ACTIONS.ADD_DIGIT, digit: '.' } },
  { label: '=', type: 'operator' as const, action: { type: ACTIONS.EVALUATE } },
] satisfies Array<{
  label: string;
  type: 'number' | 'operator' | 'function';
  wide?: boolean;
  action: CalculatorAction;
}>;

export default function MainScreen() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  const { width, height } = useWindowDimensions();
  const { settings } = useSettings();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [container, setContainer] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((evt: LayoutChangeEvent) => {
    const { width: w, height: h } = evt.nativeEvent.layout;
    setContainer((prev) =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h },
    );
  }, []);

  useEffect(() => {
    const value = (route.params as { initialValue?: string } | undefined)?.initialValue;
    if (value) {
      dispatch({ type: ACTIONS.CLEAR });
      String(value)
        .split('')
        .forEach((digit) => {
          dispatch({ type: ACTIONS.ADD_DIGIT, digit });
        });
    }
  }, [(route.params as { initialValue?: string } | undefined)?.initialValue]);

  const { colors } = useTheme();

  const isLandscape = width > height;
  const showScientific = settings.scientificMode;

  // Use measured container size (accounts for tab bar, safe areas, nav chrome).
  // Fall back to window-based estimate before first layout fires.
  const cw = container.width || width - insets.left - insets.right;
  const ch = container.height || height - insets.top - insets.bottom - TAB_BAR_HEIGHT_ESTIMATE;

  const { buttonSize, buttonHeight, sciButtonSize, sciPortraitButtonSize, sciPortraitButtonHeight } =
    useCalcLayout({ cw, ch, isLandscape, showScientific });

  useHistoryPush(state.current, state.overwrite, state.tokens);

  const swipe = useSwipeToDelete(() => dispatch({ type: ACTIONS.DELETE_DIGIT }));

  const expressionText = useMemo(
    () =>
      state.tokens
        .map((t) => (t.type === 'number' ? formatNumber(t.value, settings.precision) : t.value))
        .join(' '),
    [state.tokens, settings.precision],
  );

  const buttonHandlers = useMemo(
    () => BUTTONS.map((btn) => () => dispatch(btn.action)),
    [dispatch],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <View style={[styles.row, isLandscape && styles.rowLandscape]} onLayout={onLayout}>
        {isLandscape && showScientific && (
          <ScientificPanel
            orientation="landscape"
            dispatch={dispatch}
            buttonSize={sciButtonSize}
            buttonHeight={buttonHeight}
            angleMode={state.angleMode}
            memory={state.memory}
          />
        )}

        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          <CalcDisplay
            expressionText={expressionText}
            current={state.current}
            precision={settings.precision}
            memory={state.memory}
            angleMode={state.angleMode}
            showScientific={showScientific}
            isLandscape={isLandscape}
            swipe={swipe}
          />

          {!isLandscape && showScientific && (
            <ScientificPanel
              orientation="portrait"
              dispatch={dispatch}
              buttonSize={sciPortraitButtonSize}
              buttonHeight={sciPortraitButtonHeight}
              angleMode={state.angleMode}
              memory={state.memory}
            />
          )}

          <View
            style={[
              styles.grid,
              { padding: GAP, gap: GAP },
              !isLandscape && showScientific && { paddingBottom: GAP / 2 },
            ]}
          >
            {BUTTONS.map((btn, index) => (
              <CalcButton
                key={btn.label}
                label={btn.label}
                type={btn.type}
                wide={btn.wide}
                buttonSize={buttonSize}
                buttonHeight={buttonHeight}
                hapticsEnabled={settings.hapticsEnabled}
                onPress={buttonHandlers[index]!}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  rowLandscape: { paddingTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
