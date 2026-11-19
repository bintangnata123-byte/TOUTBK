import cv2
import numpy as np
import json
import os
from crop_base import build_crop, out_dir, answer_keys

# We will collect questions metadata
all_meta = {}

# =========================================================================
# 1. PU (Penalaran Umum, 30 questions)
# =========================================================================
pu_questions = {
    1: [{'page': 0, 'y1': 140, 'y2': 575}],
    2: [{'page': 0, 'y1': 575, 'y2': 915}],
    3: [{'page': 0, 'y1': 915, 'y2': 1260}],
    4: [{'page': 0, 'y1': 1260, 'y2': 1560}],
    5: [{'page': 0, 'y1': 1560, 'y2': 1940}],
    6: [{'page': 0, 'y1': 1940, 'y2': 2085}, {'page': 1, 'y1': 140, 'y2': 460}],
    7: [{'page': 1, 'y1': 460, 'y2': 840}],
    8: [{'page': 1, 'y1': 840, 'y2': 1260}],
    9: [{'page': 1, 'y1': 1260, 'y2': 1830}],
    10: [{'page': 1, 'y1': 1830, 'y2': 2085}, {'page': 2, 'y1': 140, 'y2': 460}],
    11: [{'page': 2, 'y1': 460, 'y2': 955}],
    12: [{'page': 2, 'y1': 955, 'y2': 1760}],
    13: [{'page': 2, 'y1': 1760, 'y2': 2085}, {'page': 3, 'y1': 140, 'y2': 575}],
    14: [{'page': 3, 'y1': 575, 'y2': 1455}],
    15: [{'page': 3, 'y1': 1455, 'y2': 2085}],
    16: [{'page': 4, 'y1': 140, 'y2': 840}],
    17: [{'page': 4, 'y1': 840, 'y2': 1525}],
    18: [{'page': 4, 'y1': 1525, 'y2': 2085}, {'page': 5, 'y1': 140, 'y2': 345}],
    19: [{'page': 5, 'y1': 345, 'y2': 1030}],
    20: [{'page': 5, 'y1': 1030, 'y2': 1540}],
    21: [{'page': 5, 'y1': 1540, 'y2': 2085}],
    22: [{'page': 6, 'y1': 140, 'y2': 425}],
    23: [{'page': 6, 'y1': 425, 'y2': 540}],
    24: [{'page': 6, 'y1': 540, 'y2': 730}],
    25: [{'page': 6, 'y1': 730, 'y2': 920}],
    26: [{'page': 6, 'y1': 920, 'y2': 1000}],
    27: [{'page': 6, 'y1': 1000, 'y2': 1305}],
    28: [{'page': 6, 'y1': 1305, 'y2': 1570}],
    29: [{'page': 6, 'y1': 1570, 'y2': 1835}],
    30: [{'page': 6, 'y1': 1835, 'y2': 2085}]
}
pu_stimuli = {}

# =========================================================================
# 2. PPU (Pengetahuan dan Pemahaman Umum, 20 questions)
# =========================================================================
ppu_stimuli = {
    'PPU_stim_1_5': {'segs': [{'page': 0, 'y1': 140, 'y2': 845}], 'range': (1, 5)},
    'PPU_stim_6_10': {'segs': [{'page': 1, 'y1': 140, 'y2': 1110}], 'range': (6, 10)},
    'PPU_stim_11_15': {'segs': [{'page': 2, 'y1': 420, 'y2': 990}], 'range': (11, 15)},
    'PPU_stim_16_20': {'segs': [{'page': 3, 'y1': 140, 'y2': 765}], 'range': (16, 20)}
}
ppu_questions = {
    1: [{'page': 0, 'y1': 845, 'y2': 1065}],
    2: [{'page': 0, 'y1': 1065, 'y2': 1285}],
    3: [{'page': 0, 'y1': 1285, 'y2': 1545}],
    4: [{'page': 0, 'y1': 1545, 'y2': 1765}],
    5: [{'page': 0, 'y1': 1765, 'y2': 2085}],
    6: [{'page': 1, 'y1': 1110, 'y2': 1375}],
    7: [{'page': 1, 'y1': 1375, 'y2': 1605}],
    8: [{'page': 1, 'y1': 1605, 'y2': 1835}],
    9: [{'page': 1, 'y1': 1835, 'y2': 2085}],
    10: [{'page': 2, 'y1': 140, 'y2': 420}],
    11: [{'page': 2, 'y1': 990, 'y2': 1105}],
    12: [{'page': 2, 'y1': 1105, 'y2': 1335}],
    13: [{'page': 2, 'y1': 1335, 'y2': 1560}],
    14: [{'page': 2, 'y1': 1560, 'y2': 1865}],
    15: [{'page': 2, 'y1': 1865, 'y2': 2085}],
    16: [{'page': 3, 'y1': 765, 'y2': 990}],
    17: [{'page': 3, 'y1': 990, 'y2': 1220}],
    18: [{'page': 3, 'y1': 1220, 'y2': 1635}],
    19: [{'page': 3, 'y1': 1635, 'y2': 1865}],
    20: [{'page': 3, 'y1': 1865, 'y2': 2085}]
}

