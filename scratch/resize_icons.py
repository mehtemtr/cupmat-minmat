import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Attempting to install it...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def main():
    src_path = "public/logo_s_clean.png"
    if not os.path.exists(src_path):
        src_path = "public/statmatik_logo_final.png"
        
    if not os.path.exists(src_path):
        print(f"Error: Source logo not found.")
        sys.exit(1)
        
    print(f"Using source logo: {src_path}")
    
    img = Image.open(src_path)
    print(f"Original size: {img.size}")
    
    # Generate icon.png (512x512)
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save("public/icon.png", "PNG")
    img_512.save("public/icon-512.png", "PNG")
    print("Saved public/icon.png and public/icon-512.png")
    
    # Generate icon-192.png (192x192)
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save("public/icon-192.png", "PNG")
    print("Saved public/icon-192.png")

if __name__ == "__main__":
    main()
