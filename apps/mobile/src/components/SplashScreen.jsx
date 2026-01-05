import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Text, View } from "react-native";
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
        backgroundColor: "#6C5CE7",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" backgroundColor="#6C5CE7" />
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
      }}>
        <Text style={{ fontSize: 36, fontWeight: "bold", color: "#fff" }}>
          owo!
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.8)" }}>
        Votre finance, simplifiée
      </Text>
    </Animated.View>
  );
}
