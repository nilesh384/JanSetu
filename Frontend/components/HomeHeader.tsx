import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface HomeHeaderProps{
  userName?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ userName = "नागरिक" }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const citizenTips = [
    {
      id: 1,
      title: "🚨 Emergency Report",
      message: "Report critical issues like accidents, fires, or medical emergencies immediately",
      icon: "alert-circle",
      color: "#DC2626",
      action: "emergency"
    },
    {
      id: 2,
      title: "🛣️ Road & Infrastructure",
      message: "Report potholes, broken streetlights, damaged roads, and infrastructure issues",
      icon: "construct",
      color: "#FF6B35",
      action: "infrastructure"
    },
    {
      id: 3,
      title: "🗑️ Sanitation & Waste",
      message: "Report overflowing garbage bins, illegal dumping, and sanitation problems",
      icon: "trash",
      color: "#059669",
      action: "sanitation"
    },
    {
      id: 4,
      title: "💧 Water & Utilities",
      message: "Report water supply issues, pipe leaks, and utility service problems",
      icon: "water",
      color: "#2563EB",
      action: "utilities"
    },
    {
      id: 5,
      title: "🏥 Health & Safety",
      message: "Report health hazards, unsafe conditions, and public safety concerns",
      icon: "medical",
      color: "#7C3AED",
      action: "health"
    },
    {
      id: 6,
      title: "📊 Track Your Reports",
      message: "Monitor the status of your submitted reports and get resolution updates",
      icon: "analytics",
      color: "#EA580C",
      action: "track"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Start the slide and fade animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Update the tip index
        setCurrentTipIndex((prevIndex) =>
          prevIndex === citizenTips.length - 1 ? 0 : prevIndex + 1
        );

        // Reset position and fade back in
        translateAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [fadeAnim, translateAnim]);

  const currentTip = citizenTips[currentTipIndex];

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <View style={styles.gradientBackground}>
        <View style={styles.patternOverlay} />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingContainer}>
              <View style={styles.greetingIcon}>
                <AntDesign name="user" size={24} color="#FF6B35" />
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.greetingLabel}>Welcome to</Text>
                <Text style={styles.userName}>Jharkhand Civic Hub</Text>
              </View>
            </View>
          </View>

          {/* Animated Tips Carousel */}
          <View style={styles.tipsContainer}>
            <Animated.View
              style={[
                styles.tipCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateX: translateAnim
                  }]
                }
              ]}
            >
              <View style={styles.tipHeader}>
                <Text style={styles.tipEmoji}>{currentTip.title.split(' ')[0]}</Text>
                <Text style={styles.tipTitle}>
                  {currentTip.title.substring(currentTip.title.indexOf(' ') + 1)}
                </Text>
              </View>

              <Text style={styles.tipMessage}>{currentTip.message}</Text>

              <View style={styles.tipFooter}>
                <View style={styles.progressContainer}>
                  {citizenTips.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.progressDot,
                        {
                          backgroundColor: index === currentTipIndex
                            ? currentTip.color
                            : '#E5E7EB'
                        }
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <AntDesign name="arrowright" size={14} color={currentTip.color} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => {router.push('/Post' as any)}}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="flag" size={20} color="#DC2626" />
              </View>
              <Text style={styles.quickActionText}>Quick Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => {router.push('/complaints/nearby' as any)}}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="location" size={20} color="#2563EB" />
              </View>
              <Text style={styles.quickActionText}>Nearby Issues</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/complaints/my' as any)}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="stats-chart" size={20} color="#059669" />
              </View>
              <Text style={styles.quickActionText}>My Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradientBackground: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 25,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 153, 51, 0.05)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FF9933',
  },
  greetingText: {
    flex: 1,
  },
  greetingLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 120,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tipMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 15,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  quickActionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});

export default HomeHeader;