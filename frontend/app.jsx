import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import QueryEditor from './components/QueryEditor';
import ConnectionManager from './components/ConnectionManager';
import SavedQueries from './components/SavedQueries';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<QueryEditor />} />
            <Route path="/connections" element={<ConnectionManager />} />
            <Route path="/saved-queries" element={<SavedQueries />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
