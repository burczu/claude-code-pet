import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText, useTheme } from '../../theme/restyleTheme';

import StepsAccordion from './StepsAccordion';

export type BubbleRole = 'user' | 'assistant' | 'out_of_scope' | 'error';

interface MessageBubbleProps {
  role: BubbleRole;
  content: string;
  steps?: string[] | undefined;
  onUseResult?: ((value: string) => void) | undefined;
}

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  steps,
  onUseResult,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isUser = role === 'user';

  const bubbleStyle = [
    styles.bubble,
    isUser
      ? [styles.userBubble, { backgroundColor: colors.operatorBtn }]
      : [styles.assistantBubble, { backgroundColor: colors.historyBg }],
    role === 'error' && { backgroundColor: colors.danger },
    role === 'out_of_scope' && { backgroundColor: colors.scientificBtn },
  ];

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View style={bubbleStyle}>
        <ThemedText variant="rowLabel" style={{ color: isUser ? '#fff' : colors.historyText }}>
          {content}
        </ThemedText>

        {steps && steps.length > 0 && <StepsAccordion steps={steps} />}

        {role === 'assistant' && onUseResult && (
          <TouchableOpacity
            style={[styles.resultBtn, { borderColor: colors.separator }]}
            onPress={() => onUseResult(content)}
            activeOpacity={0.7}
          >
            <ThemedText variant="indicator" style={{ color: colors.expressionText }}>
              {t('assistant.useResult')}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default MessageBubble;

const styles = StyleSheet.create({
  row: { marginHorizontal: 16, marginVertical: 4 },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: { borderBottomLeftRadius: 4 },
  resultBtn: {
    alignSelf: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
});
