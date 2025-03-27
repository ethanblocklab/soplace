"""
Example usage of the sky generator module.
"""

from sky_generator import generate_isometric_sky_no_clouds

def main():
    # Generate a default sky
    sky_image = generate_isometric_sky_no_clouds()
    
    # Save the image
    sky_image.save("isometric_sky_no_clouds.png")
    
    # Display the image
    sky_image.show()
    
    # Generate a custom sky with different colors
    custom_sky = generate_isometric_sky_no_clouds(
        width=800,
        height=600,
        top_color="#00BFFF",  # Deep sky blue
        bottom_color="#000080"  # Navy blue
    )
    custom_sky.save("custom_sky.png")
    custom_sky.show()

if __name__ == "__main__":
    main() 