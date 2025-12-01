import React from 'react';
import { Image, View, Text } from 'react-native';

export function OwoLogo({ size = 80 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          fontWeight: 'bold',
          color: '#FFFFFF',
          letterSpacing: 2,
        }}
      >
        owo!
      </Text>
    </View>
  );
}

export function OwoLogoWithText({ size = 80, textColor = '#FF6B35' }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <OwoLogo size={size} />
    </View>
  );
}

export default OwoLogo;
