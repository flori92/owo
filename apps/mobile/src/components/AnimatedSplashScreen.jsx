import { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as SplashScreen from 'expo-splash-screen';

// Garde le splash screen natif visible pendant le chargement
SplashScreen.preventAutoHideAsync();

// Source vidéo
const splashVideo = require('../../assets/images/splash.mp4');

export default function AnimatedSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasFinished = useRef(false);

  // Créer le player vidéo avec expo-video
  const player = useVideoPlayer(splashVideo, (player) => {
    player.loop = false;
    player.play();
  });

  const triggerFinish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onFinish?.();
    });
  }, [fadeAnim, onFinish]);

  useEffect(() => {
    // Cache le splash screen natif après un court délai
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Écouter la fin de la vidéo
  useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('playingChange', (isPlaying) => {
      if (!isPlaying && player.currentTime > 0) {
        triggerFinish();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [player, triggerFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
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
