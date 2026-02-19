const { pool } = require('../config/database');

class TokenService {
  // Simpan token ke database
  async saveToken(userId, tokenData) {
    try {
      // Nonaktifkan token lama untuk user ini
      await pool.query(
        'UPDATE accurate_tokens SET is_active = FALSE WHERE user_id = ? AND is_active = TRUE',
        [userId]
      );

      // Hitung expires_at
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      // Simpan token baru
      const [result] = await pool.query(
        `INSERT INTO accurate_tokens 
         (user_id, access_token, refresh_token, token_type, expires_in, expires_at, scope, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          userId,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.token_type || 'Bearer',
          tokenData.expires_in || 3600,
          expiresAt,
          tokenData.scope || ''
        ]
      );

      return {
        success: true,
        tokenId: result.insertId
      };
    } catch (error) {
      console.error('Error saving token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Ambil token aktif untuk user
  async getActiveToken(userId) {
    try {
      console.log('Getting active token for userId:', userId);
      
      const [tokens] = await pool.query(
        `SELECT * FROM accurate_tokens 
         WHERE user_id = ? AND is_active = TRUE 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );

      console.log('Tokens found:', tokens.length);

      if (tokens.length === 0) {
        console.log('No active token found for user');
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan hubungkan akun Accurate terlebih dahulu.'
        };
      }

      const token = tokens[0];

      // Cek apakah token sudah expired
      const now = new Date();
      const expiresAt = new Date(token.expires_at);

      console.log('Token expiry check:', {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isExpired: now >= expiresAt
      });

      if (now >= expiresAt) {
        console.log('Token expired, needs refresh');
        return {
          success: false,
          message: 'Token sudah expired. Silakan refresh token atau hubungkan ulang akun Accurate.',
          needsRefresh: true,
          refreshToken: token.refresh_token
        };
      }

      console.log('Token is valid');
      return {
        success: true,
        token: {
          id: token.id,
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          tokenType: token.token_type,
          expiresAt: token.expires_at,
          scope: token.scope
        }
      };
    } catch (error) {
      console.error('Error getting active token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update token (setelah refresh)
  async updateToken(tokenId, newTokenData) {
    try {
      const expiresAt = new Date(Date.now() + (newTokenData.expires_in * 1000));

      await pool.query(
        `UPDATE accurate_tokens 
         SET access_token = ?, 
             refresh_token = ?, 
             expires_in = ?, 
             expires_at = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          newTokenData.access_token,
          newTokenData.refresh_token || null,
          newTokenData.expires_in || 3600,
          expiresAt,
          tokenId
        ]
      );

      return {
        success: true
      };
    } catch (error) {
      console.error('Error updating token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Hapus token (logout)
  async revokeToken(userId) {
    try {
      await pool.query(
        'UPDATE accurate_tokens SET is_active = FALSE WHERE user_id = ?',
        [userId]
      );

      return {
        success: true
      };
    } catch (error) {
      console.error('Error revoking token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cek apakah user sudah punya token aktif
  async hasActiveToken(userId) {
    try {
      const [tokens] = await pool.query(
        `SELECT COUNT(*) as count FROM accurate_tokens 
         WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()`,
        [userId]
      );

      return tokens[0].count > 0;
    } catch (error) {
      console.error('Error checking active token:', error);
      return false;
    }
  }

  // Cleanup expired tokens (untuk cron job)
  async cleanupExpiredTokens() {
    try {
      const [result] = await pool.query(
        'UPDATE accurate_tokens SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE'
      );

      return {
        success: true,
        updated: result.affectedRows
      };
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TokenService();
