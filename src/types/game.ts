export type SimulationMode = 'jaring' | 'volume' | 'luas';

export type ShapeType = 'kubus' | 'balok';

export interface NetPattern {
  id: string;
  name: string;
  patternType: '1-4-1' | '2-3-1' | '2-2-2' | '3-3' | 'balok' | 'invalid';
  shape: ShapeType;
  isValid: boolean;
  explanation: string;
  // 6x6 grid where true indicates a face is present
  grid: boolean[][];
  // Face mappings for 3D folding test (base, front, back, left, right, top)
  // Each entry is { r, c, role }
  faces?: { r: number; c: number; role: 'alas' | 'depan' | 'belakang' | 'kiri' | 'kanan' | 'tutup'; foldAngle?: number }[];
}

export interface ShieldTheme {
  id: string;
  name: string;
  colorName: string;
  hex: string;
  glow: string;
  secondary: string;
  description: string;
}

export interface CargoMission {
  id: string;
  title: string;
  targetMode: SimulationMode;
  description: string;
  goalExplanation: string;
  targetVolume?: number;
  targetArea?: number;
  hint: string;
  completed: boolean;
}
