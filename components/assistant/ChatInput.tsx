import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SendHorizonal } from 'lucide-react-native';
import { useTheme } from '../../theme/restyleTheme';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

const ChatInput = memo(function ChatInput({ onSend, loading }: ChatInputProps) {
  const [text, setText] = useState('');
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.separator, backgroundColor: colors.historyBg }]}>
      <TextInput
        style={[styles.input, { color: colors.historyText, backgroundColor: colors.background }]}
        value={text}
        onChangeText={setText}
        placeholder={t('assistant.inputPlaceholder')}
        placeholderTextColor={colors.historySubText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        editable={!loading}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: colors.operatorBtn }]}
        onPress={handleSend}
        disabled={loading || text.trim().length === 0}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <SendHorizonal size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
});

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});