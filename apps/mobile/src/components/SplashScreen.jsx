import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Video, ResizeMode } from "expo-av";
import { useTheme } from "@/utils/useTheme";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onAnimationComplete }) {
  const theme = useTheme();
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Durée maximale du splash (2.5 secondes)
  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerFadeOut();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const triggerFadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete?.();
    });
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      triggerFadeOut();
    }
  };

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
      <Video
        ref={videoRef}
        source={require('../../assets/images/splash.mp4')}
        style={{ 
          width: width * 0.7,  // 70% de la largeur
          height: height * 0.5, // 50% de la hauteur
        }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </Animated.View>
  );
}
