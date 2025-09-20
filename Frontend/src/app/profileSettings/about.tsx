import UniversalHeader from '@/src/components/UniversalHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const appInfo = {
    version: '1.0.0',
    build: '2024.1.0',
    lastUpdated: 'September 2024',
  };

  const links = [
    {
      id: 'website',
      title: t('profile.visitWebsite'),
      subtitle: t('profile.learnMoreMission'),
      icon: 'globe',
      url: 'https://civicreporter.com', // Replace with actual website
    },
    {
      id: 'privacy',
      title: t('profile.privacyPolicy'),
      subtitle: t('profile.protectData'),
      icon: 'shield-checkmark',
      url: 'https://civicreporter.com/privacy', // Replace with actual privacy policy
    },
    {
      id: 'terms',
      title: t('profile.termsService'),
      subtitle: t('profile.termsConditions'),
      icon: 'document-text',
      url: 'https://civicreporter.com/terms', // Replace with actual terms
    },
    {
      id: 'feedback',
      title: t('profile.sendFeedback'),
      subtitle: t('profile.helpImprove'),
      icon: 'chatbubble',
      url: 'mailto:feedback@civicreporter.com', // Replace with actual feedback email
    },
  ];

  const team = [
    {
      name: 'Nilesh Bera',
      role: t('profile.projectLead'),
      department: t('profile.appDeveloper'),
    },
    {
      name: 'Priya Singh',
      role: t('profile.planner'),
      department: '',
    },
    // {
    //   name: 'Amit Sharma',
    //   role: 'UI/UX Designer',
    //   department: 'Design Team',
    // },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <UniversalHeader title={t('profile.about')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.ourMission')}</Text>
          <Text style={styles.missionText}>
            {t('profile.missionText')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appInformation')}</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('profile.versionLabel')}</Text>
            <Text style={styles.infoValue}>{appInfo.version}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('profile.buildLabel')}</Text>
            <Text style={styles.infoValue}>{appInfo.build}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('profile.lastUpdatedLabel')}</Text>
            <Text style={styles.infoValue}>{appInfo.lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.quickLinks')}</Text>

          {links.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkItem}
              onPress={() => handleLinkPress(link.url)}
              activeOpacity={0.8}
            >
              <View style={styles.linkLeft}>
                <Ionicons name={link.icon as any} size={20} color="#FF6B35" />
                <View style={styles.linkText}>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.ourTeam')}</Text>
          <Text style={styles.teamDescription}>
            {t('profile.meetTeam')}
          </Text>

          {team.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
                <Text style={styles.memberDepartment}>{member.department}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.contactInformation')}</Text>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('tel:+911234567890')}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={20} color="#FF6B35" />
            <Text style={styles.contactText}>+91 12345 67890</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL('mailto:support@civicreporter.com')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={20} color="#FF6B35" />
            <Text style={styles.contactText}>support@civicreporter.com</Text>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color="#FF6B35" />
            <Text style={styles.contactText}>Government of Jharkhand{'\n'}Department of Higher and Technical Education</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('profile.copyrightText')}
          </Text>
          <Text style={styles.footerSubtext}>
            {t('profile.madeWithLove')}
          </Text>
        </View>
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  missionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkText: {
    marginLeft: 12,
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  teamDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  memberInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 2,
  },
  memberDepartment: {
    fontSize: 12,
    color: '#666666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  contactText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});
