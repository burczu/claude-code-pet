import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { GROQ_API_KEY } from '@env';

const WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

let activeRecording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error('Microphone permission denied');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  activeRecording = recording;
}

export async function stopRecordingAndTranscribe(): Promise<string> {
  if (!activeRecording) throw new Error('No active recording');

  await activeRecording.stopAndUnloadAsync();
  const uri = activeRecording.getURI();
  activeRecording = null;

  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  if (!uri) throw new Error('No audio recorded');

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('model', 'whisper-1');

  const response = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY ?? ''}` },
    body: formData,
  });

  if (!response.ok) throw new Error(`Transcription failed: ${response.status}`);

  const data = (await response.json()) as { text: string };
  return data.text.trim();
}

export function speak(text: string, languageCode = 'en'): void {
  Speech.speak(text, { language: languageCode });
}

export function stopSpeaking(): void {
  void Speech.stop();
}
