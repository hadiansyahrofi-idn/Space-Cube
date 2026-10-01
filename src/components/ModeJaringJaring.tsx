import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { NetPattern } from '../types/game';
import { NET_PATTERNS } from '../data/netPatterns';
import { sound } from '../utils/audio';
import { CheckCircle2, RotateCcw, Box, Layers, Play, Info, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onPatternValidated: (pattern: NetPattern) => void;
}

interface Point {
  r: number;
  c: number;
}

interface TreeNode {
  r: number;
  c: number;
  role: string;
  w: number;
  h: number;
  children: {
    node: TreeNode;
    dir: 'right' | 'left' | 'down' | 'up';
  }[];
}

// 11 Canonical Cube Nets normalized to (0,0)
const CANONICAL_NETS: { name: string; type: string; coords: [number, number][] }[] = [
  // 1-4-1 variations (6)
  { name: 'Pola 1-4-1 (Salib Tengah)', type: '1-4-1', coords: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
  { name: 'Pola 1-4-1 (Sayap Geser 1)', type: '1-4-1', coords: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Pola 1-4-1 (Sayap Geser 2)', type: '1-4-1', coords: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]] },
  { name: 'Pola 1-4-1 (Ujung Kiri 1)', type: '1-4-1', coords: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
  { name: 'Pola 1-4-1 (Ujung Kiri 2)', type: '1-4-1', coords: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Pola 1-4-1 (Ujung Kiri 3)', type: '1-4-1', coords: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 3]] },
  // 2-3-1 variations (3)
  { name: 'Pola 2-3-1 (Tipe A)', type: '2-3-1', coords: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 2]] },
  { name: 'Pola 2-3-1 (Tipe B)', type: '2-3-1', coords: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 3]] },
  { name: 'Pola 2-3-1 (Tipe C)', type: '2-3-1', coords: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3], [2, 1]] },
  // 2-2-2 variation (1)
  { name: 'Pola 2-2-2 (Tangga Zig-Zag)', type: '2-2-2', coords: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]] },
  // 3-3 variation (1)
  { name: 'Pola 3-3 (Garis Ganda)', type: '3-3', coords: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3], [1, 4]] },
];

// Helper to normalize and serialize coordinates
function serializeCoords(points: Point[]): string {
  const minR = Math.min(...points.map((p) => p.r));
  const minC = Math.min(...points.map((p) => p.c));
  const normalized = points.map((p) => ({ r: p.r - minR, c: p.c - minC }));
  normalized.sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
  return normalized.map((p) => `${p.r},${p.c}`).join('|');
}

// Generate all 8 symmetries of a point set
function getAllSymmetries(points: Point[]): string[] {
  const results: string[] = [];
  for (let reflect = 0; reflect <= 1; reflect++) {
    for (let rot = 0; rot < 4; rot++) {
      let transformed = points.map((p) => ({ r: p.r, c: p.c }));
      if (reflect === 1) {
        transformed = transformed.map((p) => ({ r: p.r, c: -p.c }));
      }
      for (let i = 0; i < rot; i++) {
        transformed = transformed.map((p) => ({ r: p.c, c: -p.r }));
      }
      results.push(serializeCoords(transformed));
    }
  }
  return results;
}

// Precompute valid signatures
const CANONICAL_SIGNATURES = new Map<string, { name: string; type: string }>();
CANONICAL_NETS.forEach((net) => {
  const basePoints = net.coords.map(([r, c]) => ({ r, c }));
  const symmetries = getAllSymmetries(basePoints);
  symmetries.forEach((sig) => {
    if (!CANONICAL_SIGNATURES.has(sig)) {
      CANONICAL_SIGNATURES.set(sig, { name: net.name, type: net.type });
    }
  });
});

