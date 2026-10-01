import React from 'react';
import { X, BookOpen, Box, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel-glow rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl border border-cyan-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-wider text-cyan-300">
                PANDUAN AKADEMIK KONTROL: KUBUS & BALOK
              </h2>
              <p className="text-xs md:text-sm text-cyan-100/70 font-tech uppercase tracking-widest">
                Kurikulum Matematika Fase C SD (Kelas 5 - 6) • Standar Arsitektur Armada Antariksa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="space-y-6">

          {/* Section 1: Sifat-sifat Bangun */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Kubus */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3 text-cyan-300 font-display font-semibold text-lg">
                <Box className="w-5 h-5" />
                <span>1. Bangun Ruang: KUBUS</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Kubus adalah bangun ruang tiga dimensi yang dibatasi oleh 6 bidang sisi berbentuk bujur sangkar (persegi) yang sama besar (kongruen).
              </p>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <strong>Jumlah Sisi:</strong> 6 buah persegi identik
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <strong>Jumlah Rusuk:</strong> 12 rusuk sama panjang (<span className="text-cyan-300 font-mono">s</span>)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <strong>Titik Sudut:</strong> 8 titik sudut siku-siku (90°)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <strong>Diagonal Sisi/Ruang:</strong> 12 diagonal bidang & 4 diagonal ruang
                </li>
              </ul>
            </div>

            {/* Balok */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-3 text-violet-300 font-display font-semibold text-lg">
                <Box className="w-5 h-5" />
                <span>2. Bangun Ruang: BALOK</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Balok adalah bangun ruang tiga dimensi yang dibentuk oleh 3 pasang persegi panjang yang saling berhadapan dengan ukuran yang sama.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <strong>Jumlah Sisi:</strong> 6 sisi (3 pasang sisi sejajar & kongruen)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <strong>Jumlah Rusuk:</strong> 12 rusuk (4 panjang <span className="text-violet-300 font-mono">p</span>, 4 lebar <span className="text-violet-300 font-mono">l</span>, 4 tinggi <span className="text-violet-300 font-mono">t</span>)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <strong>Titik Sudut:</strong> 8 titik sudut siku-siku (90°)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <strong>Pasangan Sisi:</strong> Alas = Tutup, Depan = Belakang, Kiri = Kanan
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: Volume & Kubus Satuan */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3 text-amber-300 font-display font-semibold text-lg">
              <Layers className="w-5 h-5" />
              <span>Volume & Konsep Kubus Satuan (Packing)</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Volume bangun ruang adalah kapasitas atau isi yang dapat dimuat di dalam ruang tersebut. Dalam pembelajaran Fase C, volume dipahami melalui <strong>tumpukan kubus satuan</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-black/40 border border-amber-500/30">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Volume Balok</div>
                <div className="font-mono text-base text-white font-bold mb-1">V = p × l × t</div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-amber-300">Luas Alas</span> = (p × l) kontainer di lantai bawah.<br/>
                  Dikalikan dengan tinggi (<span className="text-amber-300">t</span>) lapisan tumpukan.
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-black/40 border border-amber-500/30">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Volume Kubus</div>
                <div className="font-mono text-base text-white font-bold mb-1">V = s × s × s = s³</div>
                <div className="text-[11px] text-slate-400">
                  Karena pada kubus: panjang = lebar = tinggi = <span className="text-amber-300">s</span> (rusuk).
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Luas Permukaan (Shielding) */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3 text-cyan-300 font-display font-semibold text-lg">
              <ShieldCheck className="w-5 h-5" />
              <span>Luas Permukaan (Sistem Perisai 6 Sisi)</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Luas permukaan adalah jumlah seluruh luas bidang datar yang menutupi bagian luar kargo (total 6 sisi):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-black/40 border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Luas Permukaan Balok</div>
                <div className="font-mono text-sm md:text-base text-white font-bold mb-1">L = 2 × (p·l + p·t + l·t)</div>
                <div className="text-[11px] text-slate-400 space-y-0.5 mt-2">
                  <div>• Sisi Alas & Tutup: 2 × (p × l)</div>
                  <div>• Sisi Depan & Belakang: 2 × (p × t)</div>
                  <div>• Sisi Kiri & Kanan: 2 × (l × t)</div>
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-black/40 border border-cyan-500/30">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Luas Permukaan Kubus</div>
                <div className="font-mono text-sm md:text-base text-white font-bold mb-1">L = 6 × (s × s) = 6s²</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Karena ke-6 sisi kubus berbentuk persegi yang ukurannya persis sama (kongruen), cukup hitung luas 1 sisi (<span className="text-cyan-300">s²</span>) lalu kalikan 6.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Pola Jaring-Jaring */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3 text-emerald-300 font-display font-semibold text-lg">
              <Sparkles className="w-5 h-5" />
              <span>Pola Jaring-Jaring Kubus (11 Pola Valid)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Jaring-jaring adalah rangkaian 6 persegi datar yang jika dilipat sepanjang rusuk-rusuknya akan membentuk kubus tertutup rapat tanpa ada sisi yang saling bertumpuk:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-bold block">Pola 1-4-1</span>
                <span className="text-[11px] text-slate-400">6 variasi bentuk</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-bold block">Pola 2-3-1</span>
                <span className="text-[11px] text-slate-400">3 variasi bentuk</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-bold block">Pola 2-2-2</span>
                <span className="text-[11px] text-slate-400">1 variasi bentuk tangga</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 text-center">
                <span className="text-emerald-400 font-bold block">Pola 3-3</span>
                <span className="text-[11px] text-slate-400">1 variasi garis ganda</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display tracking-wider text-sm transition shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            SAYA MENGERTI, LANJUTKAN SIMULASI!
          </button>
        </div>

      </div>
    </div>
  );
};
