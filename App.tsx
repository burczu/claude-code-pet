import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider } from '@shopify/restyle';
import { Home, Settings } from 'lucide-react-native';
import { SettingsProvider, useSettings } from './store/SettingsContext';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import { darkTheme, lightTheme } from './theme/restyleTheme';

const Tab = createBottomTabNavigator();

const LANDSCAPE_TAB_HEIGHT = 50;
const LANDSCAPE_TAB_PADDING_BOTTOM = 4;
const LANDSCAPE_TAB_PADDING_TOP = 3;

function AppNavigator() {
  const { width, height } = useWindowDimensions();
  const { resolvedScheme, settings } = useSettings();
  const isLandscape = width > height;
  const restyleTheme = useMemo(() => {
    const base = resolvedScheme === 'dark' ? darkTheme : lightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        operatorBtn: settings.accentColor,
      },
    };
  }, [resolvedScheme, settings.accentColor]);

  return (
    <ThemeProvider theme={restyleTheme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            animation: 'shift',
            tabBarStyle: isLandscape
              ? {
                  height: LANDSCAPE_TAB_HEIGHT,
                  paddingBottom: LANDSCAPE_TAB_PADDING_BOTTOM,
                  paddingTop: LANDSCAPE_TAB_PADDING_TOP,
                }
              : undefined,
          }}
        >
          <Tab.Screen
            name="Home"
            component={MainScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AppNavigator />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
