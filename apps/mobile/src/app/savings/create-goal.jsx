import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Laptop,
  Plane,
  Shield,
  Car,
  Home,
  GraduationCap,
  Heart,
  ShoppingBag,
  Zap,
  Lock,
  Calendar,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/utils/useTheme';
import { useRequireAuth } from '@/utils/auth/useAuth';
import { useFirebaseAuth, useWallets } from '@/hooks/useFirebase';
import { createSavingsGoal } from '@/hooks/useSavingsGoals';
import ScreenContainer from '@/components/ScreenContainer';
import LoadingScreen from '@/components/LoadingScreen';

const CATEGORIES = [
  { id: 'tech', name: 'Technologie', icon: 'Laptop', color: '#3B82F6' },
  { id: 'travel', name: 'Voyage', icon: 'Plane', color: '#10B981' },
  { id: 'emergency', name: 'Urgence', icon: 'Shield', color: '#EF4444' },
  { id: 'vehicle', name: 'Véhicule', icon: 'Car', color: '#F59E0B' },
  { id: 'home', name: 'Maison', icon: 'Home', color: '#8B5CF6' },
  { id: 'education', name: 'Éducation', icon: 'GraduationCap', color: '#06B6D4' },
  { id: 'health', name: 'Santé', icon: 'Heart', color: '#EC4899' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#F97316' },
];

const FREQUENCIES = [
  { id: 'daily', name: 'Quotidien' },
  { id: 'weekly', name: 'Hebdomadaire' },
  { id: 'monthly', name: 'Mensuel' },
];

export default function CreateGoalScreen() {
  // Require authentication
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useFirebaseAuth();
  const { wallets, loading: walletsLoading } = useWallets(user?.uid);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)); // 1 an par défaut
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [autoDebit, setAutoDebit] = useState(false);
  const [autoDebitAmount, setAutoDebitAmount] = useState('');
  const [frequency, setFrequency] = useState(FREQUENCIES[2]); // Monthly par défaut
  const [autoDebitDay, setAutoDebitDay] = useState('1');
  const [locked, setLocked] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sélectionner le wallet principal par défaut
  React.useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      const primaryWallet = wallets.find((w) => w.isPrimary) || wallets[0];
      setSelectedWallet(primaryWallet);
    }
  }, [wallets]);

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom pour l\'objectif');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant cible valide');
      return;
    }

    if (autoDebit && (!autoDebitAmount || parseFloat(autoDebitAmount) <= 0)) {
      Alert.alert('Erreur', 'Veuillez saisir un montant de prélèvement automatique valide');
      return;
    }

    if (!selectedWallet) {
      Alert.alert('Erreur', 'Veuillez sélectionner un wallet source');
      return;
    }

    setLoading(true);

    const goalData = {
      userId: user.uid,
      name: name.trim(),
      description: description.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      currency: 'EUR',
      category: selectedCategory.id,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      startDate: new Date().toISOString(),
      targetDate: targetDate.toISOString(),
      frequency: frequency.id,
      autoDebit,
      autoDebitAmount: autoDebit ? parseFloat(autoDebitAmount) : 0,
      autoDebitDay: autoDebit ? parseInt(autoDebitDay) : 0,
      walletId: selectedWallet.id,
      locked,
      status: 'active',
      priority: 1,
    };

    const result = await createSavingsGoal(goalData);

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Objectif créé !',
        `Votre objectif "${name}" a été créé avec succès.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'objectif.');
    }
  };

  if (walletsLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScreenContainer>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: theme.colors.cardBackground,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={theme.colors.text} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 28,
                color: theme.colors.text,
              }}
            >
              Nouvel Objectif
            </Text>
          </View>

          {/* Section: Informations de base */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Informations de base
            </Text>

            {/* Nom */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Nom de l'objectif *
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholder="Ex: Nouveau MacBook Pro"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Description (optionnel)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  height: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Décrivez votre objectif..."
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Montant cible */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Montant cible *
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.cardBackground,
                    borderRadius: 12,
                    padding: 16,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 20,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="decimal-pad"
                />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.textSecondary,
                    marginLeft: 12,
                  }}
                >
                  EUR
                </Text>
              </View>
            </View>

            {/* Date cible */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Date cible
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.cardBackground,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 16,
                    color: theme.colors.text,
                  }}
                >
                  {targetDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Calendar size={20} color={theme.colors.textSecondary} strokeWidth={1.5} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={targetDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setTargetDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Section: Catégorie */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Catégorie
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon === 'Laptop' ? Laptop :
                  category.icon === 'Plane' ? Plane :
                  category.icon === 'Shield' ? Shield :
                  category.icon === 'Car' ? Car :
                  category.icon === 'Home' ? Home :
                  category.icon === 'GraduationCap' ? GraduationCap :
                  category.icon === 'Heart' ? Heart :
                  ShoppingBag;

                const isSelected = selectedCategory.id === category.id;

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? category.color + '20'
                        : theme.colors.cardBackground,
                      borderWidth: 2,
                      borderColor: isSelected ? category.color : theme.colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <IconComponent
                      size={20}
                      color={isSelected ? category.color : theme.colors.textSecondary}
                      strokeWidth={1.5}
                    />
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: isSelected ? category.color : theme.colors.textSecondary,
                        marginLeft: 8,
                      }}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Prélèvement automatique */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 4,
                  }}
                >
                  Prélèvement automatique
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Épargner automatiquement selon une fréquence
                </Text>
              </View>
              <Switch
                value={autoDebit}
                onValueChange={setAutoDebit}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {autoDebit && (
              <View>
                {/* Fréquence */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Fréquence
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {FREQUENCIES.map((freq) => (
                      <TouchableOpacity
                        key={freq.id}
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          backgroundColor:
                            frequency.id === freq.id
                              ? theme.colors.primary
                              : theme.colors.cardBackground,
                          borderWidth: 1,
                          borderColor:
                            frequency.id === freq.id
                              ? theme.colors.primary
                              : theme.colors.border,
                          alignItems: 'center',
                        }}
                        onPress={() => setFrequency(freq)}
                      >
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 14,
                            color:
                              frequency.id === freq.id
                                ? '#FFFFFF'
                                : theme.colors.textSecondary,
                          }}
                        >
                          {freq.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Montant */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginBottom: 8,
                    }}
                  >
                    Montant du prélèvement
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.cardBackground,
                        borderRadius: 12,
                        padding: 16,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 18,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={autoDebitAmount}
                      onChangeText={setAutoDebitAmount}
                      keyboardType="decimal-pad"
                    />
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: theme.colors.textSecondary,
                        marginLeft: 12,
                      }}
                    >
                      EUR
                    </Text>
                  </View>
                </View>

                {/* Jour du prélèvement */}
                {frequency.id === 'monthly' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                        marginBottom: 8,
                      }}
                    >
                      Jour du mois (1-28)
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.cardBackground,
                        borderRadius: 12,
                        padding: 16,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                      placeholder="1"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={autoDebitDay}
                      onChangeText={setAutoDebitDay}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Section: Options */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Options
            </Text>

            {/* Épargne verrouillée */}
            <View
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: theme.colors.warning + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Lock size={20} color={theme.colors.warning} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: theme.colors.text,
                      marginBottom: 2,
                    }}
                  >
                    Épargne verrouillée
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    L'argent ne peut pas être retiré avant l'objectif
                  </Text>
                </View>
              </View>
              <Switch
                value={locked}
                onValueChange={setLocked}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Wallet source */}
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                Compte source
              </Text>
              <View style={{ gap: 8 }}>
                {wallets.map((wallet) => (
                  <TouchableOpacity
                    key={wallet.id}
                    style={{
                      backgroundColor:
                        selectedWallet?.id === wallet.id
                          ? theme.colors.primary + '20'
                          : theme.colors.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedWallet?.id === wallet.id
                          ? theme.colors.primary
                          : theme.colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => setSelectedWallet(wallet)}
                  >
                    <View>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 15,
                          color:
                            selectedWallet?.id === wallet.id
                              ? theme.colors.primary
                              : theme.colors.text,
                        }}
                      >
                        {wallet.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 13,
                          color: theme.colors.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {wallet.balance.toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        {wallet.currency}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Bouton de création */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              padding: 18,
              alignItems: 'center',
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Création en cours...
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Créer l'objectif
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
