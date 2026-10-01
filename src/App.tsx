import React, { useState } from 'react';
import { SimulationMode, NetPattern, ShieldTheme, CargoMission } from './types/game';
import { SHIELD_THEMES, INITIAL_MISSIONS } from './data/netPatterns';
import { sound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { ModeJaringJaring } from './components/ModeJaringJaring';
import { ModeVolume } from './components/ModeVolume';
import { ModeLuasPermukaan } from './components/ModeLuasPermukaan';
import { MissionsPanel } from './components/MissionsPanel';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { AIVisualModal } from './components/AIVisualModal';
import { Sparkles, Box, Shield, Globe2, BookOpen } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState<SimulationMode>('jaring');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);

  // Global cargo state
  const [cargoDimensions, setCargoDimensions] = useState<{
    p: number;
    l: number;
    t: number;
    shape: 'kubus' | 'balok';
  }>({
    p: 4,
    l: 3,
    t: 2,
    shape: 'balok'
  });

  const [shieldTheme, setShieldTheme] = useState<ShieldTheme>(SHIELD_THEMES[0]);
  const [missions, setMissions] = useState<CargoMission[]>(INITIAL_MISSIONS);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  // Complete a mission
  const completeMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
  };

  // Callback when pattern is validated in Mode Jaring-jaring
  const handlePatternValidated = (pattern: NetPattern) => {
    if (pattern.isValid) {
      completeMission('misi-1');
    }
  };

  return (
    <div className="min-h-screen space-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <Navbar
        activeMode={activeMode}
        onModeChange={(mode) => setActiveMode(mode)}
        onOpenAIModal={() => setIsAIOpen(true)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        missions={missions}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        
        {/* Active Simulation Tab View */}
        {activeMode === 'jaring' && (
          <ModeJaringJaring onPatternValidated={handlePatternValidated} />
        )}

        {activeMode === 'volume' && (
          <ModeVolume
            onVolumeChanged={(p, l, t, shape) => {
              setCargoDimensions({ p, l, t, shape });
            }}
            targetVolume={24}
            onMissionCompleted={() => completeMission('misi-2')}
          />
        )}

        {activeMode === 'luas' && (
          <ModeLuasPermukaan
            currentShield={shieldTheme}
            onShieldChanged={(newShield) => setShieldTheme(newShield)}
            onDimensionsChanged={(p, l, t, shape) => {
              setCargoDimensions({ p, l, t, shape });
            }}
            targetArea={54}
            onMissionCompleted={() => completeMission('misi-3')}
          />
        )}

        {/* Missions Challenge Section */}
        <MissionsPanel
          missions={missions}
          onSelectMissionMode={(mode) => setActiveMode(mode)}
        />

        {/* AI Generator CTA Banner */}
        <div className="glass-panel-accent rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-violet-500/30 relative overflow-hidden">
          <div className="space-y-1.5 z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/30 text-violet-300 font-tech text-xs tracking-wider border border-violet-500/40">
                FITUR GOOGLE AI STUDIO IMAGEN 3
              </span>
              <span className="text-xs text-slate-400">Rendering Kargo Nyata</span>
            </div>
            <h3 className="text-base md:text-lg font-bold font-display text-white">
              Cetak Poster 3D Kargo & Latar Planet Berdasarkan Ukuran Anda
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Gunakan kecerdasan buatan Google AI Studio (Imagen 3) untuk menghasilkan gambar fotorealistik kargo {cargoDimensions.shape} berukuran {cargoDimensions.p}m × {cargoDimensions.l}m × {cargoDimensions.t}m dengan perisai {shieldTheme.colorName}.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsAIOpen(true);
            }}
            className="z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold font-display text-xs md:text-sm tracking-wider transition shadow-lg shadow-violet-500/25 border border-cyan-400/40 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>HASILKAN VISUAL KARGO & PLANET AI</span>
          </button>

          {/* Decorative glow in background */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-cyan-500/20 mt-8 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <span>
              <strong>Space Cargo Architect</strong> • Simulasi Pembelajaran Geometri Bangun Ruang SD Fase C (Kelas 5 - 6)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => {
                sound.playClick();
                setIsGuideOpen(true);
              }}
              className="hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kamus Rumus</span>
            </button>
            <span>•</span>
            <button
              onClick={() => {
                sound.playClick();
                setIsAIOpen(true);
              }}
              className="hover:text-violet-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Imagen 3 Studio</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FormulaGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <AIVisualModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        dimensions={cargoDimensions}
        shield={shieldTheme}
      />

    </div>
  );
}
