export const GAP = 12;
export const PORTRAIT_SCI_DISPLAY_HEIGHT = 60;

const COLS = 4;
const ROWS = 5;
const SCI_COLS_LANDSCAPE = 4;
const SCI_COLS_PORTRAIT = 6;
const SCI_PANEL_WIDTH_RATIO = 0.45;
const LANDSCAPE_DISPLAY_RESERVE = 72;
const LANDSCAPE_ROW_PADDING_TOP = 12;
const SCI_ROW_GAP_RATIO = 0.12;
const PORTRAIT_SCI_SHARED_HEIGHT_MIN = 18;
const SCIENTIFIC_ROW_GAP_EXTRA = 6;
const PORTRAIT_SCI_PADDING = 12;
const SCI_PORTRAIT_PANEL_PADDING = 24;

interface CalcLayoutInput {
  cw: number;
  ch: number;
  isLandscape: boolean;
  showScientific: boolean;
}

export interface CalcLayoutResult {
  buttonSize: number;
  buttonHeight: number;
  sciButtonSize: number;
  sciPortraitButtonSize: number;
  sciPortraitButtonHeight: number;
}

export function useCalcLayout({
  cw,
  ch,
  isLandscape,
  showScientific,
}: CalcLayoutInput): CalcLayoutResult {
  const sciPanelRatio = isLandscape && showScientific ? SCI_PANEL_WIDTH_RATIO : 0;
  const calcWidth = isLandscape && showScientific ? cw * (1 - sciPanelRatio) : cw;

  const buttonSize = (calcWidth - GAP * (COLS + 1)) / COLS;

  const portraitSciSharedHeight =
    !isLandscape && showScientific && ch > 0
      ? Math.max(
          (ch -
            PORTRAIT_SCI_DISPLAY_HEIGHT -
            (ROWS - 1) * GAP -
            2 * GAP -
            (ROWS - 1) * SCIENTIFIC_ROW_GAP_EXTRA -
            PORTRAIT_SCI_PADDING) /
            (ROWS + ROWS),
          PORTRAIT_SCI_SHARED_HEIGHT_MIN,
        )
      : null;

  const buttonHeight = isLandscape
    ? (ch - LANDSCAPE_DISPLAY_RESERVE - LANDSCAPE_ROW_PADDING_TOP - GAP * (ROWS + 1)) / ROWS
    : (portraitSciSharedHeight ?? buttonSize);

  const sciButtonSize =
    isLandscape && showScientific
      ? (cw * sciPanelRatio - GAP * (SCI_COLS_LANDSCAPE + 1)) / SCI_COLS_LANDSCAPE
      : 0;

  const sciPortraitButtonSize =
    !isLandscape && showScientific
      ? (cw - SCI_PORTRAIT_PANEL_PADDING) /
        (SCI_COLS_PORTRAIT + (SCI_COLS_PORTRAIT - 1) * SCI_ROW_GAP_RATIO)
      : 0;

  const sciPortraitButtonHeight = portraitSciSharedHeight ?? 0;

  return {
    buttonSize,
    buttonHeight,
    sciButtonSize,
    sciPortraitButtonSize,
    sciPortraitButtonHeight,
  };
}
