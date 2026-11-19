export const SUBTESTS = [
  {
    id: 'PU',
    name: 'Penalaran Umum (PU)',
    shortName: 'PU',
    duration: 30 * 60, // 30 menit
    totalQuestions: 30,
    category: 'Tes Potensi Skolastik (TPS)',
    pembahasanPages: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    description: 'Menguji kemampuan peserta untuk memecahkan masalah baru yang belum pernah dihadapi sebelumnya secara logis, analitis, dan induktif/deduktif.'
  },
  {
    id: 'PPU',
    name: 'Pengetahuan dan Pemahaman Umum (PPU)',
    shortName: 'PPU',
    duration: 15 * 60, // 15 menit
    totalQuestions: 20,
    category: 'Tes Potensi Skolastik (TPS)',
    pembahasanPages: [4, 5, 6, 7],
    description: 'Menguji kedalaman pemahaman kosakata, makna kata, konotasi, struktur kalimat, serta wawasan umum berbahasa.'
  },
  {
    id: 'PBM',
    name: 'Pemahaman Bacaan dan Menulis (PBM)',
    shortName: 'PBM',
    duration: 25 * 60, // 25 menit
    totalQuestions: 20,
    category: 'Tes Potensi Skolastik (TPS)',
    pembahasanPages: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    description: 'Menguji kemampuan membaca kritis, memahami ide pokok paragraf, sintaksis, ejaan, konjungsi, dan kaidah penulisan bahasa Indonesia.'
  },
  {
    id: 'PK',
    name: 'Pengetahuan Kuantitatif (PK)',
    shortName: 'PK',
    duration: 20 * 60, // 20 menit
    totalQuestions: 20,
    category: 'Tes Potensi Skolastik (TPS)',
    pembahasanPages: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    description: 'Menguji pengetahuan dasar matematika, logika numerik, perhitungan matematis, aljabar, dan geometri.'
  },
  {
    id: 'LID',
    name: 'Literasi dalam Bahasa Indonesia',
    shortName: 'Literasi Indo',
    duration: Math.round(42.5 * 60), // 42,5 menit (2550 detik)
    totalQuestions: 30,
    category: 'Tes Literasi',
    pembahasanPages: [12, 13, 14, 15, 16, 17, 18, 19],
    description: 'Menguji kemampuan memahami esensi teks wacana, mengevaluasi fakta versus opini, menganalisis argumen, dan merefleksikan makna bacaan.'
  },
  {
    id: 'LIG',
    name: 'Literasi dalam Bahasa Inggris',
    shortName: 'Literasi Inggris',
    duration: 20 * 60, // 20 menit
    totalQuestions: 20,
    category: 'Tes Literasi',
    pembahasanPages: [6, 7, 8, 9, 10, 11],
    description: 'Menguji pemahaman teks wacana akademis dan populer berbahasa Inggris, menarik kesimpulan (inferencing), dan menangkap gagasan pokok.'
  },
  {
    id: 'PM',
    name: 'Penalaran Matematika',
    shortName: 'Penalaran MTK',
    duration: Math.round(42.5 * 60), // 42,5 menit (2550 detik)
    totalQuestions: 20,
    category: 'Tes Penalaran',
    pembahasanPages: [4, 5, 6, 7, 8, 9, 10, 11],
    description: 'Menguji kemampuan menyelesaikan masalah matematika dalam konteks kehidupan nyata sehari-hari (pemodelan, statistika, interpretasi grafik).'
  }
];

export const TOTAL_EXAM_QUESTIONS = SUBTESTS.reduce((acc, s) => acc + s.totalQuestions, 0);
export const TOTAL_EXAM_DURATION_MINUTES = SUBTESTS.reduce((acc, s) => acc + s.duration, 0) / 60;
