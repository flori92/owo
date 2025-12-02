import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@/utils/useTheme';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

export function SocialAuthButton({
  provider,
  onPress,
  disabled = false,
  loading = false,
}) {
  const theme = useTheme();

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          iconComponent: <GoogleIcon size={20} />,
          label: 'Google',
          color: '#4285F4',
        };
      case 'apple':
        return {
          iconComponent: <AppleIcon size={20} />,
          label: 'Apple',
          color: '#000000',
        };
      case 'facebook':
        return {
          icon: '📘',
          label: 'Facebook',
          color: '#1877F2',
        };
      default:
        return {
          icon: '🔐',
          label: provider,
          color: theme.colors.primary,
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.elevated,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: disabled || loading ? 0.6 : 1,
      }}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={theme.colors.textSecondary}
          style={{ marginRight: 8 }}
        />
      ) : (
        config.iconComponent || (
          <Text style={{ fontSize: 20, marginRight: 8 }}>
            {config.icon}
          </Text>
        )
      )}
      
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          color: theme.colors.text,
        }}
      >
        {loading ? 'Connexion...' : config.label}
      </Text>
    </TouchableOpacity>
  );
}

export function SocialAuthDivider() {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 14,
          color: theme.colors.textSecondary,
          marginHorizontal: 16,
        }}
      >
        Ou continuer avec
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
    </View>
  );
}

export default SocialAuthButton;
