import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import PerformanceTest from './components/PerformanceTest';
import WebScraping from './components/WebScraping';
import LogStreaming from './components/LogStreaming';
import BackgroundTasks from './components/BackgroundTasks';
import ExternalAPIs from './components/ExternalAPIs';
import WebSocketChat from './components/WebSocketChat';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="home">
                <h1>FastAPI 비동기 서비스 테스트</h1>
                <p>각 메뉴를 클릭하여 다양한 비동기 API들을 테스트해보세요.</p>
              </div>
            } />
            <Route path="/performance" element={<PerformanceTest apiUrl={API_BASE_URL} />} />
            <Route path="/scraping" element={<WebScraping apiUrl={API_BASE_URL} />} />
            <Route path="/logs" element={<LogStreaming apiUrl={API_BASE_URL} />} />
            <Route path="/tasks" element={<BackgroundTasks apiUrl={API_BASE_URL} />} />
            <Route path="/external" element={<ExternalAPIs apiUrl={API_BASE_URL} />} />
            <Route path="/chat" element={<WebSocketChat apiUrl={API_BASE_URL} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;