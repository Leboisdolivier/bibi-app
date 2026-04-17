import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ProfileProvider } from './src/context/ProfileContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import TimerScreen from './src/screens/TimerScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#e94560',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
            tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#16213e' },
            tabBarActiveTintColor: '#e94560',
            tabBarInactiveTintColor: '#8892b0',
          }}
        >
          <Tab.Screen
            name="Accueil"
            component={HomeScreen}
            options={{ tabBarLabel: 'Accueil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}
          />
          <Tab.Screen
            name="Nutrition"
            component={NutritionScreen}
            options={{ tabBarLabel: 'Nutrition', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍽️</Text> }}
          />
          <Tab.Screen
            name="Entraînement"
            component={WorkoutScreen}
            options={{ tabBarLabel: 'Sport', tabBarIcon: () => <Text style={{ fontSize: 20 }}>💪</Text> }}
          />
          <Tab.Screen
            name="Chrono"
            component={TimerScreen}
            options={{ tabBarLabel: 'Chrono', tabBarIcon: () => <Text style={{ fontSize: 20 }}>⏱️</Text> }}
          />
          <Tab.Screen
            name="Profil"
            component={ProfileScreen}
            options={{ tabBarLabel: 'Profil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }}
          />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <MainTabs />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0f0f23', justifyContent: 'center', alignItems: 'center' },
});
