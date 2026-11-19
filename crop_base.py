import cv2
import numpy as np
import json
import os

with open('cbt-utbk/src/data/answer_keys.json', 'r', encoding='utf-8') as f:
    answer_keys = json.load(f)

out_dir = 'cbt-utbk/public/questions'
os.makedirs(out_dir, exist_ok=True)

def load_page(sub, p):
    path = f'cbt-utbk/public/clean_pages/{sub}_p{p}.png'
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Page image not found: {path}")
    return img

def crop_box(img, y1, y2, x1, x2):
    h, w = img.shape[:2]
    y1 = max(0, min(h - 1, int(y1)))
    y2 = max(y1 + 10, min(h, int(y2)))
    x1 = max(0, min(w - 1, int(x1)))
    x2 = max(x1 + 10, min(w, int(x2)))
    return img[y1:y2, x1:x2]

def trim_white_safe(img, tol=245, pad_x=25, pad_y=20):
    if img is None or img.size == 0:
        return img
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    dark_mask = gray < tol
    if not np.any(dark_mask):
        return img
    y_indices, x_indices = np.where(dark_mask)
    y_min, y_max = np.min(y_indices), np.max(y_indices)
    x_min, x_max = np.min(x_indices), np.max(x_indices)
    h, w = img.shape[:2]
    y_min = max(0, y_min - pad_y)
    y_max = min(h, y_max + pad_y)
    x_min = max(0, x_min - pad_x)
    x_max = min(w, x_max + pad_x)
    return img[y_min:y_max, x_min:x_max]

def build_crop(segments, sub):
    crops = []
    for seg in segments:
        p = seg['page']
        y1, y2 = seg['y1'], seg['y2']
        full_width = seg.get('full_width', True)
        col = seg.get('col', 1)
        
        img = load_page(sub, p)
        if full_width:
            x1, x2 = 50, 1550
        else:
            if col == 1:
                x1, x2 = 50, 800
            else:
                x1, x2 = 795, 1550
                
        c = crop_box(img, y1, y2, x1, x2)
        c = trim_white_safe(c, pad_x=15, pad_y=10)
        crops.append(c)
        
    if len(crops) == 1:
        return trim_white_safe(crops[0], pad_x=20, pad_y=15)
        
    max_w = max(c.shape[1] for c in crops)
    padded = []
    for c in crops:
        ch, cw = c.shape[:2]
        if cw < max_w:
            pad_right = np.full((ch, max_w - cw, 3), 255, dtype=np.uint8)
            c = np.hstack([c, pad_right])
        padded.append(c)
        
    divider = np.full((15, max_w, 3), 255, dtype=np.uint8)
    all_pieces = []
    for i, c in enumerate(padded):
        if i > 0:
            all_pieces.append(divider)
        all_pieces.append(c)
        
    stitched = np.vstack(all_pieces)
    return trim_white_safe(stitched, pad_x=20, pad_y=15)
