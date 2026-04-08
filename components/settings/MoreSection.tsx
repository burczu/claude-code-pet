import { Alert, Linking } from 'react-native';
import { ChevronRight, Info, Share2, Star } from 'lucide-react-native';
import { ThemedText, useTheme } from '../../theme/restyleTheme';
import SectionCard from '../SectionCard';
import SettingRow from '../SettingRow';

interface MoreSectionProps {
  accentColor: string;
  hasHistory: boolean;
  onShareHistory: () => void;
}

export default function MoreSection({ accentColor, hasHistory, onShareHistory }: MoreSectionProps) {
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
        MORE
      </ThemedText>
      <SectionCard>
        <SettingRow
          icon={
            <Share2
              size={18}
              color={hasHistory ? accentColor : colors.separator}
            />
          }
          label="Share History"
          onPress={hasHistory ? onShareHistory : undefined}
        >
          <ChevronRight
            size={18}
            color={hasHistory ? colors.historySubText : colors.separator}
          />
        </SettingRow>

        <SettingRow
          icon={<Star size={18} color={accentColor} />}
          label="Rate App"
          onPress={() => Linking.openURL('https://apps.apple.com')}
        >
          <ChevronRight size={18} color={colors.historySubText} />
        </SettingRow>

        <SettingRow
          icon={<Info size={18} color={accentColor} />}
          label="About"
          last
          onPress={() =>
            Alert.alert('Calculator', 'Version 1.0.0\nBuilt with Expo & React Native')
          }
        >
          <ChevronRight size={18} color={colors.historySubText} />
        </SettingRow>
      </SectionCard>
    </>
  );
}