# =========================================================================
# 3. PBM (Pemahaman Bacaan dan Menulis, 20 questions)
# =========================================================================
pbm_stimuli = {
    'PBM_stim_1_6': {'segs': [{'page': 0, 'y1': 140, 'y2': 850, 'full_width': True}], 'range': (1, 6)},
    'PBM_stim_7_10': {'segs': [{'page': 0, 'y1': 1940, 'y2': 2085, 'full_width': True}, {'page': 1, 'y1': 140, 'y2': 770, 'full_width': True}], 'range': (7, 10)},
    'PBM_stim_11_14': {'segs': [{'page': 2, 'y1': 140, 'y2': 800, 'full_width': True}], 'range': (11, 14)},
    'PBM_stim_15_18': {'segs': [{'page': 2, 'y1': 1865, 'y2': 2085, 'full_width': True}, {'page': 3, 'y1': 140, 'y2': 495, 'full_width': True}], 'range': (15, 18)},
    'PBM_stim_19_20': {'segs': [{'page': 3, 'y1': 1380, 'y2': 1765, 'full_width': True}], 'range': (19, 20)}
}
pbm_questions = {
    1: [{'page': 0, 'col': 1, 'y1': 855, 'y2': 1145, 'full_width': False}],
    2: [{'page': 0, 'col': 1, 'y1': 1145, 'y2': 1485, 'full_width': False}],
    3: [{'page': 0, 'col': 1, 'y1': 1485, 'y2': 1795, 'full_width': False}],
    4: [{'page': 0, 'col': 1, 'y1': 1795, 'y2': 1940, 'full_width': False}, {'page': 0, 'col': 2, 'y1': 855, 'y2': 1040, 'full_width': False}],
    5: [{'page': 0, 'col': 2, 'y1': 1040, 'y2': 1595, 'full_width': False}],
    6: [{'page': 0, 'col': 2, 'y1': 1595, 'y2': 1940, 'full_width': False}],
    7: [{'page': 1, 'col': 1, 'y1': 770, 'y2': 1045, 'full_width': False}],
    8: [{'page': 1, 'col': 1, 'y1': 1045, 'y2': 1785, 'full_width': False}],
    9: [{'page': 1, 'col': 1, 'y1': 1785, 'y2': 2085, 'full_width': False}, {'page': 1, 'col': 2, 'y1': 770, 'y2': 1430, 'full_width': False}],
    10: [{'page': 1, 'col': 2, 'y1': 1430, 'y2': 2085, 'full_width': False}],
    11: [{'page': 2, 'col': 1, 'y1': 800, 'y2': 1335, 'full_width': False}],
    12: [{'page': 2, 'col': 1, 'y1': 1335, 'y2': 1715, 'full_width': False}],
    13: [{'page': 2, 'col': 1, 'y1': 1715, 'y2': 1865, 'full_width': False}, {'page': 2, 'col': 2, 'y1': 800, 'y2': 1010, 'full_width': False}],
    14: [{'page': 2, 'col': 2, 'y1': 1010, 'y2': 1865, 'full_width': False}],
    15: [{'page': 3, 'col': 1, 'y1': 495, 'y2': 835, 'full_width': False}],
    16: [{'page': 3, 'col': 1, 'y1': 835, 'y2': 1195, 'full_width': False}],
    17: [{'page': 3, 'col': 1, 'y1': 1195, 'y2': 1380, 'full_width': False}, {'page': 3, 'col': 2, 'y1': 495, 'y2': 860, 'full_width': False}],
    18: [{'page': 3, 'col': 2, 'y1': 860, 'y2': 1380, 'full_width': False}],
    19: [{'page': 3, 'col': 1, 'y1': 1765, 'y2': 2085, 'full_width': False}, {'page': 4, 'col': 1, 'y1': 140, 'y2': 415, 'full_width': False}],
    20: [{'page': 4, 'col': 1, 'y1': 415, 'y2': 780, 'full_width': False}]
}

