/**
 * Utilitaire de validation des numéros de téléphone mobile money
 */

import { OPERATOR_PREFIXES, COUNTRY_CODES, PHONE_FORMATS } from './operators';

/**
 * Détecte le pays et l'opérateur à partir d'un numéro de téléphone
 * @param {string} phoneNumber - Numéro au format international (+229...)
 * @returns {object} - { country, operator, isValid }
 */
export function detectOperator(phoneNumber) {
  // Nettoyer le numéro
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Vérifier le format international
  if (!cleaned.startsWith('+')) {
    return { country: null, operator: null, isValid: false };
  }

  // Extraire l'indicatif pays (3 chiffres)
  const countryCode = cleaned.substring(1, 4);
  const country = COUNTRY_CODES[countryCode];

  if (!country) {
    return { country: null, operator: null, isValid: false };
  }

  // Extraire le numéro local
  const localNumber = cleaned.substring(4);

  // Vérifier la longueur
  const expectedLength = PHONE_FORMATS[country]?.length;
  if (localNumber.length !== expectedLength) {
    return { country, operator: null, isValid: false };
  }

  // Extraire le préfixe (2 premiers chiffres)
  const prefix = localNumber.substring(0, 2);

  // Rechercher l'opérateur
  const operators = OPERATOR_PREFIXES[country];
  if (!operators) {
    return { country, operator: null, isValid: false };
  }

  for (const [operatorCode, prefixes] of Object.entries(operators)) {
    if (prefixes.includes(prefix)) {
      return {
        country,
        operator: operatorCode,
        isValid: true,
        phoneNumber: cleaned
      };
    }
  }

  return { country, operator: null, isValid: false };
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param {string} phoneNumber - Numéro au format international
 * @returns {string} - Numéro formaté
 */
export function formatPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (!cleaned.startsWith('+')) {
    return phoneNumber;
  }

  const countryCode = cleaned.substring(1, 4);
  const country = COUNTRY_CODES[countryCode];

  if (!country) {
    return phoneNumber;
  }

  const localNumber = cleaned.substring(4);

  // Formatage selon le pays
  switch (country) {
    case 'BJ':
    case 'TG':
    case 'ML':
    case 'BF':
    case 'NE':
      // Format: XX XX XX XX
      return `+${countryCode} ${localNumber.substring(0, 2)} ${localNumber.substring(2, 4)} ${localNumber.substring(4, 6)} ${localNumber.substring(6, 8)}`;
    case 'CI':
      // Format: XX XX XX XX XX
      return `+${countryCode} ${localNumber.substring(0, 2)} ${localNumber.substring(2, 4)} ${localNumber.substring(4, 6)} ${localNumber.substring(6, 8)} ${localNumber.substring(8, 10)}`;
    case 'SN':
    case 'GN':
      // Format: XX XXX XX XX
      return `+${countryCode} ${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5, 7)} ${localNumber.substring(7, 9)}`;
    default:
      return phoneNumber;
  }
}

/**
 * Vérifie si deux numéros sont identiques
 * @param {string} phone1
 * @param {string} phone2
 * @returns {boolean}
 */
export function arePhoneNumbersEqual(phone1, phone2) {
  const cleaned1 = phone1.replace(/[\s-]/g, '');
  const cleaned2 = phone2.replace(/[\s-]/g, '');
  return cleaned1 === cleaned2;
}
