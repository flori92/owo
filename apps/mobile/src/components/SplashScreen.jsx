import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Dimensions, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTheme } from "@/utils/useTheme";

const { width, height } = Dimensions.get("window");

// Source vidéo
const splashVideo = require('../../assets/images/splash.mp4');

export default function SplashScreen({ onAnimationComplete }) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasTriggeredFadeOut = useRef(false);

  // Créer le player vidéo avec expo-video
  const player = useVideoPlayer(splashVideo, (player) => {
    player.loop = false;
    player.play();
  });

  const triggerFadeOut = useCallback(() => {
    if (hasTriggeredFadeOut.current) return;
    hasTriggeredFadeOut.current = true;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete?.();
    });
  }, [fadeAnim, onAnimationComplete]);

  // Durée maximale du splash (3 secondes)
  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerFadeOut();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [triggerFadeOut]);

  // Écouter la fin de la vidéo
  useEffect(() => {
    if (!player) return;
    
    const subscription = player.addListener('playingChange', (isPlaying) => {
      // Si la vidéo s'arrête et qu'on n'a pas encore déclenché le fade out
      if (!isPlaying && player.currentTime > 0) {
        triggerFadeOut();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [player, triggerFadeOut]);

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        opacity: fadeAnim,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <VideoView
        player={player}
        style={{ 
          width: width * 0.85,
          height: height * 0.6,
        }}
        contentFit="contain"
        nativeControls={false}
      />
    </Animated.View>
  );
}
