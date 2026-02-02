import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendMessage, getMessages, deleteMessages } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/chatbot.styles';

interface Message {
  id: number | string;
  userId: string;
  role: string;
  message: string;
  createdAt: string;
  isLoading?: boolean;
  isPending?: boolean;
}

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const createDotStyle = (dot: Animated.Value) => ({
    opacity: dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, createDotStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, createDotStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, createDotStyle(dot3)]} />
    </View>
  );
};

export default function ChatbotScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await getMessages(user.id) as any;
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isSending) return;

    const messageToSend = inputMessage.trim();
    const tempUserId = `temp-${Date.now()}`;
    const tempAiId = `temp-ai-${Date.now()}`;
    
    // Add user message immediately
    const userMessage: Message = {
      id: tempUserId,
      userId: user.id,
      role: 'user',
      message: messageToSend,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    // Add loading AI message
    const aiLoadingMessage: Message = {
      id: tempAiId,
      userId: user.id,
      role: 'ai',
      message: '',
      createdAt: new Date().toISOString(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, aiLoadingMessage]);
    setInputMessage('');
    setIsSending(true);
    Keyboard.dismiss();

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendMessage(messageToSend, user.id) as any;
      if (response.success) {
        // Reload messages to get the full conversation
        await loadMessages();
      } else {
        // Remove loading message and show error
        setMessages(prev => prev.filter(msg => msg.id !== tempUserId && msg.id !== tempAiId));
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading message and show error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserId && msg.id !== tempAiId));
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!user?.id || isDeleting) return;

    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await deleteMessages(user.id) as any;
              if (response.success) {
                setMessages([]);
              } else {
                Alert.alert('Error', response.message || 'Failed to clear chat');
              }
            } catch (error) {
              console.error('Error clearing chat:', error);
              Alert.alert('Error', 'Failed to clear chat. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    if (item.isLoading) {
      return (
        <View style={[styles.messageContainer, styles.aiMessage, styles.loadingMessageContainer]}>
          <TypingIndicator />
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {item.message}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {formatTime(item.createdAt)}
          </Text>
          {item.isPending && (
            <Ionicons name="time-outline" size={12} color="rgba(255, 255, 255, 0.7)" style={styles.pendingIcon} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header with Delete and Close buttons */}
      <View style={styles.simpleHeader}>
        <TouchableOpacity 
          onPress={handleClearChat} 
          disabled={isDeleting}
          style={styles.headerButton}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <MaterialIcons name="delete" size={24} color="#ff0000" />
          )}
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerButton}
        >
          <Ionicons name="close" size={28} color="#666" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMessage}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              onLayout={() => flatListRef.current?.scrollToEnd()}
              keyboardShouldPersistTaps="handled"
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                multiline
                maxLength={1000}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputMessage.trim() || isSending) && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}