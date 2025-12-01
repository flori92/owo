import React from 'react';
import { Image, View } from 'react-native';

export function OwoLogo({ size = 80 }) {
  return (
    <Image
      source={require('../../../assets/images/icon.png')}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2, // Légèrement arrondi
        resizeMode: 'contain',
      }}
    />
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
