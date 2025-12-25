import React, { useState, useEffect } from 'react';
import { getImageById } from '../services/api';

/**
 * ResultsDisplay Component
 * Purpose: Display comprehensive comparison results
 * Features:
 * - Side-by-side baseline and current images
 * - Highlighted difference visualization
 * - SSIM score and metrics
 * - Color-coded severity assessment
 * - Preservation recommendations
 * - PDF report download
 */
const ResultsDisplay = ({ comparisonData }) => {
  const [baselineImageUrl, setBaselineImageUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [differenceImageUrl, setDifferenceImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    if (comparisonData) {
      loadImages();
    }
  }, [comparisonData]);

  const loadImages = async () => {
    try {
      setLoading(true);

      // Load baseline image
      if (comparisonData.baselineImage?.metadataId) {
        const baselineResponse = await getImageById(comparisonData.baselineImage.metadataId);
        const baselineBlob = new Blob([baselineResponse.data]);
        setBaselineImageUrl(URL.createObjectURL(baselineBlob));
      }

      // Load current image
      if (comparisonData.currentImage?.metadataId) {
        const currentResponse = await getImageById(comparisonData.currentImage.metadataId);
        const currentBlob = new Blob([currentResponse.data]);
        setCurrentImageUrl(URL.createObjectURL(currentBlob));
      }

      // Load difference image
      if (comparisonData.differenceImage?.metadataId) {
        const diffResponse = await getImageById(comparisonData.differenceImage.metadataId);
        const diffBlob = new Blob([diffResponse.data]);
        setDifferenceImageUrl(URL.createObjectURL(diffBlob));
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load images:', error);
      setLoading(false);
    }
  };

  const getSeverityInfo = (severity) => {
    const severityConfig = {
      'NO_CHANGE': {
        label: 'No Change',
        color: '#10b981',
        description: 'Images are virtually identical',
        icon: '✅'
      },
      'EXCELLENT': {
        label: 'Excellent',
        color: '#22c55e',
        description: 'Minimal differences detected',
        icon: '🟢'
      },
      'MINOR': {
        label: 'Minor Changes',
        color: '#84cc16',
        description: 'Small variations observed',
        icon: '🟡'
      },
      'MODERATE': {
        label: 'Moderate Changes',
        color: '#eab308',
        description: 'Noticeable differences detected',
        icon: '🟠'
      },
      'MAJOR': {
        label: 'Major Changes',
        color: '#f97316',
        description: 'Significant structural changes',
        icon: '🔴'
      },
      'CRITICAL': {
        label: 'Critical Damage',
        color: '#ef4444',
        description: 'Severe deterioration detected',
        icon: '🚨'
      }
    };
    return severityConfig[severity] || severityConfig['MODERATE'];
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      // In a production app, you'd call a backend endpoint to generate PDF
      // For now, we'll create a simple text report
      const reportContent = generateTextReport();
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comparison_report_${comparisonData.id || Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate report');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const generateTextReport = () => {
    const severityInfo = getSeverityInfo(comparisonData.severityLevel);
    const date = new Date(comparisonData.comparisonDate || Date.now());
    
    return `
MONASTERY PRESERVATION SYSTEM
STRUCTURAL COMPARISON REPORT
==========================================

COMPARISON DETAILS
------------------------------------------
Report ID: ${comparisonData.id || 'N/A'}
Date: ${date.toLocaleString()}
Location: ${comparisonData.location}
Structure Component: ${comparisonData.structureComponent}

BASELINE IMAGE
------------------------------------------
Filename: ${comparisonData.baselineImage?.filename || 'N/A'}
Upload Date: ${comparisonData.baselineImage?.uploadDate ? new Date(comparisonData.baselineImage.uploadDate).toLocaleDateString() : 'N/A'}

CURRENT IMAGE
------------------------------------------
Filename: ${comparisonData.currentImage?.filename || 'N/A'}
Upload Date: ${comparisonData.currentImage?.uploadDate ? new Date(comparisonData.currentImage.uploadDate).toLocaleDateString() : 'N/A'}

ANALYSIS RESULTS
------------------------------------------
Severity Level: ${severityInfo.label}
SSIM Score: ${(comparisonData.ssimScore * 100).toFixed(2)}%
Difference Percentage: ${comparisonData.analysis?.differencePercentage?.toFixed(2) || 'N/A'}%
Affected Area: ${comparisonData.analysis?.affectedArea?.toFixed(2) || 'N/A'}%

KEY FINDINGS
------------------------------------------
${comparisonData.analysis?.keyFindings?.map((finding, i) => `${i + 1}. ${finding}`).join('\n') || 'No key findings available'}

RECOMMENDATIONS
------------------------------------------
${comparisonData.analysis?.recommendations || 'No recommendations available'}

ACTION ITEMS
------------------------------------------
${comparisonData.analysis?.actionItems?.map((item, i) => `${i + 1}. ${item}`).join('\n') || 'No action items'}

==========================================
Generated by Monastery Preservation System
AI-Powered Structural Change Detection
    `.trim();
  };

  if (!comparisonData) {
    return (
      <div className="results-display-container">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>No Comparison Results</h3>
          <p>Upload a current image to see comparison results here.</p>
        </div>
      </div>
    );
  }

  const severityInfo = getSeverityInfo(comparisonData.severityLevel);

  return (
    <div className="results-display-container">
      <div className="section-header">
        <h2>📊 Comparison Results</h2>
        <p className="section-description">
          Detailed analysis of structural changes between baseline and current images.
        </p>
      </div>

      {/* Overall Assessment Card */}
      <div className="assessment-card">
        <div className="assessment-header">
          <div className="severity-indicator" style={{ backgroundColor: severityInfo.color }}>
            <span className="severity-icon">{severityInfo.icon}</span>
            <div className="severity-text">
              <h3>{severityInfo.label}</h3>
              <p>{severityInfo.description}</p>
            </div>
          </div>
          <div className="comparison-meta">
            <div className="meta-item">
              <span className="meta-label">Location:</span>
              <span className="meta-value">{comparisonData.location}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Structure:</span>
              <span className="meta-value">{comparisonData.structureComponent}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-value">
                {new Date(comparisonData.comparisonDate || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-container">
        <div className="metric-card">
          <div className="metric-icon">📐</div>
          <div className="metric-content">
            <div className="metric-label">SSIM Score</div>
            <div className="metric-value">{(comparisonData.ssimScore * 100).toFixed(2)}%</div>
            <div className="metric-description">Structural similarity index</div>
          </div>
        </div>

        {comparisonData.analysis?.differencePercentage !== undefined && (
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-label">Difference</div>
              <div className="metric-value">
                {comparisonData.analysis.differencePercentage.toFixed(2)}%
              </div>
              <div className="metric-description">Pixels changed</div>
            </div>
          </div>
        )}

        {comparisonData.analysis?.affectedArea !== undefined && (
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="metric-label">Affected Area</div>
              <div className="metric-value">
                {comparisonData.analysis.affectedArea.toFixed(2)}%
              </div>
              <div className="metric-description">Structural impact</div>
            </div>
          </div>
        )}
      </div>

      {/* Image Comparison Grid */}
      <div className="images-grid">
        {loading ? (
          <div className="loading-images">
            <div className="spinner"></div>
            <p>Loading images...</p>
          </div>
        ) : (
          <>
            {/* Baseline Image */}
            <div className="image-panel">
              <div className="image-panel-header">
                <h4>📷 Baseline Image</h4>
                <span className="image-label">Reference</span>
              </div>
              {baselineImageUrl ? (
                <img src={baselineImageUrl} alt="Baseline" className="comparison-image" />
              ) : (
                <div className="image-placeholder">Image not available</div>
              )}
              <div className="image-info">
                <div>{comparisonData.baselineImage?.filename || 'N/A'}</div>
                <div className="image-date">
                  {comparisonData.baselineImage?.uploadDate 
                    ? new Date(comparisonData.baselineImage.uploadDate).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Current Image */}
            <div className="image-panel">
              <div className="image-panel-header">
                <h4>🖼️ Current Image</h4>
                <span className="image-label">Latest</span>
              </div>
              {currentImageUrl ? (
                <img src={currentImageUrl} alt="Current" className="comparison-image" />
              ) : (
                <div className="image-placeholder">Image not available</div>
              )}
              <div className="image-info">
                <div>{comparisonData.currentImage?.filename || 'N/A'}</div>
                <div className="image-date">
                  {comparisonData.currentImage?.uploadDate 
                    ? new Date(comparisonData.currentImage.uploadDate).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Difference Image */}
            <div className="image-panel full-width">
              <div className="image-panel-header">
                <h4>🔍 Difference Visualization</h4>
                <span className="image-label highlight">Highlighted Changes</span>
              </div>
              {differenceImageUrl ? (
                <img src={differenceImageUrl} alt="Difference" className="comparison-image" />
              ) : (
                <div className="image-placeholder">No difference image generated</div>
              )}
              <div className="image-info">
                <div className="difference-legend">
                  <span className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                    Red areas indicate structural changes
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Analysis Details */}
      {comparisonData.analysis && (
        <div className="analysis-section">
          {/* Key Findings */}
          {comparisonData.analysis.keyFindings && comparisonData.analysis.keyFindings.length > 0 && (
            <div className="analysis-card">
              <h4>🔎 Key Findings</h4>
              <ul className="findings-list">
                {comparisonData.analysis.keyFindings.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {comparisonData.analysis.recommendations && (
            <div className="recommendations-card" style={{ borderColor: severityInfo.color }}>
              <h4>💡 Preservation Recommendations</h4>
              <p>{comparisonData.analysis.recommendations}</p>
            </div>
          )}

          {/* Action Items */}
          {comparisonData.analysis.actionItems && comparisonData.analysis.actionItems.length > 0 && (
            <div className="action-items-card">
              <h4>✅ Recommended Actions</h4>
              <ul className="action-list">
                {comparisonData.analysis.actionItems.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Download Report Button */}
      <div className="report-actions">
        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="btn btn-primary btn-large"
        >
          {downloadingPDF ? (
            <>
              <span className="spinner-small"></span>
              Generating Report...
            </>
          ) : (
            <>
              <span>📄</span>
              Download PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
