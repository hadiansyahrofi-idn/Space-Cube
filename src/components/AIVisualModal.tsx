import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Key, Download, RefreshCw, Eye, EyeOff, Globe, Shield, Box, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { ShieldTheme } from '../types/game';
import { sound } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dimensions: { p: number; l: number; t: number; shape: 'kubus' | 'balok' };
  shield: ShieldTheme;
}

const PLANETS = [
  { id: 'mars', name: 'Koloni Tambang Mars Alpha', desc: 'Permukaan merah gurun pasir berdebu dengan kubah terraform' },
  { id: 'kepler', name: 'Planet Cincin Kepler-186f', desc: 'Planet berair berkilau biru dengan cincin es kosmik raksasa' },
  { id: 'cyberport', name: 'Pelabuhan Antariksa Neo-Tokyo Orbit', desc: 'Stasiun luar angkasa megah berhias neon cyberpunk dan kapal kargo lalu-lalang' },
  { id: 'saturn', name: 'Cincin Asteroid Saturnus Prime', desc: 'Sabuk asteroid berkabut hidrogen dengan pendaran cahaya matahari keemasan' },
  { id: 'gliese', name: 'Gliese 667Cc Tiga Surya', desc: 'Langit eksotis dengan pemandangan 3 matahari kembar dan aurora magnetik' }
];

const CARGO_CONTENTS = [
  'Kristal Energi Fusi Hyperdrive (Bahan Bakar Kecepatan Cahaya)',
  'Kapsul Makanan & Oksigen untuk Pangkalan Bulan',
  'Unit Pemancar Perisai Deflektor Asteroid',
  'Komputer Kuantum Navigasi Antargalaksi',
  'Spesimen Tanaman Eksotis Laboratorium Bio-Dome'
];

