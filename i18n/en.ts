export interface TranslationKeys {
  settings: {
    appearance: string;
    behaviour: string;
    more: string;
    theme: string;
    accent: string;
    haptics: string;
    scientificMode: string;
    precision: string;
    shareHistory: string;
    rateApp: string;
    about: string;
    themeOptions: {
      light: string;
      dark: string;
      system: string;
    };
  };
  history: {
    title: string;
    clearAll: string;
    empty: string;
    clearConfirmTitle: string;
    clearConfirmMessage: string;
    clearConfirmCancel: string;
    clearConfirmDelete: string;
    shareHeader: string;
  };
  about: {
    title: string;
    message: string;
  };
  display: {
    memory: string;
    radians: string;
  };
  assistant: {
    emptyState: string;
    inputPlaceholder: string;
    outOfScope: string;
    useResult: string;
    showSteps: string;
    hideSteps: string;
    tabLabel: string;
    micPermissionDenied: string;
  };
}

const en: TranslationKeys = {
  settings: {
    appearance: 'APPEARANCE',
    behaviour: 'BEHAVIOUR',
    more: 'MORE',
    theme: 'Theme',
    accent: 'Accent',
    haptics: 'Haptics',
    scientificMode: 'Scientific Mode',
    precision: 'Precision: {{value}}',
    shareHistory: 'Share History',
    rateApp: 'Rate App',
    about: 'About',
    themeOptions: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
  history: {
    title: 'HISTORY',
    clearAll: 'Clear All',
    empty: 'No calculations yet',
    clearConfirmTitle: 'Clear History',
    clearConfirmMessage: 'Are you sure you want to delete all history?',
    clearConfirmCancel: 'Cancel',
    clearConfirmDelete: 'Delete All',
    shareHeader: 'My Calculator History:',
  },
  about: {
    title: 'Calculator',
    message: 'Version 1.0.0\nBuilt with Expo & React Native',
  },
  display: {
    memory: 'M',
    radians: 'RAD',
  },
  assistant: {
    emptyState: 'Ask me anything math-related',
    inputPlaceholder: 'e.g. Split $80 between 3 people with 15% tip',
    outOfScope:
      'I can only help with calculations and math. Try asking something like "What\'s 15% of 200?"',
    useResult: 'Use result',
    showSteps: 'Show working',
    hideSteps: 'Hide working',
    tabLabel: 'Assistant',
    micPermissionDenied: 'Microphone permission is required for voice input.',
  },
};

export default en;
