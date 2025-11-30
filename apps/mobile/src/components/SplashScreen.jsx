import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/utils/useTheme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function SplashScreen({ onAnimationComplete }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Animations pour "La Connexion Instantanée"
  const leftCircleAnim = useRef(new Animated.Value(0)).current;
  const rightCircleAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const exclamationAnim = useRef(new Animated.Value(-50)).current;
  const sparkAnim = useRef(new Animated.Value(0)).current;
  const finalGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // === SCÉNARIO "LA CONNEXION INSTANTANÉE" ===
    const sequence = Animated.sequence([
      // Étape 1 : L'Impulsion (0.3s)
      // Deux cercles dorés apparaissent en pulsant
      Animated.parallel([
        Animated.spring(leftCircleAnim, {
          toValue: 1,
          delay: 300,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightCircleAnim, {
          toValue: 1,
          delay: 400,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // Étape 2 : Le Tissage (0.8s)
      // La ligne fluide du "W" se dessine entre les cercles
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // Étape 3 : Le Spark (1.2s)
      // Le point d'exclamation arrive comme un éclair
      Animated.parallel([
        Animated.spring(exclamationAnim, {
          toValue: 0,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
        // Explosion d'étincelles dorées
        Animated.sequence([
          Animated.timing(sparkAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(sparkAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // État Final : Éclat intense
      Animated.sequence([
        Animated.timing(finalGlowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(finalGlowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(() => {
      // Animation terminée après 2 secondes
      setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 100);
    });
  }, []);

  // Interpolations pour les animations
  const leftCircleScale = leftCircleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rightCircleScale = rightCircleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const waveWidth = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120], // Largeur du "W"
  });

  const sparkScale = sparkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const sparkOpacity = sparkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const finalGlowOpacity = finalGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.primary, // Fond Turquoise Owo!
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" backgroundColor={theme.colors.primary} />

      {/* Container du logo Owo! */}
      <View
        style={{
          width: 200,
          height: 80,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Le "O" de gauche */}
        <Animated.View
          style={{
            position: "absolute",
            left: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.gold, // Or Owo!
            transform: [{ scale: leftCircleScale }],
            shadowColor: theme.colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10,
          }}
        />

        {/* Le "W" - Lien fluide tissé */}
        <Animated.View
          style={{
            position: "absolute",
            left: 40,
            top: 15,
            width: waveWidth,
            height: 50,
          }}
        >
          {/* Onde supérieure du W */}
          <Animated.View
            style={{
              position: "absolute",
              top: 5,
              left: 0,
              width: waveWidth,
              height: 3,
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              transform: [
                {
                  rotate: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "25deg"],
                  }),
                },
              ],
            }}
          />

          {/* Onde centrale du W */}
          <Animated.View
            style={{
              position: "absolute",
              top: 20,
              left: 10,
              width: waveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100],
              }),
              height: 4,
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
            }}
          />

          {/* Onde inférieure du W */}
          <Animated.View
            style={{
              position: "absolute",
              top: 35,
              left: 0,
              width: waveWidth,
              height: 3,
              backgroundColor: "#FFFFFF",
              borderRadius: 2,
              transform: [
                {
                  rotate: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "-25deg"],
                  }),
                },
              ],
            }}
          />
        </Animated.View>

        {/* Le "O" de droite */}
        <Animated.View
          style={{
            position: "absolute",
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.gold, // Or Owo!
            transform: [{ scale: rightCircleScale }],
            shadowColor: theme.colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 10,
          }}
        />

        {/* Le point d'exclamation "!" */}
        <Animated.View
          style={{
            position: "absolute",
            right: -5,
            transform: [{ translateY: exclamationAnim }],
          }}
        >
          {/* Barre du ! qui s'élargit vers le haut */}
          <View
            style={{
              width: 6,
              height: 35,
              backgroundColor: "#FFFFFF",
              borderTopWidth: 3,
              borderTopColor: "#FFFFFF",
              borderRadius: 3,
            }}
          />

          {/* Point du ! - Étincelle dorée */}
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.gold,
              marginTop: 5,
              alignSelf: "center",
              transform: [{ scale: sparkScale }],
              opacity: sparkOpacity,
              shadowColor: theme.colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 8,
              elevation: 10,
            }}
          />
        </Animated.View>

        {/* Explosion d'étincelles autour du point */}
        <Animated.View
          style={{
            position: "absolute",
            right: -5,
            top: 45,
            width: 30,
            height: 30,
            transform: [{ scale: sparkScale }],
            opacity: sparkOpacity,
          }}
        >
          {/* Étincelles multiples */}
          {[0, 1, 2, 3, 4].map((index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.colors.gold,
                top: 15 + Math.cos(index * 1.26) * 12,
                left: 15 + Math.sin(index * 1.26) * 12,
              }}
            />
          ))}
        </Animated.View>

        {/* Éclat final de gloire */}
        <Animated.View
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: theme.colors.splashGlow,
            opacity: finalGlowOpacity,
            transform: [{ scale: finalGlowAnim }],
          }}
        />
      </View>

      {/* Texte "owo!" en bas du logo */}
      <View
        style={{
          marginTop: 40,
          alignItems: "center",
        }}
      >
        <Animated.Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: 1.5,
            transform: [
              {
                scale: finalGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
            opacity: finalGlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          }}
        >
          owo!
        </Animated.Text>

        <Animated.Text
          style={{
            fontSize: 14,
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: 8,
            opacity: finalGlowAnim,
          }}
        >
          Votre passerelle financière
        </Animated.Text>
      </View>
    </View>
  );
}