# =========================================================================
# 4. PK (Pengetahuan Kuantitatif, 20 questions)
# =========================================================================
pk_stimuli = {
    'PK_stim_18_19': {'segs': [{'page': 2, 'y1': 140, 'y2': 1250, 'full_width': True}], 'range': (18, 19)}
}
pk_questions = {
    1: [{'page': 0, 'col': 1, 'y1': 140, 'y2': 520, 'full_width': False}],
    2: [{'page': 0, 'col': 1, 'y1': 520, 'y2': 735, 'full_width': False}],
    3: [{'page': 0, 'col': 1, 'y1': 735, 'y2': 1070, 'full_width': False}],
    4: [{'page': 0, 'col': 1, 'y1': 1070, 'y2': 1430, 'full_width': False}],
    5: [{'page': 0, 'col': 1, 'y1': 1430, 'y2': 1770, 'full_width': False}],
    6: [{'page': 0, 'col': 1, 'y1': 1770, 'y2': 2085, 'full_width': False}],
    7: [{'page': 0, 'col': 2, 'y1': 140, 'y2': 460, 'full_width': False}],
    8: [{'page': 0, 'col': 2, 'y1': 460, 'y2': 1200, 'full_width': False}],
    9: [{'page': 0, 'col': 2, 'y1': 1200, 'y2': 1550, 'full_width': False}],
    10: [{'page': 0, 'col': 2, 'y1': 1550, 'y2': 2085, 'full_width': False}],
    11: [{'page': 1, 'col': 1, 'y1': 140, 'y2': 510, 'full_width': False}],
    12: [{'page': 1, 'col': 1, 'y1': 510, 'y2': 905, 'full_width': False}],
    13: [{'page': 1, 'col': 1, 'y1': 905, 'y2': 1545, 'full_width': False}],
    14: [{'page': 1, 'col': 1, 'y1': 1545, 'y2': 2085, 'full_width': False}, {'page': 1, 'col': 2, 'y1': 140, 'y2': 465, 'full_width': False}],
    15: [{'page': 1, 'col': 2, 'y1': 465, 'y2': 685, 'full_width': False}], # Real Q15 DUNIA!
    16: [{'page': 1, 'col': 2, 'y1': 685, 'y2': 1425, 'full_width': False}],
    17: [{'page': 1, 'col': 2, 'y1': 1425, 'y2': 2085, 'full_width': False}],
    18: [{'page': 2, 'y1': 1250, 'y2': 1470, 'full_width': True}], # Full width!
    19: [{'page': 2, 'y1': 1470, 'y2': 1680, 'full_width': True}], # Full width!
    20: [{'page': 2, 'y1': 1680, 'y2': 2085, 'full_width': True}]  # Full width! Complete with P/Q table!
}

