"""
Flask API for Monastery Preservation Image Comparison Service
Receives images from Node.js backend and performs SSIM-based comparison
"""

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from image_processor import ImageProcessor, validate_image_bytes
import traceback

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_IMAGE_SIZE', 10 * 1024 * 1024))
ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,webp').split(','))

# Initialize image processor
processor = ImageProcessor(target_size=(800, 600))


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    GET /health
    """
    return jsonify({
        'status': 'healthy',
        'service': 'Python Image Comparison Service',
        'version': '1.0.0'
    }), 200


@app.route('/api/compare', methods=['POST'])
def compare_images():
    """
    Compare two images and return SSIM score with difference image
    POST /api/compare
    
    Form Data:
        - baseline_image (file): Baseline image
        - current_image (file): Current image to compare
        - location (string, optional): Location name
        - structure_component (string, optional): Structure component name
        
    Returns:
        JSON with:
            - ssim_score (float): Similarity score (0-1)
            - severity (string): EXCELLENT, GOOD, MODERATE, POOR, CRITICAL
            - difference_percentage (float): Percentage of difference
            - contour_count (int): Number of difference regions
            - affected_area (float): Percentage of affected area
            - difference_image (string): Base64 encoded difference image
    """
    try:
        # Validate request
        if 'baseline_image' not in request.files:
            return jsonify({'error': 'Baseline image is required'}), 400
        
        if 'current_image' not in request.files:
            return jsonify({'error': 'Current image is required'}), 400
        
        baseline_file = request.files['baseline_image']
        current_file = request.files['current_image']
        
        # Validate files
        if baseline_file.filename == '' or current_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Read image bytes
        baseline_bytes = baseline_file.read()
        current_bytes = current_file.read()
        
        # Validate image data
        validate_image_bytes(baseline_bytes)
        validate_image_bytes(current_bytes)
        
        # Get optional metadata
        location = request.form.get('location', 'Unknown')
        structure_component = request.form.get('structure_component', 'Unknown')
        
        print(f"Processing comparison for: {location} - {structure_component}")
        
        # Perform comparison
        results = processor.compare_images(baseline_bytes, current_bytes)
        
        # Add metadata to results
        results['metadata'] = {
            'location': location,
            'structure_component': structure_component
        }
        
        print(f"Comparison complete: SSIM={results['ssim_score']:.4f}, Severity={results['severity']}")
        
        return jsonify(results), 200
        
    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        return jsonify({
            'error': 'Validation error',
            'message': str(ve)
        }), 400
        
    except Exception as e:
        print(f"Comparison error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': 'Comparison failed',
            'message': str(e)
        }), 500


@app.route('/api/test', methods=['GET'])
def test():
    """
    Test endpoint to verify service is running
    GET /api/test
    """
    return jsonify({
        'message': 'Python Image Comparison Service is running',
        'opencv_version': __import__('cv2').__version__,
        'numpy_version': __import__('numpy').__version__,
    }), 200


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({
        'error': 'File too large',
        'message': f'Maximum file size is {app.config["MAX_CONTENT_LENGTH"]} bytes'
    }), 413


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': str(e)
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"🐍 Starting Python Image Comparison Service")
    print(f"📊 Port: {port}")
    print(f"🔧 Debug: {debug}")
    print(f"📏 Max file size: {app.config['MAX_CONTENT_LENGTH']} bytes")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=False  # Disable reloader to prevent process issues
    )
