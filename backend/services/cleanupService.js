import db from '../config/database.js';
import { deleteContent } from '../utils/fileStorage.js';

/**
 * Delete expired snippets from database and filesystem
 * @returns {Promise<number>} Number of snippets deleted
 */
export const cleanupExpiredSnippets = async () => {
  const now = Date.now();

  // Find all expired snippets
  const selectStmt = db.prepare('SELECT id FROM snippets WHERE expires_at < ?');
  const expiredSnippets = selectStmt.all(now);

  if (expiredSnippets.length === 0) {
    console.log('No expired snippets to clean up');
    return 0;
  }

  console.log(`Found ${expiredSnippets.length} expired snippets to clean up`);

  // Delete files and database records
  let deleted = 0;
  const deleteStmt = db.prepare('DELETE FROM snippets WHERE id = ?');

  for (const snippet of expiredSnippets) {
    try {
      // Delete file from filesystem
      await deleteContent(snippet.id);

      // Delete from database
      deleteStmt.run(snippet.id);

      deleted++;
    } catch (error) {
      console.error(`Error deleting snippet ${snippet.id}:`, error);
    }
  }

  console.log(`Successfully deleted ${deleted} expired snippets`);
  return deleted;
};

/**
 * Get statistics about snippets
 * @returns {object} Statistics object
 */
export const getSnippetStats = () => {
  const now = Date.now();

  const total = db.prepare('SELECT COUNT(*) as count FROM snippets').get().count;
  const expired = db.prepare('SELECT COUNT(*) as count FROM snippets WHERE expires_at < ?').get(now).count;
  const active = total - expired;

  return {
    total,
    active,
    expired
  };
};
