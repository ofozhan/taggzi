import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import TodayScreen from './screens/TodayScreen';
import HistoryScreen from './screens/HistoryScreen';
import DayDetailScreen from './screens/DayDetailScreen';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <Ionicons name="car-sport-outline" size={28} color="#1e8449" />
      <Text style={styles.logoText}>tagzi</Text>
    </View>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F7F7F8' },
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

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          await Notifications.cancelAllScheduledNotificationsAsync();
          await Notifications.scheduleNotificationAsync({
            content: { title: "Günü Kapatma Zamanı!", body: "Bugünkü kayıtlarını Tagzi'ye eklemeyi unutma." },
            trigger: { hour: 22, minute: 0, repeats: true },
          });
        }
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Bugün') { iconName = focused ? 'today' : 'today-outline'; } 
              else if (route.name === 'Geçmiş') { iconName = focused ? 'calendar' : 'calendar-outline'; }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1e8449',
            tabBarInactiveTintColor: 'gray',
            headerTitleAlign: 'center',
            headerStyle: { height: 110, backgroundColor: '#F7F7F8', shadowOpacity: 0, elevation: 0, },
            tabBarStyle: { backgroundColor: '#F7F7F8', borderTopColor: '#DCDCDC' },
            tabBarShowLabel: false,
          })}
        >
          <Tab.Screen name="Bugün" component={TodayScreen} options={{ headerTitle: () => <LogoTitle /> }} />
          <Tab.Screen name="Geçmiş" component={HistoryStack} options={{ headerTitle: 'Geçmiş Kayıtlar' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#333' },
});