# =========================================================================
# 5. LID (Literasi dalam Bahasa Indonesia, 30 questions)
# =========================================================================
lid_stimuli = {
    'LID_stim_1_5': {'segs': [{'page': 0, 'y1': 140, 'y2': 1700}], 'range': (1, 5)},
    'LID_stim_6_12': {'segs': [{'page': 1, 'y1': 1640, 'y2': 2085}, {'page': 2, 'y1': 140, 'y2': 1445}], 'range': (6, 12)},
    'LID_stim_13_17': {'segs': [{'page': 4, 'y1': 1100, 'y2': 2085}, {'page': 5, 'y1': 140, 'y2': 620}], 'range': (13, 17)},
    'LID_stim_18_21': {'segs': [{'page': 6, 'y1': 720, 'y2': 2085}, {'page': 7, 'y1': 140, 'y2': 830}], 'range': (18, 21)},
    'LID_stim_22_25': {'segs': [{'page': 8, 'y1': 380, 'y2': 2085}, {'page': 9, 'y1': 140, 'y2': 300}], 'range': (22, 25)},
    'LID_stim_26_30': {'segs': [{'page': 9, 'y1': 1680, 'y2': 2085}, {'page': 10, 'y1': 140, 'y2': 1520}], 'range': (26, 30)}
}
lid_questions = {
    1: [{'page': 0, 'y1': 1700, 'y2': 1895}],
    2: [{'page': 0, 'y1': 1895, 'y2': 2085}, {'page': 1, 'y1': 140, 'y2': 535}],
    3: [{'page': 1, 'y1': 535, 'y2': 840}],
    4: [{'page': 1, 'y1': 840, 'y2': 1295}],
    5: [{'page': 1, 'y1': 1295, 'y2': 1640}],
    6: [{'page': 2, 'y1': 1445, 'y2': 1945}],
    7: [{'page': 2, 'y1': 1945, 'y2': 2085}, {'page': 3, 'y1': 140, 'y2': 525}],
    8: [{'page': 3, 'y1': 525, 'y2': 945}],
    9: [{'page': 3, 'y1': 945, 'y2': 1330}],
    10: [{'page': 3, 'y1': 1330, 'y2': 1860}],
    11: [{'page': 3, 'y1': 1860, 'y2': 2085}, {'page': 4, 'y1': 140, 'y2': 755}],
    12: [{'page': 4, 'y1': 755, 'y2': 1100}],
    13: [{'page': 5, 'y1': 620, 'y2': 930}],
    14: [{'page': 5, 'y1': 930, 'y2': 1345}],
    15: [{'page': 5, 'y1': 1345, 'y2': 1840}],
    16: [{'page': 5, 'y1': 1840, 'y2': 2085}, {'page': 6, 'y1': 140, 'y2': 335}],
    17: [{'page': 6, 'y1': 335, 'y2': 720}],
    18: [{'page': 7, 'y1': 830, 'y2': 1140}],
    19: [{'page': 7, 'y1': 1140, 'y2': 1635}],
    20: [{'page': 7, 'y1': 1635, 'y2': 1940}],
    21: [{'page': 7, 'y1': 1940, 'y2': 2085}, {'page': 8, 'y1': 140, 'y2': 375}],
    22: [{'page': 9, 'y1': 300, 'y2': 730}],
    23: [{'page': 9, 'y1': 730, 'y2': 1070}],
    24: [{'page': 9, 'y1': 1070, 'y2': 1375}],
    25: [{'page': 9, 'y1': 1375, 'y2': 1680}],
    26: [{'page': 10, 'y1': 1520, 'y2': 2085}],
    27: [{'page': 11, 'y1': 140, 'y2': 605}],
    28: [{'page': 11, 'y1': 605, 'y2': 910}],
    29: [{'page': 11, 'y1': 910, 'y2': 1215}],
    30: [{'page': 11, 'y1': 1215, 'y2': 2085}]
}

# =========================================================================
# 6. LIG (Literasi dalam Bahasa Inggris, 20 questions)
# =========================================================================
lig_stimuli = {
    'LIG_stim_1_5': {'segs': [{'page': 0, 'y1': 140, 'y2': 1085}], 'range': (1, 5)},
    'LIG_stim_6_11': {'segs': [{'page': 1, 'y1': 760, 'y2': 1760}], 'range': (6, 11)},
    'LIG_stim_12_15': {'segs': [{'page': 2, 'y1': 1400, 'y2': 2085}, {'page': 3, 'y1': 140, 'y2': 1435}], 'range': (12, 15)},
    'LIG_stim_16_20': {'segs': [{'page': 4, 'y1': 760, 'y2': 1585}], 'range': (16, 20)}
}
lig_questions = {
    1: [{'page': 0, 'y1': 1085, 'y2': 1390}],
    2: [{'page': 0, 'y1': 1390, 'y2': 1695}],
    3: [{'page': 0, 'y1': 1695, 'y2': 2000}],
    4: [{'page': 0, 'y1': 2000, 'y2': 2085}, {'page': 1, 'y1': 140, 'y2': 460}],
    5: [{'page': 1, 'y1': 460, 'y2': 760}],
    6: [{'page': 1, 'y1': 1760, 'y2': 2085}],
    7: [{'page': 2, 'y1': 140, 'y2': 390}],
    8: [{'page': 2, 'y1': 390, 'y2': 620}],
    9: [{'page': 2, 'y1': 620, 'y2': 850}],
    10: [{'page': 2, 'y1': 850, 'y2': 1150}],
    11: [{'page': 2, 'y1': 1150, 'y2': 1380}],
    12: [{'page': 3, 'y1': 1435, 'y2': 1745}],
    13: [{'page': 3, 'y1': 1745, 'y2': 2085}],
    14: [{'page': 4, 'y1': 140, 'y2': 450}],
    15: [{'page': 4, 'y1': 450, 'y2': 760}],
    16: [{'page': 4, 'y1': 1585, 'y2': 1895}],
    17: [{'page': 4, 'y1': 1895, 'y2': 2085}, {'page': 5, 'y1': 140, 'y2': 335}],
    18: [{'page': 5, 'y1': 335, 'y2': 640}],
    19: [{'page': 5, 'y1': 640, 'y2': 945}],
    20: [{'page': 5, 'y1': 945, 'y2': 2085}]
}

