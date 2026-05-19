'use client';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import {
  Layers, Download, GitCompare, Box, Loader2, Eye, EyeOff,
  RotateCcw, Maximize2, ChevronDown, ChevronRight,
  Hammer, Upload, FileText, AlertCircle, TrendingUp, TrendingDown,
  Minus, Plus, Sparkles, X
} from 'lucide-react';

// =============================================================================
// BID LEVEL — Interactive BIM Takeoff Prototype
// =============================================================================

// ---------- Design tokens ----------
const C = {
  bg: '#0A0B0E',
  surface: '#13161B',
  surfaceHi: '#1B1F27',
  surfaceMax: '#252A35',
  border: '#2A2F38',
  borderHi: '#3A414C',
  text: '#E8EAED',
  textDim: '#8B92A0',
  textMute: '#5A6170',
  accent: '#FF6B35',
  accentDim: '#A8431F',
  blueprint: '#4A9EFF',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
};

const CSI_COLORS: Record<string, number> = {
  '03 - Concrete':       0xA8A8A8,
  '04 - Masonry':        0xC9A875,
  '05 - Metals':         0x5B7CA6,
  '06 - Wood/Plastics':  0xB28A5C,
  '07 - Thermal/Moist.': 0x7A6B5D,
  '08 - Openings':       0x7FB8D4,
  '09 - Finishes':       0xD4C4A8,
};

