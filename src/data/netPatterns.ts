import { NetPattern, ShieldTheme, CargoMission } from '../types/game';

// Helper to create empty 6x6 grid
function createGrid(coords: [number, number][]): boolean[][] {
  const g = Array.from({ length: 6 }, () => Array(6).fill(false));
  coords.forEach(([r, c]) => {
    if (r >= 0 && r < 6 && c >= 0 && c < 6) {
      g[r][c] = true;
    }
  });
  return g;
}

export const NET_PATTERNS: NetPattern[] = [
  // 1. Pola 1-4-1 (Variasi Klasik Salib)
  {
    id: 'pola-141-salib',
    name: 'Pola 1-4-1 (Salib Standar)',
    patternType: '1-4-1',
    shape: 'kubus',
    isValid: true,
    explanation: 'BENAR! Pola 1-4-1 klasik. Baris tengah memiliki 4 sisi berjejer (selimut), 1 sisi di atas sebagai tutup, dan 1 sisi di bawah sebagai alas.',
    grid: createGrid([
      [1, 2],
      [2, 1], [2, 2], [2, 3], [2, 4],
      [3, 2]
    ]),
    faces: [
      { r: 2, c: 2, role: 'alas' },
      { r: 1, c: 2, role: 'depan' },
      { r: 3, c: 2, role: 'belakang' },
      { r: 2, c: 1, role: 'kiri' },
      { r: 2, c: 3, role: 'kanan' },
      { r: 2, c: 4, role: 'tutup' }
    ]
  },
  // 2. Pola 1-4-1 (Variasi Sayap Geser)
  {
    id: 'pola-141-geser',
    name: 'Pola 1-4-1 (Sayap Geser Kanan-Kiri)',
    patternType: '1-4-1',
    shape: 'kubus',
    isValid: true,
    explanation: 'BENAR! Pola 1-4-1 valid. Sisi atas berada di kolom ke-2, dan sisi bawah berada di kolom ke-4. Saat dilipat, kedua sisi saling berhadapan tanpa bertabrakan.',
    grid: createGrid([
      [1, 2],
      [2, 1], [2, 2], [2, 3], [2, 4],
      [3, 4]
    ]),
    faces: [
      { r: 2, c: 2, role: 'alas' },
      { r: 1, c: 2, role: 'depan' },
      { r: 2, c: 1, role: 'kiri' },
      { r: 2, c: 3, role: 'kanan' },
      { r: 3, c: 4, role: 'belakang' },
      { r: 2, c: 4, role: 'tutup' }
    ]
  },
  // 3. Pola 2-3-1 (Bentuk Tangga 3 Tingkat)
  {
    id: 'pola-231',
    name: 'Pola 2-3-1 (Tangga 3 Baris)',
    patternType: '2-3-1',
    shape: 'kubus',
    isValid: true,
    explanation: 'BENAR! Pola 2-3-1 valid. Terdiri dari 2 sisi di baris atas, 3 sisi di baris tengah, dan 1 sisi di baris bawah. Lipatan menutup sempurna membentuk 6 sisi kubus.',
    grid: createGrid([
      [1, 1], [1, 2],
      [2, 2], [2, 3], [2, 4],
      [3, 3]
    ]),
    faces: [
      { r: 2, c: 2, role: 'alas' },
      { r: 1, c: 2, role: 'depan' },
      { r: 1, c: 1, role: 'tutup' },
      { r: 2, c: 3, role: 'kanan' },
      { r: 2, c: 4, role: 'belakang' },
      { r: 3, c: 3, role: 'kiri' }
    ]
  },
  // 4. Pola 2-2-2 (Bentuk Tangga Berjenjang)
  {
    id: 'pola-222',
    name: 'Pola 2-2-2 (Tangga Zig-Zag)',
    patternType: '2-2-2',
    shape: 'kubus',
    isValid: true,
    explanation: 'BENAR! Pola 2-2-2 yang unik. Tiga pasang persegi bergeser seperti anak tangga. Saat dilipat bertahap, semua sisi akan bertemu di sudut-sudutnya.',
    grid: createGrid([
      [1, 1], [1, 2],
      [2, 2], [2, 3],
      [3, 3], [3, 4]
    ]),
    faces: [
      { r: 2, c: 2, role: 'alas' },
      { r: 1, c: 2, role: 'depan' },
      { r: 1, c: 1, role: 'kiri' },
      { r: 2, c: 3, role: 'kanan' },
      { r: 3, c: 3, role: 'belakang' },
      { r: 3, c: 4, role: 'tutup' }
    ]
  },
  // 5. Pola 3-3 (Bentuk Garis Ganda / Z)
  {
    id: 'pola-33',
    name: 'Pola 3-3 (Garis Ganda)',
    patternType: '3-3',
    shape: 'kubus',
    isValid: true,
    explanation: 'BENAR! Pola 3-3 terdiri dari 2 baris yang masing-masing memiliki 3 persegi yang bergeser tepat satu kotak. Menghasilkan kubus yang simetris saat dilipat.',
    grid: createGrid([
      [1, 1], [1, 2], [1, 3],
      [2, 3], [2, 4], [2, 5]
    ]),
    faces: [
      { r: 1, c: 2, role: 'alas' },
      { r: 1, c: 1, role: 'kiri' },
      { r: 1, c: 3, role: 'kanan' },
      { r: 2, c: 3, role: 'belakang' },
      { r: 2, c: 4, role: 'depan' },
      { r: 2, c: 5, role: 'tutup' }
    ]
  },
  // 6. Pola Jaring-jaring Balok
  {
    id: 'pola-balok-1',
    name: 'Jaring-Jaring Balok Standar',
    patternType: 'balok',
    shape: 'balok',
    isValid: true,
    explanation: 'BENAR! Jaring-jaring Balok memiliki 3 pasang sisi persegi panjang yang berukuran sama: sepasang alas & tutup, sepasang depan & belakang, dan sepasang kiri & kanan.',
    grid: createGrid([
      [1, 2],
      [2, 1], [2, 2], [2, 3], [2, 4],
      [3, 2]
    ]),
    faces: [
      { r: 2, c: 2, role: 'alas' },
      { r: 1, c: 2, role: 'depan' },
      { r: 3, c: 2, role: 'belakang' },
      { r: 2, c: 1, role: 'kiri' },
      { r: 2, c: 3, role: 'kanan' },
      { r: 2, c: 4, role: 'tutup' }
    ]
  },
  // 7. Pola Rusak / Invalid 1 (Tumpang Tindih di sisi yang sama)
  {
    id: 'pola-invalid-overlap',
    name: 'Pola Rusak: Sayap Berdampingan (Menumpuk)',
    patternType: 'invalid',
    shape: 'kubus',
    isValid: false,
    explanation: 'SALAH (INVALID)! Kedua sisi tambahan berada di sisi atas yang sama. Saat dilipat, kedua sisi ini akan SALING BERTUMPUK di sisi atas, meninggalkan sisi bawah berlubang tanpa alas!',
    grid: createGrid([
      [1, 2], [1, 3],
      [2, 1], [2, 2], [2, 3], [2, 4]
    ])
  },
  // 8. Pola Rusak / Invalid 2 (5 Persegi Berjejer)
  {
    id: 'pola-invalid-5line',
    name: 'Pola Rusak: 5 Kotak Berjejer Lurus',
    patternType: 'invalid',
    shape: 'kubus',
    isValid: false,
    explanation: 'SALAH (INVALID)! Ada 5 kotak berjejer lurus. Kubus hanya membutuhkan 4 sisi untuk mengelilingi selimut. Kotak ke-5 akan bertumpuk menimpa kotak pertama, dan sisi samping tidak tertutup!',
    grid: createGrid([
      [1, 2],
      [2, 1], [2, 2], [2, 3], [2, 4], [2, 5]
    ])
  },
  // 9. Pola Rusak / Invalid 3 (Bentuk Balok T / U Tidak Seimbang)
  {
    id: 'pola-invalid-u',
    name: 'Pola Rusak: Bentuk U / Cekung',
    patternType: 'invalid',
    shape: 'kubus',
    isValid: false,
    explanation: 'SALAH (INVALID)! Pola membentuk huruf U. Saat dilipat, dua sisi di ujung akan bertabrakan di posisi yang sama, menyisakan 2 sisi lain yang terbuka melompong.',
    grid: createGrid([
      [1, 1], [1, 4],
      [2, 1], [2, 2], [2, 3], [2, 4]
    ])
  }
];

