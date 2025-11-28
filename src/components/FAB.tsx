import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function FAB({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.fab} activeOpacity={0.9} onPress={onPress}>
      <Ionicons name="add" size={28} color={colors.bg} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 26,
    bottom: 32,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
