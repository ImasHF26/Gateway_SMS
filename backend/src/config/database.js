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

    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'Général',
        is_system INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        // Migration : ajouter la colonne gateway_message_id si elle n'existe pas
        this.db.run(
          `ALTER TABLE sms_history ADD COLUMN gateway_message_id TEXT`,
          (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
              // Colonne existe déjà, c'est normal — on ignore
            } else if (!alterErr) {
              console.log('Colonne gateway_message_id ajoutée à sms_history');
            }
          }
        );
        // Migration : ajouter la colonne delivery_status pour le statut réel de la passerelle
        this.db.run(
          `ALTER TABLE sms_history ADD COLUMN delivery_status TEXT DEFAULT 'unknown'`,
          (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
              // Colonne existe déjà
            } else if (!alterErr) {
              console.log('Colonne delivery_status ajoutée à sms_history');
            }
          }
        );
        // Migration : ajouter la colonne status_checked_at pour la date de dernière vérification
        this.db.run(
          `ALTER TABLE sms_history ADD COLUMN status_checked_at DATETIME`,
          (alterErr) => {
            if (alterErr && !alterErr.message.includes('duplicate column')) {
              // Colonne existe déjà
            } else if (!alterErr) {
              console.log('Colonne status_checked_at ajoutée à sms_history');
            }
          }
        );
      }
    });

    this.db.run(createTemplatesTable, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table templates:', err.message);
      } else {
        console.log('Table templates créée ou existe déjà');
        // Insérer les modèles par défaut s'il n'y en a pas
        this.db.get('SELECT COUNT(*) as count FROM templates WHERE is_system = 1', (countErr, row) => {
          if (!countErr && row && row.count === 0) {
            const defaultTemplates = [
              ['Message de test', 'Bonjour ! Ceci est un message de test envoyé depuis notre passerelle SMS.', 'Test', 1],
              ['Rappel de rendez-vous', 'Bonjour {nom}, nous vous rappelons votre rendez-vous prévu demain à 14h00. En cas d\'empêchement, merci de nous contacter.', 'Rappel', 1],
              ['Offre promotionnelle', 'Bonjour {nom} ! Profitez de notre offre exclusive valable jusqu\'à la fin de la semaine. Rendez-vous sur notre site.', 'Marketing', 1],
              ['Confirmation de commande', 'Bonjour {nom}, votre commande #{numero} est validée et en cours de préparation. Merci de votre confiance.', 'Notification', 1],
              ['Vœux & Salutations', 'Bonne année {nom} ! Toute notre équipe vous présente ses meilleurs vœux de santé, de bonheur et de succès.', 'Salutations', 1]
            ];
            const stmt = this.db.prepare('INSERT INTO templates (title, content, category, is_system) VALUES (?, ?, ?, ?)');
            defaultTemplates.forEach(t => stmt.run(t));
            stmt.finalize(() => {
              console.log('Modèles de messages par défaut insérés');
            });
          }
        });
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
      const { contact_id, phone_number, message, status, gateway_message_id } = smsData;
      this.db.run(
        'INSERT INTO sms_history (contact_id, phone_number, message, status, gateway_message_id) VALUES (?, ?, ?, ?, ?)',
        [contact_id, phone_number, message, status, gateway_message_id || null],
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

  updateSmsDeliveryStatus(smsId, deliveryStatus, gatewayMessageId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE sms_history
         SET delivery_status = ?,
             status = ?,
             gateway_message_id = COALESCE(?, gateway_message_id),
             status_checked_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [deliveryStatus, deliveryStatus === 'Delivered' ? 'sent' : (deliveryStatus === 'Failed' ? 'failed' : 'pending'), gatewayMessageId, smsId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  getSmsById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM sms_history WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
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
          // Ajouter delivery_status par défaut pour les anciens enregistrements
          const enriched = rows.map(row => ({
            ...row,
            delivery_status: row.delivery_status || 'unknown',
            gateway_message_id: row.gateway_message_id || null
          }));
          resolve(enriched);
        }
      });
    });
  }

  // Méthodes pour les modèles (Templates)
  getAllTemplates() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM templates ORDER BY is_system DESC, created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getTemplateById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM templates WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  addTemplate(template) {
    return new Promise((resolve, reject) => {
      const { title, content, category } = template;
      this.db.run(
        'INSERT INTO templates (title, content, category, is_system) VALUES (?, ?, ?, 0)',
        [title, content, category || 'Personnalisé'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...template, is_system: 0 });
          }
        }
      );
    });
  }

  updateTemplate(id, template) {
    return new Promise((resolve, reject) => {
      const { title, content, category } = template;
      this.db.run(
        'UPDATE templates SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, category || 'Personnalisé', id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...template, changes: this.changes });
          }
        }
      );
    });
  }

  deleteTemplate(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM templates WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedId: id, changes: this.changes });
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
