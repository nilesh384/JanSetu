import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BiometricSettings from '../../components/BiometricSettings';
import UniversalHeader from '../../components/UniversalHeader';

export default function BiometricScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <UniversalHeader title="Biometric Security" showBackButton />
      <BiometricSettings />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
