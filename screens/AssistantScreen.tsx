import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { sendMessage, AssistantMessage } from '../services/assistantService';
import { pushHistory } from '../services/historyService';
import { formatNumber } from '../calculator/formatNumber';
import { useSettings } from '../store/SettingsContext';
import { ThemedText, useTheme } from '../theme/restyleTheme';
import MessageBubble from '../components/assistant/MessageBubble';
import ChatInput from '../components/assistant/ChatInput';
import type { BubbleRole } from '../components/assistant/MessageBubble';

interface DisplayMessage {
  id: string;
  role: BubbleRole;
  content: string;
  steps?: string[] | undefined;
}

const MAX_HISTORY = 10;

export default function AssistantScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<AssistantMessage[]>([]);
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: DisplayMessage = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const result = await sendMessage(text, historyRef.current);

      let assistantMsg: DisplayMessage;

      if (result.type === 'result') {
        const displayValue = formatNumber(result.value, settings.precision);
        assistantMsg = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: displayValue,
          steps: result.steps,
        };
        void pushHistory(text, displayValue);
        // Update rolling history for contextual memory — use raw value for AI context
        historyRef.current = [
          ...historyRef.current,
          { role: 'user' as const, content: text },
          { role: 'assistant' as const, content: result.value },
        ].slice(-MAX_HISTORY);
      } else if (result.type === 'out_of_scope') {
        assistantMsg = {
          id: `${Date.now()}-out_of_scope`,
          role: 'out_of_scope',
          content: t('assistant.outOfScope'),
        };
      } else {
        assistantMsg = {
          id: `${Date.now()}-error`,
          role: 'error',
          content: result.message,
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [t, settings.precision],
  );

  const handleUseResult = useCallback(
    (value: string) => {
      // Strip thousands separators before passing to calculator
      const raw = value.replace(/,/g, '');
      // @ts-expect-error — untyped navigator params
      navigation.navigate('Home', { initialValue: raw });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: insets.bottom + 8 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="emptyText" style={{ color: colors.historySubText }}>
              {t('assistant.emptyState')}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <MessageBubble
            role={item.role}
            content={item.content}
            steps={item.steps}
            onUseResult={item.role === 'assistant' ? handleUseResult : undefined}
          />
        )}
      />
      <ChatInput onSend={handleSend} loading={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
});
