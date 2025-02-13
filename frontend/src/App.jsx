import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/landing';
import Header from './components/header';
import LoginPage from './pages/login';
import Dashboard from './pages/dashboard';
import ProjectDetails from './pages/project';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/project/:projectId" element={<ProjectDetails/>} />
      </Routes>
    </Router>
  );
};

export default App;
