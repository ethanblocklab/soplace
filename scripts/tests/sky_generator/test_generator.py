"""
Tests for the sky generator module.
"""

import pytest
from PIL import Image
from sky_generator import generate_isometric_sky_no_clouds

def test_generate_isometric_sky_no_clouds():
    """Test the basic sky generation functionality."""
    # Generate a small test image
    width, height = 100, 100
    image = generate_isometric_sky_no_clouds(width=width, height=height)
    
    # Check image properties
    assert isinstance(image, Image.Image)
    assert image.size == (width, height)
    assert image.mode == "RGB"
    
    # Check that the image has the expected gradient
    top_pixel = image.getpixel((0, 0))
    bottom_pixel = image.getpixel((0, height-1))
    
    # Default colors are #87CEEB (top) and #4682B4 (bottom)
    assert top_pixel == (135, 206, 235)  # RGB for #87CEEB
    assert bottom_pixel == (70, 130, 180)  # RGB for #4682B4 