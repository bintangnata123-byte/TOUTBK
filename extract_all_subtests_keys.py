import subprocess
import json
import re
import os

files = {
    'PU': (7, 17, 30),
    'PPU': (4, 8, 20),
    'PBM': (5, 19, 20),
    'PK': (3, 14, 20),
    'LID': (12, 20, 30),
    'LIG': (6, 12, 20),
    'PM': (4, 12, 20),
}

def get_ocr(img_path):
    cmd = ['powershell', '-ExecutionPolicy', 'Bypass', '-File', 'ocr_tool.ps1', '-ImagePath', img_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and res.stdout.strip().startswith('{'):
        return json.loads(res.stdout)
    return None

all_keys = {}

for sub, (start_p, end_p, total_q) in files.items():
    print(f'=== Extracting keys for {sub} ===')
    sub_keys = {}
    for p in range(start_p, end_p):
        path = f'cbt-utbk/public/clean_pages/{sub}_p{p}.png'
        data = get_ocr(path)
        if not data:
            continue
            
        num_words = []
        kunci_words = []
        
        for line in data['lines']:
            words = line['words']
            for i, w in enumerate(words):
                # match number
                m = re.match(r'^(\d{1,2})\.?$', w['text'])
                if m:
                    n = int(m.group(1))
                    if 1 <= n <= total_q:
                        num_words.append((n, w['x'], w['y']))
                
                # match Kunci: or Jawaban:
                if re.match(r'^(?:Kunci|Jawaban):?$', w['text'], re.IGNORECASE):
                    key_val = ''
                    # if key is attached or in next word
                    if ':' in w['text'] and len(w['text']) > 6:
                        key_val = w['text'].split(':', 1)[1].strip()
                    elif i + 1 < len(words):
                        # check next words (could be 'B-S-S-B-S' or 'A' or '2')
                        key_val = words[i+1]['text'].strip()
                        # if next word is just colon ':' check word after that
                        if key_val == ':' and i + 2 < len(words):
                            key_val = words[i+2]['text'].strip()
                    if key_val:
                        # Clean punctuation
                        clean_key = re.sub(r'^[^\w\-]+|[^\w\-]+$', '', key_val)
                        if clean_key:
                            kunci_words.append((clean_key, w['x'], w['y']))
        
        # Match each question number to closest Kunci on the right within y distance < 45
        for num, nx, ny in num_words:
            best_k = None
            best_dist = 999
            for key, kx, ky in kunci_words:
                # Kunci should be to the right of number (kx > nx - 20) and not across columns (kx - nx < 300)
                if -20 <= (kx - nx) <= 350:
                    dist = abs(ny - ky)
                    if dist < 45 and dist < best_dist:
                        best_dist = dist
                        best_k = key
            if best_k and num not in sub_keys:
                sub_keys[num] = best_k
                
    all_keys[sub] = sub_keys
    print(f'{sub} extracted {len(sub_keys)} / {total_q} keys:', sorted(sub_keys.items()))

os.makedirs('cbt-utbk/src/data', exist_ok=True)
with open('cbt-utbk/src/data/answer_keys.json', 'w') as f:
    json.dump(all_keys, f, indent=2)

print('Saved all keys to cbt-utbk/src/data/answer_keys.json')
