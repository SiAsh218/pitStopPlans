const db = require("../db");

class SessionRepository {
  create({ userId, tokenHash, expiresAt }) {
    const result = db
      .prepare(
        `
      INSERT INTO auth_sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
    `,
      )
      .run(userId, tokenHash, expiresAt);

    return {
      id: Number(result.lastInsertRowid),
    };
  }

  findValidByTokenHash(tokenHash) {
    return db
      .prepare(
        `
      SELECT
        s.*,
        u.email,
        u.role,
        u.active
      FROM auth_sessions s
      INNER JOIN users u
        ON u.id = s.user_id
      WHERE s.token_hash = ?
        AND s.revoked_at IS NULL
        AND s.expires_at > CURRENT_TIMESTAMP
    `,
      )
      .get(tokenHash);
  }

  rotate(id, newTokenHash, newExpiresAt) {
    const result = db
      .prepare(
        `
      UPDATE auth_sessions
      SET
        token_hash = ?,
        expires_at = ?,
        last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND revoked_at IS NULL
    `,
      )
      .run(newTokenHash, newExpiresAt, id);

    return result.changes === 1;
  }

  revoke(id) {
    db.prepare(
      `
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(id);
  }

  revokeAllForUser(userId) {
    db.prepare(
      `
      UPDATE auth_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
        AND revoked_at IS NULL
    `,
    ).run(userId);
  }

  deleteExpired() {
    db.prepare(
      `
      DELETE FROM auth_sessions
      WHERE expires_at <= CURRENT_TIMESTAMP
         OR revoked_at IS NOT NULL
    `,
    ).run();
  }
}

module.exports = new SessionRepository();
