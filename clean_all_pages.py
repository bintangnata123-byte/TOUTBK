import cv2
import pymupdf
import numpy as np
import os
import glob

def clean_watermark(bgr_img):
    h, w = bgr_img.shape[:2]
    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    b, g, r = cv2.split(bgr_img)
    
    # 1. Dark text, formulas, equations, borders, lines
    is_dark = (gray < 145)
    
    # 2. Orange/amber table headers (like P, Q or Pernyataan)
    is_orange = (r > 175) & (g > 95) & (b < 100)
    
    # 3. Graph lines / diagram lines (blue/cyan/green)
    is_graph_line = (b > 110) & (r < 110) & (g < 160)
    
    # Create pure white background
    cleaned = np.full_like(bgr_img, 255)
    cleaned[is_dark] = bgr_img[is_dark]
    cleaned[is_orange] = bgr_img[is_orange]
    cleaned[is_graph_line] = bgr_img[is_graph_line]
    
    # 4. Remove top edulab header banner (y: 0 to 140)
    cleaned[0:140, :] = 255
    
    # 5. Remove bottom confidential footer (y: 2090 to 2262)
    cleaned[2090:h, :] = 255
    
    return cleaned

subtests = {
    'PU': 'Sumber Soal/TPS 4 PU.pdf',
    'PPU': 'Sumber Soal/TPS 4 PPU.pdf',
    'PBM': 'Sumber Soal/TPS 4 PBM.pdf',
    'PK': 'Sumber Soal/TPS 4 PK.pdf',
    'LID': 'Sumber Soal/TPS 4 LID.pdf',
    'LIG': 'Sumber Soal/TPS 4 LIG.pdf',
    'PM': 'Sumber Soal/TPS 4 PM.pdf',
}

out_dir = 'cbt-utbk/public/clean_pages'
os.makedirs(out_dir, exist_ok=True)

for name, pdf_path in subtests.items():
    doc = pymupdf.open(pdf_path)
    print(f'Processing {name} ({len(doc)} pages)...')
    for p_idx in range(len(doc)):
        p = doc[p_idx]
        pix = p.get_pixmap(dpi=72)
        arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        clean = clean_watermark(bgr)
        out_path = f'{out_dir}/{name}_p{p_idx}.png'
        cv2.imwrite(out_path, clean)
    print(f'Done {name}')

print('All 102 pages cleaned and saved to', out_dir)
