/**
 * Configuration des opérateurs mobile money en Afrique de l'Ouest
 */

export const OPERATORS = {
  MTN: {
    code: 'MTN',
    name: 'MTN Mobile Money',
    color: '#FFCC00',
    countries: ['BJ', 'TG', 'CI', 'GN', 'BF', 'NE']
  },
  ORANGE: {
    code: 'ORANGE',
    name: 'Orange Money',
    color: '#FF6600',
    countries: ['BJ', 'CI', 'SN', 'ML', 'BF', 'NE']
  },
  MOOV: {
    code: 'MOOV',
    name: 'Moov Money',
    color: '#0066CC',
    countries: ['BJ', 'TG', 'CI', 'BF', 'NE']
  },
  CELTIIS: {
    code: 'CELTIIS',
    name: 'Celtiis Cash',
    color: '#00AA00',
    countries: ['BJ']
  },
  TOGOCOM: {
    code: 'TOGOCOM',
    name: 'TOGOCOM Cash',
    color: '#CC0000',
    countries: ['TG']
  },
  FREE: {
    code: 'FREE',
    name: 'Free Money',
    color: '#666666',
    countries: ['SN']
  },
  WAVE: {
    code: 'WAVE',
    name: 'Wave',
    color: '#0099FF',
    countries: ['SN', 'CI', 'ML', 'BF']
  }
};

/**
 * Préfixes des numéros de téléphone par opérateur et pays
 */
export const OPERATOR_PREFIXES = {
  BJ: {
    MTN: ['96', '97', '61', '62', '63', '64', '65', '66', '67', '01'],
    MOOV: ['98', '99', '60', '68', '69', '01'],
    CELTIIS: ['95', '01'],
    ORANGE: ['01']
  },
  TG: {
    TOGOCOM: ['90', '91', '92', '93'],
    MOOV: ['96', '97', '98', '99', '70', '71', '72', '79']
  },
  CI: {
    MTN: ['05', '06', '45', '46', '47', '54', '55', '56', '57'],
    ORANGE: ['07', '08', '09', '48', '49', '67', '68', '69', '77', '78', '87', '88', '89'],
    MOOV: ['01', '02', '03', '40', '41', '42', '43', '50', '51', '52', '53']
  },
  SN: {
    ORANGE: ['77', '78'],
    FREE: ['76']
  },
  ML: {
    ORANGE: ['06', '07', '08', '09']
  },
  BF: {
    ORANGE: ['06', '07']
  },
  NE: {
    ORANGE: ['06', '07']
  },
  GN: {
    MTN: ['06', '07']
  }
};

/**
 * Codes pays par indicatif téléphonique
 */
export const COUNTRY_CODES = {
  '229': 'BJ', // Bénin
  '228': 'TG', // Togo
  '225': 'CI', // Côte d'Ivoire
  '221': 'SN', // Sénégal
  '223': 'ML', // Mali
  '226': 'BF', // Burkina Faso
  '227': 'NE', // Niger
  '224': 'GN'  // Guinée
};

/**
 * Noms des pays
 */
export const COUNTRY_NAMES = {
  BJ: 'Bénin',
  TG: 'Togo',
  CI: 'Côte d\'Ivoire',
  SN: 'Sénégal',
  ML: 'Mali',
  BF: 'Burkina Faso',
  NE: 'Niger',
  GN: 'Guinée'
};

/**
 * Formats de numéro par pays
 */
export const PHONE_FORMATS = {
  BJ: { length: 8, example: '96 12 34 56' },
  TG: { length: 8, example: '90 12 34 56' },
  CI: { length: 10, example: '07 12 34 56 78' },
  SN: { length: 9, example: '77 123 45 67' },
  ML: { length: 8, example: '06 12 34 56' },
  BF: { length: 8, example: '06 12 34 56' },
  NE: { length: 8, example: '06 12 34 56' },
  GN: { length: 9, example: '06 123 45 67' }
};