const buildScene = (scene: THREE.Scene) => {
  const meshes: THREE.Mesh[] = [];
  const W = 80, D = 50, FLOOR_H = 11;
  const WALL_H = FLOOR_H * 2;
  const WALL_T = 0.65;
  const COL_X = [-30, -10, 10, 30];
  const COL_Z = [-20, 0, 20];

  const makeMat = (color: number, opts: any = {}) => new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.05,
    transparent: true,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });

  const addMesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.MeshStandardMaterial,
    tag: any,
    transform?: { pos?: [number, number, number]; rot?: [number, number, number] }
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.userData = { ...tag, originalColor: mat.color.getHex(), originalOpacity: mat.opacity };
    if (transform?.pos) m.position.set(transform.pos[0], transform.pos[1], transform.pos[2]);
    if (transform?.rot) m.rotation.set(transform.rot[0], transform.rot[1], transform.rot[2]);
    scene.add(m);
    meshes.push(m);
    return m;
  };

  const makeWallGeo = (length: number, height: number, thickness: number, openings: any[]) => {
    const shape = new THREE.Shape();
    shape.moveTo(-length / 2, 0);
    shape.lineTo(length / 2, 0);
    shape.lineTo(length / 2, height);
    shape.lineTo(-length / 2, height);
    shape.lineTo(-length / 2, 0);
    openings.forEach(o => {
      const x1 = o.pos - o.w / 2, x2 = o.pos + o.w / 2;
      const y1 = o.y - o.h / 2,   y2 = o.y + o.h / 2;
      const hole = new THREE.Path();
      hole.moveTo(x1, y1);
      hole.lineTo(x2, y1);
      hole.lineTo(x2, y2);
      hole.lineTo(x1, y2);
      hole.lineTo(x1, y1);
      shape.holes.push(hole);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    geo.translate(0, 0, -thickness / 2);
    return geo;
  };

  // Division 03: Concrete
  addMesh(new THREE.BoxGeometry(W, 0.5, D), makeMat(CSI_COLORS['03 - Concrete']),
    { csi: '03 - Concrete', item: 'Slab on Grade — 6" thick', qty: 74, unit: 'cy' }, { pos: [0, -0.25, 0] });
  addMesh(new THREE.BoxGeometry(W, 0.67, D), makeMat(CSI_COLORS['03 - Concrete']),
    { csi: '03 - Concrete', item: '2nd Floor Slab — 8" thick', qty: 99, unit: 'cy' }, { pos: [0, FLOOR_H, 0] });
  addMesh(new THREE.BoxGeometry(W, 0.4, D), makeMat(CSI_COLORS['03 - Concrete']),
    { csi: '03 - Concrete', item: 'Roof Deck — 4" concrete topping', qty: 59, unit: 'cy' }, { pos: [0, WALL_H, 0] });
  COL_X.forEach(x => COL_Z.forEach(z => {
    addMesh(new THREE.BoxGeometry(3, 0.8, 3), makeMat(CSI_COLORS['03 - Concrete']),
      { csi: '03 - Concrete', item: 'Footing Pads — 3000 PSI', qty: 23 / 12, unit: 'cy' }, { pos: [x, -0.9, z] });
  }));

  // Division 04: Masonry
  const winF1Y = 4, winF2Y = 15, winSize = 4;
  const sfY = 4, sfW = 12, sfH = 8;
  const doorY = 3.5, doorW = 3.5, doorH = 7;
  const cmuPerWall = 5316 / 4;

  const northOpenings = [
    { pos: 0, y: sfY, w: sfW, h: sfH },
    { pos: -28, y: winF1Y, w: winSize, h: winSize }, { pos: -18, y: winF1Y, w: winSize, h: winSize },
    { pos: 18, y: winF1Y, w: winSize, h: winSize }, { pos: 28, y: winF1Y, w: winSize, h: winSize },
    { pos: -28, y: winF2Y, w: winSize, h: winSize }, { pos: -18, y: winF2Y, w: winSize, h: winSize },
    { pos: -8, y: winF2Y, w: winSize, h: winSize }, { pos: 8, y: winF2Y, w: winSize, h: winSize },
    { pos: 18, y: winF2Y, w: winSize, h: winSize }, { pos: 28, y: winF2Y, w: winSize, h: winSize },
  ];
  addMesh(makeWallGeo(W, WALL_H, WALL_T, northOpenings), makeMat(CSI_COLORS['04 - Masonry'], { roughness: 0.95 }),
    { csi: '04 - Masonry', item: 'CMU 8" Block — Exterior', qty: cmuPerWall, unit: 'sf' }, { pos: [0, 0, D / 2 - WALL_T / 2] });

  const sFwinX = [-28, -18, -8, 8, 18, 28];
  const southOpenings = [
    ...sFwinX.map(x => ({ pos: x, y: winF1Y, w: winSize, h: winSize })),
    ...sFwinX.map(x => ({ pos: x, y: winF2Y, w: winSize, h: winSize })),
  ];
  addMesh(makeWallGeo(W, WALL_H, WALL_T, southOpenings), makeMat(CSI_COLORS['04 - Masonry'], { roughness: 0.95 }),
    { csi: '04 - Masonry', item: 'CMU 8" Block — Exterior', qty: cmuPerWall, unit: 'sf' }, { pos: [0, 0, -D / 2 + WALL_T / 2] });

  const eastOpenings = [
    { pos: 0, y: doorY, w: doorW, h: doorH },
    { pos: -18, y: winF1Y, w: winSize, h: winSize }, { pos: 18, y: winF1Y, w: winSize, h: winSize },
    { pos: -18, y: winF2Y, w: winSize, h: winSize }, { pos: 0, y: winF2Y, w: winSize, h: winSize },
    { pos: 18, y: winF2Y, w: winSize, h: winSize },
  ];
  addMesh(makeWallGeo(D, WALL_H, WALL_T, eastOpenings), makeMat(CSI_COLORS['04 - Masonry'], { roughness: 0.95 }),
    { csi: '04 - Masonry', item: 'CMU 8" Block — Exterior', qty: cmuPerWall, unit: 'sf' },
    { pos: [W / 2 - WALL_T / 2, 0, 0], rot: [0, Math.PI / 2, 0] });

  const westOpenings = [
    { pos: 0, y: doorY, w: doorW, h: doorH },
    { pos: -18, y: winF1Y, w: winSize, h: winSize }, { pos: 18, y: winF1Y, w: winSize, h: winSize },
    { pos: -18, y: winF2Y, w: winSize, h: winSize }, { pos: 0, y: winF2Y, w: winSize, h: winSize },
    { pos: 18, y: winF2Y, w: winSize, h: winSize },
  ];
  addMesh(makeWallGeo(D, WALL_H, WALL_T, westOpenings), makeMat(CSI_COLORS['04 - Masonry'], { roughness: 0.95 }),
    { csi: '04 - Masonry', item: 'CMU 8" Block — Exterior', qty: cmuPerWall, unit: 'sf' },
    { pos: [-W / 2 + WALL_T / 2, 0, 0], rot: [0, -Math.PI / 2, 0] });

  const parapetH = 1.5;
  [
    { dims: [W + 0.4, parapetH, 0.5] as [number,number,number], pos: [0, WALL_H + 0.45 + parapetH / 2, D / 2 - 0.25] as [number,number,number] },
    { dims: [W + 0.4, parapetH, 0.5] as [number,number,number], pos: [0, WALL_H + 0.45 + parapetH / 2, -D / 2 + 0.25] as [number,number,number] },
    { dims: [0.5, parapetH, D + 0.4] as [number,number,number], pos: [W / 2 - 0.25, WALL_H + 0.45 + parapetH / 2, 0] as [number,number,number] },
    { dims: [0.5, parapetH, D + 0.4] as [number,number,number], pos: [-W / 2 + 0.25, WALL_H + 0.45 + parapetH / 2, 0] as [number,number,number] },
  ].forEach(p => addMesh(new THREE.BoxGeometry(...p.dims), makeMat(CSI_COLORS['04 - Masonry'], { roughness: 0.95 }),
    { csi: '04 - Masonry', item: 'CMU 8" Block — Exterior', qty: 0, unit: 'sf' }, { pos: p.pos }));

  // Division 05: Metals
  COL_X.forEach(x => COL_Z.forEach(z => {
    addMesh(new THREE.BoxGeometry(0.9, WALL_H, 0.9), makeMat(CSI_COLORS['05 - Metals'], { roughness: 0.45, metalness: 0.65 }),
      { csi: '05 - Metals', item: 'W10x33 Steel Column', qty: 22, unit: 'lf' }, { pos: [x, WALL_H / 2, z] });
  }));

  let beamCount = 0, totalBeamLength = 0;
  [FLOOR_H - 0.5, WALL_H - 0.4].forEach(() => {
    COL_Z.forEach(() => { for (let i = 0; i < COL_X.length - 1; i++) { beamCount++; totalBeamLength += COL_X[i + 1] - COL_X[i]; } });
    COL_X.forEach(() => { for (let i = 0; i < COL_Z.length - 1; i++) { beamCount++; totalBeamLength += COL_Z[i + 1] - COL_Z[i]; } });
  });

  [FLOOR_H - 0.5, WALL_H - 0.4].forEach(yLvl => {
    COL_Z.forEach(z => {
      for (let i = 0; i < COL_X.length - 1; i++) {
        const x1 = COL_X[i], x2 = COL_X[i + 1], span = x2 - x1;
        addMesh(new THREE.BoxGeometry(span - 1, 1, 0.7), makeMat(CSI_COLORS['05 - Metals'], { roughness: 0.45, metalness: 0.65 }),
          { csi: '05 - Metals', item: 'W12x26 Steel Beam', qty: span, unit: 'lf' }, { pos: [(x1 + x2) / 2, yLvl, z] });
      }
    });
    COL_X.forEach(x => {
      for (let i = 0; i < COL_Z.length - 1; i++) {
        const z1 = COL_Z[i], z2 = COL_Z[i + 1], span = z2 - z1;
        addMesh(new THREE.BoxGeometry(0.7, 1, span - 1), makeMat(CSI_COLORS['05 - Metals'], { roughness: 0.45, metalness: 0.65 }),
          { csi: '05 - Metals', item: 'W12x26 Steel Beam', qty: span, unit: 'lf' }, { pos: [x, yLvl, (z1 + z2) / 2] });
      }
    });
  });

  // Division 08: Openings
  const winMat = () => makeMat(0x6BA4C9, { roughness: 0.1, metalness: 0.2, opacity: 0.55 });
  const addWindow = (x: number, y: number, z: number, w: number, h: number, axis: string) => {
    const dims = axis === 'NS' ? [w, h, 0.15] as [number,number,number] : [0.15, h, w] as [number,number,number];
    addMesh(new THREE.BoxGeometry(...dims), winMat(),
      { csi: '08 - Openings', item: "Aluminum Window 4'×4'", qty: 1, unit: 'ea' }, { pos: [x, y, z] });
  };

  [{x: -28}, {x: -18}, {x: 18}, {x: 28}].forEach(o => addWindow(o.x, winF1Y, D / 2 - WALL_T / 2, winSize, winSize, 'NS'));
  [-28, -18, -8, 8, 18, 28].forEach(x => addWindow(x, winF2Y, D / 2 - WALL_T / 2, winSize, winSize, 'NS'));
  sFwinX.forEach(x => addWindow(x, winF1Y, -D / 2 + WALL_T / 2, winSize, winSize, 'NS'));
  sFwinX.forEach(x => addWindow(x, winF2Y, -D / 2 + WALL_T / 2, winSize, winSize, 'NS'));
  [-18, 18].forEach(z => addWindow(W / 2 - WALL_T / 2, winF1Y, z, winSize, winSize, 'EW'));
  [-18, 0, 18].forEach(z => addWindow(W / 2 - WALL_T / 2, winF2Y, z, winSize, winSize, 'EW'));
  [-18, 18].forEach(z => addWindow(-W / 2 + WALL_T / 2, winF1Y, z, winSize, winSize, 'EW'));
  [-18, 0, 18].forEach(z => addWindow(-W / 2 + WALL_T / 2, winF2Y, z, winSize, winSize, 'EW'));

  addMesh(new THREE.BoxGeometry(sfW, sfH, 0.15), makeMat(0x7FB8D4, { roughness: 0.05, metalness: 0.3, opacity: 0.4 }),
    { csi: '08 - Openings', item: 'Storefront — Aluminum Curtain Wall', qty: sfW * sfH, unit: 'sf' },
    { pos: [0, sfY, D / 2 - WALL_T / 2] });

  addMesh(new THREE.BoxGeometry(sfW + 4, 0.3, 4), makeMat(0x4A4A4A, { roughness: 0.6, metalness: 0.3 }),
    { csi: '05 - Metals', item: 'Entrance Canopy — Steel', qty: 1, unit: 'ea' }, { pos: [0, sfH + 0.5, D / 2 + 1.5] });

  addMesh(new THREE.BoxGeometry(0.18, doorH, doorW), makeMat(0x5C3E2A, { roughness: 0.7 }),
    { csi: '08 - Openings', item: "Solid Core Door 3'0\"×7'0\"", qty: 1, unit: 'ea' }, { pos: [W / 2 - WALL_T / 2, doorH / 2, 0] });
  addMesh(new THREE.BoxGeometry(0.18, doorH, doorW), makeMat(0x5C3E2A, { roughness: 0.7 }),
    { csi: '08 - Openings', item: "Solid Core Door 3'0\"×7'0\"", qty: 1, unit: 'ea' }, { pos: [-W / 2 + WALL_T / 2, doorH / 2, 0] });

  // Division 07: Roofing
  addMesh(new THREE.BoxGeometry(W, 0.08, D), makeMat(CSI_COLORS['07 - Thermal/Moist.'], { roughness: 0.9 }),
    { csi: '07 - Thermal/Moist.', item: 'TPO Roofing Membrane — 60 mil', qty: W * D, unit: 'sf' },
    { pos: [0, WALL_H + 0.44, 0] });

  return meshes;
};

const aggregate = (meshes: THREE.Mesh[]) => {
  const groups: Record<string, any> = {};
  meshes.forEach(m => {
    const { csi, item, qty, unit } = m.userData;
    const key = `${csi}|${item}`;
    if (!groups[key]) groups[key] = { key, csi, item, qty: 0, unit, meshes: [] };
    groups[key].qty += qty;
    groups[key].meshes.push(m);
  });
  return Object.values(groups).map(g => ({ ...g, qty: Math.round(g.qty * 10) / 10 }));
};

const PHANTOM_ITEMS = [
  { csi: '06 - Wood/Plastics', item: "Solid Core Door 3'0\"×7'0\" (interior)", qty: 22, unit: 'ea' },
  { csi: '09 - Finishes', item: 'Metal Stud Partition 3-5/8" @ 16" o.c.', qty: 1240, unit: 'lf' },
  { csi: '09 - Finishes', item: 'Drywall 5/8" Type X — both sides', qty: 10840, unit: 'sf' },
  { csi: '09 - Finishes', item: 'Acoustic Ceiling Tile 2×4', qty: 7800, unit: 'sf' },
  { csi: '09 - Finishes', item: 'VCT Flooring', qty: 5200, unit: 'sf' },
];

const DEFAULT_PRICES: Record<string, number> = {
  'Slab on Grade — 6" thick': 185,
  '2nd Floor Slab — 8" thick': 210,
  'Roof Deck — 4" concrete topping': 175,
  'Footing Pads — 3000 PSI': 220,
  'CMU 8" Block — Exterior': 14.50,
  'W10x33 Steel Column': 42,
  'W12x26 Steel Beam': 38,
  "Aluminum Window 4'×4'": 685,
  'Storefront — Aluminum Curtain Wall': 85,
  'Entrance Canopy — Steel': 4800,
  "Solid Core Door 3'0\"×7'0\"": 420,
  "Solid Core Door 3'0\"×7'0\" (interior)": 340,
  'TPO Roofing Membrane — 60 mil': 8.50,
  'Metal Stud Partition 3-5/8" @ 16" o.c.': 4.75,
  'Drywall 5/8" Type X — both sides': 3.20,
  'Acoustic Ceiling Tile 2×4': 5.40,
  'VCT Flooring': 4.10,
};

const DEFAULT_WASTE: Record<string, number> = { 'sf': 8, 'lf': 5, 'cy': 5, 'ea': 2 };

export default function DemoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number>(0);

  const [phase, setPhase] = useState<'idle' | 'parsing' | 'ready'>('idle');
  const [parseStep, setParseStep] = useState(0);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [openDivisions, setOpenDivisions] = useState<Record<string, boolean>>({});
  const [hiddenDivisions, setHiddenDivisions] = useState<Record<string, boolean>>({});
  const [waste, setWaste] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [showDiff, setShowDiff] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [viewMode, setViewMode] = useState<'section' | 'xray' | 'solid'>('section');
  const [projectName] = useState('Main Street Clinic — Boca Raton, FL');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const PARSE_STEPS = [
    'Reading IFC schema (4.3)…',
    'Extracting IfcQuantitySet relationships…',
    'Resolving IfcRelDefinesByProperties…',
    'Grouping by CSI MasterFormat division…',
    'Computing geometry-derived quantities…',
    'Rendering 3D viewport (WebGL)…',
  ];

  const startParse = useCallback(() => {
    setPhase('parsing');
    setParseStep(0);
    let s = 0;
    const t = setInterval(() => {
      s++;
      if (s >= PARSE_STEPS.length) { clearInterval(t); setPhase('ready'); }
      else setParseStep(s);
    }, 280);
  }, []);

  // Auto-start on mount so visitors hit the 3D model without clicking anything
  useEffect(() => {
    startParse();
  }, [startParse]);

  useEffect(() => {
    if (phase !== 'ready' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const W = canvas.clientWidth, H = canvas.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0B0E);
    scene.fog = new THREE.Fog(0x0A0B0E, 180, 320);

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000);
    camera.position.set(85, 50, 85);
    camera.lookAt(0, 8, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.65);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(60, 100, 40);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x4A9EFF, 0.25);
    fill.position.set(-50, 30, -30);
    scene.add(fill);

    const meshes = buildScene(scene);
    meshesRef.current = meshes;
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const grid = new THREE.GridHelper(200, 40, 0x2A2F38, 0x1B1F27);
    grid.position.y = -1.4;
    scene.add(grid);

    const visible = aggregate(meshes);
    const all = [...visible, ...PHANTOM_ITEMS.map(p => ({ ...p, key: `${p.csi}|${p.item}`, meshes: [] }))];
    setLineItems(all);
    const divs: Record<string, boolean> = {};
    all.forEach(li => { divs[li.csi] = true; });
    setOpenDivisions(divs);
    const w0: Record<string, number> = {}, p0: Record<string, number> = {};
    all.forEach(li => { w0[li.key] = DEFAULT_WASTE[li.unit] || 5; p0[li.key] = DEFAULT_PRICES[li.item] || 0; });
    setWaste(w0);
    setPrices(p0);

    let isDragging = false, lastX = 0, lastY = 0;
    let theta = Math.atan2(85, 85);
    let phi = Math.acos(50 / Math.sqrt(85*85 + 50*50 + 85*85));
    let radius = Math.sqrt(85*85 + 50*50 + 85*85);
    const target = new THREE.Vector3(0, 8, 0);

    const updateCam = () => {
      camera.position.set(
        radius * Math.sin(phi) * Math.sin(theta) + target.x,
        radius * Math.cos(phi) + target.y,
        radius * Math.sin(phi) * Math.cos(theta) + target.z
      );
      camera.lookAt(target);
    };
    updateCam();

    const onDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = 'grabbing'; };
    const onUp = () => { isDragging = false; canvas.style.cursor = 'grab'; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      theta -= (e.clientX - lastX) * 0.005;
      phi -= (e.clientY - lastY) * 0.005;
      phi = Math.max(0.15, Math.min(Math.PI - 0.15, phi));
      lastX = e.clientX; lastY = e.clientY;
      updateCam();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius *= e.deltaY > 0 ? 1.08 : 0.92;
      radius = Math.max(40, Math.min(280, radius));
      updateCam();
    };
    const onResize = () => {
      const Wn = canvas.clientWidth, Hn = canvas.clientHeight;
      camera.aspect = Wn / Hn;
      camera.updateProjectionMatrix();
      renderer.setSize(Wn, Hn, false);
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.style.cursor = 'grab';

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    (canvas as any)._resetView = () => {
      theta = Math.atan2(85, 85);
      phi = Math.acos(50 / Math.sqrt(85*85 + 50*50 + 85*85));
      radius = Math.sqrt(85*85 + 50*50 + 85*85);
      updateCam();
    };

    const tick = () => { animFrameRef.current = requestAnimationFrame(tick); renderer.render(scene, camera); };
    tick();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('wheel', onWheel);
      ro.disconnect();
      meshes.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      renderer.dispose();
    };
  }, [phase]);

  useEffect(() => {
    if (!meshesRef.current.length) return;
    const isShellElement = (m: THREE.Mesh) =>
      m.userData.csi === '04 - Masonry' ||
      m.userData.item.includes('Roof Deck') ||
      m.userData.item.includes('TPO Roofing') ||
      m.userData.item.includes('Canopy');

    meshesRef.current.forEach(m => {
      const hidden = hiddenDivisions[m.userData.csi];
      const key = `${m.userData.csi}|${m.userData.item}`;
      const matches = !selectedKey || key === selectedKey;
      const isShell = isShellElement(m);

      let visible = !hidden;
      let baseOpacity = m.userData.originalOpacity ?? 1;
      if (isShell) {
        if (viewMode === 'section') visible = false;
        else if (viewMode === 'xray') baseOpacity = Math.min(baseOpacity, 0.18);
      }
      if (selectedKey && !matches) baseOpacity = 0.08;
      if (selectedKey && matches && isShell && viewMode === 'section') { visible = true; baseOpacity = 0.6; }

      m.visible = visible;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (visible) {
        if (selectedKey && matches) {
          mat.color.setHex(0xFF6B35);
          mat.emissive = new THREE.Color(0xFF6B35);
          mat.emissiveIntensity = 0.35;
          mat.opacity = baseOpacity;
        } else if (selectedKey && !matches) {
          mat.color.setHex(0x3A414C);
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = baseOpacity;
        } else {
          mat.color.setHex(m.userData.originalColor);
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 0;
          mat.opacity = baseOpacity;
        }
      }
    });
  }, [selectedKey, hiddenDivisions, viewMode, phase]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    lineItems.forEach(li => { if (!g[li.csi]) g[li.csi] = []; g[li.csi].push(li); });
    return g;
  }, [lineItems]);

  const totals = useMemo(() => {
    const byDiv: Record<string, number> = {};
    let grand = 0;
    lineItems.forEach(li => {
      const w = waste[li.key] || 0, p = prices[li.key] || 0;
      const total = li.qty * (1 + w / 100) * p;
      byDiv[li.csi] = (byDiv[li.csi] || 0) + total;
      grand += total;
    });
    return { byDiv, grand };
  }, [lineItems, waste, prices]);

  const stats = useMemo(() => ({
    totalElems: meshesRef.current.length,
    concrete: Math.round(lineItems.filter(li => li.csi === '03 - Concrete' && li.unit === 'cy').reduce((s, li) => s + li.qty, 0)),
    steel: Math.round(lineItems.filter(li => li.csi === '05 - Metals' && li.unit === 'lf').reduce((s, li) => s + li.qty, 0)),
  }), [lineItems]);

  const exportCSV = () => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = [
      `"Bid Level — Construction Takeoff Export"`,
      `"Project","${projectName}"`,
      `"Generated","${today}"`,
      `"Source IFC","MainStreetClinic_v3.ifc (IFC 4.3)"`,
      '',
      `"CSI Division","Item","Net Quantity","Unit","Waste %","Total Quantity","Unit Price","Extension"`,
    ];
    lineItems.forEach(li => {
      const w = waste[li.key] || 0, p = prices[li.key] || 0;
      const tot = li.qty * (1 + w / 100);
      rows.push(`"${li.csi}","${li.item}",${li.qty},"${li.unit}",${w},${tot.toFixed(2)},${p.toFixed(2)},${(tot * p).toFixed(2)}`);
    });
    rows.push('', `"","","","","","","Subtotal",${totals.grand.toFixed(2)}`);
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `BidLevel_Takeoff_${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: number, dec = 0) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{
      background: C.bg, color: C.text, height: '100vh',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .mono { font-family: "IBM Plex Mono", ui-monospace, monospace; font-feature-settings: "tnum"; }
        .scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .scrollbar::-webkit-scrollbar-track { background: ${C.surface}; }
        .scrollbar::-webkit-scrollbar-thumb { background: ${C.borderHi}; border-radius: 4px; }
        .scrollbar::-webkit-scrollbar-thumb:hover { background: ${C.textMute}; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        input.np { background: ${C.surfaceMax}; border: 1px solid ${C.border}; color: ${C.text}; padding: 4px 6px; border-radius: 3px; font-family: "IBM Plex Mono", monospace; font-size: 12px; width: 100%; font-feature-settings: "tnum"; }
        input.np:focus { outline: none; border-color: ${C.accent}; }
        button.btn { font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 500; padding: 7px 12px; border-radius: 4px; border: 1px solid ${C.border}; background: ${C.surfaceHi}; color: ${C.text}; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.02em; transition: all 0.15s; }
        button.btn:hover { background: ${C.surfaceMax}; border-color: ${C.borderHi}; }
        button.btn.primary { background: ${C.accent}; border-color: ${C.accent}; color: #0A0B0E; font-weight: 600; }
        button.btn.primary:hover { background: #FF7E4D; }
      `}</style>

      {/* HEADER */}
      <header style={{ height: 52, borderBottom: `1px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box size={16} strokeWidth={2.5} color="#0A0B0E" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
            BID<span style={{ color: C.accent }}>LEVEL</span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: C.textMute, marginLeft: 4 }}>v0.1.0</div>
        </div>
        {phase === 'ready' && (
          <>
            <div style={{ width: 1, height: 24, background: C.border }} />
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <FileText size={14} color={C.textDim} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.textDim, flexShrink: 0 }}>Project</span>
                <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{projectName}</span>
                <span className="mono" style={{ fontSize: 10, color: C.success, background: 'rgba(74,222,128,0.1)', padding: '2px 6px', borderRadius: 3, marginLeft: 6, flexShrink: 0 }}>● PARSED</span>
              </div>
            )}
            {isMobile && <div style={{ flex: 1 }} />}
            {!isMobile && <button className="btn" onClick={() => setShowDiff(true)}><GitCompare size={13} /> Compare Revision</button>}
            <button className="btn primary" onClick={exportCSV}><Download size={13} />{isMobile ? '' : ' Export CSV'}</button>
          </>
        )}
      </header>

      {/* IDLE */}
      {phase === 'idle' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 520 }}>
            <div style={{ width: 88, height: 88, margin: '0 auto 24px', borderRadius: 8, background: C.surface, border: `1.5px dashed ${C.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={32} color={C.textDim} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Drop an IFC file to extract takeoff</h1>
            <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              Drag an <span className="mono" style={{ color: C.text }}>.ifc</span> file into the browser.
              Bid Level parses every <span className="mono" style={{ color: C.text }}>IfcQuantitySet</span> relationship,
              groups by CSI MasterFormat, and renders an interactive 3D model — all in seconds.
            </p>
            <button className="btn primary" onClick={startParse} style={{ padding: '10px 18px', fontSize: 13 }}>
              <Sparkles size={14} /> Load Sample Project (Main Street Clinic)
            </button>
            <div style={{ marginTop: 32, display: 'flex', gap: 24, justifyContent: 'center', fontSize: 11, color: C.textMute }}>
              <span>IFC 2x3 · 4.0 · 4.3 · 5</span><span>·</span><span>WebGL Renderer</span><span>·</span><span>CSI MasterFormat</span>
            </div>
          </div>
        </div>
      )}

      {/* PARSING */}
      {phase === 'parsing' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <Loader2 size={20} color={C.accent} style={{ animation: 'spin 1s linear infinite' }} />
              <div className="mono" style={{ fontSize: 12, color: C.textDim }}>Parsing MainStreetClinic_v3.ifc</div>
            </div>
            {PARSE_STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', fontSize: 12, color: i < parseStep ? C.success : i === parseStep ? C.text : C.textMute }}>
                <span className="mono" style={{ width: 16, textAlign: 'center' }}>{i < parseStep ? '✓' : i === parseStep ? '◆' : '○'}</span>
                <span>{step}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, height: 2, background: C.surface, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: C.accent, width: `${(parseStep / PARSE_STEPS.length) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      )}

      {/* READY */}
      {phase === 'ready' && (
        <>
          <div style={{ height: 36, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: isMobile ? 16 : 28, flexShrink: 0, overflowX: isMobile ? 'auto' : 'visible' }}>
            <Stat label="Elements" value={fmt(stats.totalElems)} unit="meshes" />
            <Stat label="Concrete" value={fmt(stats.concrete)} unit="cy" />
            {!isMobile && <Stat label="Steel framing" value={fmt(stats.steel)} unit="lf" />}
            {!isMobile && <Stat label="Floor area" value="8,000" unit="sf" />}
            <Stat label="Line items" value={fmt(lineItems.length)} unit="" />
            <div style={{ flex: 1, minWidth: 8 }} />
            {!isMobile && <div className="mono" style={{ fontSize: 11, color: C.textMute, flexShrink: 0 }}>parsed in <span style={{ color: C.success }}>1.68s</span></div>}
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* 3D Viewer — desktop only */}
            {isMobile ? (
              <div style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,107,53,0.06)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, fontSize: 12, color: C.textDim }}>
                <Box size={14} color={C.accent} style={{ flexShrink: 0 }} />
                <span>Interactive 3D model available on desktop — takeoff schedule below is fully functional.</span>
              </div>
            ) : (
            <div style={{ flex: '0 0 58%', position: 'relative', borderRight: `1px solid ${C.border}`, background: C.bg }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn" style={{ padding: 7, background: 'rgba(19,22,27,0.85)', backdropFilter: 'blur(8px)' }}
                  onClick={() => (canvasRef.current as any)?._resetView?.()} title="Reset view"><Maximize2 size={13} /></button>
                <button className="btn" style={{ padding: 7, background: 'rgba(19,22,27,0.85)', backdropFilter: 'blur(8px)' }}
                  onClick={() => setSelectedKey(null)} title="Show all"><RotateCcw size={13} /></button>
              </div>

              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', background: 'rgba(19,22,27,0.9)', backdropFilter: 'blur(8px)', border: `1px solid ${C.border}`, borderRadius: 4, padding: 3 }}>
                {(['section', 'xray', 'solid'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)} style={{ background: viewMode === m ? C.accent : 'transparent', color: viewMode === m ? '#0A0B0E' : C.text, border: 'none', borderRadius: 3, padding: '6px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: '"IBM Plex Sans", sans-serif', transition: 'all 0.15s' }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(19,22,27,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 12px', minWidth: 180 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>Visibility</div>
                {Object.keys(grouped).map(div => (
                  <div key={div} onClick={() => setHiddenDivisions(p => ({ ...p, [div]: !p[div] }))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: 11, color: hiddenDivisions[div] ? C.textMute : C.text }}>
                    {hiddenDivisions[div] ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span style={{ width: 8, height: 8, borderRadius: 1, background: '#' + (CSI_COLORS[div] ?? 0).toString(16).padStart(6, '0'), opacity: hiddenDivisions[div] ? 0.3 : 1 }} />
                    <span>{div}</span>
                  </div>
                ))}
              </div>

              {selectedKey && (
                <div className="fade-in" style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'rgba(255,107,53,0.12)', border: `1px solid ${C.accent}`, borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.accent, boxShadow: `0 0 12px ${C.accent}`, animation: 'pulse 1.6s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div className="mono" style={{ fontSize: 10, color: C.accent, letterSpacing: '0.08em' }}>ISOLATED VIEW</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedKey.split('|')[1]}</div>
                  </div>
                  <button onClick={() => setSelectedKey(null)} style={{ background: 'none', border: 'none', color: C.text, cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
              )}

              {showHints && !selectedKey && (
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(19,22,27,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '6px 12px', fontSize: 11, color: C.textDim, display: 'flex', alignItems: 'center', gap: 14, whiteSpace: 'nowrap' }}>
                  <span>drag to orbit</span><span style={{ color: C.borderHi }}>·</span>
                  <span>scroll to zoom</span><span style={{ color: C.borderHi }}>·</span>
                  <span>click any row to isolate</span>
                  <button onClick={() => setShowHints(false)} style={{ background: 'none', border: 'none', color: C.textMute, cursor: 'pointer', marginLeft: 4, display: 'flex' }}><X size={12} /></button>
                </div>
              )}
            </div>
            )}

            {/* Takeoff panel */}
            <div className="scrollbar" style={{ flex: 1, overflow: 'auto', background: C.surface }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 5, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 16px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>TAKEOFF SCHEDULE</div>
                    <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>Quantities derived from IFC geometry · CSI MasterFormat 2018</div>
                  </div>
                  <div style={{ background: C.surfaceHi, border: `1px solid ${C.border}`, padding: '6px 10px', borderRadius: 4, textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: C.textMute, letterSpacing: '0.1em' }}>EST. SUBTOTAL</div>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: C.accent }}>{fmtMoney(totals.grand)}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 60px 44px 80px' : '1fr 70px 56px 60px 80px 90px', gap: 8, padding: '8px 16px', fontSize: 10, color: C.textMute, fontWeight: 600, letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 64, zIndex: 4, background: C.surface }}>
                <div>ITEM</div><div style={{ textAlign: 'right' }}>NET QTY</div><div>UNIT</div>
                {!isMobile && <div style={{ textAlign: 'right' }}>WASTE %</div>}
                {!isMobile && <div style={{ textAlign: 'right' }}>$ / UNIT</div>}
                <div style={{ textAlign: 'right' }}>TOTAL</div>
              </div>

              {Object.entries(grouped).map(([div, items]) => (
                <div key={div}>
                  <div onClick={() => setOpenDivisions(p => ({ ...p, [div]: !p[div] }))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', background: C.surfaceHi, borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600 }}>
                    {openDivisions[div] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#' + (CSI_COLORS[div] ?? 0).toString(16).padStart(6, '0') }} />
                    <span style={{ flex: 1 }}>{div}</span>
                    <span style={{ fontSize: 11, color: C.textDim, fontWeight: 400 }}>{items.length} items</span>
                    <span className="mono" style={{ fontSize: 12, color: C.text, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{fmtMoney(totals.byDiv[div] || 0)}</span>
                  </div>

                  {openDivisions[div] && items.map((li: any) => {
                    const w = waste[li.key] || 0, p = prices[li.key] || 0;
                    const tot = li.qty * (1 + w / 100), ext = tot * p;
                    const isSelected = selectedKey === li.key, isPhantom = li.meshes.length === 0;
                    return (
                      <div key={li.key} onClick={() => !isPhantom && !isMobile && setSelectedKey(isSelected ? null : li.key)}
                        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 60px 44px 80px' : '1fr 70px 56px 60px 80px 90px', gap: 8, padding: '8px 16px', alignItems: 'center', borderBottom: `1px solid ${C.surfaceHi}`, cursor: (isPhantom || isMobile) ? 'default' : 'pointer', background: isSelected ? 'rgba(255,107,53,0.08)' : 'transparent', borderLeft: isSelected ? `2px solid ${C.accent}` : '2px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ fontSize: 12, color: isSelected ? C.accent : C.text, fontWeight: isSelected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{li.item}</span>
                          {isPhantom && !isMobile && <span className="mono" style={{ fontSize: 8, color: C.textMute, padding: '1px 4px', border: `1px solid ${C.border}`, borderRadius: 2 }}>NO 3D</span>}
                        </div>
                        <div className="mono" style={{ textAlign: 'right', fontSize: 12 }}>{fmt(li.qty, li.qty < 10 ? 1 : 0)}</div>
                        <div className="mono" style={{ fontSize: 11, color: C.textDim }}>{li.unit}</div>
                        {!isMobile && <input className="np" type="number" value={w} onClick={e => e.stopPropagation()}
                          onChange={e => setWaste(prev => ({ ...prev, [li.key]: parseFloat(e.target.value) || 0 }))} style={{ textAlign: 'right' }} />}
                        {!isMobile && <input className="np" type="number" value={p} step="0.01" onClick={e => e.stopPropagation()}
                          onChange={e => setPrices(prev => ({ ...prev, [li.key]: parseFloat(e.target.value) || 0 }))} style={{ textAlign: 'right' }} />}
                        <div className="mono" style={{ textAlign: 'right', fontSize: 12, color: ext > 0 ? C.text : C.textMute }}>{ext > 0 ? fmtMoney(ext) : '—'}</div>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div style={{ padding: '16px', borderTop: `2px solid ${C.border}`, marginTop: 12, background: C.surfaceHi }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.textDim, letterSpacing: '0.06em' }}>DIRECT MATERIAL + LABOR</span>
                  <span className="mono" style={{ fontSize: 13 }}>{fmtMoney(totals.grand)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.textDim, letterSpacing: '0.06em' }}>OH&P (15%)</span>
                  <span className="mono" style={{ fontSize: 13 }}>{fmtMoney(totals.grand * 0.15)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>BID TOTAL</span>
                  <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{fmtMoney(totals.grand * 1.15)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* REVISION DIFF MODAL */}
      {showDiff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowDiff(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 640, maxWidth: '92vw', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <GitCompare size={18} color={C.accent} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Revision Comparison</div>
                <div className="mono" style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>MainStreetClinic_v2.ifc → MainStreetClinic_v3.ifc</div>
              </div>
              <button onClick={() => setShowDiff(false)} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <div className="scrollbar" style={{ padding: '16px 22px', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(251,191,36,0.08)', border: `1px solid ${C.warning}`, padding: '10px 14px', borderRadius: 4, fontSize: 12, color: C.warning, marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ color: C.text }}>Architect issued a revised model on May 16. 7 line items changed, 2 added, 0 removed. Estimated cost delta: <strong className="mono">+$18,420</strong> vs. previous bid.</span>
              </div>

              {[
                { kind: 'changed', item: 'CMU 8" Block — Exterior', before: '5,316 sf', after: '5,840 sf', delta: '+524 sf', cost: 7598 },
                { kind: 'changed', item: "Aluminum Window 4'×4'", before: '20 ea', after: '24 ea', delta: '+4 ea', cost: 2740 },
                { kind: 'changed', item: 'W12x26 Steel Beam', before: '480 lf', after: '520 lf', delta: '+40 lf', cost: 1520 },
                { kind: 'changed', item: '2nd Floor Slab — 8" thick', before: '94 cy', after: '99 cy', delta: '+5 cy', cost: 1050 },
                { kind: 'added', item: 'Storefront — Aluminum Curtain Wall', before: '—', after: '96 sf', delta: '+96 sf', cost: 8160 },
                { kind: 'added', item: 'Solid Core Door (interior)', before: '20 ea', after: '22 ea', delta: '+2 ea', cost: 680 },
                { kind: 'changed', item: 'Drywall 5/8" Type X — both sides', before: '11,200 sf', after: '10,840 sf', delta: '-360 sf', cost: -1152 },
              ].map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 80px 80px 70px 90px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < 6 ? `1px solid ${C.surfaceHi}` : 'none', fontSize: 12 }}>
                  <div style={{ color: row.kind === 'added' ? C.success : row.cost > 0 ? C.warning : C.blueprint }}>
                    {row.kind === 'added' ? <Plus size={14} /> : row.cost > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  </div>
                  <div>{row.item}</div>
                  <div className="mono" style={{ color: C.textDim, fontSize: 11 }}>{row.before}</div>
                  <div className="mono" style={{ fontSize: 11 }}>{row.after}</div>
                  <div className="mono" style={{ fontSize: 11, color: row.cost > 0 ? C.warning : C.blueprint }}>{row.delta}</div>
                  <div className="mono" style={{ textAlign: 'right', color: row.cost > 0 ? C.warning : C.success }}>{row.cost > 0 ? '+' : ''}{fmtMoney(row.cost)}</div>
                </div>
              ))}

              <div style={{ marginTop: 18, padding: '14px', background: C.surfaceHi, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Net cost impact</span>
                <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: C.warning }}>+{fmtMoney(20596)}</span>
              </div>
            </div>

            <div style={{ padding: '14px 22px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => setShowDiff(false)}>Dismiss</button>
              <button className="btn primary"><Download size={13} /> Export Change Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 10, color: '#5A6170', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: '#E8EAED' }}>{value}</span>
      {unit && <span className="mono" style={{ fontSize: 10, color: '#8B92A0' }}>{unit}</span>}
    </div>
  );
}
