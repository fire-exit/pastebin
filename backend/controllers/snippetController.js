import db from '../config/database.js';
import { generateUniqueId } from '../utils/idGenerator.js';
import { saveContent, readContent } from '../utils/fileStorage.js';

export const saveSnippet = async (req, res) => {
  try {
    const { content, language, title } = req.body;
    const id = generateUniqueId();

    const createdAt = Date.now();
    const expiresAt = createdAt + (14 * 24 * 60 * 60 * 1000); // 2 weeks

    // Save content to filesystem
    const filePath = await saveContent(id, content);

    // Save metadata to SQLite
    const insertStmt = db.prepare(`
      INSERT INTO snippets (id, language, title, created_at, expires_at, file_size, views, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      language,
      title || null,
      createdAt,
      expiresAt,
      req.contentSize,
      0,
      filePath
    );

    res.json({
      success: true,
      id,
      url: `/api/snippets/${id}`,
      expires_at: new Date(expiresAt).toISOString()
    });
  } catch (error) {
    console.error('Error saving snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    // Get metadata from SQLite
    const selectStmt = db.prepare('SELECT * FROM snippets WHERE id = ?');
    const snippet = selectStmt.get(id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found or expired'
      });
    }

    // Check if snippet has expired
    if (snippet.expires_at < Date.now()) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found or expired'
      });
    }

    // Increment view counter atomically
    const updateStmt = db.prepare('UPDATE snippets SET views = views + 1 WHERE id = ?');
    updateStmt.run(id);

    // Read content from filesystem
    const content = await readContent(id);

    res.json({
      success: true,
      snippet: {
        id: snippet.id,
        content,
        language: snippet.language,
        title: snippet.title,
        created_at: new Date(snippet.created_at).toISOString(),
        file_size: snippet.file_size,
        views: snippet.views + 1 // Return incremented value
      }
    });
  } catch (error) {
    console.error('Error retrieving snippet:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};