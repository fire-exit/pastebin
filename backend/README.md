# Pastebin Backend

A Node.js Express API server using SQLite for metadata and filesystem for content storage, with automatic 2-week expiry.

## Features

- ✅ Save code snippets with unique IDs
- ✅ Retrieve snippets by ID with view tracking
- ✅ Automatic 2-week expiry with hourly cleanup
- ✅ 2MB file size limit with validation
- ✅ URL-safe ID generation with collision handling
- ✅ CORS support for frontend integration
- ✅ SQLite for metadata storage
- ✅ Filesystem for content storage

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   The database and data directories will be created automatically on first run.

## API Endpoints

### Save Snippet

```http
POST /api/snippets
Content-Type: application/json

{
  "content": "console.log('Hello World');",
  "language": "javascript",
  "title": "Optional title"
}
```

**Response:**

```json
{
  "success": true,
  "id": "V1StGXR8_Z5j",
  "url": "/api/snippet/V1StGXR8_Z5j",
  "expires_at": "2024-02-15T10:30:00Z"
}
```

### Retrieve Snippet

```http
GET /api/snippets/:id
```

**Response:**

```json
{
  "success": true,
  "snippet": {
    "id": "V1StGXR8_Z5j",
    "content": "console.log('Hello World');",
    "language": "javascript",
    "title": null,
    "created_at": "2024-02-01T10:30:00Z",
    "views": 42,
    "file_size": 29
  }
}
```

### Health Check

```http
GET /health
```

## Environment Variables

- `PORT`: Server port (default: `3001`)
- `FRONTEND_URL`: Frontend URL for CORS (default: `http://localhost:5173`)
- `DATABASE_PATH`: SQLite database path (optional, default: `data/pastebin.db`)

## Data Model

### SQLite Database (`data/pastebin.db`)

```sql
CREATE TABLE snippets (
  id TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  title TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL
);
```

### Filesystem (`data/snippets/`)

- Each snippet's content is stored as: `data/snippets/{id}.txt`
- Files are automatically deleted when snippets expire

## Supported Languages

- javascript
- typescript
- python
- html
- css
- json