export const SHIELD_THEMES: ShieldTheme[] = [
  {
    id: 'plasma-cyan',
    name: 'Plasma Ion Cyan',
    colorName: 'Cyan Neon',
    hex: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.65)',
    secondary: '#0891b2',
    description: 'Perisai radiasi antariksa standar dengan partikel ion berenergi tinggi.'
  },
  {
    id: 'hyper-violet',
    name: 'Hyperdrive Violet',
    colorName: 'Violet Neon',
    hex: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.65)',
    secondary: '#7e22ce',
    description: 'Medan pelindung distorsi gravitasi untuk kecepatan warp antargalaksi.'
  },
  {
    id: 'solar-gold',
    name: 'Solar Thermal Gold',
    colorName: 'Emas Surya',
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.65)',
    secondary: '#d97706',
    description: 'Lapisan nano-emas penangkal panas ekstrem saat mendekati bintang induk.'
  },
  {
    id: 'matrix-emerald',
    name: 'Quantum Emerald',
    colorName: 'Zamrud Kuantum',
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.65)',
    secondary: '#059669',
    description: 'Katalis kristal kuantum penahan gelombang pulsar berfrekuensi tinggi.'
  },
  {
    id: 'crimson-force',
    name: 'Crimson Forcefield',
    colorName: 'Merah Plasma',
    hex: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.65)',
    secondary: '#e11d48',
    description: 'Perisai militer tempur armada Nova dengan daya tahan benturan asteroid.'
  }
];

