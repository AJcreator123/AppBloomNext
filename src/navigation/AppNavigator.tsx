import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

import HomeScreen from "../screens/HomeScreen";
import PlantsScreen from "../screens/PlantsScreen";
import CareScreen from "../screens/CareScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PlantDetailScreen from "../screens/PlantDetailScreen";
import HistoryScreen from "../screens/HistoryScreen";
import AddPlantScreen from "../screens/AddPlantScreen";
import PairBloomPotScreen from "../screens/PairBloomPotScreen";
import PlantPickerScreen from "../screens/PlantPickerScreen";
import AuthGate from "../screens/AuthGate";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ================= TABS ================= */

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Plants"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          height: 70,
          borderRadius: 28,
          backgroundColor: "#111827",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },

        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: "#A8A8A8",

        tabBarIcon: ({ color, focused }) => {
          let icon = "flower-outline";
          if (route.name === "Care") icon = "heart-outline";
          if (route.name === "Profile") icon = "person-outline";

          return (
            <Ionicons
              name={icon}
              size={focused ? 30 : 24}
              color={color}
              style={{ marginTop: 6 }}
            />
          );
        },

        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 6,
        },
      })}
    >
      <Tab.Screen name="Plants" component={PlantsScreen} />
      <Tab.Screen name="Care" component={CareScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ================= NAV THEME ================= */

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000",
  },
};

/* ================= ROOT NAV ================= */

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          /* 🔐 AUTH FLOW */
          <Stack.Screen name="Auth" component={AuthGate} />
        ) : (
          /* 🌱 MAIN APP */
          <>
            <Stack.Screen name="Root" component={Tabs} />

            <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="AddPlant" component={AddPlantScreen} />
            <Stack.Screen
              name="PairBloomPotScreen"
              component={PairBloomPotScreen}
            />
            <Stack.Screen name="PlantPicker" component={PlantPickerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
