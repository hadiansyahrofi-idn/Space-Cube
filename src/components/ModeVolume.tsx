import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { sound } from '../utils/audio';
import { Box, Layers, Sparkles, CheckCircle2, RotateCcw, Target, Info, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onVolumeChanged: (p: number, l: number, t: number, shape: 'kubus' | 'balok') => void;
  targetVolume?: number;
  onMissionCompleted?: () => void;
}

export const ModeVolume: React.FC<Props> = ({
  onVolumeChanged,
  targetVolume = 24,
  onMissionCompleted
}) => {
  const [shape, setShape] = useState<'kubus' | 'balok'>('balok');
  const [panjang, setPanjang] = useState<number>(4);
  const [lebar, setLebar] = useState<number>(3);
  const [tinggi, setTinggi] = useState<number>(2);

  // Active layer visibility for pedagogical layer-by-layer learning
  const [activeLayers, setActiveLayers] = useState<number>(2);
  const [showUnitCrates, setShowUnitCrates] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [targetSuccess, setTargetSuccess] = useState<boolean>(false);

  // 3D scene refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const crateGroupRef = useRef<THREE.Group | null>(null);

  // Sync state if shape is cube
  const handleShapeChange = (newShape: 'kubus' | 'balok') => {
    sound.playClick();
    setShape(newShape);
    if (newShape === 'kubus') {
      const s = 3;
      setPanjang(s);
      setLebar(s);
      setTinggi(s);
      setActiveLayers(s);
      onVolumeChanged(s, s, s, 'kubus');
    } else {
      onVolumeChanged(panjang, lebar, tinggi, 'balok');
    }
  };

  const updateDimensions = (p: number, l: number, t: number) => {
    sound.playTick();
    setPanjang(p);
    setLebar(l);
    setTinggi(t);
    setActiveLayers(t);
    onVolumeChanged(p, l, t, shape);
  };

  // Calculations
  const luasAlas = panjang * lebar;
  const volumeTotal = panjang * lebar * tinggi;
  const currentPackedVolume = panjang * lebar * activeLayers;

  // Check target volume mission
  useEffect(() => {
    if (volumeTotal === targetVolume && !targetSuccess) {
      setTargetSuccess(true);
      sound.playSuccess();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      if (onMissionCompleted) onMissionCompleted();
    } else if (volumeTotal !== targetVolume && targetSuccess) {
      setTargetSuccess(false);
    }
  }, [volumeTotal, targetVolume, targetSuccess, onMissionCompleted]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 9, 10);

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 1.0);
    fillLight.position.set(-10, -5, -10);
    scene.add(fillLight);

    // Docking Bay Floor Grid
    const grid = new THREE.GridHelper(16, 16, 0x06b6d4, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Group for all crates
    const group = new THREE.Group();
    scene.add(group);
    crateGroupRef.current = group;

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

  // Update 3D Crates when dimensions or active layers change
  useEffect(() => {
    if (!crateGroupRef.current) return;
    const group = crateGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const unitSize = 0.94; // slightly smaller than 1 to give high-tech crate gap
    const gap = 0.06;

    // Unit crate materials
    const crateMaterial = new THREE.MeshStandardMaterial({
      color: shape === 'kubus' ? 0x0284c7 : 0x2563eb,
      metalness: 0.4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.92,
      wireframe: showWireframe
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.5,
      roughness: 0.2
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      linewidth: 2
    });

    const boxGeom = new THREE.BoxGeometry(unitSize, unitSize, unitSize);
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);

    // Offset to center the cargo on grid
    const offsetX = (panjang * (unitSize + gap)) / 2;
    const offsetZ = (lebar * (unitSize + gap)) / 2;

    if (showUnitCrates) {
      // Build individual unit cubes (Packing)
      for (let y = 0; y < activeLayers; y++) {
        for (let x = 0; x < panjang; x++) {
          for (let z = 0; z < lebar; z++) {
            const posX = x * (unitSize + gap) - offsetX + unitSize / 2;
            const posY = y * (unitSize + gap) + unitSize / 2;
            const posZ = z * (unitSize + gap) - offsetZ + unitSize / 2;

            const isTopLayer = y === activeLayers - 1;
            const mesh = new THREE.Mesh(boxGeom, isTopLayer ? highlightMaterial : crateMaterial);
            mesh.position.set(posX, posY, posZ);
            group.add(mesh);

            // Tech border edges
            const line = new THREE.LineSegments(edgesGeom, edgeMaterial);
            line.position.copy(mesh.position);
            group.add(line);
          }
        }
      }
    } else {
      // Show as a single solid monolithic block
      const solidW = panjang * (unitSize + gap) - gap;
      const solidH = activeLayers * (unitSize + gap) - gap;
      const solidD = lebar * (unitSize + gap) - gap;

      const solidGeom = new THREE.BoxGeometry(solidW, solidH, solidD);
      const solidMesh = new THREE.Mesh(solidGeom, crateMaterial);
      solidMesh.position.set(0, solidH / 2, 0);
      group.add(solidMesh);

      const solidEdges = new THREE.EdgesGeometry(solidGeom);
      const solidLine = new THREE.LineSegments(solidEdges, edgeMaterial);
      solidLine.position.copy(solidMesh.position);
      group.add(solidLine);
    }
  }, [panjang, lebar, tinggi, activeLayers, shape, showUnitCrates, showWireframe]);

  return (
    <div className="space-y-6">

      {/* Intro banner */}
      <div className="p-4 md:p-5 rounded-2xl glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-tech text-xs tracking-wider border border-blue-500/30">
              MODUL PACKING & VOLUME
            </span>
            <span className="text-xs text-slate-400">Konsep Kubus Satuan • Fase C SD</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold font-display text-white">
            Simulasi Tumpukan Kontainer Kargo 3D
          </h2>
          <p className="text-xs text-slate-300">
            Pahami bahwa <strong>Volume = Luas Alas × Tinggi</strong>. Hitung banyaknya kubus satuan yang mengisi penuh ruang kargo!
          </p>
        </div>

        {/* Shape selector: Kubus vs Balok */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => handleShapeChange('balok')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              shape === 'balok'
                ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Balok (p × l × t)
          </button>
          <button
            onClick={() => handleShapeChange('kubus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              shape === 'kubus'
                ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kubus (s × s × s)
          </button>
        </div>
      </div>

      {/* Target Mission Alert if active */}
      {targetVolume && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            targetSuccess
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 border-blue-500/30 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${targetSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold font-display uppercase tracking-wider">
                MISI ARMADA: TARGET KAPASITAS {targetVolume} SATUAN
              </div>
              <div className="text-xs text-slate-300">
                Atur slider dimensi kargo hingga total volume mencapai tepat <strong>{targetVolume} kontainer</strong>!
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-base font-bold font-mono px-3 py-1 rounded-lg border ${
              targetSuccess ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-cyan-300 border-slate-700'
            }`}>
              {volumeTotal} / {targetVolume}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Controls & 3D WebGL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Sliders & Calculation Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Dimension Sliders */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-cyan-400" />
                PENGATUR DIMENSI KARGO ({shape.toUpperCase()})
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

            {/* Slider Panjang (p) or Sisi (s) */}
            {shape === 'balok' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Panjang (p):</span>
                  <span className="font-mono text-cyan-300 font-bold">{panjang} satuan</span>
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
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Panjang Rusuk (s):</span>
                  <span className="font-mono text-cyan-300 font-bold">{panjang} satuan</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={panjang}
                  onChange={(e) => {
                    const s = parseInt(e.target.value);
                    updateDimensions(s, s, s);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            {/* Slider Lebar (l) */}
            {shape === 'balok' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Lebar (l):</span>
                  <span className="font-mono text-blue-300 font-bold">{lebar} satuan</span>
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
            )}

            {/* Slider Tinggi (t) */}
            {shape === 'balok' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Tinggi (t):</span>
                  <span className="font-mono text-violet-300 font-bold">{tinggi} satuan</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={tinggi}
                  onChange={(e) => updateDimensions(panjang, lebar, parseInt(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>
            )}

            {/* Interactive Layer Breakdown Slider */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Eksplorasi Lapisan (Tumpukan per Tingkat):
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  Tingkat {activeLayers} dari {tinggi}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={tinggi}
                value={activeLayers}
                onChange={(e) => {
                  sound.playTick();
                  setActiveLayers(parseInt(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Lantai dasar berisi <strong>{luasAlas}</strong> kubus satuan. Ditumpuk {activeLayers} lantai = <strong>{currentPackedVolume}</strong> kubus.
              </div>
            </div>

            {/* Visual View Toggles */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowUnitCrates(!showUnitCrates);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                  showUnitCrates
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showUnitCrates ? 'Mode: Kubus Satuan' : 'Mode: Blok Padat'}</span>
              </button>
            </div>

          </div>

          {/* Real-time Math Calculation Box */}
          <div className="p-5 rounded-2xl glass-panel-glow border-cyan-500/30 space-y-3">
            <div className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              KALKULASI RUMUS VOLUME (LANGKAH DEMI LANGKAH)
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              {shape === 'balok' ? (
                <>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400 font-bold">1. Luas Lantai Dasar (Alas):</span><br />
                    <span className="font-mono text-cyan-300">Luas Alas = p × l = {panjang} × {lebar} = <strong>{luasAlas} kontainer satuan</strong></span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400 font-bold">2. Kalikan dengan Tinggi Lapisan (t):</span><br />
                    <span className="font-mono text-violet-300">Volume = Luas Alas × t = {luasAlas} × {tinggi} = <strong>{volumeTotal} kontainer satuan</strong></span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-300">RUMUS MATEMATIS:</span>
                    <span className="font-mono text-lg font-bold text-cyan-400">
                      V = {panjang} × {lebar} × {tinggi} = {volumeTotal} Satuan³
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400 font-bold">Pada Kubus (Semua rusuk sama s = {panjang}):</span><br />
                    <span className="font-mono text-cyan-300">Volume = s × s × s = {panjang} × {panjang} × {panjang}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-300">RUMUS MATEMATIS:</span>
                    <span className="font-mono text-lg font-bold text-cyan-400">
                      V = {panjang}³ = {volumeTotal} Satuan³
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Jika 1 kubus satuan = 1 meter³, maka kapasitas ruang angkut kargo ini adalah {volumeTotal} m³.</span>
            </div>
          </div>

        </div>

        {/* Right Column: 3D Isometric / WebGL Packing Simulator (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-2xl glass-panel-glow space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-cyan-400" />
                SIMULATOR PACKING REAL-TIME 3D
              </div>
              <span className="text-[10px] text-slate-400">Pendaran Kubus Satuan</span>
            </div>

            {/* 3D WebGL Canvas */}
            <div
              ref={mountRef}
              className="w-full h-[340px] md:h-[390px] rounded-xl bg-slate-950/90 border border-blue-500/20 relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-cyan-400/80 bg-black/40 px-2 py-0.5 rounded">
                KLIK & GESER UNTUK MELIHAT SUDUT PANDANG 360°
              </div>

              {/* Stats overlay */}
              <div className="absolute bottom-3 right-3 pointer-events-none bg-slate-950/80 border border-cyan-500/30 p-2.5 rounded-lg text-right font-mono">
                <div className="text-[10px] text-slate-400">TERMUAT DI KARGO:</div>
                <div className="text-lg font-bold text-cyan-300">{currentPackedVolume} / {volumeTotal} KUBUS</div>
              </div>
            </div>

            {/* Educational takeaway */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <strong>Fase C SD Insight:</strong> Menyusun kubus satuan mengajarkan mengapa perkalian 3 bilangan (panjang × lebar × tinggi) digunakan untuk menghitung volume ruang.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
