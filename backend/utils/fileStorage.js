import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SNIPPETS_DIR = join(__dirname, '../data/snippets');

/**
 * Save content to filesystem
 * @param {string} id - Snippet ID
 * @param {string} content - Snippet content
 * @returns {Promise<string>} - Relative file path
 */
export const saveContent = async (id, content) => {
  const filePath = join(SNIPPETS_DIR, `${id}.txt`);
  await fs.writeFile(filePath, content, 'utf8');
  return `snippets/${id}.txt`;
};

/**
 * Read content from filesystem
 * @param {string} id - Snippet ID
 * @returns {Promise<string>} - Snippet content
 */
export const readContent = async (id) => {
  const filePath = join(SNIPPETS_DIR, `${id}.txt`);
  return await fs.readFile(filePath, 'utf8');
};

/**
 * Delete content file from filesystem
 * @param {string} id - Snippet ID
 * @returns {Promise<void>}
 */
export const deleteContent = async (id) => {
  const filePath = join(SNIPPETS_DIR, `${id}.txt`);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Check if content file exists
 * @param {string} id - Snippet ID
 * @returns {Promise<boolean>}
 */
export const contentExists = async (id) => {
  const filePath = join(SNIPPETS_DIR, `${id}.txt`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};
