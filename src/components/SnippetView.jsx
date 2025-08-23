import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../api.js';
import { LANGUAGES } from '../constants.js';

function SnippetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    loadSnippet();
  }, [id]);

  const loadSnippet = async () => {
    try {
      setLoading(true);
      setError(null);
      const snippetData = await api.getSnippet(id);
      setSnippet(snippetData);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('not found')) {
        setTimeout(() => navigate('/'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (snippet && snippet.content) {
      try {
        await navigator.clipboard.writeText(snippet.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Code Snippet - ${snippet.language}`,
        text: 'Check out this code snippet',
        url: window.location.href
      });
    } catch (err) {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error('Failed to share or copy URL: ', copyErr);
      }
    }
  };

  const getLanguageLabel = (langValue) => {
    const lang = LANGUAGES.find(l => l.value === langValue);
    return lang ? lang.label : langValue;
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };


  const editorOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    readOnly: true,
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    wordWrap: wordWrap ? 'on' : 'off',
    scrollBeyondLastLine: false,
  };

  if (loading) {
    return (
      <div className={`snippet-view ${theme}`}>
        <div className="header">
          <Link to="/" className="btn btn-secondary">← New Snippet</Link>
          <h1>Loading snippet...</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`snippet-view ${theme}`}>
        <div className="header">
          <Link to="/" className="btn btn-secondary">← New Snippet</Link>
          <h1>Error</h1>
        </div>
        <div className="error-container">
          <div className="message error-message">
            <p>❌ {error}</p>
            {error.includes('not found') && (
              <p>Redirecting to home page in a few seconds...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`snippet-view ${theme}`}>
      <div className="header">
        <div className="title-section">
          <div className="meta">
            <span className="language-badge">{getLanguageLabel(snippet.language)}</span>
            <span className="snippet-id">ID: {id}</span>
          </div>
        </div>
        <div className="controls">
          <div className="control-group">
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`btn btn-outline wrap-toggle ${wordWrap ? 'active' : ''}`}
              title={wordWrap ? 'Disable line wrapping' : 'Enable line wrapping'}
            >
              {wordWrap ? '↩ On' : '→ Off'}
            </button>
          </div>

          <div className="control-group">
            <button
              onClick={toggleTheme}
              className="btn btn-outline theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          
          <div className="button-group">
            <button
              onClick={handleCopy}
              className="btn btn-outline"
              title="Copy code to clipboard"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleShare}
              className="btn btn-primary"
              title="Share this snippet"
            >
              🔗 Share
            </button>
            <Link to="/" className="btn btn-secondary">← New</Link>
          </div>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          width="100%"
          height="100%"
          language={snippet.language}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={snippet.content}
          options={editorOptions}
        />
      </div>

      <div className="footer">
        <p className="expiry-notice">
          ⏰ This snippet will be automatically deleted after 2 weeks
        </p>
      </div>
    </div>
  );
}

export default SnippetView;
