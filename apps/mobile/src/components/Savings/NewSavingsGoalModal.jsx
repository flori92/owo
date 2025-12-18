import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { useNeon } from '../../hooks/useNeon';
import { useTheme } from '../../utils/useTheme';
import { X, Target, Calendar } from 'lucide-react-native';

export default function NewSavingsGoalModal({ visible, onClose, userId, onSuccess }) {
  const { createSavingsGoal, loading } = useNeon();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_amount || !formData.deadline) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const targetAmount = parseFloat(formData.target_amount);
    const currentAmount = parseFloat(formData.current_amount) || 0;

    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant cible valide');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      Alert.alert('Erreur', 'Veuillez choisir une date future');
      return;
    }

    const result = await createSavingsGoal({
      user_id: userId,
      title: formData.title,
      target_amount: targetAmount,
      current_amount: currentAmount,
      deadline: deadlineDate.toISOString(),
      created_at: new Date().toISOString()
    });

    if (result.success) {
      Alert.alert('Succès', 'Objectif d\'épargne créé avec succès');
      onSuccess();
      setFormData({
        title: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
      });
      onClose();
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de créer l\'objectif d\'épargne');
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
            Nouvel objectif d'épargne
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Titre de l'objectif
            </Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Ex: Voyage à Paris, Nouvelle voiture..."
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>

          {/* Target Amount */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Target size={16} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                Montant cible (FCFA)
              </Text>
            </View>
            <TextInput
              value={formData.target_amount}
              onChangeText={(text) => setFormData({ ...formData, target_amount: text })}
              keyboardType="numeric"
              placeholder="100000"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 20,
                fontWeight: '700',
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>

          {/* Current Amount */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Montant actuel (FCFA) - Optionnel
            </Text>
            <TextInput
              value={formData.current_amount}
              onChangeText={(text) => setFormData({ ...formData, current_amount: text })}
              keyboardType="numeric"
              placeholder="0"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
          </View>

          {/* Deadline */}
          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Calendar size={16} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
                Date limite
              </Text>
            </View>
            <TextInput
              value={formData.deadline}
              onChangeText={(text) => setFormData({ ...formData, deadline: text })}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              style={{
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                fontSize: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              Format: AAAA-MM-JJ (minimum: {getMinDate()})
            </Text>
          </View>

          {/* Summary */}
          {formData.target_amount && formData.deadline && (
            <View style={{
              backgroundColor: theme.colors.card,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
              marginBottom: 20,
            }}>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Résumé de l'objectif
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                Objectif: {formData.title || 'Non défini'}
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                Cible: {parseInt(formData.target_amount || 0).toLocaleString()} FCFA
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                Déjà épargné: {parseInt(formData.current_amount || 0).toLocaleString()} FCFA
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                Reste à épargner: {(parseInt(formData.target_amount || 0) - parseInt(formData.current_amount || 0)).toLocaleString()} FCFA
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>
                Date limite: {formData.deadline}
              </Text>
            </View>
          )}
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
              {loading ? 'Création en cours...' : 'Créer l\'objectif'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