# =========================================================================
# 7. PM (Penalaran Matematika, 20 questions)
# =========================================================================
pm_stimuli = {
    'PM_stim_1_4': {'segs': [{'page': 0, 'col': 1, 'y1': 140, 'y2': 685, 'full_width': False}], 'range': (1, 4)},
    'PM_stim_5_8': {'segs': [{'page': 0, 'col': 2, 'y1': 1100, 'y2': 1370, 'full_width': False}], 'range': (5, 8)},
    'PM_stim_9_12': {'segs': [{'page': 1, 'y1': 640, 'y2': 1305, 'full_width': True}], 'range': (9, 12)}, # full width table!
    'PM_stim_13_16': {'segs': [{'page': 2, 'col': 1, 'y1': 830, 'y2': 1530, 'full_width': False}], 'range': (13, 16)},
    'PM_stim_17_20': {'segs': [{'page': 2, 'col': 2, 'y1': 1370, 'y2': 2085, 'full_width': False}, {'page': 3, 'col': 1, 'y1': 140, 'y2': 380, 'full_width': False}], 'range': (17, 20)}
}
pm_questions = {
    1: [{'page': 0, 'col': 1, 'y1': 685, 'y2': 1255, 'full_width': False}],
    2: [{'page': 0, 'col': 1, 'y1': 1255, 'y2': 1750, 'full_width': False}],
    3: [{'page': 0, 'col': 1, 'y1': 1750, 'y2': 2085, 'full_width': False}, {'page': 0, 'col': 2, 'y1': 140, 'y2': 335, 'full_width': False}],
    4: [{'page': 0, 'col': 2, 'y1': 335, 'y2': 1100, 'full_width': False}],
    5: [{'page': 0, 'col': 2, 'y1': 1370, 'y2': 1490, 'full_width': False}],
    6: [{'page': 0, 'col': 2, 'y1': 1490, 'y2': 1795, 'full_width': False}],
    7: [{'page': 0, 'col': 2, 'y1': 1795, 'y2': 2085, 'full_width': False}, {'page': 1, 'col': 1, 'y1': 140, 'y2': 600, 'full_width': False}],
    8: [{'page': 1, 'col': 2, 'y1': 140, 'y2': 620, 'full_width': False}],
    9: [{'page': 1, 'col': 1, 'y1': 1305, 'y2': 1650, 'full_width': False}],
    10: [{'page': 1, 'col': 1, 'y1': 1650, 'y2': 2085, 'full_width': False}],
    11: [{'page': 1, 'col': 2, 'y1': 1570, 'y2': 2085, 'full_width': False}],
    12: [{'page': 2, 'col': 1, 'y1': 140, 'y2': 830, 'full_width': False}],
    13: [{'page': 2, 'col': 1, 'y1': 1530, 'y2': 1685, 'full_width': False}],
    14: [{'page': 2, 'col': 1, 'y1': 1685, 'y2': 2085, 'full_width': False}],
    15: [{'page': 2, 'col': 2, 'y1': 140, 'y2': 565, 'full_width': False}],
    16: [{'page': 2, 'col': 2, 'y1': 565, 'y2': 1370, 'full_width': False}],
    17: [{'page': 3, 'col': 1, 'y1': 380, 'y2': 760, 'full_width': False}],
    18: [{'page': 3, 'col': 1, 'y1': 760, 'y2': 1085, 'full_width': False}],
    19: [{'page': 3, 'col': 1, 'y1': 1085, 'y2': 2085, 'full_width': False}, {'page': 3, 'col': 2, 'y1': 140, 'y2': 525, 'full_width': False}],
    20: [{'page': 3, 'col': 2, 'y1': 525, 'y2': 2085, 'full_width': False}]
}

