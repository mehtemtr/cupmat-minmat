import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def main():
    # 1. Paths
    workspace_dir = r"d:\2026 dünya"
    public_dir = os.path.join(workspace_dir, "public")
    logo_path = os.path.join(public_dir, "logo_s_clean.png")
    output_path = os.path.join(public_dir, "statmatik_logo_final.png")

    # Scratch font paths
    scratch_dir = os.path.join(workspace_dir, "scratch")
    os.makedirs(scratch_dir, exist_ok=True)
    font_bold_path = os.path.join(scratch_dir, "Montserrat-Bold.ttf")
    font_medium_path = os.path.join(scratch_dir, "Montserrat-Medium.ttf")

    # 2. Download Montserrat font if not exists
    if not os.path.exists(font_bold_path):
        print("Montserrat-Bold.ttf indiriliyor...")
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/Montserrat-Bold.ttf",
            font_bold_path
        )
    if not os.path.exists(font_medium_path):
        print("Montserrat-Medium.ttf indiriliyor...")
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/JulietaUla/Montserrat/master/fonts/ttf/Montserrat-Medium.ttf",
            font_medium_path
        )

    # 3. Load Logo and Crop Transparent Borders
    if not os.path.exists(logo_path):
        print(f"Hata: Logo dosyası bulunamadı: {logo_path}")
        return

    img_s = Image.open(logo_path).convert("RGBA")
    bbox = img_s.getbbox() # crops transparent edges
    if bbox:
        img_s = img_s.crop(bbox)
        print("Logo kenar boşlukları kırpıldı.")

    # 4. Create a 1024x1024 blank canvas with #0a1220 background
    size = 1024
    canvas = Image.new("RGBA", (size, size), (10, 18, 32, 255)) # #0a1220
    draw = ImageDraw.Draw(canvas)

    # 5. Measure and setup font sizes
    # We want text width to match the logo width
    target_width = 660  # Width of the logo and text in pixels

    # Find the exact font size for "StatMatik" that makes its width match target_width
    font_size = 40
    font_bold = ImageFont.truetype(font_bold_path, font_size)

    while True:
        w = draw.textlength("StatMatik", font=font_bold)
        if w >= target_width:
            break
        font_size += 1
        font_bold = ImageFont.truetype(font_bold_path, font_size)

    font_size -= 1
    font_bold = ImageFont.truetype(font_bold_path, font_size)
    main_text_width = draw.textlength("StatMatik", font=font_bold)

    # Subtext font size (40% of main text)
    sub_font_size = int(font_size * 0.40)
    font_medium = ImageFont.truetype(font_medium_path, sub_font_size)

    # Calculate S logo dimensions
    logo_width = int(main_text_width)
    target_aspect = 1.25  # Aspect ratio (slightly wide S logo)
    logo_height = int(logo_width / target_aspect)

    # Resize S logo
    img_s_resized = img_s.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

    # Spacing calculations (tight gaps)
    gap1 = 20  # Tight space between logo and main text
    gap2 = 32  # Space between StatMatik and Cupmat/Minmat

    # Draw dummy text to measure height accurately
    main_text_bbox = draw.textbbox((0, 0), "StatMatik", font=font_bold)
    main_text_height = main_text_bbox[3] - main_text_bbox[1]

    sub_text_bbox = draw.textbbox((0, 0), "Cupmat", font=font_medium)
    sub_text_height = sub_text_bbox[3] - sub_text_bbox[1]

    # Total height of composite elements
    total_height = logo_height + gap1 + main_text_height + gap2 + sub_text_height

    # Y coordinates (perfectly centered vertically)
    logo_y = (size - total_height) // 2
    main_text_y = logo_y + logo_height + gap1
    sub_text_y = main_text_y + main_text_height + gap2

    # X coordinates
    left_x = (size - logo_width) // 2
    right_x = left_x + logo_width

    # 6. Draw elements
    # Draw S logo
    canvas.alpha_composite(img_s_resized, (left_x, logo_y))

    # Draw "StatMatik" centered
    draw.text((size // 2, main_text_y), "StatMatik", font=font_bold, fill=(255, 255, 255, 255), anchor="mt")

    # Draw "Cupmat" aligned to the left edge of "StatMatik"
    draw.text((left_x, sub_text_y), "Cupmat", font=font_medium, fill=(148, 163, 184, 255), anchor="lt")

    # Draw "Minmat" aligned to the right edge of "StatMatik"
    draw.text((right_x, sub_text_y), "Minmat", font=font_medium, fill=(148, 163, 184, 255), anchor="rt")

    # Save output
    canvas_final = canvas.convert("RGB")
    canvas_final.save(output_path, "PNG")
    print(f"Logo basariyla olusturuldu ve kaydedildi: {output_path}")

if __name__ == "__main__":
    main()
