const db = require("../db");

class LoginAttemptRepository {
  findByEmail(email) {
    return db
      .prepare(
        `
        SELECT
          email,
          failed_attempts,
          locked_until,
          last_failed_at
        FROM login_attempts
        WHERE email = ?
        `,
      )
      .get(email);
  }

  recordFailure(email, maxAttempts, lockoutMinutes) {
    const existing = this.findByEmail(email);

    if (!existing) {
      db.prepare(
        `
        INSERT INTO login_attempts (
          email,
          failed_attempts,
          locked_until,
          last_failed_at
        )
        VALUES (
          ?,
          1,
          NULL,
          CURRENT_TIMESTAMP
        )
        `,
      ).run(email);

      return;
    }

    const failedAttempts = existing.failed_attempts + 1;

    if (failedAttempts >= maxAttempts) {
      db.prepare(
        `
        UPDATE login_attempts
        SET
          failed_attempts = ?,
          locked_until = datetime(
            'now',
            '+' || ? || ' minutes'
          ),
          last_failed_at = CURRENT_TIMESTAMP
        WHERE email = ?
        `,
      ).run(failedAttempts, lockoutMinutes, email);

      return;
    }

    db.prepare(
      `
      UPDATE login_attempts
      SET
        failed_attempts = ?,
        last_failed_at = CURRENT_TIMESTAMP
      WHERE email = ?
      `,
    ).run(failedAttempts, email);
  }

  getStatus(email, maxAttempts) {
    const attempt = this.findByEmail(email);

    if (!attempt) {
      return {
        locked: false,
        attemptsRemaining: maxAttempts,
        lockoutRemainingMinutes: 0,
      };
    }

    if (!attempt.locked_until) {
      return {
        locked: false,
        attemptsRemaining: Math.max(maxAttempts - attempt.failed_attempts, 0),
        lockoutRemainingMinutes: 0,
      };
    }

    const result = db
      .prepare(
        `
      SELECT
        MAX(
          0,
          CAST(
            CEIL(
              (julianday(locked_until) - julianday('now')) * 24 * 60
            )
            AS INTEGER
          )
        ) AS remaining_minutes
      FROM login_attempts
      WHERE email = ?
      `,
      )
      .get(email);

    if (!result || result.remaining_minutes <= 0) {
      this.clearExpiredLockout(email);

      return {
        locked: false,
        attemptsRemaining: maxAttempts,
        lockoutRemainingMinutes: 0,
      };
    }

    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutRemainingMinutes: result.remaining_minutes,
    };
  }

  reset(email) {
    db.prepare(
      `
      DELETE FROM login_attempts
      WHERE email = ?
      `,
    ).run(email);
  }

  clearExpiredLockout(email) {
    db.prepare(
      `
      UPDATE login_attempts
      SET
        failed_attempts = 0,
        locked_until = NULL
      WHERE email = ?
        AND locked_until IS NOT NULL
        AND locked_until <= CURRENT_TIMESTAMP
      `,
    ).run(email);
  }

  isLocked(email) {
    const attempt = this.findByEmail(email);

    if (!attempt || !attempt.locked_until) {
      return false;
    }

    const result = db
      .prepare(
        `
      SELECT
        CASE
          WHEN locked_until > CURRENT_TIMESTAMP THEN 1
          ELSE 0
        END AS locked
      FROM login_attempts
      WHERE email = ?
      `,
      )
      .get(email);

    if (!result || result.locked === 0) {
      this.clearExpiredLockout(email);
      return false;
    }

    return true;
  }
}

module.exports = new LoginAttemptRepository();
