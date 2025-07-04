const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Create a test database in memory
const testDb = new sqlite3.Database(':memory:');

// Initialize test database with schema
const initTestDb = () => {
  return new Promise((resolve, reject) => {
    testDb.serialize(async () => {
      // Create users table
      testDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create cards table
      testDb.run(`
        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          subtitle TEXT,
          description TEXT,
          image_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert test user with hashed password
      const hashedPassword = await bcrypt.hash('testpass', 10);
      testDb.run(`
        INSERT INTO users (username, password_hash) 
        VALUES ('testuser', ?)
      `, [hashedPassword]);

      // Insert test cards
      testDb.run(`
        INSERT INTO cards (title, subtitle, description, image_path) 
        VALUES 
          ('Test Card 1', 'First subtitle', 'First test card', 'test1.jpg'),
          ('Test Card 2', 'Second subtitle', 'Second test card', 'test2.jpg')
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

// Mock the database module
const db = {
  get: (query, params) => {
    return new Promise((resolve, reject) => {
      testDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (query, params) => {
    return new Promise((resolve, reject) => {
      testDb.all(query, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (query, params) => {
    return new Promise((resolve, reject) => {
      testDb.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

// Replace database module with test database
jest.doMock('../src/database', () => db);

module.exports = {
  testDb,
  initTestDb
};