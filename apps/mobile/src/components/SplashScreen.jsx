import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "@/utils/useTheme";

export default function SplashScreen({ onAnimationComplete }) {
  const theme = useTheme();
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Fade out après la fin de la vidéo
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <Video
        ref={videoRef}
        source={require('../assets/images/splash.mp4')}
        style={{ flex: 1 }}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </Animated.View>
  );
}
