import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';

// 🌱 ADD THIS
import { PlantsProvider } from './src/context/PlantsContext';

import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';

export default function App() {
  const [loadedInter] = useInter({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [loadedPlayfair] = usePlayfair({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
  });

  if (!loadedInter || !loadedPlayfair) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>

        {/* 🌱 WRAP THE WHOLE APP IN THIS PROVIDER */}
        <PlantsProvider>
          <AppNavigator />
        </PlantsProvider>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
