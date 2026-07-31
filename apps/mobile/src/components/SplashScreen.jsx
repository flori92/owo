import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Image, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function SplashScreen({ onAnimationComplete }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasTriggeredFadeOut = useRef(false);

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

  // Splash rapide de 1.5 secondes
  useEffect(() => {
    const timeout = setTimeout(() => {
      triggerFadeOut();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [triggerFadeOut]);

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        opacity: fadeAnim,
        backgroundColor: "#20B2AA",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" backgroundColor="#20B2AA" />
      <View style={{
        width: 132,
        height: 132,
        borderRadius: 32,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
      }}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={{ width: 116, height: 116, borderRadius: 28 }}
          resizeMode="contain"
          accessibilityLabel="Logo owo!"
        />
      </View>
      <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.8)" }}>
        Votre finance, simplifiée
      </Text>
    </Animated.View>
  );
}