export const ModeJaringJaring: React.FC<Props> = ({ onPatternValidated }) => {
  const [selectedPattern, setSelectedPattern] = useState<NetPattern>(NET_PATTERNS[0]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customGrid, setCustomGrid] = useState<boolean[][]>(
    Array.from({ length: 6 }, () => Array(6).fill(false))
  );
  const [foldProgress, setFoldProgress] = useState(0); // 0 to 1
  const [isAutoFolding, setIsAutoFolding] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  }>({
    tested: true,
    valid: selectedPattern.isValid,
    message: selectedPattern.explanation,
  });

  // 3D Canvas ref
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rootMeshGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Active grid determined by mode
  const currentGrid = useMemo(() => {
    return isCustomMode ? customGrid : selectedPattern.grid;
  }, [isCustomMode, customGrid, selectedPattern]);

  // Extract active cells
  const activeCells = useMemo(() => {
    const cells: Point[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (currentGrid[r]?.[c]) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  }, [currentGrid]);

  // Switch preset pattern
  const handleSelectPreset = (pattern: NetPattern) => {
    sound.playClick();
    setSelectedPattern(pattern);
    setIsCustomMode(false);
    setFoldProgress(0);
    setValidationResult({
      tested: true,
      valid: pattern.isValid,
      message: pattern.explanation,
    });

    if (pattern.isValid) {
      sound.playSuccess();
      onPatternValidated(pattern);
    } else {
      sound.playError();
    }
  };

  // Toggle cell in custom grid
  const handleToggleCell = (r: number, c: number) => {
    sound.playTick();
    const next = customGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? !cell : cell))
    );
    setCustomGrid(next);
  };

  // Count active faces in custom grid
  const customCount = customGrid.reduce(
    (acc, row) => acc + row.filter(Boolean).length,
    0
  );

  // Validate custom grid
  const handleValidateCustom = () => {
    sound.playClick();
    if (customCount !== 6) {
      sound.playError();
      setValidationResult({
        tested: true,
        valid: false,
        message: `PERINGATAN: Jaring-jaring kubus/balok WAJIB memiliki tepat 6 sisi! Saat ini baru ada ${customCount} sisi yang dipilih.`,
      });
      return;
    }

    // Check against canonical 11 nets
    const sig = serializeCoords(activeCells);
    const matched = CANONICAL_SIGNATURES.get(sig);

    // Also check Balok preset
    const isBalok = activeCells.length === 6 && selectedPattern.shape === 'balok';

    if (matched || isBalok) {
      sound.playSuccess();
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
      const netTitle = matched ? matched.name : 'Jaring-Jaring Balok';
      setValidationResult({
        tested: true,
        valid: true,
        message: `LUAR BIASA! Pola buatan Anda VALID dan tergolong dalam ${netTitle}. Enam sisi tersambung presisi dan dapat dilipat menjadi bangun ruang tanpa tumpang tindih!`,
      });
      onPatternValidated({
        id: 'custom-valid',
        name: netTitle,
        patternType: (matched?.type as '1-4-1' | '2-3-1' | '2-2-2' | '3-3') || '1-4-1',
        shape: 'kubus',
        isValid: true,
        explanation: 'Pola buatan pemain valid!',
        grid: customGrid,
      });
    } else {
      sound.playError();
      setValidationResult({
        tested: true,
        valid: false,
        message:
          'POLA TIDAK VALID: Sisi-sisi bertabrakan atau menyisakan lubang saat dicoba dilipat. Pastikan mengikuti pola standar seperti 1-4-1, 2-3-1, 2-2-2, atau 3-3.',
      });
    }
  };

  // Reset custom grid
  const handleResetCustom = () => {
    sound.playClick();
    setCustomGrid(Array.from({ length: 6 }, () => Array(6).fill(false)));
    setValidationResult({ tested: false, valid: false, message: '' });
  };

  // Auto fold animation loop
  useEffect(() => {
    let animId: number;
    if (isAutoFolding) {
      const step = () => {
        setFoldProgress((prev) => {
          if (prev >= 1) {
            setIsAutoFolding(false);
            return 1;
          }
          return Math.min(1, prev + 0.012);
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoFolding]);

  // Three.js Scene Setup (Mount once)
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 9);

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
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight1.position.set(6, 12, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight2.position.set(-6, -2, -6);
    scene.add(dirLight2);

    // Floor holographic grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Master Group for folding tree
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootMeshGroupRef.current = rootGroup;

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 360;
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

  // Helper to build Texture with Sci-Fi Label
  const createFaceTexture = (label: string, role: string, isValid: boolean, isRoot: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 256, 256);
    if (!isValid) {
      bgGrad.addColorStop(0, 'rgba(244, 63, 94, 0.88)');
      bgGrad.addColorStop(1, 'rgba(159, 18, 57, 0.95)');
    } else if (isRoot) {
      bgGrad.addColorStop(0, 'rgba(2, 132, 199, 0.92)');
      bgGrad.addColorStop(1, 'rgba(12, 74, 110, 0.95)');
    } else {
      bgGrad.addColorStop(0, 'rgba(8, 145, 178, 0.88)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 256, 256);

    // High-tech Border
    ctx.strokeStyle = isValid ? (isRoot ? '#38bdf8' : '#67e8f9') : '#fda4af';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 244, 244);

    // Inner Corner Brackets
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(25, 25); ctx.lineTo(55, 25);
    ctx.moveTo(25, 25); ctx.lineTo(25, 55);
    ctx.moveTo(231, 25); ctx.lineTo(201, 25);
    ctx.moveTo(231, 25); ctx.lineTo(231, 55);
    ctx.moveTo(25, 231); ctx.lineTo(55, 231);
    ctx.moveTo(25, 231); ctx.lineTo(25, 201);
    ctx.moveTo(231, 231); ctx.lineTo(201, 231);
    ctx.moveTo(231, 231); ctx.lineTo(231, 201);
    ctx.stroke();

    // Primary Text (Label)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.toUpperCase(), 128, 118);

    // Secondary Text (Role)
    ctx.fillStyle = isValid ? '#e0f2fe' : '#ffe4e6';
    ctx.font = 'bold 20px "Rajdhani", sans-serif';
    ctx.fillText(role.toUpperCase(), 128, 162);

    return new THREE.CanvasTexture(canvas);
  };

  // Rebuild 3D Mesh whenever activeCells, foldProgress, or pattern changes
  useEffect(() => {
    if (!rootMeshGroupRef.current) return;
    const group = rootMeshGroupRef.current;

    // Clear old meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (activeCells.length === 0) return;

    const S = 1.25; // Standard unit square face size
    const isBalok = !isCustomMode && selectedPattern.shape === 'balok';

    // Bounding Box to center the 2D layout
    const minC = Math.min(...activeCells.map((p) => p.c));
    const maxC = Math.max(...activeCells.map((p) => p.c));
    const minR = Math.min(...activeCells.map((p) => p.r));
    const maxR = Math.max(...activeCells.map((p) => p.r));
    const midC = (minC + maxC) / 2;
    const midR = (minR + maxR) / 2;

    // 1. Determine Root Cell (prefer designated 'alas', or closest to center)
    let rootCell = activeCells.find((c) => {
      const faceInfo = selectedPattern.faces?.find((f) => f.r === c.r && f.c === c.c);
      return faceInfo?.role === 'alas';
    });

    if (!rootCell) {
      // Find cell closest to center of mass
      let bestDist = Infinity;
      rootCell = activeCells[0];
      activeCells.forEach((c) => {
        const d = (c.r - midR) ** 2 + (c.c - midC) ** 2;
        if (d < bestDist) {
          bestDist = d;
          rootCell = c;
        }
      });
    }

    // Dimension helper
    const getFaceDim = (role: string): { w: number; h: number } => {
      if (!isBalok) return { w: S, h: S };
      // Balok dimensions (Panjang=1.8, Lebar=1.2, Tinggi=0.9)
      const p = 1.8;
      const l = 1.2;
      const t = 0.9;
      if (role === 'alas' || role === 'tutup') return { w: p, h: l };
      if (role === 'depan' || role === 'belakang') return { w: p, h: t };
      if (role === 'kiri' || role === 'kanan') return { w: t, h: l };
      return { w: S, h: S };
    };

    // Role helper
    const getFaceRole = (r: number, c: number): string => {
      const found = selectedPattern.faces?.find((f) => f.r === r && f.c === c);
      if (found) return found.role;
      if (r === rootCell!.r && c === rootCell!.c) return 'alas';
      return `sisi ${r + 1},${c + 1}`;
    };

    // 2. Build Spanning Tree from active cells using BFS
    const visited = new Set<string>();
    const rootNode: TreeNode = {
      r: rootCell.r,
      c: rootCell.c,
      role: getFaceRole(rootCell.r, rootCell.c),
      ...getFaceDim(getFaceRole(rootCell.r, rootCell.c)),
      children: [],
    };

    visited.add(`${rootCell.r},${rootCell.c}`);
    const queue: TreeNode[] = [rootNode];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const neighbors: { r: number; c: number; dir: 'right' | 'left' | 'down' | 'up' }[] = [
        { r: curr.r, c: curr.c + 1, dir: 'right' },
        { r: curr.r, c: curr.c - 1, dir: 'left' },
        { r: curr.r + 1, c: curr.c, dir: 'down' },
        { r: curr.r - 1, c: curr.c, dir: 'up' },
      ];

      neighbors.forEach(({ r, c, dir }) => {
        const key = `${r},${c}`;
        if (currentGrid[r]?.[c] && !visited.has(key)) {
          visited.add(key);
          const role = getFaceRole(r, c);
          const childNode: TreeNode = {
            r,
            c,
            role,
            ...getFaceDim(role),
            children: [],
          };
          curr.children.push({ node: childNode, dir });
          queue.push(childNode);
        }
      });
    }

    // 3. Recursive Three.js Tree Builder
    const foldAngle = (Math.PI / 2) * foldProgress;

    const buildMeshNode = (node: TreeNode, parentGroup: THREE.Group, isRootNode: boolean) => {
      const nodeGroup = new THREE.Group();
      parentGroup.add(nodeGroup);

      // Create Plane Mesh
      const geom = new THREE.PlaneGeometry(node.w, node.h);
      const texture = createFaceTexture(
        node.role,
        isRootNode ? 'Dasar' : `(r${node.r + 1},c${node.c + 1})`,
        validationResult.valid,
        isRootNode
      );

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.94,
        roughness: 0.25,
        metalness: 0.45,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = Math.PI / 2; // Flat on horizontal plane
      nodeGroup.add(mesh);

      // Edge outline
      const edges = new THREE.EdgesGeometry(geom);
      const edgeLine = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: validationResult.valid ? 0x67e8f9 : 0xfca5a5,
          linewidth: 2,
        })
      );
      edgeLine.rotation.x = Math.PI / 2;
      nodeGroup.add(edgeLine);

      // Add each child with proper hinge pivot and rotation
      node.children.forEach(({ node: childNode, dir }) => {
        const pivot = new THREE.Group();
        const childGroup = new THREE.Group();

        if (dir === 'right') {
          // Hinge on right edge
          pivot.position.set(node.w / 2, 0, 0);
          childGroup.position.set(childNode.w / 2, 0, 0);
          pivot.rotation.z = foldAngle;
        } else if (dir === 'left') {
          // Hinge on left edge
          pivot.position.set(-node.w / 2, 0, 0);
          childGroup.position.set(-childNode.w / 2, 0, 0);
          pivot.rotation.z = -foldAngle;
        } else if (dir === 'down') {
          // Hinge on bottom/down edge (along +Z)
          pivot.position.set(0, 0, node.h / 2);
          childGroup.position.set(0, 0, childNode.h / 2);
          pivot.rotation.x = -foldAngle;
        } else if (dir === 'up') {
          // Hinge on top/up edge (along -Z)
          pivot.position.set(0, 0, -node.h / 2);
          childGroup.position.set(0, 0, -childNode.h / 2);
          pivot.rotation.x = foldAngle;
        }

        pivot.add(childGroup);
        nodeGroup.add(pivot);

        // Recursively build children
        buildMeshNode(childNode, childGroup, false);
      });
    };

    // Build the tree hierarchy starting from root
    buildMeshNode(rootNode, group, true);

    // 4. Smooth Centering:
    // At foldProgress = 0, center the 2D layout at (0, 0, 0).
    // At foldProgress = 1, center the folded 3D solid at (0, S/2, 0).
    const flatOffsetX = -(midC - rootCell.r !== undefined ? midC - rootCell.c : 0) * S * (1 - foldProgress);
    const flatOffsetZ = -(midR - rootCell.r) * S * (1 - foldProgress);
    const liftY = foldProgress * (S / 2);

    group.position.set(flatOffsetX, liftY, flatOffsetZ);

    // 5. Handle any disconnected active cells (in custom mode)
    activeCells.forEach((c) => {
      const key = `${c.r},${c.c}`;
      if (!visited.has(key)) {
        const discGroup = new THREE.Group();
        discGroup.position.set((c.c - midC) * S, 0, (c.r - midR) * S);
        const geom = new THREE.PlaneGeometry(S, S);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          wireframe: true,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = Math.PI / 2;
        discGroup.add(mesh);
        group.add(discGroup);
      }
    });

    // 6. Glowing core inside when 100% folded and valid
    if (foldProgress > 0.88 && validationResult.valid) {
      const coreGeom = new THREE.OctahedronGeometry(0.35);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      core.position.set(0, 0, 0);
      group.add(core);
    }
  }, [activeCells, foldProgress, selectedPattern, validationResult, isCustomMode, currentGrid]);

  return (
    <div className="space-y-6">

      {/* Intro banner */}
      <div className="p-4 md:p-5 rounded-2xl glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-tech text-xs tracking-wider border border-cyan-500/30">
              MODUL CETAK BIRU INTERAKTIF
            </span>
            <span className="text-xs text-slate-400">Kurikulum Fase C SD (Kelas 5-6)</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold font-display text-white">
            Simulasi Jaring-Jaring 2D ke 3D Folding Real-Time
          </h2>
          <p className="text-xs text-slate-300">
            Pilih cetak biru pola jaring-jaring atau gambar mandiri di grid 2D. Simulator 3D akan <strong>menampilkan pola yang Anda pilih secara presisi</strong> dan melipatnya menjadi bangun ruang!
          </p>
        </div>

        {/* Mode Toggle Button: Presets vs Custom Draw */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setIsCustomMode(false);
              setFoldProgress(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              !isCustomMode
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pola Kurikulum Standar
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsCustomMode(true);
              setFoldProgress(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isCustomMode
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rancang Mandiri (Grid 6x6)
          </button>
        </div>
      </div>

      {/* Main Grid: 2D Blueprint & 3D WebGL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: 2D Grid & Pattern Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Preset Selector */}
          {!isCustomMode ? (
            <div className="p-4 rounded-xl glass-panel space-y-3">
              <label className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                PILIH CETAK BIRU POLA JARING-JARING:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {NET_PATTERNS.map((p) => {
                  const isSelected = selectedPattern.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-lg text-left text-xs transition border cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? p.isValid
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400'
                            : 'bg-rose-950/80 border-rose-400 text-rose-200 shadow-md shadow-rose-500/25 ring-1 ring-rose-400'
                          : 'bg-slate-900/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                        <span>{p.patternType.toUpperCase()}</span>
                        <span className={p.isValid ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {p.isValid ? '✓ Valid' : '✗ Rusak'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Canvas Controls */
            <div className="p-4 rounded-xl glass-panel space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider">
                    STUDIO RANCANG CETAK BIRU MANDIRI
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Klik kotak di grid untuk menaruh 6 sisi kargo ({customCount}/6 Sisi terpilih).
                  </div>
                </div>
                <button
                  onClick={handleResetCustom}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Grid</span>
                </button>
              </div>

              <button
                onClick={handleValidateCustom}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display text-xs tracking-wider transition shadow-md shadow-cyan-500/25 cursor-pointer"
              >
                UJI KELAYAKAN POLA MANDIRI ({customCount}/6 SISI)
              </button>
            </div>
          )}

          {/* 2D Interactive Grid View */}
          <div className="p-5 rounded-2xl glass-panel flex flex-col items-center justify-center relative min-h-[310px]">
            <div className="absolute top-3 left-4 text-xs font-tech text-slate-300 tracking-wider flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isCustomMode
                  ? 'GRID PERSEGI 6x6 (KLIK UNTUK AKTIFKAN / NONAKTIFKAN SISI)'
                  : `POLA AKTIF: ${selectedPattern.name}`}
              </span>
            </div>

            {/* 6x6 Grid */}
            <div className="grid grid-cols-6 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner mt-6">
              {currentGrid.map((row, r) =>
                row.map((active, c) => {
                  const faceRole = selectedPattern.faces?.find((f) => f.r === r && f.c === c)?.role;
                  return (
                    <button
                      key={`${r}-${c}`}
                      disabled={!isCustomMode}
                      onClick={() => handleToggleCell(r, c)}
                      className={`w-11 h-11 md:w-13 md:h-13 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        active
                          ? validationResult.valid
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100 shadow-sm shadow-cyan-400/30 scale-95'
                            : 'bg-rose-500/25 border-rose-400 text-rose-100 shadow-sm shadow-rose-400/30 scale-95'
                          : isCustomMode
                          ? 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 cursor-pointer'
                          : 'bg-transparent border-slate-800/30 opacity-20'
                      }`}
                    >
                      {active && (
                        <>
                          <span className="font-bold font-mono text-[10px] md:text-xs">
                            {faceRole ? faceRole.toUpperCase() : 'SISI'}
                          </span>
                          <span className="text-[8px] opacity-70 font-mono">
                            {r + 1},{c + 1}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-400 text-center">
              Total Sisi Aktif: <strong className="text-cyan-300">{activeCells.length} Sisi</strong> (Kubus & Balok memiliki tepat 6 sisi)
            </div>
          </div>

          {/* Validation Feedback Banner */}
          {validationResult.tested && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                validationResult.valid
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold font-display uppercase tracking-wider">
                  {validationResult.valid
                    ? 'STATUS: POLA VALID & MEMBENTUK KUBUS/BALOK'
                    : 'STATUS: POLA TIDAK LAYAK (CACAT CETAK BIRU)'}
                </div>
                <div className="text-xs leading-relaxed text-slate-200">
                  {validationResult.message}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: 3D Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl glass-panel-glow space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-cyan-400" />
                SIMULATOR 3D (MENAMPILKAN SESUAI POLA)
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                {activeCells.length} SISI TERETAK
              </span>
            </div>

            {/* 3D WebGL Canvas Container */}
            <div
              ref={mountRef}
              className="w-full h-[300px] md:h-[350px] rounded-xl bg-slate-950/90 border border-cyan-500/25 relative overflow-hidden cursor-grab active:cursor-grabbing"
            >
              <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                DRAG MOUSE UNTUK ROTASI 3D • SCROLL ZOOM
              </div>

              {/* Holographic corner markers */}
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />

              {/* Status indicator on canvas */}
              <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded">
                Sudut Lipat: <strong className="text-cyan-300">{Math.round(foldProgress * 90)}°</strong> ({Math.round(foldProgress * 100)}%)
              </div>
            </div>

            {/* Fold Slider & Controls */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Tingkat Lipatan (Folding Angle):</span>
                <span className="font-mono text-cyan-300 font-bold">{Math.round(foldProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={foldProgress}
                onChange={(e) => {
                  sound.playTick();
                  setFoldProgress(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Cetak Biru 2D Datar)</span>
                <span>50% (Sedang Melipat)</span>
                <span>100% (Tertutup Rapat 3D)</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsAutoFolding(true);
                  }}
                  disabled={isAutoFolding}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-cyan-500/30 transition disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Animasi Lipat Otomatis</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setFoldProgress(0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Buka Datar</span>
                </button>
              </div>
            </div>

            {/* Pedagogical Note */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Prinsip Jaring-Jaring Fase C SD:
              </div>
              <p className="text-slate-400 leading-relaxed">
                Di posisi <strong>0%</strong>, simulator memperlihatkan cetak biru datar persis seperti pola yang Anda pilih. Saat digeser ke <strong>100%</strong>, setiap persegi melipat 90° pada sambungan rusuknya. Jika pola valid, keenam sisi bertemu tepat di rusuk tanpa ada yang saling menabrak (overlap).
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
