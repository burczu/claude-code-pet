import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, SendHorizonal } from 'lucide-react-native';
import { useTheme } from '../../theme/restyleTheme';
import { startRecording, stopRecordingAndTranscribe } from '../../services/speechService';

type RecordingState = 'idle' | 'recording' | 'transcribing';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
}

const ChatInput = memo(function ChatInput({ onSend, loading }: ChatInputProps) {
  const [text, setText] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const { colors } = useTheme();
  const { t } = useTranslation();

  const busy = loading || recordingState !== 'idle';

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    onSend(trimmed);
    setText('');
  };

  const handleMicPress = async () => {
    if (recordingState === 'idle') {
      try {
        setRecordingState('recording');
        await startRecording();
      } catch {
        setRecordingState('idle');
      }
    } else if (recordingState === 'recording') {
      try {
        setRecordingState('transcribing');
        const transcript = await stopRecordingAndTranscribe();
        setRecordingState('idle');
        if (transcript) {
          onSend(transcript);
        }
      } catch {
        setRecordingState('idle');
      }
    }
  };

  const micColor = recordingState === 'recording' ? colors.danger : colors.historySubText;

  return (
    <View style={[styles.container, { borderTopColor: colors.separator, backgroundColor: colors.historyBg }]}>
      <TouchableOpacity
        style={styles.micBtn}
        onPress={handleMicPress}
        disabled={loading || recordingState === 'transcribing'}
        activeOpacity={0.7}
      >
        {recordingState === 'transcribing' ? (
          <ActivityIndicator size="small" color={colors.historySubText} />
        ) : recordingState === 'recording' ? (
          <MicOff size={22} color={micColor} />
        ) : (
          <Mic size={22} color={micColor} />
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: colors.historyText, backgroundColor: colors.background }]}
        value={text}
        onChangeText={setText}
        placeholder={t('assistant.inputPlaceholder')}
        placeholderTextColor={colors.historySubText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
        editable={!busy}
        multiline
      />

      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: colors.operatorBtn }]}
        onPress={handleSend}
        disabled={busy || text.trim().length === 0}
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
  micBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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