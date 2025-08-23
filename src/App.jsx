import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import Home from './components/Home.jsx';
import SnippetView from './components/SnippetView.jsx';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:id" element={<SnippetView />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;