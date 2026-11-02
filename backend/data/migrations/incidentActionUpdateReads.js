function createReadTable(db) {
  db.exec(`
    CREATE TABLE incident_action_update_reads (
      user_id INTEGER NOT NULL,
      incident_action_id INTEGER NOT NULL,
      update_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, update_id),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      FOREIGN KEY (incident_action_id)
        REFERENCES incident_actions(id)
        ON DELETE CASCADE,

      FOREIGN KEY (update_id)
        REFERENCES incident_action_updates(id)
        ON DELETE CASCADE
    );
  `);
}

function ensureIncidentActionUpdateReadsTable(db) {
  const tableExists = db
    .prepare(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'incident_action_update_reads'",
    )
    .get();

  if (!tableExists) {
    createReadTable(db);
    return;
  }

  const columns = db
    .prepare("PRAGMA table_info(incident_action_update_reads)")
    .all()
    .map((column) => column.name);

  if (columns.includes("update_id")) {
    return;
  }

  if (!columns.includes("last_read_update_id")) {
    throw new Error(
      "Cannot migrate incident_action_update_reads: expected last_read_update_id",
    );
  }

  const migrate = db.transaction(() => {
    db.exec(`
      ALTER TABLE incident_action_update_reads
      RENAME TO incident_action_update_reads_legacy;
    `);

    createReadTable(db);

    db.exec(`
      INSERT OR IGNORE INTO incident_action_update_reads (
        user_id,
        incident_action_id,
        update_id
      )
      SELECT
        reads.user_id,
        reads.incident_action_id,
        updates.id
      FROM incident_action_update_reads_legacy reads
      INNER JOIN incident_action_updates updates
        ON updates.incident_action_id = reads.incident_action_id
        AND updates.id <= reads.last_read_update_id
        AND updates.update_type = 'comment'
        AND TRIM(COALESCE(updates.note, '')) != '';

      DROP TABLE incident_action_update_reads_legacy;
    `);
  });

  migrate();
}

module.exports = ensureIncidentActionUpdateReadsTable;
