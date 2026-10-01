import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShieldTheme } from '../types/game';
import { SHIELD_THEMES } from '../data/netPatterns';
import { sound } from '../utils/audio';
import { Shield, Sparkles, Box, Target, Layers, Info, RotateCcw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  currentShield: ShieldTheme;
  onShieldChanged: (shield: ShieldTheme) => void;
  onDimensionsChanged: (p: number, l: number, t: number, shape: 'kubus' | 'balok') => void;
  targetArea?: number;
  onMissionCompleted?: () => void;
}

export const ModeLuasPermukaan: React.FC<Props> = ({
  currentShield,
  onShieldChanged,
  onDimensionsChanged,
  targetArea = 54,
  onMissionCompleted
}) => {
  const [shape, setShape] = useState<'kubus' | 'balok'>('kubus');
  const [panjang, setPanjang] = useState<number>(3);
  const [lebar, setLebar] = useState<number>(3);
  const [tinggi, setTinggi] = useState<number>(3);

  // Exploded shield view slider (0% to 100%)
  const [explodeOffset, setExplodeOffset] = useState<number>(0.2);
  const [selectedPair, setSelectedPair] = useState<'all' | 'alas-tutup' | 'depan-belakang' | 'kiri-kanan'>('all');
  const [targetSuccess, setTargetSuccess] = useState<boolean>(false);

  // 3D scene refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const shieldGroupRef = useRef<THREE.Group | null>(null);

  // Switch shape
  const handleShapeChange = (newShape: 'kubus' | 'balok') => {
    sound.playClick();
    setShape(newShape);
    if (newShape === 'kubus') {
      const s = 3;
      setPanjang(s);
      setLebar(s);
      setTinggi(s);
      onDimensionsChanged(s, s, s, 'kubus');
    } else {
      setPanjang(4);
      setLebar(3);
      setTinggi(2);
      onDimensionsChanged(4, 3, 2, 'balok');
    }
  };

  const updateDimensions = (p: number, l: number, t: number) => {
    sound.playTick();
    setPanjang(p);
    setLebar(l);
    setTinggi(t);
    onDimensionsChanged(p, l, t, shape);
  };

  // Calculations for Area of 6 Faces
  const luasAlasTutup = panjang * lebar; // 2 faces
  const luasDepanBelakang = panjang * tinggi; // 2 faces
  const luasKiriKanan = lebar * tinggi; // 2 faces

  const luasTotalBalok = 2 * (luasAlasTutup + luasDepanBelakang + luasKiriKanan);
  const luasSatuSisiKubus = panjang * panjang;
  const luasTotalKubus = 6 * luasSatuSisiKubus;
  const luasPermukaanTotal = shape === 'kubus' ? luasTotalKubus : luasTotalBalok;

  // Power Shield consumption
  const powerMegaWatt = luasPermukaanTotal * 120;

  // Mission check
  useEffect(() => {
    if (luasPermukaanTotal === targetArea && !targetSuccess) {
      setTargetSuccess(true);
      sound.playSuccess();
      confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });
      if (onMissionCompleted) onMissionCompleted();
    } else if (luasPermukaanTotal !== targetArea && targetSuccess) {
      setTargetSuccess(false);
    }
  }, [luasPermukaanTotal, targetArea, targetSuccess, onMissionCompleted]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 8, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 25;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(8, 12, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-8, -4, -8);
    scene.add(dirLight2);

    // Floor Grid
    const grid = new THREE.GridHelper(16, 16, 0x06b6d4, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Shield group
    const group = new THREE.Group();
    scene.add(group);
    shieldGroupRef.current = group;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update 3D Shield Panels when dimensions, shield color, or explode slider changes
  useEffect(() => {
    if (!shieldGroupRef.current) return;
    const group = shieldGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const scale = 0.8;
    const p = panjang * scale;
    const l = lebar * scale;
    const t = tinggi * scale;
    const exp = explodeOffset * 1.5; // distance offset

    const shieldColor = new THREE.Color(currentShield.hex);

    // Panel material creator
    const createPanelMat = (isHighlighted: boolean) => {
      return new THREE.MeshStandardMaterial({
        color: shieldColor,
        emissive: shieldColor,
        emissiveIntensity: isHighlighted ? 0.6 : 0.25,
        transparent: true,
        opacity: isHighlighted ? 0.95 : 0.65,
        roughness: 0.15,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
    };

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2
    });

    const addPlate = (
      w: number,
      h: number,
      pos: [number, number, number],
      rot: [number, number, number],
      isHigh: boolean
    ) => {
      const g = new THREE.Group();
      const geom = new THREE.PlaneGeometry(w, h);
      const mesh = new THREE.Mesh(geom, createPanelMat(isHigh));
      g.add(mesh);

      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, edgeMat);
      g.add(line);

      g.position.set(pos[0], pos[1], pos[2]);
      g.rotation.set(rot[0], rot[1], rot[2]);
      group.add(g);
    };

    // 1. Alas (Bottom) Face: dimension (p, l) at Y = -t/2 - exp
    const isAlasHigh = selectedPair === 'all' || selectedPair === 'alas-tutup';
    addPlate(p, l, [0, -t / 2 - exp, 0], [Math.PI / 2, 0, 0], isAlasHigh);

    // 2. Tutup (Top) Face: dimension (p, l) at Y = t/2 + exp
    addPlate(p, l, [0, t / 2 + exp, 0], [-Math.PI / 2, 0, 0], isAlasHigh);

    // 3. Depan (Front) Face: dimension (p, t) at Z = l/2 + exp
    const isDepanHigh = selectedPair === 'all' || selectedPair === 'depan-belakang';
    addPlate(p, t, [0, 0, l / 2 + exp], [0, 0, 0], isDepanHigh);

    // 4. Belakang (Back) Face: dimension (p, t) at Z = -l/2 - exp
    addPlate(p, t, [0, 0, -l / 2 - exp], [0, Math.PI, 0], isDepanHigh);

    // 5. Kiri (Left) Face: dimension (l, t) at X = -p/2 - exp
    const isKiriHigh = selectedPair === 'all' || selectedPair === 'kiri-kanan';
    addPlate(l, t, [-p / 2 - exp, 0, 0], [0, -Math.PI / 2, 0], isKiriHigh);

    // 6. Kanan (Right) Face: dimension (l, t) at X = p/2 + exp
    addPlate(l, t, [p / 2 + exp, 0, 0], [0, Math.PI / 2, 0], isKiriHigh);

    // Inner Core Holographic Cube
    const coreGeom = new THREE.BoxGeometry(p * 0.7, t * 0.7, l * 0.7);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    group.add(coreMesh);

    // Connection energy beams if exploded
    if (explodeOffset > 0.1) {
      const beamMat = new THREE.LineDashedMaterial({
        color: shieldColor,
        dashSize: 0.2,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.5
      });
      const points = [
        new THREE.Vector3(-p / 2, -t / 2, -l / 2),
        new THREE.Vector3(-p / 2 - exp, -t / 2 - exp, -l / 2 - exp),
        new THREE.Vector3(p / 2, t / 2, l / 2),
        new THREE.Vector3(p / 2 + exp, t / 2 + exp, l / 2 + exp)
      ];
      const beamGeom = new THREE.BufferGeometry().setFromPoints(points);
      const beamLine = new THREE.LineSegments(beamGeom, beamMat);
      group.add(beamLine);
    }
  }, [panjang, lebar, tinggi, explodeOffset, currentShield, selectedPair, shape]);

  return (
    <div className="space-y-6">

      {/* Intro banner */}
      <div className="p-4 md:p-5 rounded-2xl glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-tech text-xs tracking-wider border border-violet-500/30">
              MODUL SHIELDING & PERMUKAAN
            </span>
            <span className="text-xs text-slate-400">Total Luas 6 Sisi Kargo • Fase C SD</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold font-display text-white">
            Simulasi Perisai Pelindung Luas Permukaan (6 Sisi)
          </h2>
          <p className="text-xs text-slate-300">
            Perisai luar angkasa harus melapisi seluruh 6 permukaan kubus/balok. Pelajari rumus penjumlahan luas ke-6 sisinya!
          </p>
        </div>

        {/* Shape selector: Kubus vs Balok */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => handleShapeChange('kubus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              shape === 'kubus'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kubus (L = 6 × s²)
          </button>
          <button
            onClick={() => handleShapeChange('balok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              shape === 'balok'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Balok (3 Pasang Sisi)
          </button>
        </div>
      </div>

      {/* Target Mission Alert if active */}
      {targetArea && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            targetSuccess
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 border-violet-500/30 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${targetSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'}`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold font-display uppercase tracking-wider">
                MISI ARMADA: TARGET LUAS PERISAI TEPAT {targetArea} M²
              </div>
              <div className="text-xs text-slate-300">
                Sesuaikan dimensi kargo kubus/balok agar total luas 6 pelat perisainya menghasilkan <strong>{targetArea} m²</strong>!
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-base font-bold font-mono px-3 py-1 rounded-lg border ${
              targetSuccess ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-violet-300 border-slate-700'
            }`}>
              {luasPermukaanTotal} / {targetArea} m²
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Controls & 3D WebGL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Dimensions, Color & Calculation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Shield Color Theme Picker */}
          <div className="p-4 rounded-xl glass-panel space-y-2.5">
            <label className="text-xs font-bold text-violet-300 font-tech uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              PILIH TIPE & WARNA PERISAI ENERGI
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SHIELD_THEMES.map((theme) => {
                const isSelected = currentShield.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      sound.playShield();
                      onShieldChanged(theme);
                    }}
                    className={`p-2 rounded-lg text-left text-xs transition border cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-850 border-violet-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: theme.hex }}
                    />
                    <div className="truncate font-semibold">{theme.colorName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension Controls */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-cyan-400" />
                UKURAN KARGO ({shape.toUpperCase()})
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  if (shape === 'kubus') updateDimensions(3, 3, 3);
                  else updateDimensions(4, 3, 2);
                }}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider Sisi (s) for Kubus, or p, l, t for Balok */}
            {shape === 'kubus' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Panjang Rusuk (s):</span>
                  <span className="font-mono text-cyan-300 font-bold">{panjang} meter</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={panjang}
                  onChange={(e) => {
                    const s = parseInt(e.target.value);
                    updateDimensions(s, s, s);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Panjang (p):</span>
                    <span className="font-mono text-cyan-300 font-bold">{panjang} meter</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={panjang}
                    onChange={(e) => updateDimensions(parseInt(e.target.value), lebar, tinggi)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Lebar (l):</span>
                    <span className="font-mono text-blue-300 font-bold">{lebar} meter</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={lebar}
                    onChange={(e) => updateDimensions(panjang, parseInt(e.target.value), tinggi)}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Tinggi (t):</span>
                    <span className="font-mono text-violet-300 font-bold">{tinggi} meter</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={tinggi}
                    onChange={(e) => updateDimensions(panjang, lebar, parseInt(e.target.value))}
                    className="w-full accent-violet-400 cursor-pointer"
                  />
                </div>
              </>
            )}

            {/* Exploded View Slider (Buka Perisai) */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-violet-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Mode Buka Perisai (Exploded 6 Plates View):
                </span>
                <span className="font-mono text-violet-300 font-bold">
                  {Math.round(explodeOffset * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeOffset}
                onChange={(e) => {
                  sound.playTick();
                  setExplodeOffset(parseFloat(e.target.value));
                }}
                className="w-full accent-violet-400 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Geser untuk merenggangkan ke-6 pelat perisai agar terlihat jelas setiap pasang sisi!
              </div>
            </div>

            {/* Filter Pair Highlight Buttons */}
            {shape === 'balok' && (
              <div className="pt-2 flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => setSelectedPair('all')}
                  className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                    selectedPair === 'all'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Semua 6 Sisi
                </button>
                <button
                  onClick={() => setSelectedPair('alas-tutup')}
                  className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                    selectedPair === 'alas-tutup'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Alas & Tutup (2× p·l)
                </button>
                <button
                  onClick={() => setSelectedPair('depan-belakang')}
                  className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                    selectedPair === 'depan-belakang'
                      ? 'bg-violet-500/20 border-violet-400 text-violet-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Depan & Belakang (2× p·t)
                </button>
                <button
                  onClick={() => setSelectedPair('kiri-kanan')}
                  className={`px-2.5 py-1 rounded border transition cursor-pointer ${
                    selectedPair === 'kiri-kanan'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Kiri & Kanan (2× l·t)
                </button>
              </div>
            )}

          </div>

          {/* Mathematical Surface Area Calculation */}
          <div className="p-5 rounded-2xl glass-panel-glow border-violet-500/30 space-y-3">
            <div className="text-xs font-bold text-violet-300 font-tech uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              RINCIAN RUMUS LUAS PERMUKAAN (6 BIDANG)
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              {shape === 'balok' ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pb-2 border-b border-slate-800">
                    <div className="p-2 rounded bg-slate-900 border border-blue-500/30">
                      <span className="text-slate-400 block font-semibold">Alas & Tutup (2 sisi):</span>
                      <span className="font-mono text-cyan-300">2 × ({panjang}×{lebar}) = <strong>{2 * luasAlasTutup} m²</strong></span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-violet-500/30">
                      <span className="text-slate-400 block font-semibold">Depan & Belakang:</span>
                      <span className="font-mono text-violet-300">2 × ({panjang}×{tinggi}) = <strong>{2 * luasDepanBelakang} m²</strong></span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-amber-500/30">
                      <span className="text-slate-400 block font-semibold">Kiri & Kanan:</span>
                      <span className="font-mono text-amber-300">2 × ({lebar}×{tinggi}) = <strong>{2 * luasKiriKanan} m²</strong></span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-300">TOTAL LUAS BALOK:</span>
                    <span className="font-mono text-lg font-bold text-violet-400">
                      L = 2×({luasAlasTutup} + {luasDepanBelakang} + {luasKiriKanan}) = {luasPermukaanTotal} m²
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>• Luas 1 bidang sisi bujur sangkar = s × s = {panjang} × {panjang} = <strong>{luasSatuSisiKubus} m²</strong></div>
                    <div>• Karena kubus memiliki <strong>6 sisi persegi yang sama besar (kongruen)</strong>:</div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-300">TOTAL LUAS KUBUS:</span>
                    <span className="font-mono text-lg font-bold text-violet-400">
                      L = 6 × s² = 6 × {luasSatuSisiKubus} = {luasPermukaanTotal} m²
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Konsumsi Generator Perisai:
              </span>
              <span className="font-mono font-bold text-amber-400">{powerMegaWatt} MW (Megawatt)</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Shielding WebGL Simulator (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl glass-panel-glow space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-violet-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-violet-400" />
                VISUALISASI PERISAI 3D EXPLODED
              </div>
              <span className="text-[10px] text-slate-400">Pendaran 6 Pelat Perisai</span>
            </div>

            {/* 3D WebGL Canvas */}
            <div
              ref={mountRef}
              className="w-full h-[340px] md:h-[390px] rounded-xl bg-slate-950/90 border border-violet-500/20 relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-cyan-400/80 bg-black/40 px-2 py-0.5 rounded">
                PUTAR 360° UNTUK MEMERIKSA KE-6 PELAT PERISAI
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-3 right-3 pointer-events-none bg-slate-950/80 border border-violet-500/30 p-2.5 rounded-lg text-right font-mono">
                <div className="text-[10px] text-slate-400">TOTAL AREA PELINDUNG:</div>
                <div className="text-lg font-bold text-violet-300">{luasPermukaanTotal} M²</div>
              </div>
            </div>

            {/* Educational takeaway */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <strong>Fase C SD Insight:</strong> Perbedaan mendasar Luas Permukaan dengan Volume adalah: <strong>Volume</strong> mengukur ruang di bagian <em>dalam</em>, sedangkan <strong>Luas Permukaan</strong> mengukur seluruh kulit atau bidang di bagian <em>luar</em>.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
