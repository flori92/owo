import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { useAuth } from '@/hooks/useFirebase';

export function UserMenu({ displayName }) {
  const theme = useTheme();
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: Settings,
      label: 'Paramètres',
      onPress: () => {
        setShowMenu(false);
        // TODO: Navigate to settings
      },
    },
    {
      icon: HelpCircle,
      label: 'Aide',
      onPress: () => {
        setShowMenu(false);
        // TODO: Navigate to help
      },
    },
    {
      icon: LogOut,
      label: 'Déconnexion',
      onPress: handleLogout,
      color: theme.colors.error,
    },
  ];

  return (
    <View style={{ position: 'relative' }}>
      {/* Menu Trigger */}
      <TouchableOpacity
        onPress={() => setShowMenu(!showMenu)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.elevated,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <User size={20} color={theme.colors.text} />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
          }}
        >
          {displayName}
        </Text>
        <ChevronDown
          size={16}
          color={theme.colors.textSecondary}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      {/* Menu Modal */}
      {showMenu && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            zIndex: 1000,
            minWidth: 180,
          }}
        >
          {/* Close overlay */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -8,
              left: -200,
              right: -8,
              bottom: -8,
              zIndex: 999,
            }}
            onPress={() => setShowMenu(false)}
          />

          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <IconComponent
                  size={18}
                  color={item.color || theme.colors.text}
                />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 14,
                    color: item.color || theme.colors.text,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default UserMenu;
