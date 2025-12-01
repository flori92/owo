import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';

// Garde le splash screen natif visible pendant le chargement
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({ onFinish }) {
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Cache le splash screen natif après un court délai
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Fade out après la fin de la vidéo
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Video
        ref={videoRef}
        source={require('../../assets/images/splash.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17A2B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
