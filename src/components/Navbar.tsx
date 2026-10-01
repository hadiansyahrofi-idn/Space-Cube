import React from 'react';
import { SimulationMode, CargoMission } from '../types/game';
import { sound } from '../utils/audio';
import { Box, Layers, ShieldCheck, Sparkles, BookOpen, Volume2, VolumeX, Rocket, Award } from 'lucide-react';

interface Props {
  activeMode: SimulationMode;
  onModeChange: (mode: SimulationMode) => void;
  onOpenAIModal: () => void;
  onOpenGuideModal: () => void;
  missions: CargoMission[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeMode,
  onModeChange,
  onOpenAIModal,
  onOpenGuideModal,
  missions,
  soundEnabled,
  onToggleSound
}) => {
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-violet-500/30 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/20">
                <Rocket className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black font-display tracking-wider text-white">
                    SPACE CARGO ARCHITECT
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-tech bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    FASE C SD
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200/70 font-tech uppercase tracking-wider">
                  Simulasi Matematika Interaktif Kubus & Balok
                </p>
              </div>
            </div>

            {/* Mobile Sound & AI trigger */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onToggleSound}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
              <button
                onClick={onOpenAIModal}
                className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold border border-cyan-400/50 shadow-md cursor-pointer"
                title="Hasilkan Visual Kargo & Planet AI"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-cyan-500/25 shadow-inner w-full md:w-auto justify-center">
            
            {/* Tab 1: Jaring-jaring */}
            <button
              onClick={() => {
                sound.playClick();
                onModeChange('jaring');
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'jaring'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 font-display'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>1. Jaring-Jaring</span>
            </button>

            {/* Tab 2: Volume */}
            <button
              onClick={() => {
                sound.playClick();
                onModeChange('volume');
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'volume'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 font-display'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Volume (Packing)</span>
            </button>

            {/* Tab 3: Luas Permukaan */}
            <button
              onClick={() => {
                sound.playClick();
                onModeChange('luas');
              }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'luas'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 font-display'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Luas Permukaan</span>
            </button>

          </div>

          {/* Quick Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Mission status indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/60 text-xs">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 font-tech">Misi:</span>
              <strong className="text-amber-300 font-mono">{completedCount}/{missions.length}</strong>
            </div>

            {/* Formula guide button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenGuideModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kamus Rumus</span>
            </button>

            {/* AI Visualizer Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenAIModal();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold font-display text-xs tracking-wide transition shadow-lg shadow-cyan-500/25 border border-cyan-400/30 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Visual Kargo AI</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'Matikan Suara SFX' : 'Nyalakan Suara SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
