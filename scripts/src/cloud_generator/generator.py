from PIL import Image, ImageDraw

def generate_cloud_sprite_sheet(cloud_size=(64, 32), num_clouds=4, output_filename="cloud_sprites.png"):
    """
    Generates a pixel art cloud sprite sheet.

    Args:
        cloud_size (tuple): Size of each cloud (width, height).
        num_clouds (int): Number of cloud sprites to generate.
        output_filename (str): Filename to save the sprite sheet.
    """

    cloud_width, cloud_height = cloud_size
    sprite_sheet_width = cloud_width * num_clouds
    sprite_sheet_height = cloud_height

    sprite_sheet = Image.new("RGBA", (sprite_sheet_width, sprite_sheet_height), (0, 0, 0, 0))  # Transparent background

    cloud_designs = [
        [
            (16, 4), (17, 4), (18, 4), (19, 4), (20, 4), (21, 4), (22, 4), (23, 4),
            (14, 6), (15, 6), (16, 6), (17, 6), (18, 6), (19, 6), (20, 6), (21, 6), (22, 6), (23, 6), (24, 6),
            (14, 8), (15, 8), (16, 8), (17, 8), (18, 8), (19, 8), (20, 8), (21, 8), (22, 8), (23, 8), (24, 8),
            (16, 10), (17, 10), (18, 10), (19, 10), (20, 10), (21, 10), (22, 10),
            (18, 12), (19, 12), (20, 12), (21, 12), (22, 12),
            (20, 14), (21, 14),
        ],
        [
            (8, 8), (9, 8), (10, 8), (11, 8), (12, 8), (13, 8), (14, 8), (15, 8), (16, 8), (17, 8), (18, 8),
            (6, 10), (7, 10), (8, 10), (9, 10), (10, 10), (11, 10), (12, 10), (13, 10), (14, 10), (15, 10), (16, 10), (17, 10), (18, 10), (19, 10),
            (8, 12), (9, 12), (10, 12), (11, 12), (12, 12), (13, 12), (14, 12), (15, 12), (16, 12), (17, 12),
            (10, 14), (11, 14), (12, 14), (13, 14), (14, 14), (15, 14),
        ],
        [
            (4, 12), (5, 10), (6, 10), (7, 10), (8, 10), (9, 10), (10, 10), (11, 12),
            (36, 12), (37, 10), (38, 10), (39, 10), (40, 10), (41, 10), (42, 10), (43, 12),
            (6, 14), (7, 14), (8, 14), (9, 14), (10, 14), (11, 14), (38, 14), (39, 14), (40, 14), (41, 14),
            (7, 16), (8, 16), (9, 16), (10, 16), (39, 16), (40, 16),
        ],
        [
            (16, 6), (17, 6), (18, 8), (19, 8), (20, 8), (21, 6), (22, 6),
            (12, 10), (13, 10), (14, 12), (15, 12), (16, 12), (17, 12), (18, 12), (19, 12), (20, 12), (21, 12), (22, 12), (23, 10), (24, 10),
            (14, 14), (15, 14), (16, 14), (17, 14), (18, 14), (19, 14), (20, 14), (21, 14), (22, 14)
        ]
    ]

    white = (255, 255, 255, 255)
    light_gray = (220, 220, 220, 255)

    for i, design in enumerate(cloud_designs):
        for x, y in design:
            sprite_sheet.putpixel((i * cloud_width + x, y), white)
            if random.random() < 0.2:
                sprite_sheet.putpixel((i * cloud_width + x, y), light_gray)

    sprite_sheet.save(output_filename, "PNG")

import random
generate_cloud_sprite_sheet()