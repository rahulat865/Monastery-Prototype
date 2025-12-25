"""
Image Processing Module for Monastery Preservation
Uses OpenCV and SSIM for structural similarity comparison
Detects minute differences and generates highlighted difference images
"""

import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from io import BytesIO
from PIL import Image
import base64


class ImageProcessor:
    """
    Handles all image processing operations including:
    - Image preprocessing (resize, grayscale, blur)
    - SSIM comparison
    - Contour detection for differences
    - Difference image generation with highlighting
    """
    
    def __init__(self, target_size=(800, 600)):
        """
        Initialize processor with target image size
        
        Args:
            target_size (tuple): Target dimensions for image resizing (width, height)
        """
        self.target_size = target_size
        
    def preprocess_image(self, image_bytes):
        """
        Convert image bytes to processed OpenCV format
        
        Args:
            image_bytes (bytes): Raw image data
            
        Returns:
            tuple: (original_color, grayscale, blurred)
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            
            # Decode image
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Failed to decode image")
            
            # Resize to standard size for comparison
            img_resized = cv2.resize(img, self.target_size, interpolation=cv2.INTER_AREA)
            
            # Convert to grayscale for SSIM
            gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            return img_resized, gray, blurred
            
        except Exception as e:
            raise ValueError(f"Image preprocessing failed: {str(e)}")
    
    def compute_ssim(self, image1_gray, image2_gray):
        """
        Compute Structural Similarity Index between two grayscale images
        
        Args:
            image1_gray (np.array): First grayscale image
            image2_gray (np.array): Second grayscale image
            
        Returns:
            tuple: (ssim_score, difference_image)
        """
        try:
            # Compute SSIM with full output
            # data_range is required for newer scikit-image versions
            score, diff = ssim(image1_gray, image2_gray, full=True, data_range=255)
            
            # Convert difference image to uint8 format
            diff = (diff * 255).astype("uint8")
            
            return score, diff
            
        except Exception as e:
            raise ValueError(f"SSIM computation failed: {str(e)}")
    
    def detect_differences(self, diff_image, threshold=50):
        """
        Detect difference regions using contour detection
        
        Safely handles case where no differences are found (identical images).
        
        Args:
            diff_image (np.array): Difference image from SSIM
            threshold (int): Threshold for difference detection
            
        Returns:
            tuple: (contours, difference_percentage, affected_area)
        """
        try:
            # Threshold the difference image
            thresh = cv2.threshold(diff_image, threshold, 255, cv2.THRESH_BINARY_INV)[1]
            
            # Find contours of differences
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Safely calculate affected area (avoid division by zero)
            total_area = diff_image.shape[0] * diff_image.shape[1]
            if total_area == 0:
                return [], 0.0, 0.0
                
            affected_pixels = cv2.countNonZero(thresh)
            affected_area = (affected_pixels / total_area) * 100
            
            # Calculate difference percentage safely
            mean_val = np.mean(diff_image)
            diff_percentage = 100 - (mean_val / 255 * 100) if mean_val > 0 else 0.0
            
            # Return empty list if no contours found (valid for identical images)
            return list(contours) if contours is not None else [], float(diff_percentage), float(affected_area)
            
        except Exception as e:
            raise ValueError(f"Difference detection failed: {str(e)}")
    
    def create_highlighted_diff_image(self, original_img, contours, min_contour_area=50):
        """
        Create a highlighted difference image with contours drawn
        
        Safely handles empty contours (returns original image copy).
        
        Args:
            original_img (np.array): Original color image
            contours (list): List of detected contours (can be empty)
            min_contour_area (int): Minimum contour area to draw
            
        Returns:
            np.array: Image with highlighted differences (or clean copy if no differences)
        """
        try:
            # Safety check: ensure we have a valid image
            if original_img is None:
                raise ValueError("Original image is None")
            
            # Create a copy for drawing
            diff_highlight = original_img.copy()
            
            # If no contours, return the clean copy (valid for identical images)
            if not contours or len(contours) == 0:
                return diff_highlight
            
            # Create a mask for differences
            mask = np.zeros(original_img.shape[:2], dtype=np.uint8)
            
            # Filter significant contours (safely handle empty list)
            significant_contours = [c for c in contours if cv2.contourArea(c) > min_contour_area]
            
            # If no significant contours after filtering, return clean copy
            if not significant_contours:
                return diff_highlight
            
            for contour in significant_contours:
                # Draw filled contour on mask
                cv2.drawContours(mask, [contour], -1, 255, -1)
                
                # Draw contour outline in red
                cv2.drawContours(diff_highlight, [contour], -1, (0, 0, 255), 2)
                
                # Draw bounding rectangle in yellow
                x, y, w, h = cv2.boundingRect(contour)
                cv2.rectangle(diff_highlight, (x, y), (x + w, y + h), (0, 255, 255), 2)
            
            # Only apply overlay if mask has non-zero pixels
            if cv2.countNonZero(mask) > 0:
                # Highlight differences in semi-transparent red
                red_overlay = np.zeros_like(diff_highlight)
                red_overlay[:] = (0, 0, 255)
                
                # Apply overlay where mask is set
                alpha = 0.3
                diff_highlight[mask > 0] = cv2.addWeighted(
                    diff_highlight[mask > 0], 1 - alpha,
                    red_overlay[mask > 0], alpha, 0
                )
            
            return diff_highlight
            
        except Exception as e:
            raise ValueError(f"Highlight creation failed: {str(e)}")
    
    def determine_severity(self, ssim_score):
        """
        Determine severity level based on SSIM score
        
        Args:
            ssim_score (float): SSIM score (0 to 1)
            
        Returns:
            str: Severity level
        """
        # Handle identical images (SSIM >= 0.9999 is essentially identical)
        if ssim_score >= 0.9999:
            return "NO_CHANGE"
        elif ssim_score >= 0.95:
            return "EXCELLENT"
        elif ssim_score >= 0.85:
            return "GOOD"
        elif ssim_score >= 0.70:
            return "MODERATE"
        elif ssim_score >= 0.50:
            return "POOR"
        else:
            return "CRITICAL"
    
    def compare_images(self, baseline_bytes, current_bytes):
        """
        Main comparison function that orchestrates the entire process
        
        Safely handles identical images and returns proper response.
        
        Args:
            baseline_bytes (bytes): Baseline image data
            current_bytes (bytes): Current image data
            
        Returns:
            dict: Comparison results including score, severity, and difference image
        """
        try:
            # Preprocess both images
            baseline_color, baseline_gray, baseline_blur = self.preprocess_image(baseline_bytes)
            current_color, current_gray, current_blur = self.preprocess_image(current_bytes)
            
            # Compute SSIM
            ssim_score, diff_image = self.compute_ssim(baseline_blur, current_blur)
            
            # Detect differences (safely handles no differences)
            contours, diff_percentage, affected_area = self.detect_differences(diff_image)
            
            # Determine severity
            severity = self.determine_severity(ssim_score)
            
            # Check if images are identical
            is_identical = ssim_score >= 0.9999 or severity == "NO_CHANGE"
            
            # Create highlighted difference image (safely handles empty contours)
            diff_highlight = self.create_highlighted_diff_image(current_color, contours)
            
            # Ensure diff_highlight is valid before encoding
            if diff_highlight is None:
                diff_highlight = current_color.copy()
            
            # Convert difference image to base64 for transmission
            encode_success, buffer = cv2.imencode('.jpg', diff_highlight)
            if not encode_success:
                raise ValueError("Failed to encode difference image")
                
            diff_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Count significant contours
            significant_contour_count = len([c for c in contours if cv2.contourArea(c) > 50]) if contours else 0
            
            # Prepare results with explicit handling for identical images
            results = {
                'status': 'success',
                'ssim_score': float(ssim_score),
                'severity': severity,
                'change_detected': not is_identical,
                'difference_percentage': float(diff_percentage) if not is_identical else 0.0,
                'contour_count': significant_contour_count,
                'affected_area': float(affected_area) if not is_identical else 0.0,
                'difference_image': diff_image_base64,
                'image_dimensions': {
                    'width': self.target_size[0],
                    'height': self.target_size[1]
                },
                'structural_changes': [],  # Empty array for identical images
                'message': 'No structural change detected. Images are identical.' if is_identical 
                          else f'Structural changes detected. Severity: {severity}'
            }
            
            return results
            
        except Exception as e:
            raise Exception(f"Image comparison failed: {str(e)}")


def validate_image_bytes(image_bytes, max_size=10 * 1024 * 1024):
    """
    Validate image bytes before processing
    
    Args:
        image_bytes (bytes): Image data to validate
        max_size (int): Maximum allowed size in bytes
        
    Returns:
        bool: True if valid, raises exception otherwise
    """
    if not image_bytes:
        raise ValueError("Empty image data")
    
    if len(image_bytes) > max_size:
        raise ValueError(f"Image size exceeds maximum allowed size of {max_size} bytes")
    
    # Try to decode to verify it's a valid image
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image format")
    except Exception as e:
        raise ValueError(f"Image validation failed: {str(e)}")
    
    return True
