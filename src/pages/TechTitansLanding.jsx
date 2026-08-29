import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './TechTitansLanding.css';

/**
 * TechTitansLanding — Inauguration splash page
 *
 * Full-screen 3D scene with physics-driven hardware objects
 * (keyboard, mouse, CPU, GPU, molecule), boot sequence animation,
 * and an "Enter Home Page" button that navigates into the SPA.
 *
 * @param {boolean} prefersReducedMotion — skip animations when true
 */
export default function TechTitansLanding({ prefersReducedMotion = false }) {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  // Refs for DOM elements (replaces all getElementById calls)
  const containerRef = useRef(null);
  const bootScreenRef = useRef(null);
  const bootLinesRef = useRef(null);
  const bootBarFillRef = useRef(null);
  const bootPercentRef = useRef(null);
  const bootFlashRef = useRef(null);
  const fallbackRef = useRef(null);
  const overlayRef = useRef(null);

  // Refs for cleanup-reachable scene state
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const worldRef = useRef(null);
  const animFrameRef = useRef(null);
  const clockRef = useRef(null);
  const listenersRef = useRef([]);
  const timeoutsRef = useRef([]);
  const disposablesRef = useRef([]);

  // Navigation handler for the enter button
  const handleEnterHome = useCallback((btn) => {
    if (btn) {
      btn.classList.add('btn-loading');
      btn.textContent = 'ACCESSING CORE...';
    }
    if (overlayRef.current) overlayRef.current.style.opacity = '1';
    const tid = setTimeout(() => navigate('/home'), 900);
    timeoutsRef.current.push(tid);
  }, [navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isMounted = true;
    let isMobile = window.innerWidth <= 768;
    let isSmallPhone = window.innerWidth <= 420;

    // ── SCENE ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#1c212d', isMobile ? 0.012 : 0.010);
    sceneRef.current = scene;

    // ── CAMERA ──
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 50 : 48, window.innerWidth / window.innerHeight, 0.1, 250
    );
    const BASE_CAMERA_X = 0;
    const BASE_CAMERA_Y = isMobile ? 3 : 2;
    const BASE_CAMERA_Z = isMobile ? 43 : 52;
    camera.position.set(BASE_CAMERA_X, BASE_CAMERA_Y, BASE_CAMERA_Z);
    camera.lookAt(0, isMobile ? -8 : -10, 0);

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true,
      powerPreference: 'high-performance', precision: 'highp'
    });
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    const getPixelRatio = () => {
      const dpr = window.devicePixelRatio || 1;
      return Math.min(dpr, isMobile ? 1.75 : 2);
    };
    renderer.setPixelRatio(getPixelRatio());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isMobile ? 1.15 : 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isMobile ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // WebGL context loss fallback
    const onContextLost = (e) => {
      e.preventDefault();
      renderer.domElement.style.display = 'none';
      if (fallbackRef.current) fallbackRef.current.style.display = 'flex';
    };
    const onContextRestored = () => {
      renderer.domElement.style.display = '';
      if (fallbackRef.current) fallbackRef.current.style.display = 'none';
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setPixelRatio(getPixelRatio());
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    // ── PHYSICS ──
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.solver.iterations = isMobile ? 8 : 20;
    world.allowSleep = true;
    worldRef.current = world;

    const defaultMaterial = new CANNON.Material();
    world.addContactMaterial(
      new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, { friction: 0.8, restitution: 0.15 })
    );
    const objectsToUpdate = [];

    // ── LIGHTS ──
    const ambientLight = new THREE.AmbientLight('#332e4d', isMobile ? 1.8 : 2.4);
    scene.add(ambientLight);

    const frontFillLight = new THREE.DirectionalLight('#ffffff', isMobile ? 1.8 : 2.6);
    frontFillLight.position.set(0, 20, 45);
    scene.add(frontFillLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', isMobile ? 2.0 : 2.8);
    keyLight.position.set(25, 45, 25);
    keyLight.castShadow = true;
    const shadowRes = isSmallPhone ? 512 : isMobile ? 768 : 1536;
    keyLight.shadow.mapSize.width = shadowRes;
    keyLight.shadow.mapSize.height = shadowRes;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 150;
    const d = 40;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = isMobile ? 1.5 : 2.5;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#c084fc', isMobile ? 5.0 : 7.0, 120);
    rimLight.position.set(-30, 15, -15);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight('#00f3ff', isMobile ? 4.5 : 6.0, 110);
    fillLight.position.set(30, 10, -15);
    scene.add(fillLight);

    const neonPinkUplight = new THREE.PointLight('#ff007f', isMobile ? 3.0 : 4.5, 90);
    neonPinkUplight.position.set(0, -32, 10);
    scene.add(neonPinkUplight);

    // ── MATERIALS (Luminous Cyber Titanium & Vivid Neon Palette) ──
    const matBaseGrey = new THREE.MeshPhysicalMaterial({
      color: '#424866', roughness: 0.15, metalness: 0.7, clearcoat: 1.0, clearcoatRoughness: 0.1
    });
    const matKeyDark = new THREE.MeshPhysicalMaterial({
      color: '#31364f', roughness: 0.2, metalness: 0.5, clearcoat: 0.7
    });
    const matAccentPurple = new THREE.MeshPhysicalMaterial({
      color: '#d8b4fe', roughness: 0.05, metalness: 0.2, emissive: '#a855f7', emissiveIntensity: 2.2
    });
    const matAccentCyan = new THREE.MeshPhysicalMaterial({
      color: '#00f3ff', roughness: 0.05, metalness: 0.2, emissive: '#00f3ff', emissiveIntensity: 2.5
    });
    const matAccentPink = new THREE.MeshPhysicalMaterial({
      color: '#ff007f', roughness: 0.05, metalness: 0.2, emissive: '#ff007f', emissiveIntensity: 2.5
    });
    const matMoleculeNode = new THREE.MeshPhysicalMaterial({
      color: '#ffffff', roughness: 0.05, metalness: 0.95, clearcoat: 1.0, emissive: '#c084fc', emissiveIntensity: 0.6
    });
    const matMoleculeWire = new THREE.MeshPhysicalMaterial({
      color: '#ff007f', roughness: 0.05, metalness: 0.8, emissive: '#ff007f', emissiveIntensity: 3.2
    });
    const matPin = new THREE.MeshPhysicalMaterial({
      color: '#ffe066', metalness: 0.95, roughness: 0.05, emissive: '#ffb703', emissiveIntensity: 2.0
    });
    const matPanelEdgeBright = new THREE.MeshPhysicalMaterial({
      color: '#c084fc', roughness: 0.1, metalness: 0.4, clearcoat: 1.0,
      emissive: '#a855f7', emissiveIntensity: 2.2
    });
    const disposables = [
      matBaseGrey, matKeyDark, matAccentPurple, matAccentCyan, matAccentPink,
      matMoleculeNode, matMoleculeWire, matPin, matPanelEdgeBright
    ];
    disposablesRef.current = disposables;

    // Glow helpers for code panels
    const hexWithAlpha = (hex, alphaHex) => hex + alphaHex;
    const glowSpriteCache = {};
    function getGlowTexture(color) {
      if (glowSpriteCache[color]) return glowSpriteCache[color];
      const c = document.createElement('canvas');
      c.width = 128; c.height = 128;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, hexWithAlpha(color, 'ff'));
      grad.addColorStop(0.45, hexWithAlpha(color, '88'));
      grad.addColorStop(1, hexWithAlpha(color, '00'));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      glowSpriteCache[color] = tex;
      disposables.push(tex);
      return tex;
    }
    function createGlowSprite(color, width, height) {
      const mat = new THREE.SpriteMaterial({
        map: getGlowTexture(color), transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(width * 1.6, height * 1.6, 1);
      sprite.position.z = -0.5;
      return sprite;
    }

    const SPRING_K = isMobile ? 1.2 : 1.5;

    // ── HELPERS ──
    function createRoundedRectShape(width, height, radius) {
      const shape = new THREE.Shape();
      const x = -width / 2, y = -height / 2;
      shape.moveTo(x, y + radius);
      shape.lineTo(x, y + height - radius);
      shape.quadraticCurveTo(x, y + height, x + radius, y + height);
      shape.lineTo(x + width - radius, y + height);
      shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      shape.lineTo(x + width, y + radius);
      shape.quadraticCurveTo(x + width, y, x + width - radius, y);
      shape.lineTo(x + radius, y);
      shape.quadraticCurveTo(x, y, x, y + radius);
      return shape;
    }

    function registerPhysics(mesh, shape, mass, restPos, initialEuler = null) {
      scene.add(mesh);
      const spawnY = prefersReducedMotion ? restPos.y : restPos.y - (isMobile ? 10 : 20);
      const body = new CANNON.Body({
        mass, shape, material: defaultMaterial,
        position: new CANNON.Vec3(restPos.x, spawnY, restPos.z),
        linearDamping: 0.92, angularDamping: 1.0,
        fixedRotation: true,
        allowSleep: true, sleepSpeedLimit: 0.05, sleepTimeLimit: 1.5
      });
      body.updateMassProperties();
      body.angularFactor.set(0, 0, 0); // No spinning/rotation!

      if (initialEuler) {
        body.quaternion.setFromEuler(initialEuler.x, initialEuler.y, initialEuler.z);
        mesh.rotation.set(initialEuler.x, initialEuler.y, initialEuler.z);
      }
      world.addBody(body);
      objectsToUpdate.push({ mesh, body, restPos: new CANNON.Vec3(restPos.x, restPos.y, restPos.z), initialEuler, launched: false });
    }

    function launchObjects() {
      if (prefersReducedMotion) return;
      objectsToUpdate.forEach(obj => {
        obj.body.wakeUp();
        obj.body.velocity.set(
          (Math.random() - 0.5) * (isMobile ? 0.4 : 0.8),
          (isMobile ? 16 : 24) + Math.random() * 2,
          (Math.random() - 0.5) * (isMobile ? 0.4 : 0.8)
        );
        obj.body.angularVelocity.set(0, 0, 0);
        obj.launched = true;
      });
    }

    // ── RINGS ──
    const ringsGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({ color: '#9a7fe0', transparent: true, opacity: isMobile ? 0.22 : 0.32, blending: THREE.AdditiveBlending });
    const purpleRingMat = new THREE.LineBasicMaterial({ color: '#c9b3ff', transparent: true, opacity: isMobile ? 0.20 : 0.28, blending: THREE.AdditiveBlending });
    const cyanRingMat = new THREE.LineBasicMaterial({ color: '#00f3ff', transparent: true, opacity: isMobile ? 0.22 : 0.32, blending: THREE.AdditiveBlending });
    disposables.push(ringMat, purpleRingMat, cyanRingMat);

    const ringCount = isSmallPhone ? 7 : isMobile ? 9 : 18;
    const ringPointRes = isMobile ? 100 : 220;
    for (let i = 1; i <= ringCount; i++) {
      const curve = new THREE.EllipseCurve(0, 0, i * (isMobile ? 5.2 : 6.5), i * (isMobile ? 3.2 : 4.0), 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(ringPointRes);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      disposables.push(geometry);
      let selectedMat = ringMat;
      if (i % 3 === 0) selectedMat = purpleRingMat;
      if (i % 4 === 0) selectedMat = cyanRingMat;
      const ellipse = new THREE.Line(geometry, selectedMat);
      ellipse.rotation.x = -Math.PI / 2.05;
      ellipse.rotation.z = (Math.random() - 0.5) * 0.5;
      ellipse.position.y = isMobile ? -24 + (i * 0.45) : -35 + (i * 0.5);
      ellipse.position.z = isMobile ? -16 : -20;
      ellipse.userData = { rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.0005 + Math.random() * 0.001) };
      ringsGroup.add(ellipse);
    }
    scene.add(ringsGroup);

    // ── PARTICLES ──
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = isSmallPhone ? 120 : isMobile ? 220 : 700;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * (isMobile ? 100 : 150);
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    disposables.push(particlesGeo);

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64; pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(220,210,255,1)');
    pGrad.addColorStop(0.18, 'rgba(190,175,240,0.85)');
    pGrad.addColorStop(0.55, 'rgba(160,145,210,0.25)');
    pGrad.addColorStop(1, 'rgba(0,0,0,0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(pCanvas);
    particleTexture.minFilter = THREE.LinearFilter;
    particleTexture.magFilter = THREE.LinearFilter;
    particleTexture.generateMipmaps = false;
    disposables.push(particleTexture);

    const particlesMat = new THREE.PointsMaterial({
      size: isMobile ? 0.65 : 0.8, map: particleTexture,
      transparent: true, opacity: isMobile ? 0.5 : 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    disposables.push(particlesMat);
    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    // ── OBJECT BUILDERS ──
    function createKeyboard() {
      const group = new THREE.Group();
      const baseShape = createRoundedRectShape(17, 6, 0.5);
      const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
        depth: 0.8, bevelEnabled: true, bevelSegments: isMobile ? 2 : 4,
        steps: 1, bevelSize: 0.15, bevelThickness: 0.15
      });
      disposables.push(baseGeo);
      const base = new THREE.Mesh(baseGeo, matBaseGrey);
      base.castShadow = true; base.receiveShadow = true;
      base.position.z = -0.4;
      group.add(base);

      const keyShape = createRoundedRectShape(0.85, 0.85, 0.15);
      const standardKeyGeo = new THREE.ExtrudeGeometry(keyShape, {
        depth: 0.45, bevelEnabled: true, bevelSegments: isMobile ? 1 : 3,
        steps: 1, bevelSize: 0.05, bevelThickness: 0.05
      });
      disposables.push(standardKeyGeo);

      const startX = -7.8, startY = 2.2;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 15; col++) {
          let keyWidth = 1.0;
          let mat = matKeyDark;

          if (row === 4 && col === 4) {
            keyWidth = 6.5; mat = matAccentPurple; col += 5; // Spacebar
          } else if (row === 3 && col === 0) {
            keyWidth = 2.2; mat = matKeyDark; col += 1; // Caps
          } else if (row === 2 && col === 13) {
            keyWidth = 2.0; mat = matAccentPurple; col += 1; // Enter
          } else if (row === 0 && col === 0) {
            mat = matAccentPurple; // ESC
          } else if (row === 0 && col === 14) {
            mat = matKeyDark; // Backspace
          } else if (row === 4 && col > 10) {
            mat = matAccentPurple; // Arrows
          }

          let geo = standardKeyGeo;
          if (keyWidth > 1) {
            const customShape = createRoundedRectShape(0.85 * keyWidth + (keyWidth - 1) * 0.15, 0.85, 0.15);
            geo = new THREE.ExtrudeGeometry(customShape, {
              depth: 0.45, bevelEnabled: true, bevelSegments: isMobile ? 1 : 3,
              steps: 1, bevelSize: 0.05, bevelThickness: 0.05
            });
            disposables.push(geo);
          }
          const key = new THREE.Mesh(geo, mat);
          const kx = startX + col * 1.05 + (keyWidth > 1 ? (keyWidth - 1) * 0.525 : 0);
          const ky = startY - row * 1.1;
          key.position.set(kx, ky, 0.25);
          key.castShadow = true;
          group.add(key);
        }
      }
      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(8.5, 3.0, 0.6)) };
    }

    function createCPU() {
      const group = new THREE.Group();
      const baseGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(3.8, 3.8, 0.4), {
        depth: 0.25, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1,
        bevelSegments: isMobile ? 2 : 3
      });
      disposables.push(baseGeo);
      const base = new THREE.Mesh(baseGeo, matBaseGrey);
      base.position.z = -0.125; base.castShadow = true;

      const coreGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(2.0, 2.0, 0.2), {
        depth: 0.25, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05
      });
      disposables.push(coreGeo);

      // CPU label texture
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e2235'; ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, 236, 236);
      ctx.fillStyle = '#00f3ff';
      ctx.font = '900 80px "Outfit", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CPU', 128, 128);
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      disposables.push(tex);

      const coreMat = new THREE.MeshPhysicalMaterial({
        map: tex, roughness: 0.1, metalness: 0.8, emissive: '#7e22ce', emissiveIntensity: 1.8
      });
      disposables.push(coreMat);
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.z = 0.2;
      group.add(base, core);

      // 24K Gold Pins
      const pinGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
      disposables.push(pinGeo);
      const pinRange = isMobile ? 3 : 5;
      for (let side = 0; side < 4; side++) {
        for (let i = -pinRange; i <= pinRange; i++) {
          const pin = new THREE.Mesh(pinGeo, matPin);
          const offset = i * 0.35;
          if (side === 0) pin.position.set(offset, 2.2, 0);
          else if (side === 1) pin.position.set(offset, -2.2, 0);
          else if (side === 2) { pin.rotation.z = Math.PI / 2; pin.position.set(2.2, offset, 0); }
          else { pin.rotation.z = Math.PI / 2; pin.position.set(-2.2, offset, 0); }
          group.add(pin);
        }
      }
      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(1.9, 0.25, 1.9)) };
    }

    function createMouse() {
      const group = new THREE.Group();
      const segments = isMobile ? 14 : 24;
      const bodyGeo = new THREE.SphereGeometry(1, segments, isMobile ? 10 : 18);
      disposables.push(bodyGeo);
      const body = new THREE.Mesh(bodyGeo, matBaseGrey);
      body.scale.set(0.9, 0.32, 1.4);
      body.castShadow = true;
      group.add(body);

      const seamGeo = new THREE.BoxGeometry(0.025, 0.34, 2.4);
      disposables.push(seamGeo);
      const seam = new THREE.Mesh(seamGeo, matAccentCyan);
      seam.position.y = 0.04;
      group.add(seam);

      const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.22, 10);
      disposables.push(wheelGeo);
      const wheel = new THREE.Mesh(wheelGeo, matAccentPurple);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.28, 0.35);
      group.add(wheel);

      const ledGeo = new THREE.SphereGeometry(0.08, 8, 8);
      disposables.push(ledGeo);
      const led = new THREE.Mesh(ledGeo, matAccentCyan);
      led.position.set(0, 0.1, -1.05);
      group.add(led);

      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(0.9, 0.32, 1.4)) };
    }

    function createGPU() {
      const group = new THREE.Group();
      const shroudGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(6, 3, 0.3), {
        depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06,
        bevelSegments: isMobile ? 2 : 3
      });
      disposables.push(shroudGeo);
      const shroud = new THREE.Mesh(shroudGeo, matBaseGrey);
      shroud.position.z = -0.15; shroud.castShadow = true;
      group.add(shroud);

      // Fan texture
      const fanCanvas = document.createElement('canvas');
      fanCanvas.width = 256; fanCanvas.height = 256;
      const fanCtx = fanCanvas.getContext('2d');
      fanCtx.fillStyle = '#181b28'; fanCtx.fillRect(0, 0, 256, 256);
      fanCtx.strokeStyle = '#00f3ff'; fanCtx.lineWidth = 4;
      for (let a = 0; a < 7; a++) {
        const angle = (a / 7) * Math.PI * 2;
        const endAngle = angle + 0.3;
        fanCtx.beginPath();
        fanCtx.moveTo(128 + Math.cos(angle) * 20, 128 + Math.sin(angle) * 20);
        fanCtx.quadraticCurveTo(
          128 + Math.cos(angle + 0.15) * 70, 128 + Math.sin(angle + 0.15) * 70,
          128 + Math.cos(endAngle) * 110, 128 + Math.sin(endAngle) * 110
        );
        fanCtx.stroke();
      }
      fanCtx.fillStyle = '#ff007f';
      fanCtx.beginPath(); fanCtx.arc(128, 128, 22, 0, Math.PI * 2); fanCtx.fill();

      const fanTex = new THREE.CanvasTexture(fanCanvas);
      disposables.push(fanTex);
      const fanMat = new THREE.MeshPhysicalMaterial({ map: fanTex, roughness: 0.2, metalness: 0.6, emissive: '#00f3ff', emissiveIntensity: 0.5 });
      disposables.push(fanMat);
      const fanGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.06, isMobile ? 14 : 24);
      disposables.push(fanGeo);

      [-1.2, 1.2].forEach(fx => {
        const fan = new THREE.Mesh(fanGeo, fanMat);
        fan.rotation.x = Math.PI / 2;
        fan.position.set(fx, 0.1, 0.2);
        group.add(fan);
        const torusGeo = new THREE.TorusGeometry(0.9, 0.06, 8, isMobile ? 16 : 24);
        disposables.push(torusGeo);
        const ring = new THREE.Mesh(torusGeo, matAccentCyan);
        ring.position.set(fx, 0.1, 0.22);
        group.add(ring);
      });

      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(3, 0.2, 1.5)) };
    }

    function createMolecule() {
      const group = new THREE.Group();
      const sphereSegs = isMobile ? 12 : 24;
      const sGeo = new THREE.SphereGeometry(0.9, sphereSegs, sphereSegs);
      const cGeo = new THREE.CylinderGeometry(0.2, 0.2, 1, isMobile ? 8 : 14);
      disposables.push(sGeo, cGeo);

      const nodes = [
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(2.5, 1.8, 0),
        new THREE.Vector3(-2, 1.5, 1.8), new THREE.Vector3(0.8, -2.5, 1.2)
      ];
      nodes.forEach(pos => {
        const m = new THREE.Mesh(sGeo, matMoleculeNode);
        m.position.copy(pos); m.castShadow = true;
        group.add(m);
      });
      function connect(p1, p2) {
        const c = new THREE.Mesh(cGeo, matMoleculeWire);
        c.scale.y = p1.distanceTo(p2);
        c.position.copy(p1).lerp(p2, 0.5);
        c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        group.add(c);
      }
      connect(nodes[0], nodes[1]);
      connect(nodes[0], nodes[2]);
      connect(nodes[0], nodes[3]);
      return { mesh: group, shape: new CANNON.Sphere(2.8) };
    }

    // ── CODE PANEL BUILDER ──
    function createCodePanel(codeLine, commentLine, width, height, glowColor) {
      const canvas = document.createElement('canvas');
      canvas.width = 1600; canvas.height = 800;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      disposables.push(texture);

      const panelMat = new THREE.MeshPhysicalMaterial({
        map: texture, roughness: 0.2, metalness: 0.2, clearcoat: 0.5,
        emissive: glowColor, emissiveMap: texture, emissiveIntensity: 1.4
      });
      disposables.push(panelMat);

      const shape = createRoundedRectShape(width, height, 0.4);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.25, bevelEnabled: true, bevelSegments: isMobile ? 2 : 3,
        bevelSize: 0.08, bevelThickness: 0.08
      });
      disposables.push(geo);

      const mesh = new THREE.Mesh(geo, [panelMat, matPanelEdgeBright]);
      mesh.castShadow = true; mesh.receiveShadow = true;
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);

      const drawPanel = () => {
        ctx.clearRect(0, 0, 1600, 800);
        ctx.fillStyle = '#22273d';
        ctx.fillRect(0, 0, 1600, 800);

        const MAX_CODE_WIDTH = 1600 * 0.92;
        const MIN_CODE_WIDTH = 1600 * 0.80;
        let codeSize = 260;
        let totalWidth = 0;
        while (codeSize > 50) {
          ctx.font = `800 ${codeSize}px "JetBrains Mono", monospace`;
          totalWidth = codeLine.reduce((w, t) => w + ctx.measureText(t.text).width, 0);
          if (totalWidth <= MAX_CODE_WIDTH) break;
          codeSize -= 4;
        }
        if (totalWidth < MIN_CODE_WIDTH && codeSize < 340) {
          const scaleUp = Math.min(340, codeSize * (MIN_CODE_WIDTH / Math.max(totalWidth, 1)));
          codeSize = Math.min(340, scaleUp);
          ctx.font = `800 ${codeSize}px "JetBrains Mono", monospace`;
          totalWidth = codeLine.reduce((w, t) => w + ctx.measureText(t.text).width, 0);
        }

        const codeY = 800 * 0.48;
        let offsetX = (1600 - totalWidth) / 2;
        ctx.textBaseline = 'alphabetic';

        codeLine.forEach(token => {
          ctx.shadowColor = token.color === '#ffffff' ? 'rgba(255,255,255,0.6)' : glowColor;
          ctx.shadowBlur = 12;
          ctx.fillStyle = token.color;
          ctx.fillText(token.text, offsetX, codeY);
          ctx.shadowBlur = 0;
          ctx.fillText(token.text, offsetX, codeY);
          offsetX += ctx.measureText(token.text).width;
        });

        const commentSize = Math.max(32, Math.round(codeSize * 0.24));
        ctx.font = `700 ${commentSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = '#c7d2fe';
        ctx.textAlign = 'center';
        ctx.fillText('# ' + commentLine, 800, codeY + codeSize * 0.55);
        ctx.textAlign = 'left';

        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, 1584, 784);
        ctx.shadowBlur = 4;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(6, 6, 1588, 788);
        ctx.restore();
        texture.needsUpdate = true;
      };

      drawPanel();
      if (document.fonts) document.fonts.ready.then(drawPanel).catch(drawPanel);

      const group = new THREE.Group();
      group.add(createGlowSprite(glowColor || '#b89eff', width, height));
      group.add(mesh);
      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, 0.15)) };
    }

    // ── BUILD OBJECTS ──
    const kb = createKeyboard();
    const mol = createMolecule();
    const cpu = createCPU();
    const mouseObj = createMouse();
    const gpu = createGPU();

    // Code panels (colored floating rectangles with bright neon code snippets)
    const code1 = createCodePanel(
      [{ text: 'print', color: '#d8b4fe' }, { text: '(', color: '#ffffff' }, { text: '"Hello, World!"', color: '#ffffff' }, { text: ')', color: '#ffffff' }],
      'outputs a greeting', 6.0, 3.8, '#c084fc'
    );
    const code2 = createCodePanel(
      [{ text: 'data', color: '#00f3ff' }, { text: ' = ', color: '#ffffff' }, { text: '[]', color: '#ffffff' }],
      'empty list, ready to fill', 5.8, 3.6, '#00f3ff'
    );
    const code3 = createCodePanel(
      [{ text: 'x', color: '#ff007f' }, { text: ', ', color: '#ffffff' }, { text: 'y', color: '#ff007f' }, { text: ' = ', color: '#ffffff' }, { text: '0, 1', color: '#ffffff' }],
      'initial state', 5.8, 3.6, '#ff007f'
    );
    const code4 = createCodePanel(
      [{ text: 'model', color: '#d8b4fe' }, { text: '.fit', color: '#d8b4fe' }, { text: '(X_train, y)', color: '#ffffff' }],
      'train the model', 6.0, 3.8, '#a855f7'
    );

    if (!isMobile) {
      registerPhysics(kb.mesh, kb.shape, 12, { x: 0, y: -21, z: 0 }, { x: -0.92, y: 0.04, z: -0.04 });
      registerPhysics(mol.mesh, mol.shape, 3, { x: -13.5, y: -16, z: 0 }, { x: 0.1, y: 0.2, z: 0 });
      registerPhysics(cpu.mesh, cpu.shape, 3, { x: 13.5, y: -16.5, z: 0 }, { x: -0.85, y: -0.22, z: 0.18 });
      registerPhysics(mouseObj.mesh, mouseObj.shape, 2.5, { x: 9.5, y: -20, z: 4.5 }, { x: -0.3, y: 0.25, z: -0.05 });
      registerPhysics(gpu.mesh, gpu.shape, 5, { x: -1.5, y: -13.5, z: -2 }, { x: -0.85, y: 0.05, z: -0.08 });
      registerPhysics(code1.mesh, code1.shape, 1.5, { x: -16.5, y: -14.5, z: 2 }, { x: 0, y: 0.25, z: 0.08 });
      registerPhysics(code2.mesh, code2.shape, 1.5, { x: 17, y: -14.5, z: 1 }, { x: 0, y: -0.25, z: -0.08 });
      registerPhysics(code3.mesh, code3.shape, 1.5, { x: -7.5, y: -15.5, z: 4 }, { x: 0, y: 0.12, z: 0.04 });
      registerPhysics(code4.mesh, code4.shape, 1.5, { x: 7.5, y: -15.5, z: 3 }, { x: 0, y: -0.12, z: -0.04 });
    } else {
      registerPhysics(kb.mesh, kb.shape, 10, { x: 0, y: -18, z: 0 }, { x: -0.92, y: 0.04, z: -0.04 });
      registerPhysics(mouseObj.mesh, mouseObj.shape, 2, { x: 9, y: -15, z: 3 }, { x: -0.3, y: 0.25, z: -0.05 });
      registerPhysics(gpu.mesh, gpu.shape, 4, { x: -8, y: -14, z: 1 }, { x: -0.85, y: 0.05, z: -0.08 });
      registerPhysics(cpu.mesh, cpu.shape, 2.5, { x: 4, y: -21, z: 2 }, { x: -0.85, y: -0.22, z: 0.18 });
      registerPhysics(code1.mesh, code1.shape, 1.2, { x: -7, y: -14, z: 2 }, { x: 0, y: 0.15, z: 0.05 });
      registerPhysics(code2.mesh, code2.shape, 1.2, { x: 7, y: -14, z: 1 }, { x: 0, y: -0.15, z: -0.05 });
      mol.mesh.visible = false;
      code3.mesh.visible = false;
      code4.mesh.visible = false;
      kb.mesh.scale.set(0.72, 0.72, 0.72);
      mouseObj.mesh.scale.set(0.9, 0.9, 0.9);
      gpu.mesh.scale.set(0.72, 0.72, 0.72);
      cpu.mesh.scale.set(0.82, 0.82, 0.82);
      code1.mesh.scale.set(0.65, 0.65, 0.65);
      code2.mesh.scale.set(0.65, 0.65, 0.65);
    }

    // ── POINTER / GYRO STATE ──
    let mouseX = 0, mouseY = 0;
    let gyroX = 0, gyroY = 0, targetGyroX = 0, targetGyroY = 0;
    let gyroEnabled = false, gyroBaselineBeta = null, gyroBaselineGamma = null;
    const GYRO_H_SENS = 0.075, GYRO_V_SENS = 0.055;
    const MAX_GYRO_X = 2.8, MAX_GYRO_Y = 2.0;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // ── EVENT HANDLERS (named, for cleanup) ──
    const handleMouseMove = (e) => {
      if (!isMobile) {
        const strength = 0.03;
        mouseX = (e.clientX - window.innerWidth / 2) * strength;
        mouseY = (e.clientY - window.innerHeight / 2) * strength;
      }
    };

    const handleDeviceOrientation = (event) => {
      if (!isMobile) return;
      const { beta, gamma } = event;
      if (beta === null || gamma === null) return;
      if (gyroBaselineBeta === null || gyroBaselineGamma === null) {
        gyroBaselineBeta = beta; gyroBaselineGamma = gamma; return;
      }
      targetGyroX = clamp((gamma - gyroBaselineGamma) * GYRO_H_SENS, -MAX_GYRO_X, MAX_GYRO_X);
      targetGyroY = clamp((beta - gyroBaselineBeta) * GYRO_V_SENS, -MAX_GYRO_Y, MAX_GYRO_Y);
      gyroEnabled = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!gyroEnabled) {
        targetGyroX = clamp((touch.clientX - window.innerWidth / 2) * 0.008, -MAX_GYRO_X, MAX_GYRO_X);
        targetGyroY = clamp((touch.clientY - window.innerHeight / 2) * 0.006, -MAX_GYRO_Y, MAX_GYRO_Y);
      }
    };

    let lastTap = 0;
    const handleTouchEnd = () => {
      const now = Date.now();
      if (now - lastTap < 350) {
        gyroBaselineBeta = null; gyroBaselineGamma = null;
        targetGyroX = 0; targetGyroY = 0; gyroX = 0; gyroY = 0;
      }
      lastTap = now;
    };

    // Raycaster for gentle zero-g space physics
    const raycaster = new THREE.Raycaster();
    const pointerVec = new THREE.Vector2();
    const triggerPhysics = (clientX, clientY) => {
      pointerVec.x = (clientX / window.innerWidth) * 2 - 1;
      pointerVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerVec, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length === 0) return;
      let mesh = intersects[0].object;
      while (mesh.parent && mesh.parent !== scene) mesh = mesh.parent;
      const obj = objectsToUpdate.find(o => o.mesh === mesh);
      if (!obj) return;
      obj.body.wakeUp();
      // Gentle weightless zero-g push with ZERO rotation
      obj.body.velocity.set(
        (Math.random() - 0.5) * (isMobile ? 1.5 : 2.5),
        (isMobile ? 2.5 : 4.0) + Math.random() * 1.5,
        (Math.random() - 0.5) * (isMobile ? 1.5 : 2.5)
      );
      obj.body.angularVelocity.set(0, 0, 0);
    };
    const handleMouseDown = (e) => triggerPhysics(e.clientX, e.clientY);
    const handleTouchStart = (e) => { if (e.touches.length > 0) triggerPhysics(e.touches[0].clientX, e.touches[0].clientY); };

    let resizeRAF = null;
    const handleResize = () => {
      isMobile = window.innerWidth <= 768;
      isSmallPhone = window.innerWidth <= 420;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      if (resizeRAF) cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        renderer.setPixelRatio(getPixelRatio());
      });
    };

    const handleVisibilityChange = () => { isPageVisible = document.visibilityState === 'visible'; };

    // ── REGISTER LISTENERS ──
    const addListener = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      listenersRef.current.push({ target, event, handler, options });
    };

    addListener(document, 'mousemove', handleMouseMove);
    addListener(document, 'touchmove', handleTouchMove, { passive: true });
    addListener(document, 'touchend', handleTouchEnd, { passive: true });
    addListener(document, 'mousedown', handleMouseDown);
    addListener(document, 'touchstart', handleTouchStart, { passive: true });
    addListener(window, 'resize', handleResize);
    addListener(document, 'visibilitychange', handleVisibilityChange);

    // Gyroscope setup
    function startGyroscope() {
      if (!isMobile) return;
      if (typeof DeviceOrientationEvent === 'undefined') return;
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permission => {
            if (permission === 'granted') {
              gyroBaselineBeta = null; gyroBaselineGamma = null;
              addListener(window, 'deviceorientation', handleDeviceOrientation, true);
            }
          })
          .catch(() => { /* permission denied */ });
      } else {
        gyroBaselineBeta = null; gyroBaselineGamma = null;
        addListener(window, 'deviceorientation', handleDeviceOrientation, true);
      }
    }

    if (isMobile) {
      const enableGyro = () => { startGyroscope(); };
      addListener(document, 'touchstart', enableGyro, { passive: true, once: true });
      // Auto-start for Android (no permission required)
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
        startGyroscope();
      }
    }

    // ── ANIMATION LOOP ──
    const clock = new THREE.Clock();
    clockRef.current = clock;
    const springForce = new CANNON.Vec3();
    let isPageVisible = true;
    let entranceStarted = prefersReducedMotion;

    function animate() {
      if (!isMounted) return;
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isPageVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Soft spring forces toward rest positions in zero-g space
      if (entranceStarted) {
        for (let i = 0; i < objectsToUpdate.length; i++) {
          const object = objectsToUpdate[i];
          springForce.x = SPRING_K * (object.restPos.x - object.body.position.x);
          springForce.y = SPRING_K * (object.restPos.y - object.body.position.y);
          springForce.z = SPRING_K * (object.restPos.z - object.body.position.z);
          object.body.applyForce(springForce, object.body.position);
        }
      }

      world.step(1 / 60, delta, 3);

      // Weightless space levitation (ambient zero-g bobbing in Y and smooth translational floating)
      for (let i = 0; i < objectsToUpdate.length; i++) {
        const object = objectsToUpdate[i];
        const floatOffset = i * 1.25;
        const levitateY = Math.sin(elapsedTime * 0.9 + floatOffset) * (isMobile ? 0.35 : 0.6);
        const levitateX = Math.cos(elapsedTime * 0.5 + floatOffset) * (isMobile ? 0.15 : 0.25);

        object.mesh.position.set(
          object.body.position.x + levitateX,
          object.body.position.y + levitateY,
          object.body.position.z
        );
        object.mesh.quaternion.copy(object.body.quaternion);
      }

      // Ambient motion
      ringsGroup.children.forEach(ring => { ring.rotation.z += ring.userData.rotSpeed * (isMobile ? 1 : 1.5); });
      particleMesh.rotation.y = elapsedTime * 0.015;
      particleMesh.rotation.x = elapsedTime * 0.008;

      // Light animation (vibrant neon pulsing)
      rimLight.intensity = (isMobile ? 4.5 : 6.0) + Math.sin(elapsedTime * 3) * 0.8;
      fillLight.intensity = (isMobile ? 3.8 : 5.0) + Math.cos(elapsedTime * 2.5) * 0.6;
      rimLight.position.x = Math.sin(elapsedTime * 0.5) * 30;
      rimLight.position.z = -15 + Math.cos(elapsedTime * 0.5) * 15;

      // Camera parallax (merged mobile blocks)
      if (isMobile) {
        gyroX += (targetGyroX - gyroX) * 0.065;
        gyroY += (targetGyroY - gyroY) * 0.065;
        camera.position.x += (BASE_CAMERA_X + gyroX - camera.position.x) * 0.045;
        camera.position.y += (BASE_CAMERA_Y + gyroY - camera.position.y) * 0.045;
      } else {
        camera.position.x += (mouseX - camera.position.x) * 0.035;
        camera.position.y += (2 + mouseY - camera.position.y) * 0.035;
      }
      camera.lookAt(0, isMobile ? -8 : -10, 0);

      renderer.render(scene, camera);
    }
    animate();

    // ── BOOT SEQUENCE ──
    (function runBootSequence() {
      const bootScreen = bootScreenRef.current;
      const bootLines = bootLinesRef.current;
      const bootBarFill = bootBarFillRef.current;
      const bootPercent = bootPercentRef.current;
      const bootFlash = bootFlashRef.current;

      function finishBoot() {
        setIsRevealed(true);
        entranceStarted = true;
        launchObjects();
        if (bootScreen) {
          bootScreen.style.opacity = '0';
          const tid = setTimeout(() => { bootScreen.style.display = 'none'; }, 400);
          timeoutsRef.current.push(tid);
        }
      }

      if (prefersReducedMotion) {
        if (bootScreen) bootScreen.style.display = 'none';
        setIsRevealed(true);
        entranceStarted = true;
        return;
      }

      const BOOT_DURATION = isMobile ? 1500 : 1900;
      const lines = [
        'INITIALIZING TECH_TITANS.SYS',
        'MOUNTING GPU DRIVERS...',
        'LOADING NEURAL ASSETS...',
        'CALIBRATING ANTI-GRAV FIELD...',
        'LINKING DATA_SCIENCE.MODULE',
        'SYSTEM READY'
      ];
      const lineGap = Math.floor((BOOT_DURATION - 300) / lines.length);

      function removeCursor() {
        const c = bootLines?.querySelector('.cursor');
        if (c) c.remove();
      }

      lines.forEach((line, i) => {
        const tid = setTimeout(() => {
          if (!isMounted || !bootLines) return;
          removeCursor();
          const el = document.createElement('div');
          el.textContent = '> ' + line;
          if (i === lines.length - 1) el.classList.add('ok');
          const cursor = document.createElement('span');
          cursor.className = 'cursor';
          el.appendChild(cursor);
          bootLines.appendChild(el);
        }, i * lineGap);
        timeoutsRef.current.push(tid);
      });

      if (bootBarFill) {
        bootBarFill.style.transition = `width ${(BOOT_DURATION - 200) / 1000}s cubic-bezier(0.3, 0.7, 0.3, 1)`;
        requestAnimationFrame(() => { bootBarFill.style.width = '100%'; });
      }

      const percentStart = performance.now();
      function tickPercent() {
        if (!isMounted || !bootPercent) return;
        const pct = Math.min(100, Math.round((performance.now() - percentStart) / (BOOT_DURATION - 200) * 100));
        bootPercent.textContent = pct + '%';
        if (pct < 100) requestAnimationFrame(tickPercent);
      }
      requestAnimationFrame(tickPercent);

      const finishTid = setTimeout(() => {
        removeCursor();
        if (bootFlash) bootFlash.classList.add('fire');
        finishBoot();
      }, BOOT_DURATION);
      timeoutsRef.current.push(finishTid);
    })();

    // ── CLEANUP ──
    return () => {
      isMounted = false;

      // Cancel animation frame
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resizeRAF) cancelAnimationFrame(resizeRAF);

      // Clear all timeouts
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];

      // Remove all event listeners
      listenersRef.current.forEach(({ target, event, handler, options }) => {
        target.removeEventListener(event, handler, options);
      });
      listenersRef.current = [];

      // Remove WebGL context listeners
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      }

      // Dispose all tracked geometries, materials, textures
      disposablesRef.current.forEach(item => { if (item && item.dispose) item.dispose(); });
      disposablesRef.current = [];

      // Clear scene
      scene.clear();

      // Dispose renderer and force context loss
      renderer.dispose();
      renderer.forceContextLoss();

      // Remove canvas from DOM
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      rendererRef.current = null;
      sceneRef.current = null;
      worldRef.current = null;
      clockRef.current = null;
    };
  }, [prefersReducedMotion, handleEnterHome]);

  return (
    <div className={`landing-page${isRevealed ? ' revealed' : ''}`}>
      {/* Boot Screen */}
      <div className="boot-screen" ref={bootScreenRef}>
        <div className="boot-lines" ref={bootLinesRef}></div>
        <div className="boot-bar-track">
          <div className="boot-bar-fill" ref={bootBarFillRef}></div>
        </div>
        <div className="boot-percent" ref={bootPercentRef}>0%</div>
      </div>
      <div className="boot-flash" ref={bootFlashRef}></div>

      {/* Three.js Canvas */}
      <div className="canvas-container" ref={containerRef}></div>

      {/* WebGL Fallback */}
      <div className="static-fallback" ref={fallbackRef}>
        <h1>TECH TITANS</h1>
        <p>Official Inauguration Ceremony</p>
        <button className="fallback-btn" onClick={(e) => handleEnterHome(e.currentTarget)}>
          Enter Home Page
        </button>
      </div>
      <div className="transition-overlay" ref={overlayRef}></div>

      {/* UI Overlay */}
      <div className="ui-layer">
        <div className="subtitle">A New Chapter Begins</div>
        <div className="title-container">
          <span className="title-tech">TECH</span>
          <span className="title-titans">TITANS</span>
        </div>
        <div className="ceremony-text">Official Inauguration Ceremony</div>
        <div className="enter-btn-wrapper">
          <button className="enter-btn" onClick={(e) => handleEnterHome(e.currentTarget)}>
            Enter Home Page
          </button>
        </div>
      </div>
      <div className="depts">Think<br />Build<br />Innovate</div>
    </div>
  );
}
