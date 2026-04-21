import { memo, useState } from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText, useTheme } from '../../theme/restyleTheme';

interface StepsAccordionProps {
  steps: string[];
}

const StepsAccordion = memo(function StepsAccordion({ steps }: StepsAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.separator }]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={styles.toggle}>
        <ThemedText variant="indicator" style={{ color: colors.expressionText }}>
          {expanded ? t('assistant.hideSteps') : t('assistant.showSteps')}
        </ThemedText>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.steps}>
          {steps.map((step, i) => (
            <ThemedText
              key={step || i}
              variant="equation"
              style={{ color: colors.historySubText, marginTop: 4 }}
            >
              {`${i + 1}. ${step}`}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );
});

export default StepsAccordion;

const styles = StyleSheet.create({
  container: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6 },
  toggle: { alignSelf: 'flex-start' },
  steps: { marginTop: 4 },
});
