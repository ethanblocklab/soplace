"""
Sky generator module for creating isometric sky backgrounds.
This module provides functionality to generate pixel art sky backgrounds
suitable for isometric games.
"""

from PIL import Image, ImageDraw

def generate_isometric_sky_no_clouds(width=1024, height=768, top_color="#87CEEB", bottom_color="#4682B4"):
    """
    Generates a pixel art sky background without clouds for an isometric game.

    Args:
        width (int): Width of the image in pixels.
        height (int): Height of the image in pixels.
        top_color (str): Hex color code for the top of the gradient.
        bottom_color (str): Hex color code for the bottom of the gradient.

    Returns:
        Image.Image: PIL Image object representing the generated sky.
    """

    # Convert hex colors to RGB
    top_rgb = tuple(int(top_color[i:i+2], 16) for i in (1, 3, 5))
    bottom_rgb = tuple(int(bottom_color[i:i+2], 16) for i in (1, 3, 5))

    # Create a new image
    image = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(image)

    # Generate gradient
    for y in range(height):
        r = int(top_rgb[0] + (bottom_rgb[0] - top_rgb[0]) * y / height)
        g = int(top_rgb[1] + (bottom_rgb[1] - top_rgb[1]) * y / height)
        b = int(top_rgb[2] + (bottom_rgb[2] - top_rgb[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    return image 