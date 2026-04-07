import { useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Settings } from 'lucide-react-native';
import { SettingsProvider } from './store/SettingsContext';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              animation: 'shift',
              tabBarStyle: isLandscape
                ? { height: 50, paddingBottom: 4, paddingTop: 3 }
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
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
