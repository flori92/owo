/**
 * Mock du SDK Appwrite pour le développement local
 * Remplace le package 'appwrite' pour éviter les crashes sur mobile
 */

// Classes mock qui ne font rien mais ne crashent pas
class Client {
  setEndpoint() { return this; }
  setProject() { return this; }
  setSelfSigned() { return this; }
}

class Account {
  constructor(client) {}
  async get() { throw new Error('Mock: User not logged in'); }
  async create() { return { $id: 'mock_user' }; }
  async createEmailPasswordSession() { return { $id: 'mock_session' }; }
  async deleteSession() { return true; }
  async createOAuth2Session() { return { $id: 'mock_oauth_session' }; }
  async createPhoneToken() { return { userId: 'mock_user', $id: 'mock_token' }; }
  async createSession() { return { $id: 'mock_session' }; }
}

class Databases {
  constructor(client) {}
  async listDocuments() { return { documents: [] }; }
  async getDocument() { return {}; }
  async createDocument() { return { $id: 'mock_doc' }; }
  async updateDocument() { return { $id: 'mock_doc' }; }
  async deleteDocument() { return true; }
}

class Storage {
  constructor(client) {}
  async listFiles() { return { files: [] }; }
  async getFile() { return {}; }
  async createFile() { return { $id: 'mock_file' }; }
  async deleteFile() { return true; }
  getFilePreview() { return 'https://placeholder.com/image.png'; }
  getFileView() { return 'https://placeholder.com/image.png'; }
}

class Functions {
  constructor(client) {}
  async createExecution() { return { $id: 'mock_execution' }; }
}

// Query mock
const Query = {
  equal: (attr, value) => `${attr}=${value}`,
  notEqual: (attr, value) => `${attr}!=${value}`,
  lessThan: (attr, value) => `${attr}<${value}`,
  lessThanEqual: (attr, value) => `${attr}<=${value}`,
  greaterThan: (attr, value) => `${attr}>${value}`,
  greaterThanEqual: (attr, value) => `${attr}>=${value}`,
  search: (attr, value) => `search:${attr}=${value}`,
  orderDesc: (attr) => `orderDesc:${attr}`,
  orderAsc: (attr) => `orderAsc:${attr}`,
  limit: (value) => `limit:${value}`,
  offset: (value) => `offset:${value}`,
  cursorAfter: (value) => `cursorAfter:${value}`,
  cursorBefore: (value) => `cursorBefore:${value}`,
};

// ID helper mock
const ID = {
  unique: () => 'unique_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  custom: (id) => id,
};

// Permission mock
const Permission = {
  read: (role) => `read:${role}`,
  write: (role) => `write:${role}`,
  create: (role) => `create:${role}`,
  update: (role) => `update:${role}`,
  delete: (role) => `delete:${role}`,
};

// Role mock
const Role = {
  any: () => 'any',
  guests: () => 'guests',
  users: () => 'users',
  user: (id) => `user:${id}`,
  team: (id) => `team:${id}`,
};

console.log('📦 Appwrite Mock chargé - Mode développement');

module.exports = {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  Query,
  ID,
  Permission,
  Role,
};
