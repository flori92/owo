import React from 'react';
import { Svg, Path, Circle, Ellipse } from 'react-native-svg';

export function OwoIcon({ size = 80, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Background circle */}
      <Circle cx="50" cy="50" r="45" fill="#FF6B35" />
      
      {/* "owo" text with custom font style */}
      <Path
        d="M25 35 Q25 25 35 25 Q45 25 45 35 L45 50 Q45 60 35 60 Q25 60 25 50 Z"
        fill={color}
      />
      <Circle cx="35" cy="40" r="3" fill="#FF6B35" />
      <Circle cx="35" cy="50" r="3" fill="#FF6B35" />
      
      {/* "o" - middle */}
      <Circle cx="50" cy="42.5" r="12.5" fill={color} />
      <Circle cx="50" cy="42.5" r="3" fill="#FF6B35" />
      
      {/* "wo" - right */}
      <Path
        d="M60 35 Q60 25 70 25 Q80 25 80 35 L80 50 Q80 60 70 60 Q60 60 60 50 Z"
        fill={color}
      />
      <Circle cx="70" cy="40" r="3" fill="#FF6B35" />
      <Circle cx="70" cy="50" r="3" fill="#FF6B35" />
      
      {/* Decorative elements */}
      <Circle cx="25" cy="70" r="2" fill={color} opacity="0.6" />
      <Circle cx="75" cy="70" r="2" fill={color} opacity="0.6" />
      <Circle cx="50" cy="75" r="2" fill={color} opacity="0.6" />
    </Svg>
  );
}

export function OwoTextIcon({ size = 32, color = '#FF6B35' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M10 14 Q10 10 14 10 Q18 10 18 14 L18 20 Q18 24 14 24 Q10 24 10 20 Z"
        fill={color}
      />
      <Circle cx="14" cy="16" r="1.5" fill="#FFFFFF" />
      <Circle cx="14" cy="20" r="1.5" fill="#FFFFFF" />
      
      <Circle cx="20" cy="17" r="5" fill={color} />
      <Circle cx="20" cy="17" r="1.5" fill="#FFFFFF" />
      
      <Path
        d="M24 14 Q24 10 28 10 Q32 10 32 14 L32 20 Q32 24 28 24 Q24 24 24 20 Z"
        fill={color}
      />
      <Circle cx="28" cy="16" r="1.5" fill="#FFFFFF" />
      <Circle cx="28" cy="20" r="1.5" fill="#FFFFFF" />
    </Svg>
  );
}
