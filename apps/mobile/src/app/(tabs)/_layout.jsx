import { Tabs } from "expo-router";
import {
  Home,
  BarChart3,
  CreditCard,
  Settings,
  PlusCircle,
  Repeat,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.colors.tabBarBorder,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="currency"
        options={{
          title: "Change",
          tabBarIcon: ({ color, size }) => (
            <Repeat color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          title: "Ajouter",
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="virtual-card"
        options={{
          title: "Carte",
          tabBarIcon: ({ color, size }) => (
            <Wallet color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={22} strokeWidth={1.5} />
          ),
        }}
      />
      {/* Hidden tabs for navigation */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hidden redirect tab
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="connect-bank"
        options={{
          href: null, // Hidden from tab bar, accessible via router.push()
        }}
      />
      <Tabs.Screen
        name="send-money"
        options={{
          href: null, // Hidden from tab bar, accessible via router.push()
        }}
      />
      <Tabs.Screen
        name="request-money"
        options={{
          href: null, // Hidden from tab bar, accessible via router.push()
        }}
      />
    </Tabs>
  );
}
