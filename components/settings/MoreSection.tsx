import { Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        {t('settings.more')}
      </ThemedText>
      <SectionCard>
        <SettingRow
          icon={
            <Share2
              size={18}
              color={hasHistory ? accentColor : colors.separator}
            />
          }
          label={t('settings.shareHistory')}
          onPress={hasHistory ? onShareHistory : undefined}
        >
          <ChevronRight
            size={18}
            color={hasHistory ? colors.historySubText : colors.separator}
          />
        </SettingRow>

        <SettingRow
          icon={<Star size={18} color={accentColor} />}
          label={t('settings.rateApp')}
          onPress={() => Linking.openURL('https://apps.apple.com')}
        >
          <ChevronRight size={18} color={colors.historySubText} />
        </SettingRow>

        <SettingRow
          icon={<Info size={18} color={accentColor} />}
          label={t('settings.about')}
          last
          onPress={() => Alert.alert(t('about.title'), t('about.message'))}
        >
          <ChevronRight size={18} color={colors.historySubText} />
        </SettingRow>
      </SectionCard>
    </>
  );
}