/**
 * ChatbotScreen.js
 * AI Assistant screen for Baubrett workers.
 * Uses Claude Sonnet to answer questions about Baubretts with live data context.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';
import { sendChatMessage, getUnscannedCount, isBaubrettScanned, getDeletedList } from '../services/chatbotService';

// Quick action chips configuration
const QUICK_ACTIONS = [
  { id: 'unscanned', label: 'Unscanned Baubretts', icon: 'warning' },
  { id: 'stats', label: 'Statistics', icon: 'bar-chart' },
  { id: 'search', label: 'Search Baubrett', icon: 'search' },
  { id: 'help', label: 'Help', icon: 'help-outline' },
];

export default function ChatbotScreen({ navigation }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Baubrett Assistant. How can I help you today? You can ask me about Baubretts, scanning status, or statistics.',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Get response from Claude
      const conversationHistory = [...messages, userMessage];
      const response = await sendChatMessage(conversationHistory);

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'The AI assistant is not configured. Please contact your administrator.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle quick action chips
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'unscanned':
        handleSend('How many Baubretts are not scanned?');
        break;
      case 'stats':
        handleSend('Show me the current statistics');
        break;
      case 'search':
        // Could navigate to search screen or ask for input
        handleSend('How do I search for a Baubrett?');
        break;
      case 'help':
        handleSend('What can you help me with?');
        break;
      default:
        break;
    }
  };

  // Render individual message bubble
  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          index === messages.length - 1 && styles.lastMessage
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="smart-toy" size={20} color={COLORS.primary} />
          </View>
        )}
        <View style={[
          styles.bubbleContent,
          isUser ? styles.userBubbleContent : styles.assistantBubbleContent
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText
          ]}>
            {item.content}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="person" size={20} color={COLORS.text2} />
          </View>
        )}
      </View>
    );
  };

  // Render quick action chips (only show on initial screen)
  const renderQuickActions = () => {
    if (messages.length > 1) return null; // Hide after first interaction
    
    return (
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick questions:</Text>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionChip}
              onPress={() => handleQuickAction(action.id)}
              activeOpacity={0.7}
            >
              <Icon name={action.icon} size={18} color={COLORS.primary} />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render input bar
  const renderInputBar = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type your question..."
        placeholderTextColor={COLORS.text3}
        multiline
        maxLength={500}
        editable={!loading}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!inputText.trim() || loading) && styles.sendButtonDisabled
        ]}
        onPress={() => handleSend(inputText)}
        disabled={!inputText.trim() || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Icon name="send" size={20} color={COLORS.white} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Icon name="smart-toy" size={28} color={COLORS.white} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by Claude AI</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderQuickActions}
          onContentSizeChange={() => {
            if (messages.length <= 1) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />

        {/* Input */}
        {renderInputBar()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    ...SHADOW.medium,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  lastMessage: {
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  bubbleContent: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  userBubbleContent: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubbleContent: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    ...SHADOW.small,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  assistantText: {
    color: COLORS.text,
    fontWeight: '400',
  },
  quickActionsContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOW.small,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text3,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.small,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.text3,
    ...SHADOW.none,
  },
});