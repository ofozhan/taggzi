import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import TodayScreen from './screens/TodayScreen';
import HistoryScreen from './screens/HistoryScreen';
import DayDetailScreen from './screens/DayDetailScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="HistoryList" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} options={{ title: 'Gün Detayı' }} />
    </Stack.Navigator>
  );
}

function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <Ionicons name="car-sport" size={28} color="#27ae60" />
      <Text style={styles.logoText}>tagzi</Text>
    </View>
  );
}

export default function App() {
  useEffect(() => {
    // ... bildirim kodu aynı ...
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            // GÜNCELLENDİ: Sekme butonu tasarımı tamamen bize ait
            tabBarShowLabel: false, // Varsayılan etiketi gizle
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Bugün') {
                iconName = focused ? 'today' : 'today-outline';
              } else if (route.name === 'Geçmiş') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              }

              return (
                <View style={styles.tabIconContainer}>
                  <Ionicons name={iconName} size={24} color={color} />
                  <Text style={[{ color: color }, styles.tabIconText]}>{route.name}</Text>
                </View>
              );
            },
            tabBarActiveTintColor: '#27ae60',
            tabBarInactiveTintColor: 'gray',
            headerTitleAlign: 'center',
            headerStyle: {
              height: 110,
              backgroundColor: '#fff',
              shadowOpacity: 0,
              elevation: 0,
            },
            tabBarStyle: {
                height: 65,
                paddingTop: 5,
                paddingBottom: 5,
            }
          })}
        >
          <Tab.Screen
            name="Bugün"
            component={TodayScreen}
            options={{ headerTitle: () => <LogoTitle /> }}
          />
          <Tab.Screen
            name="Geçmiş"
            component={HistoryStack}
            options={{ headerTitle: 'Geçmiş Kayıtlar' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  // YENİ: Özel sekme butonu için stiller
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIconText: {
    fontSize: 10,
  }
});