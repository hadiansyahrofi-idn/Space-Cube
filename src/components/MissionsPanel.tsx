import React from 'react';
import { CargoMission, SimulationMode } from '../types/game';
import { sound } from '../utils/audio';
import { CheckCircle2, Circle, Target, Award, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  missions: CargoMission[];
  onSelectMissionMode: (mode: SimulationMode) => void;
}

export const MissionsPanel: React.FC<Props> = ({ missions, onSelectMissionMode }) => {
  const completedCount = missions.filter((m) => m.completed).length;
  const allCompleted = completedCount === missions.length;

  return (
    <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display tracking-wider text-white">
              MISI ARSITEK ARMADA ANTARIKSA (TANTANGAN FASE C)
            </h3>
            <p className="text-[11px] text-slate-400">
              Selesaikan misi-misi berikut untuk membuktikan penguasaan konsep Kubus dan Balok!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-tech">PROGRESS:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-amber-500/40 text-amber-300">
            {completedCount} / {missions.length} Tuntas
          </span>
        </div>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {missions.map((mission) => {
          return (
            <div
              key={mission.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                mission.completed
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-cyan-300">
                    {mission.title}
                  </span>
                  {mission.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {mission.description}
                </p>

                <div className="p-2 rounded bg-black/40 text-[11px] text-slate-400 border border-slate-800">
                  <span className="text-cyan-400 font-semibold">Petunjuk:</span> {mission.hint}
                </div>
              </div>

              {!mission.completed && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectMissionMode(mission.targetMode);
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-cyan-500/30 cursor-pointer"
                >
                  <span>Buka Mode Terkait</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Graduation Badge if all completed */}
      {allCompleted && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-violet-500/20 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/40">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold font-display text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                LENCANA: CHIEF SPACE CARGO ARCHITECT TERCAPAI!
              </div>
              <div className="text-xs text-slate-300">
                Selamat! Anda telah menguasai seluruh konsep jaring-jaring, volume packing kubus satuan, dan luas permukaan kubus/balok Fase C SD.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
