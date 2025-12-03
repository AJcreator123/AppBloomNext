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

import colors from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Plants"
      screenOptions={({ route }) => ({
        headerShown: false,

        /** ⭐ TAB BAR RAISED EVEN MORE ⭐ */
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,

          height: 94,        // ⬆ even taller bar
          paddingTop: 18,    // ⬆ move icons further up
          paddingBottom: 20, // ⬆ clears Android nav area perfectly
          marginBottom: 14,  // ⬆ lifts entire bar up a bit more
        },

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,

        /** ⭐ ICON POSITION EVEN HIGHER ⭐ */
        tabBarIcon: ({ color }) => {
          let icon = "leaf-outline";

          if (route.name === "Plants") icon = "flower-outline";
          if (route.name === "Care") icon = "heart-outline";
          if (route.name === "Profile") icon = "person-outline";

          return <Ionicons name={icon as any} size={28} color={color} />;
        },

        /** ⭐ LABEL POSITION ADJUSTED ⭐ */
        tabBarLabelStyle: {
          marginTop: -6, // closer to icons
          fontSize: 12,
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
    background: colors.bg,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Root"
          component={Tabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PlantDetail"
          component={PlantDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddPlant"
          component={AddPlantScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PairBloomPotScreen"
          component={PairBloomPotScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
