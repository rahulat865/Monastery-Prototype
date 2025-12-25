import React, { useState, useEffect } from 'react';
import BaselineUpload from './components/BaselineUpload';
import ComparisonSection from './components/ComparisonSection';
import ResultsDisplay from './components/ResultsDisplay';
import { checkHealth } from './services/api';
import './App.css';

/**
 * Main Application Component
 * Manages three main sections:
 * 1. Baseline Upload - Upload reference images
 * 2. Comparison Section - Upload current images and trigger analysis
 * 3. Results Display - Show detailed comparison results
 */
function App() {
  const [activeSection, setActiveSection] = useState('baseline');
  const [currentComparison, setCurrentComparison] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check system health on mount
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const health = await checkHealth();
        setSystemHealth(health);
      } catch (error) {
        console.error('Health check failed:', error);
        setSystemHealth({ status: 'ERROR', services: {} });
      }
    };

    checkSystemHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle successful baseline upload
  const handleBaselineUploadSuccess = (uploadData) => {
    console.log('Baseline uploaded:', uploadData);
    // Refresh comparison section to show new baseline
    setRefreshTrigger(prev => prev + 1);
    // Auto-switch to comparison section
    setActiveSection('comparison');
  };

  // Handle comparison completion
  const handleComparisonComplete = (comparisonData) => {
    console.log('Comparison complete:', comparisonData);
    setCurrentComparison(comparisonData);
    // Auto-switch to results section
    setActiveSection('results');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🏛️ Monastery Preservation System</h1>
          <p className="header-subtitle">AI-Powered Structural Change Detection & Analysis</p>
        </div>
        
        {/* System Health Indicator */}
        {systemHealth && (
          <div className="health-indicator">
            <span className={`status-dot ${systemHealth.status === 'OK' ? 'healthy' : 'error'}`}></span>
            <div className="status-info">
              <span className="status-label">System Status:</span>
              <span className="status-text">
                Backend: {systemHealth.services?.api || 'Unknown'} | 
                Python: {systemHealth.services?.pythonService || 'Unknown'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <button
          className={`nav-btn ${activeSection === 'baseline' ? 'active' : ''}`}
          onClick={() => setActiveSection('baseline')}
        >
          <span className="nav-icon">📷</span>
          <span className="nav-label">Upload Baseline</span>
        </button>
        <button
          className={`nav-btn ${activeSection === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveSection('comparison')}
        >
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Comparison</span>
        </button>
        <button
          className={`nav-btn ${activeSection === 'results' ? 'active' : ''}`}
          onClick={() => setActiveSection('results')}
          disabled={!currentComparison}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Results</span>
          {currentComparison && <span className="nav-badge">!</span>}
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {activeSection === 'baseline' && (
          <BaselineUpload onUploadSuccess={handleBaselineUploadSuccess} />
        )}
        
        {activeSection === 'comparison' && (
          <ComparisonSection 
            key={refreshTrigger}
            onComparisonComplete={handleComparisonComplete}
          />
        )}
        
        {activeSection === 'results' && (
          <ResultsDisplay comparisonData={currentComparison} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Powered by MongoDB GridFS • OpenCV & SSIM Algorithm • MERN Stack
        </p>
        <p className="footer-credits">
          Built for Cultural Heritage Preservation
        </p>
      </footer>
    </div>
  );
}

export default App;
