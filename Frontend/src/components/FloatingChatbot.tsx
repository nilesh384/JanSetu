import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { sendMessage, getMessages, deleteMessages } from '../api/chat';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  clearButton: {
    padding: 5,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timestampText: {
    fontSize: 12,
    marginTop: 4,
    color: '#999',
  },
});

interface Message {
  id: number;
  userId: string;
  role: string;
  message: string;
  createdAt: string;
}

const FloatingChatbot: React.FC = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user?.id && isChatOpen) {
      loadMessages();
    }
  }, [user, isChatOpen]);

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
      <View style={{
        marginBottom: 8,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
      }}>
        <View style={{
          backgroundColor: isUser ? '#3B82F6' : '#374151',
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: '#4B5563',
        }}>
          <Text style={{
            color: isUser ? '#FFFFFF' : '#F3F4F6',
            fontSize: 16,
            lineHeight: 20,
          }}>
            {item.message}
          </Text>
          <Text style={{
            color: '#9CA3AF',
            fontSize: 12,
            marginTop: 4,
            textAlign: 'right',
          }}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 100 : 84, // Above tab bar (88+12 for iOS, 72+12 for Android)
          right: 20,
          width: 45,
          height: 45,
          borderRadius: 22.5,
          backgroundColor: isChatOpen ? '#1F2937' : '#3B82F6',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          zIndex: 1000,
        }}
        onPress={() => setIsChatOpen(!isChatOpen)}
      >
        <Text style={{ fontSize: 20 }}>
          {isChatOpen ? '×' : '💬'}
        </Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal
        visible={isChatOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsChatOpen(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setIsChatOpen(false)}
            />

            <View style={{
              backgroundColor: '#111827',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: height * 0.7,
              padding: 20,
              borderWidth: 1,
              borderColor: '#374151',
              borderBottomWidth: 0,
            }}>
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                }}>
                  🤖 AI Assistant
                </Text>
                <TouchableOpacity
                  onPress={() => setIsChatOpen(false)}
                  style={{
                    padding: 8,
                    borderRadius: 20,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  <Text style={{
                    fontSize: 24,
                    color: '#EF4444',
                    fontWeight: 'bold',
                  }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clear Button */}
              <TouchableOpacity
                onPress={handleClearChat}
                style={{
                  position: 'absolute',
                  right: 70,
                  top: 20,
                  zIndex: 1000,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <MaterialIcons name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>

              {/* Messages */}
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                style={{
                  flex: 1,
                  marginBottom: 16,
                }}
                contentContainerStyle={{
                  paddingVertical: 8,
                }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                onLayout={() => flatListRef.current?.scrollToEnd()}
                ListEmptyComponent={
                  !isLoading ? (
                    <Text style={{
                      color: '#6B7280',
                      textAlign: 'center',
                      marginTop: 40,
                      fontSize: 16,
                    }}>
                      No messages yet. Start chatting!
                    </Text>
                  ) : null
                }
              />

              {/* Input */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 12,
                    color: '#FFFFFF',
                    fontSize: 16,
                    minHeight: 48,
                    maxHeight: 120,
                  }}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Ask me anything..."
                  placeholderTextColor="#6B7280"
                  multiline
                  maxLength={1000}
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: (!inputMessage.trim() || isLoading) ? '#6B7280' : '#3B82F6',
                    borderRadius: 16,
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    minWidth: 48,
                    minHeight: 48,
                  }}
                  onPress={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                >
                  {isLoading ? (
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>...</Text>
                  ) : (
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

export default FloatingChatbot;