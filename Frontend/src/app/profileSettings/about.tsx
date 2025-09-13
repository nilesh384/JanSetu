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

export default function About() {
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
      title: 'Visit Our Website',
      subtitle: 'Learn more about our mission',
      icon: 'globe',
      url: 'https://civicreporter.com', // Replace with actual website
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we protect your data',
      icon: 'shield-checkmark',
      url: 'https://civicreporter.com/privacy', // Replace with actual privacy policy
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      subtitle: 'Our terms and conditions',
      icon: 'document-text',
      url: 'https://civicreporter.com/terms', // Replace with actual terms
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Help us improve the app',
      icon: 'chatbubble',
      url: 'mailto:feedback@civicreporter.com', // Replace with actual feedback email
    },
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Project Lead',
      department: 'Department of Higher and Technical Education',
    },
    {
      name: 'Priya Singh',
      role: 'Technical Lead',
      department: 'Software Development',
    },
    {
      name: 'Amit Sharma',
      role: 'UI/UX Designer',
      department: 'Design Team',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={60} color="#FF6B35" />
          </View>
          <Text style={styles.appName}>Civic Reporter</Text>
          <Text style={styles.tagline}>Empowering Communities, Driving Change</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Civic Reporter is a crowdsourced platform that connects citizens with local governments
            to address civic issues efficiently. We believe in transparent governance and community
            participation to create better living environments for everyone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{appInfo.version}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>{appInfo.build}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{appInfo.lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>

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
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.teamDescription}>
            Meet the dedicated team behind Civic Reporter
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
          <Text style={styles.sectionTitle}>Contact Information</Text>

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
            © 2024 Civic Reporter. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for better communities
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
    marginBottom: 16,
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
