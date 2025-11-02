import React from 'react';
import { View, StyleSheet } from 'react-native';
import BiometricSettings from '../../components/BiometricSettings';
import UniversalHeader from '../../components/UniversalHeader';

export default function BiometricScreen() {
  return (
    <View style={styles.container}>
      <UniversalHeader title="Biometric Security" showBackButton />
      <BiometricSettings />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});