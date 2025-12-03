// ============================================
// VALIDATION SCHEMAS - owo!
// ============================================
import * as Yup from 'yup';

// Validation pour l'authentification
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .required('Le mot de passe est requis'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9])/,
      'Le mot de passe doit contenir des lettres et des chiffres'
    )
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
    .required('Veuillez confirmer le mot de passe'),
});

// Validation pour les transactions
export const transactionSchema = Yup.object().shape({
  amount: Yup.number()
    .positive('Le montant doit être positif')
    .required('Le montant est requis')
    .typeError('Le montant doit être un nombre'),
  title: Yup.string()
    .min(3, 'La description doit contenir au moins 3 caractères')
    .max(100, 'La description ne peut pas dépasser 100 caractères')
    .required('La description est requise'),
  walletId: Yup.string().required('Le portefeuille est requis'),
  recipientName: Yup.string().when('type', {
    is: 'send',
    then: (schema) => schema
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .required('Le nom du destinataire est requis'),
    otherwise: (schema) => schema.nullable(),
  }),
  recipientPhone: Yup.string().when('type', {
    is: 'send',
    then: (schema) => schema
      .matches(
        /^\+?[0-9]{8,15}$/,
        'Numéro de téléphone invalide (format: +22507XXXXXXXX)'
      )
      .required('Le téléphone du destinataire est requis'),
    otherwise: (schema) => schema.nullable(),
  }),
});

// Fonction utilitaire pour valider un formulaire
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      if (error.path) {
        errors[error.path] = error.message;
      }
    });
    return { valid: false, errors };
  }
};

// Fonction utilitaire pour valider un champ unique
export const validateField = async (schema, fieldName, value, formData = {}) => {
  try {
    await schema.validateAt(fieldName, { ...formData, [fieldName]: value });
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};
