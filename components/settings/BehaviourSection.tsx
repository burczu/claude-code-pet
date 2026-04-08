import { StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { FlaskConical, Hash, Vibrate } from 'lucide-react-native';
import { ThemedText, useTheme } from '../../theme/restyleTheme';
import SectionCard from '../SectionCard';
import SettingRow from '../SettingRow';

const MIN_PRECISION = 0;
const MAX_PRECISION = 10;
const PRECISION_STEP = 1;
const SLIDER_WIDTH = 140;
const SLIDER_HEIGHT = 36;

interface BehaviourSectionProps {
  accentColor: string;
  hapticsEnabled: boolean;
  scientificMode: boolean;
  precision: number;
  onHapticsChange: (value: boolean) => void;
  onScientificModeChange: (value: boolean) => void;
  onPrecisionChange: (value: number) => void;
}

export default function BehaviourSection({
  accentColor,
  hapticsEnabled,
  scientificMode,
  precision,
  onHapticsChange,
  onScientificModeChange,
  onPrecisionChange,
}: BehaviourSectionProps) {
  const { colors } = useTheme();

  return (
    <>
      <ThemedText
        variant="sectionTitle"
        style={{
          color: colors.historySubText,
          marginTop: 24,
          marginBottom: 6,
          marginHorizontal: 20,
        }}
      >
        BEHAVIOUR
      </ThemedText>
      <SectionCard>
        <SettingRow icon={<Vibrate size={18} color={accentColor} />} label="Haptics">
          <Switch
            value={hapticsEnabled}
            onValueChange={onHapticsChange}
            trackColor={{ true: accentColor }}
          />
        </SettingRow>

        <SettingRow
          icon={<FlaskConical size={18} color={accentColor} />}
          label="Scientific Mode"
        >
          <Switch
            value={scientificMode}
            onValueChange={onScientificModeChange}
            trackColor={{ true: accentColor }}
          />
        </SettingRow>

        <SettingRow
          icon={<Hash size={18} color={accentColor} />}
          label={`Precision: ${precision}`}
          last
        >
          <Slider
            style={styles.slider}
            minimumValue={MIN_PRECISION}
            maximumValue={MAX_PRECISION}
            step={PRECISION_STEP}
            value={precision}
            onValueChange={onPrecisionChange}
            minimumTrackTintColor={accentColor}
            maximumTrackTintColor={colors.separator}
            thumbTintColor={accentColor}
          />
        </SettingRow>
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  slider: { width: SLIDER_WIDTH, height: SLIDER_HEIGHT },
});