export const INITIAL_MISSIONS: CargoMission[] = [
  {
    id: 'misi-1',
    title: 'Misi 1: Verifikasi Cetak Biru (Jaring-Jaring)',
    targetMode: 'jaring',
    description: 'Pilih dan validasi minimal 1 pola jaring-jaring kubus atau balok yang BENAR!',
    goalExplanation: 'Identifikasi pola jaring-jaring yang bila dilipat akan membentuk bangun ruang sempurna tanpa ada sisi yang menumpuk.',
    hint: 'Cari pola 1-4-1 atau 2-3-1 di tab Mode Jaring-Jaring.',
    completed: false
  },
  {
    id: 'misi-2',
    title: 'Misi 2: Kargo Kapasitas 24 Satuan (Volume)',
    targetMode: 'volume',
    description: 'Atur dimensi balok sehingga menghasilkan Volume tepat 24 kontainer satuan (contoh: 4 x 3 x 2 atau 6 x 2 x 2)!',
    goalExplanation: 'Gunakan rumus Volume Balok V = p x l x t untuk mencapai total 24 satuan.',
    targetVolume: 24,
    hint: 'Buka tab Mode Volume, geser slider Panjang, Lebar, dan Tinggi hingga hasil V = 24.',
    completed: false
  },
  {
    id: 'misi-3',
    title: 'Misi 3: Pelindung Termal Luas 54 m² (Luas Permukaan)',
    targetMode: 'luas',
    description: 'Rancang kargo kubus dengan rusuk s = 3 m, sehingga luas seluruh perisai 6 sisinya adalah 54 m²!',
    goalExplanation: 'Gunakan rumus Luas Permukaan Kubus L = 6 x s x s. Jika s = 3, maka L = 6 x 9 = 54.',
    targetArea: 54,
    hint: 'Buka tab Mode Luas Permukaan, pilih Kubus dengan panjang rusuk 3 m.',
    completed: false
  }
];