export const AIVisualModal: React.FC<Props> = ({ isOpen, onClose, dimensions, shield }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(PLANETS[0].name);
  const [selectedContent, setSelectedContent] = useState(CARGO_CONTENTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load API key from localStorage if saved
  useEffect(() => {
    const saved = localStorage.getItem('google_ai_studio_api_key');
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('google_ai_studio_api_key', val);
  };

  // Build the detailed sci-fi prompt based on student's dimensions
  const buildPrompt = () => {
    const shapeLabel = dimensions.shape === 'kubus' 
      ? `perfect symmetrical cube cargo container with identical side length of ${dimensions.p} meters on all axes (LxWxH: ${dimensions.p}m x ${dimensions.p}m x ${dimensions.p}m)`
      : `elongated rectangular cuboid cargo container measuring ${dimensions.p} meters length, ${dimensions.l} meters width, and ${dimensions.t} meters height`;

    return `Cinematic 8k photorealistic sci-fi space render. A heavy interstellar freight cargo box: ${shapeLabel}. The container is protected by an active translucent ${shield.colorName} holographic energy forcefield (${shield.hex}) with glowing matrix honeycomb patterns. Inside, it securely transports ${selectedContent}. The cargo is anchored with industrial magnetic clamps on the launch bay of an interstellar cargo vessel hovering above the alien horizon of ${selectedPlanet}. Dramatic rim lighting, deep space starfield nebula background, volumetric engine thruster smoke, Octane Render, Unreal Engine 5 quality.`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt());
    setCopiedPrompt(true);
    sound.playClick();
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Procedural Sci-Fi Canvas Generator (High-Fidelity Offline / Instant Fallback)
  const generateProceduralPoster = () => {
    sound.playShield();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Deep Space background
    const bgGrad = ctx.createRadialGradient(640, 360, 50, 640, 360, 800);
    bgGrad.addColorStop(0, '#090d24');
    bgGrad.addColorStop(0.6, '#040612');
    bgGrad.addColorStop(1, '#010206');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 720);

    // 2. Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 220; i++) {
      const sx = Math.random() * 1280;
      const sy = Math.random() * 720;
      const sr = Math.random() * 1.8 + 0.3;
      ctx.globalAlpha = Math.random() * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Planet in background
    const planetX = 1000;
    const planetY = 220;
    const planetR = 240;
    const planetGrad = ctx.createRadialGradient(planetX - 70, planetY - 70, 20, planetX, planetY, planetR);
    if (selectedPlanet.includes('Mars')) {
      planetGrad.addColorStop(0, '#f97316');
      planetGrad.addColorStop(0.7, '#c2410c');
      planetGrad.addColorStop(1, '#1e0b04');
    } else if (selectedPlanet.includes('Kepler')) {
      planetGrad.addColorStop(0, '#38bdf8');
      planetGrad.addColorStop(0.7, '#0284c7');
      planetGrad.addColorStop(1, '#082f49');
    } else {
      planetGrad.addColorStop(0, '#c084fc');
      planetGrad.addColorStop(0.7, '#7c3aed');
      planetGrad.addColorStop(1, '#1e1b4b');
    }
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();

    // Planet atmosphere glow
    ctx.strokeStyle = shield.hex;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 4. Spacecraft Deck Grid / Docking bay
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 1280; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 500);
      ctx.lineTo(640 + (x - 640) * 1.8, 720);
      ctx.stroke();
    }
    for (let y = 500; y <= 720; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // 5. 3D Isometric Cargo Render
    const cx = 500;
    const cy = 460;
    const scale = 36;
    const p = dimensions.p * scale;
    const l = dimensions.l * scale;
    const t = dimensions.t * scale;

    const isoX = (x: number, y: number) => (x - y) * 0.866;
    const isoY = (x: number, y: number, z: number) => (x + y) * 0.5 - z;

    const p0 = { x: cx + isoX(0, 0), y: cy + isoY(0, 0, 0) };
    const pX = { x: cx + isoX(p, 0), y: cy + isoY(p, 0, 0) };
    const pY = { x: cx + isoX(0, l), y: cy + isoY(0, l, 0) };
    const pXY = { x: cx + isoX(p, l), y: cy + isoY(p, l, 0) };

    const pZ = { x: cx + isoX(0, 0), y: cy + isoY(0, 0, t) };
    const pXZ = { x: cx + isoX(p, 0), y: cy + isoY(p, 0, t) };
    const pYZ = { x: cx + isoX(0, l), y: cy + isoY(0, l, t) };
    const pXYZ = { x: cx + isoX(p, l), y: cy + isoY(p, l, t) };

    // Front-Right Face (X-Z)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(pX.x, pX.y);
    ctx.lineTo(pXZ.x, pXZ.y);
    ctx.lineTo(pZ.x, pZ.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shield.hex;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Front-Left Face (Y-Z)
    ctx.fillStyle = 'rgba(23, 37, 84, 0.9)';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(pY.x, pY.y);
    ctx.lineTo(pYZ.x, pYZ.y);
    ctx.lineTo(pZ.x, pZ.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Face (X-Y)
    ctx.fillStyle = 'rgba(30, 58, 138, 0.95)';
    ctx.beginPath();
    ctx.moveTo(pZ.x, pZ.y);
    ctx.lineTo(pXZ.x, pXZ.y);
    ctx.lineTo(pXYZ.x, pXYZ.y);
    ctx.lineTo(pYZ.x, pYZ.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shield Forcefield Glowing Aura
    ctx.fillStyle = shield.hex;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(pZ.x, pZ.y - 10);
    ctx.lineTo(pXZ.x + 10, pXZ.y - 5);
    ctx.lineTo(pXYZ.x + 10, pXYZ.y + 10);
    ctx.lineTo(pX.x + 10, pX.y + 10);
    ctx.lineTo(p0.x, p0.y + 15);
    ctx.lineTo(pY.x - 10, pY.y + 10);
    ctx.lineTo(pYZ.x - 10, pYZ.y - 5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // 6. HUD / Telemetry Overlay
    ctx.fillStyle = 'rgba(6, 182, 212, 0.95)';
    ctx.font = 'bold 26px "Orbitron", monospace';
    ctx.fillText('ASTRO-CARGO NOVA // VISUALISASI AI RENDERING', 50, 70);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '16px "Rajdhani", sans-serif';
    ctx.fillText(`BANGUN: ${dimensions.shape.toUpperCase()} | DIMENSI: ${dimensions.p}m × ${dimensions.l}m × ${dimensions.t}m`, 50, 105);
    ctx.fillText(`VOLUME: ${dimensions.p * dimensions.l * dimensions.t} m³ | PERISAI: ${shield.name.toUpperCase()}`, 50, 130);
    ctx.fillText(`LOKASI DEPLOY: ${selectedPlanet}`, 50, 155);

    // Dimension indicators
    ctx.fillStyle = shield.hex;
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`Panjang: ${dimensions.p}m`, pX.x + 10, pX.y);
    ctx.fillText(`Lebar: ${dimensions.l}m`, pY.x - 90, pY.y);
    ctx.fillText(`Tinggi: ${dimensions.t}m`, pZ.x - 40, (p0.y + pZ.y) / 2);

    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedImageUrl(dataUrl);
    sound.playSuccess();
  };

  // Real Google AI Studio API Call (Imagen 3 / Image Generation Model)
  const handleGenerateAI = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setErrorMsg('Masukkan API Key Google AI Studio Anda terlebih dahulu, atau gunakan mode "Visual Cepat Hologram (Tanpa API Key)".');
      sound.playError();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    sound.playShield();

    const promptText = buildPrompt();

    try {
      // 1. Try Imagen 3 endpoint
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${trimmedKey}`;
      const payload = {
        instances: [{ prompt: promptText }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg"
        }
      };

      const res = await fetch(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        // Try fallback to Gemini 3.1 Flash Image if Imagen 3 quota/permission differs
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${trimmedKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseModalities: ["IMAGE"] }
          })
        }).catch(() => null);

        if (geminiRes && geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const base64Data = geminiData.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData)?.inlineData?.data;
          if (base64Data) {
            setGeneratedImageUrl(`data:image/jpeg;base64,${base64Data}`);
            sound.playSuccess();
            setIsGenerating(false);
            return;
          }
        }

        const msg = errJson.error?.message || `HTTP ${res.status}: Gagal memanggil Imagen 3.`;
        throw new Error(msg);
      }

      const data = await res.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        setGeneratedImageUrl(`data:image/jpeg;base64,${b64}`);
        sound.playSuccess();
      } else {
        throw new Error('Format gambar tidak ditemukan dari respon Google AI Studio.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungkan ke Google AI Studio API.';
      setErrorMsg(`${msg} (Tip: Periksa apakah API Key Anda valid dan memiliki izin Imagen 3 di aistudio.google.com). Anda tetap dapat menggunakan tombol 'Visual Cepat Hologram' di bawah!`);
      sound.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `SpaceCargo_${dimensions.shape}_${dimensions.p}x${dimensions.l}x${dimensions.t}.png`;
    a.click();
    sound.playClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-panel-glow rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl border border-cyan-500/40">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 text-cyan-300 border border-cyan-500/40">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display tracking-wider text-cyan-300">
                GENERATOR VISUAL KARGO & PLANET AI
              </h2>
              <p className="text-xs md:text-sm text-cyan-100/70 font-tech uppercase tracking-wider">
                Google Imagen 3 & Neural Spaceport Rendering Engine
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

        <div className="space-y-6">

          {/* API Key Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                GOOGLE AI STUDIO API KEY
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                Dapatkan API Key Gratis di Google AI Studio ↗
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder="Tempel Google AI Studio API Key (AIzaSy...)"
                className="w-full px-4 py-2.5 pr-11 bg-slate-950/80 border border-cyan-500/30 rounded-lg text-sm font-mono text-cyan-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * Kunci disimpan aman secara lokal di browser Anda. Jika Anda belum memiliki API Key, Anda tetap dapat menghasilkan visual kargo berkualitas tinggi dengan tombol <strong>Visual Cepat Hologram</strong>.
            </p>
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Planet destination */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                DESTINASI PLANET KOSMIK
              </label>
              <select
                value={selectedPlanet}
                onChange={(e) => setSelectedPlanet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {PLANETS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400">
                {PLANETS.find((p) => p.name === selectedPlanet)?.desc}
              </div>
            </div>

            {/* Cargo content */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Box className="w-4 h-4 text-violet-400" />
                MUATAN ISI KARGO
              </label>
              <select
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs md:text-sm text-slate-200 focus:outline-none focus:border-violet-400 cursor-pointer"
              >
                {CARGO_CONTENTS.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-400">
                Sistem isolasi muatan menyesuaikan dimensi {dimensions.shape} ({dimensions.p}m × {dimensions.l}m × {dimensions.t}m).
              </div>
            </div>
          </div>

          {/* Current Dimensions & Prompt Preview */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Prompt AI yang Diformulasikan Berdasarkan Dimensi Anda:
              </span>
              <button
                onClick={handleCopyPrompt}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Tersalin!' : 'Salin Prompt'}</span>
              </button>
            </div>
            <div className="p-3 bg-black/50 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto">
              {buildPrompt()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex-1 min-w-[240px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold font-display tracking-wider text-sm transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>MEMPROSES GENERASI GOOGLE IMAGEN 3...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>HASILKAN VISUAL KARGO & PLANET AI</span>
                </>
              )}
            </button>

            <button
              onClick={generateProceduralPoster}
              disabled={isGenerating}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-semibold text-xs md:text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4 text-cyan-400" />
              <span>Visual Cepat Hologram (Tanpa API Key)</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Result Showcase */}
          {generatedImageUrl && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  VISUALISASI KARGO RUANG ANGKASA SELESAI DICETAK!
                </span>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition border border-cyan-500/40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster HD</span>
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 shadow-2xl bg-black">
                <img
                  src={generatedImageUrl}
                  alt="Visual Kargo & Planet AI"
                  className="w-full h-auto max-h-[360px] object-contain mx-auto"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
