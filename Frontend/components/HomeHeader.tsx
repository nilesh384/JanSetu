import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import WebViewModal from './WebViewModal';
import { Colors, Radii, Shadows, Spacing, Typography } from '../src/styles/designSystem';

const { width } = Dimensions.get('window');

export interface HomeHeaderProps {
  userName?: string;
  onReportPress?: () => void;
  onExplorePress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Citizen',
  onReportPress,
  onExplorePress,
}) => {
  const { t } = useTranslation();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewTitle, setWebViewTitle] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const citizenTips = [
    {
      id: 1,
      tag: 'Urgent',
      title: t('home.emergencyReport') || 'Emergency Helpline',
      message: t('home.emergencyMessage') || 'For urgent civic or emergency assistance, call 112 instantly.',
      icon: 'alert-circle',
      color: '#DC2626',
      bgColor: '#FEF2F2',
      link: 'https://jh.erss.in/',
    },
    {
      id: 2,
      tag: 'Civic Roads',
      title: t('home.roadInfrastructure') || 'Roads & Potholes',
      message: t('home.roadMessage') || 'Report potholes, broken dividers, or unpaved road conditions.',
      icon: 'construct',
      color: '#FF6B35',
      bgColor: '#FFF7ED',
      link: 'https://jharkhand.mygov.in/en/group-issue/public-grievances-management-system',
    },
    {
      id: 3,
      tag: 'Sanitation',
      title: t('home.sanitationWaste') || 'Cleanliness & Waste',
      message: t('home.sanitationMessage') || 'Keep your ward clean by reporting overflowing waste bins.',
      icon: 'trash',
      color: '#059669',
      bgColor: '#ECFDF5',
      link: 'https://www.jharkhand.gov.in/drinking-water',
    },
    {
      id: 4,
      tag: 'Utilities',
      title: t('home.waterUtilities') || 'Water & Electricity',
      message: t('home.waterMessage') || 'Report water contamination, leaks, or prolonged power cuts.',
      icon: 'water',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      link: 'https://www.jharkhand.gov.in/drinking-water',
    },
    {
      id: 5,
      tag: 'Public Safety',
      title: t('home.healthSafety') || 'Health & Safety',
      message: t('home.healthMessage') || 'Report non-functioning streetlights and safety concerns.',
      icon: 'shield-checkmark',
      color: '#7C3AED',
      bgColor: '#FAF5FF',
      link: 'https://jh.erss.in/',
    },
    {
      id: 6,
      tag: 'Transparency',
      title: t('home.trackReports') || 'Track In Real-Time',
      message: t('home.trackMessage') || 'Check live department updates and resolution milestones.',
      icon: 'analytics',
      color: '#EA580C',
      bgColor: '#FFF7ED',
      link: '/complaints/my',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -15,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentTipIndex((prev) => (prev === citizenTips.length - 1 ? 0 : prev + 1));
        translateAnim.setValue(15);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [fadeAnim, translateAnim]);

  const currentTip = citizenTips[currentTipIndex];

  const handleLinkPress = (link: string) => {
    if (link.startsWith('/')) {
      router.push(link as any);
    } else {
      setWebViewUrl(link);
      setWebViewTitle(currentTip.title);
      setWebViewVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Greeting Bar */}
      <View style={styles.topBar}>
        <View style={styles.userSection}>
          <View style={styles.avatarPill}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <View>
            <View style={styles.statusRow}>
              <Text style={styles.greetingSub}>{getGreeting()},</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                <Text style={styles.verifiedText}>Citizen</Text>
              </View>
            </View>
            <Text style={styles.userNameText}>{userName}</Text>
          </View>
        </View>

        <View style={styles.brandBadge}>
          <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
          <Text style={styles.brandBadgeText}>JanSetu</Text>
        </View>
      </View>

      {/* Citizen Advisory / Tips Card */}
      <View style={styles.carouselContainer}>
        <Animated.View
          style={[
            styles.advisoryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateX: translateAnim }],
            },
          ]}
        >
          <View style={styles.advisoryHeader}>
            <View style={[styles.tagBadge, { backgroundColor: currentTip.bgColor }]}>
              <Ionicons name={currentTip.icon as any} size={13} color={currentTip.color} />
              <Text style={[styles.tagText, { color: currentTip.color }]}>{currentTip.tag}</Text>
            </View>

            {/* Carousel Dots */}
            <View style={styles.dotsRow}>
              {citizenTips.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentTipIndex && {
                      width: 14,
                      backgroundColor: currentTip.color,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.advisoryTitle}>{currentTip.title}</Text>
          <Text style={styles.advisoryDesc} numberOfLines={2}>
            {currentTip.message}
          </Text>

          <TouchableOpacity
            style={styles.learnMoreRow}
            activeOpacity={0.7}
            onPress={() => handleLinkPress(currentTip.link)}
          >
            <Text style={[styles.learnMoreText, { color: currentTip.color }]}>
              {t('home.learnMore') || 'Learn more'}
            </Text>
            <AntDesign name="arrow-right" size={13} color={currentTip.color} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Quick Action Tiles */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardPrimary]}
          activeOpacity={0.88}
          onPress={onReportPress || (() => router.push('/(tabs)/Post' as any))}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="add-circle" size={22} color={Colors.primary} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionTitle} numberOfLines={1}>
              {t('home.quickReport') || 'Report'}
            </Text>
            <Text style={styles.actionSubtitle} numberOfLines={1}>
              New Issue
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.88}
          onPress={onExplorePress || (() => router.push('/complaints/nearby' as any))}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="location" size={22} color="#0284C7" />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionTitle} numberOfLines={1}>
              {t('home.nearbyIssues') || 'Nearby'}
            </Text>
            <Text style={styles.actionSubtitle} numberOfLines={1}>
              Ward Feed
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.88}
          onPress={() => router.push('/complaints/my' as any)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="time" size={22} color={Colors.successDark} />
          </View>
          <View style={styles.actionTextBox}>
            <Text style={styles.actionTitle} numberOfLines={1}>
              {t('home.myReports') || 'Track'}
            </Text>
            <Text style={styles.actionSubtitle} numberOfLines={1}>
              My Status
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* WebView Modal */}
      <WebViewModal
        visible={webViewVisible}
        url={webViewUrl}
        title={webViewTitle}
        onClose={() => setWebViewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: Radii.large,
    borderBottomRightRadius: Radii.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.successMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radii.pill,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.successDark,
  },
  userNameText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.text,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  brandBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  carouselContainer: {
    marginBottom: Spacing.md,
  },
  advisoryCard: {
    backgroundColor: '#FAFBFD',
    borderRadius: Radii.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.soft,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  advisoryTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  advisoryDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    ...Shadows.soft,
  },
  actionCardPrimary: {
    backgroundColor: '#FFFBF8',
    borderColor: '#FED7AA',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextBox: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
});

export default HomeHeader;
