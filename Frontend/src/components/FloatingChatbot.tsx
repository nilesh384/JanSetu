import React from 'react';
import {
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const FloatingChatbot: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: (Platform.OS === 'ios' ? 100 : 84) + insets.bottom,
        right: 20,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
      }}
      onPress={() => router.push('/chatbot')}
    >
      <Text style={{ fontSize: 20 }}>💬</Text>
    </TouchableOpacity>
  );
};

export default FloatingChatbot;