import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PlantsScreen from "../screens/PlantsScreen";
import CareScreen from "../screens/CareScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PlantDetailScreen from "../screens/PlantDetailScreen";
import HistoryScreen from "../screens/HistoryScreen";
import AddPlantScreen from "../screens/AddPlantScreen";
import PairBloomPotScreen from "../screens/PairBloomPotScreen";
import PlantPickerScreen from "../screens/PlantPickerScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Plants"
      screenOptions={({ route }) => ({
        headerShown: false,

        // REAL floating tab bar design:
        tabBarStyle: {
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          height: 70,
          borderRadius: 28,

          backgroundColor: "#111827",          // << THIS WILL SHOW IMMEDIATELY

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
              size={focused ? 30 : 24}       // bigger active icon
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

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000", // optional
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>

        <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />

        <Stack.Screen name="PlantDetail" component={PlantDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddPlant" component={AddPlantScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PairBloomPotScreen" component={PairBloomPotScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PlantPicker" component={PlantPickerScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
