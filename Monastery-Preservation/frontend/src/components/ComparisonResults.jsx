import React, { useState, useEffect } from 'react';
import { getImageById } from '../services/api';

/**
 * ComparisonResults Component
 * Display comparison results with severity and difference image
 */
const ComparisonResults = ({ comparison }) => {
  const [baselinePreview, setBaselinePreview] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [differencePreview, setDifferencePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load image previews
  useEffect(() => {
    const loadPreviews = async () => {
      setLoading(true);
      
      try {
        // Load baseline image
        if (comparison.baselineImage?.metadataId) {
          const baselineUrl = await getImageById(comparison.baselineImage.metadataId._id || comparison.baselineImage.metadataId);
          setBaselinePreview(baselineUrl);
        }

        // Load current image
        if (comparison.currentImage?.metadataId) {
          const currentUrl = await getImageById(comparison.currentImage.metadataId._id || comparison.currentImage.metadataId);
          setCurrentPreview(currentUrl);
        }

        // Load difference image
        if (comparison.differenceImage?.metadataId) {
          const diffUrl = await getImageById(comparison.differenceImage.metadataId._id || comparison.differenceImage.metadataId);
          setDifferencePreview(diffUrl);
        }

      } catch (error) {
        console.error('Failed to load image previews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (comparison) {
      loadPreviews();
    }
  }, [comparison]);

  if (!comparison) {
    return <div className="no-results">No comparison results</div>;
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      EXCELLENT: '#10b981',
      GOOD: '#22c55e',
      MODERATE: '#eab308',
      POOR: '#f97316',
      CRITICAL: '#ef4444',
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <div className="comparison-results">
      <h2>Comparison Results</h2>

      {/* Summary Card */}
      <div className="summary-card">
        <div className="summary-header">
          <h3>{comparison.location} - {comparison.structureComponent}</h3>
          <div 
            className="severity-badge" 
            style={{ backgroundColor: getSeverityColor(comparison.severityLevel) }}
          >
            {comparison.severityLevel}
          </div>
        </div>

        <div className="summary-metrics">
          <div className="metric">
            <span className="metric-label">SSIM Score</span>
            <span className="metric-value">{(comparison.ssimScore * 100).toFixed(2)}%</span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Difference</span>
            <span className="metric-value">
              {comparison.analysis?.differencePercentage?.toFixed(2) || 'N/A'}%
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Affected Area</span>
            <span className="metric-value">
              {comparison.analysis?.affectedArea?.toFixed(2) || 'N/A'}%
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">Regions Detected</span>
            <span className="metric-value">{comparison.analysis?.contourCount || 0}</span>
          </div>
        </div>

        {/* Recommendations */}
        {comparison.analysis?.recommendations && (
          <div className="recommendations">
            <h4>Recommendations</h4>
            <p>{comparison.analysis.recommendations}</p>
          </div>
        )}

        {/* Alert Flag */}
        {comparison.alertFlag && (
          <div className="alert-banner">
            ⚠️ ALERT: This comparison requires immediate attention
          </div>
        )}
      </div>

      {/* Images Display */}
      {loading ? (
        <div className="loading">Loading images...</div>
      ) : (
        <div className="images-grid">
          {/* Baseline Image */}
          <div className="image-card">
            <h4>Baseline Image</h4>
            {baselinePreview ? (
              <img src={baselinePreview} alt="Baseline" />
            ) : (
              <div className="no-image">Image not available</div>
            )}
            <div className="image-caption">
              {comparison.baselineImage?.filename}
              <br />
              <small>{new Date(comparison.baselineImage?.uploadDate).toLocaleDateString()}</small>
            </div>
          </div>

          {/* Current Image */}
          <div className="image-card">
            <h4>Current Image</h4>
            {currentPreview ? (
              <img src={currentPreview} alt="Current" />
            ) : (
              <div className="no-image">Image not available</div>
            )}
            <div className="image-caption">
              {comparison.currentImage?.filename}
              <br />
              <small>{new Date(comparison.currentImage?.uploadDate).toLocaleDateString()}</small>
            </div>
          </div>

          {/* Difference Image */}
          <div className="image-card">
            <h4>Difference Image</h4>
            {differencePreview ? (
              <img src={differencePreview} alt="Difference" />
            ) : (
              <div className="no-image">No difference image</div>
            )}
            <div className="image-caption">
              Highlighted differences
              <br />
              <small>Red areas indicate detected changes</small>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="comparison-metadata">
        <p><strong>Comparison Date:</strong> {new Date(comparison.comparisonDate).toLocaleString()}</p>
        <p><strong>Processing Time:</strong> {comparison.processingTime}ms</p>
        <p><strong>Status:</strong> {comparison.status}</p>
      </div>
    </div>
  );
};

export default ComparisonResults;
