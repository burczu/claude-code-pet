import { Gesture } from 'react-native-gesture-handler';

const SWIPE_THRESHOLD_X = 40;
const SWIPE_THRESHOLD_Y = 40;

export function useSwipeToDelete(onDelete: () => void) {
  return Gesture.Pan()
    .runOnJS(true)
    .onEnd((evt) => {
      if (
        Math.abs(evt.translationX) > SWIPE_THRESHOLD_X &&
        Math.abs(evt.translationY) < SWIPE_THRESHOLD_Y
      ) {
        onDelete();
      }
    });
}