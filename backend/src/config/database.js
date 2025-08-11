const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    const dbPath = path.join(__dirname, 'database.sqlite');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
      } else {
        console.log('Connexion à la base de données SQLite réussie');
        this.createTables();
      }
    });
  }

  createTables() {
    const createContactsTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSmsHistoryTable = `
      CREATE TABLE IF NOT EXISTS sms_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        phone_number TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
      )
    `;

    this.db.run(createContactsTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table contacts:', err.message);
      } else {
        console.log('Table contacts créée ou existe déjà');
      }
    });

    this.db.run(createSmsHistoryTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table sms_history:', err.message);
      } else {
        console.log('Table sms_history créée ou existe déjà');
      }
    });
  }

  // Méthodes pour les contacts
  getAllContacts() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM contacts ORDER BY name', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getContactById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  addContact(contact) {
    return new Promise((resolve, reject) => {
      const { name, phone, email } = contact;
      this.db.run(
        'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...contact });
          }
        }
      );
    });
  }

  addContacts(contacts) {
    return new Promise((resolve, reject) => {
      if (contacts.length === 0) {
        return resolve({ changes: 0 });
      }
      
      const placeholders = contacts.map(() => '(?, ?, ?)').join(',');
      const sql = `INSERT OR IGNORE INTO contacts (name, phone, email) VALUES ${placeholders}`;
      
      const params = [];
      contacts.forEach(c => {
        params.push(c.name, c.phone, c.email || null);
      });

      const self = this;
      this.db.serialize(() => {
        self.db.run('BEGIN TRANSACTION', (err) => {
          if (err) return reject(err);
        });

        self.db.run(sql, params, function(err) {
          if (err) {
            return self.db.run('ROLLBACK', () => reject(err));
          }
          
          const changes = this.changes;
          
          self.db.run('COMMIT', (err) => {
            if (err) {
              return self.db.run('ROLLBACK', () => reject(err));
            }
            resolve({ changes });
          });
        });
      });
    });
  }

  updateContact(id, contact) {
    return new Promise((resolve, reject) => {
      const { name, phone, email } = contact;
      this.db.run(
        'UPDATE contacts SET name = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, email, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...contact });
          }
        }
      );
    });
  }

  deleteContact(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedId: id, changes: this.changes });
        }
      });
    });
  }

  // Méthodes pour l'historique SMS
  addSmsHistory(smsData) {
    return new Promise((resolve, reject) => {
      const { contact_id, phone_number, message, status } = smsData;
      this.db.run(
        'INSERT INTO sms_history (contact_id, phone_number, message, status) VALUES (?, ?, ?, ?)',
        [contact_id, phone_number, message, status],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...smsData });
          }
        }
      );
    });
  }

  getSmsHistory() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          sh.*,
          c.name as contact_name
        FROM sms_history sh
        LEFT JOIN contacts c ON sh.contact_id = c.id
        ORDER BY sh.sent_at DESC
      `;
      this.db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Erreur lors de la fermeture de la base de données:', err.message);
        } else {
          console.log('Connexion à la base de données fermée');
        }
      });
    }
  }
}

module.exports = Database;
