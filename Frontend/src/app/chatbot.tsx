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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessage, getMessages, deleteMessages } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import UniversalHeader from '../components/UniversalHeader';
import { styles } from '../styles/chatbot.styles';

interface Message {
  id: number;
  userId: string;
  role: string;
  message: string;
  createdAt: string;
}

interface ChatbotScreenProps {
  onClose?: () => void;
}

export default function ChatbotScreen({ onClose }: ChatbotScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user?.id) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user?.id) return;

    try {
      const response = await getMessages(user.id) as any;
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isLoading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendMessage(messageToSend, user.id) as any;
      if (response.success) {
        // Reload messages to get the full conversation
        await loadMessages();
      } else {
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!user?.id) return;

    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
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

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader
        title="AI Assistant"
        showBackButton={false}
        rightComponent={
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#000" />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Ask me anything about Nilesh or get help!</Text>
          <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
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
            style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Ionicons
              name={isLoading ? "ellipsis-horizontal" : "send"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}