table_definitions = {
    ('PU', 12): {
        'columns': ['Didukung', 'Tidak Didukung'],
        'rowCount': 5,
        'key': ['Tidak Didukung', 'Didukung', 'Didukung', 'Didukung', 'Tidak Didukung'],
        'short_key': 'TD-D-D-D-TD'
    },
    ('PU', 14): {
        'columns': ['Memperlemah', 'Tidak Memperlemah'],
        'rowCount': 5,
        'key': ['Tidak Memperlemah', 'Memperlemah', 'Tidak Memperlemah', 'Memperlemah', 'Tidak Memperlemah'],
        'short_key': 'TM-M-TM-M-TM'
    },
    ('PK', 10): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 3,
        'key': ['Benar', 'Salah', 'Salah'],
        'short_key': 'B-S-S'
    },
    ('PK', 16): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 3,
        'key': ['Benar', 'Benar', 'Benar'],
        'short_key': 'B-B-B'
    },
    ('LID', 2): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 5,
        'key': ['Benar', 'Salah', 'Salah', 'Benar', 'Salah'],
        'short_key': 'B-S-S-B-S'
    },
    ('LID', 22): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 4,
        'key': ['Benar', 'Salah', 'Salah', 'Salah'],
        'short_key': 'B-S-S-S'
    },
    ('PM', 7): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 3,
        'key': ['Benar', 'Salah', 'Salah'],
        'short_key': 'B-S-S'
    },
    ('PM', 16): {
        'columns': ['Benar', 'Salah'],
        'rowCount': 3,
        'key': ['Benar', 'Benar', 'Benar'],
        'short_key': 'B-B-B'
    }
}

if __name__ == '__main__':
    subtests_all = [
        ('PU', pu_questions, pu_stimuli),
        ('PPU', ppu_questions, ppu_stimuli),
        ('PBM', pbm_questions, pbm_stimuli),
        ('PK', pk_questions, pk_stimuli),
        ('LID', lid_questions, lid_stimuli),
        ('LIG', lig_questions, lig_stimuli),
        ('PM', pm_questions, pm_stimuli),
    ]

    for sub, q_dict, s_dict in subtests_all:
        print(f"=== Cropping {sub} ===")
        
        # 1. Crop and save stimuli
        stim_map = {}
        for s_id, s_data in s_dict.items():
            crop = build_crop(s_data['segs'], sub)
            filename = f"{s_id}.png"
            cv2.imwrite(f"{out_dir}/{filename}", crop)
            stim_map[s_id] = {
                'file': f"/questions/{filename}",
                'range': s_data['range']
            }
            print(f"  Stimulus {s_id}: shape={crop.shape}")

        # 2. Crop and save questions
        q_list = []
        for num, segs in sorted(q_dict.items()):
            crop = build_crop(segs, sub)
            q_filename = f"{sub}_q{num}.png"
            cv2.imwrite(f"{out_dir}/{q_filename}", crop)
            
            # Determine question type and key
            t_key = (sub, num)
            table_cfg = None
            short_key = None
            if t_key in table_definitions:
                q_type = 'complex_table'
                c = table_definitions[t_key]
                key = c['key']
                short_key = c['short_key']
                opts = c['columns']
                table_cfg = {
                    'columns': c['columns'],
                    'rowCount': c['rowCount'],
                    'statementLabels': [f"Pernyataan {i+1}" for i in range(c['rowCount'])]
                }
            else:
                key = answer_keys.get(sub, {}).get(str(num), 'A')
                if isinstance(key, str) and key.isdigit() and sub in ['PU', 'PPU', 'PK', 'PM']:
                    q_type = 'short_answer'
                    opts = []
                else:
                    q_type = 'multiple_choice'
                    if sub == 'PK' and num == 20:
                        opts = ['A', 'B', 'C', 'D']
                    else:
                        opts = ['A', 'B', 'C', 'D', 'E']

            # Determine stimulus
            assigned_stim = None
            for s_id, s_info in stim_map.items():
                r = s_info['range']
                if r[0] <= num <= r[1]:
                    assigned_stim = s_info['file']
                    break

            q_data = {
                'number': num,
                'image': f"/questions/{q_filename}",
                'type': q_type,
                'options': opts,
                'key': key,
                'stimulusImage': assigned_stim,
                'page': segs[0]['page'],
                'shape': [int(crop.shape[0]), int(crop.shape[1])]
            }
            if table_cfg:
                q_data['tableConfig'] = table_cfg
                q_data['short_key'] = short_key

            q_list.append(q_data)
            
        all_meta[sub] = q_list
        print(f"  Done {sub}: {len(q_list)} questions cropped.")

    # Save full meta
    with open('cbt-utbk/src/data/questions_meta.json', 'w', encoding='utf-8') as f:
        json.dump(all_meta, f, indent=2)

    print("\nAll 160 questions and stimuli generated perfectly and saved to questions_meta.json!")

