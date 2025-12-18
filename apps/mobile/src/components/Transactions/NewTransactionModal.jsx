import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { useNeon } from '../../hooks/useNeon';
import { useTheme } from '../../utils/useTheme';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

const CATEGORIES = [
  'Alimentation',
  'Transport',
  'Logement',
  'Santé',
  'Éducation',
  'Divertissement',
  'Shopping',
  'Épargne',
  'Autre'
];

export default function NewTransactionModal({ visible, onClose, userId, onSuccess }) {
  const { createTransaction, loading } = useNeon();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: CATEGORIES[0],
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    const result = await createTransaction({
      user_id: userId,
      type: formData.type === 'expense' ? 'debit' : 'credit',
      amount: amount,
      description: formData.description,
      category: formData.category,
      created_at: new Date().toISOString()
    });

    if (result.success) {
      Alert.alert('Succès', 'Transaction ajoutée avec succès');
      onSuccess();
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: CATEGORIES[0],
      });
      onClose();
    } else {
      Alert.alert('Erreur', result.error || 'Impossible d\'ajouter la transaction');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
            Nouvelle transaction
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Type Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              Type de transaction
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setFormData({ ...formData, type: 'expense' })}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: formData.type === 'expense' ? '#EF4444' : theme.colors.card,
                  borderWidth: 2,
                  borderColor: formData.type === 'expense' ? '#EF4444' : theme.colors.border,
                }}
              >
                <ArrowUpRight size={20} color={formData.type === 'expense' ? '#FFFFFF' : theme.colors.text} />
                <Text style={{
                  color: formData.type === 'expense' ? '#FFFFFF' : theme.colors.text,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8
                }}>
                  Dépense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFormData({ ...formData, type: 'income' })}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: formData.type === 'income' ? '#10B981' : theme.colors.card,
                  borderWidth: 2,
                  borderColor: formData.type === 'income' ? '#10B981' : theme.colors.border,
                }}
              >
                <ArrowDownRight size={20} color={formData.type === 'income' ? '#FFFFFF' : theme.colors.text} />
                <Text style={{
                  color: formData.type === 'income' ? '#FFFFFF' : theme.colors.text,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8
                }}>
                  Revenu
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Montant (FCFA)
            </Text>
            <TextInput
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
              placeholder="0"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 24,
                fontWeight: '700',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Description
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description de la transaction"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              multiline
            />
          </View>

          {/* Category */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Catégorie
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData({ ...formData, category })}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: formData.category === category 
                        ? theme.colors.primary 
                        : theme.colors.card,
                      borderWidth: 1,
                      borderColor: formData.category === category 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }}
                  >
                    <Text style={{
                      color: formData.category === category 
                        ? '#FFFFFF' 
                        : theme.colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                    }}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? theme.colors.border : theme.colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: loading ? theme.colors.textSecondary : '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}>
              {loading ? 'Ajout en cours...' : 'Ajouter la transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
