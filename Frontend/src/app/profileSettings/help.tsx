import UniversalHeader from '@/src/components/UniversalHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

export default function HelpSupport() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: t('profile.faq1Question'),
      answer: t('profile.faq1Answer'),
      expanded: false,
    },
    {
      id: '2',
      question: t('profile.faq2Question'),
      answer: t('profile.faq2Answer'),
      expanded: false,
    },
    {
      id: '3',
      question: t('profile.faq3Question'),
      answer: t('profile.faq3Answer'),
      expanded: false,
    },
    {
      id: '4',
      question: t('profile.faq4Question'),
      answer: t('profile.faq4Answer'),
      expanded: false,
    },
    {
      id: '5',
      question: t('profile.faq5Question'),
      answer: t('profile.faq5Answer'),
      expanded: false,
    },
  ]);

  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const toggleFAQ = (id: string) => {
    setFaqs(prev =>
      prev.map(faq =>
        faq.id === id
          ? { ...faq, expanded: !faq.expanded }
          : faq
      )
    );
  };

  const handleContactSubmit = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert(t('profile.error'), t('profile.fillAllFields'));
      return;
    }

    Alert.alert(
      t('profile.messageSent'),
      t('profile.messageSentDescription'),
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '' });
          }
        }
      ]
    );
  };

  const handleCallSupport = () => {
    const phoneNumber = '+911234567890'; // Replace with actual support number
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailSupport = () => {
    const email = 'support@civicreporter.com'; // Replace with actual support email
    Linking.openURL(`mailto:${email}`);
  };

  const quickActions = [
    {
      id: 'call',
      title: t('profile.callSupport'),
      subtitle: '',
      icon: 'call',
      action: handleCallSupport,
    },
    {
      id: 'email',
      title: t('profile.emailSupport'),
      subtitle: '',
      icon: 'mail',
      action: handleEmailSupport,
    },
    {
      id: 'chat',
      title: t('profile.chat'),
      subtitle: '',
      icon: 'chatbubble',
      action: () => Alert.alert(t('profile.comingSoon'), t('profile.liveChatComingSoon')),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader title={t('profile.helpSupport')} showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {t('profile.helpDescription')}
        </Text>

        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionButton}
              onPress={action.action}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={24} color="#FF6B35" />
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.frequentlyAskedQuestions')}</Text>

          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666666"
                />
              </TouchableOpacity>

              {faq.expanded && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.contactUs')}</Text>
          <Text style={styles.contactDescription}>
            {t('profile.contactDescription')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.subject')}</Text>
            <TextInput
              style={styles.input}
              value={contactForm.subject}
              onChangeText={(value) => setContactForm(prev => ({ ...prev, subject: value }))}
              placeholder={t('profile.subjectPlaceholder')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.message')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={contactForm.message}
              onChangeText={(value) => setContactForm(prev => ({ ...prev, message: value }))}
              placeholder={t('profile.messagePlaceholder')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleContactSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>{t('profile.sendMessage')}</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Support Hours</Text>
          <Text style={styles.infoText}>
            Monday - Friday: 9:00 AM - 6:00 PM IST
          </Text>
          <Text style={styles.infoText}>
            Saturday: 10:00 AM - 4:00 PM IST
          </Text>
          <Text style={styles.infoText}>
            Sunday: Closed
          </Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
});
