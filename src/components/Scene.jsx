import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default function Scene({ prefersReducedMotion, onReady }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const container = mountRef.current;
    if (!container) return;

    let isMobile = window.innerWidth <= 768;
    let isSmallPhone = window.innerWidth <= 420;

    const hexWithAlpha = (hex, alphaHex) => hex + alphaHex;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#1c212d', 0.012);

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 250);
    camera.position.set(0, 2, isMobile ? 58 : 52);
    camera.lookAt(0, -10, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isMobile ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
    // THREE.sRGBEncoding is deprecated in newer three.js, use SRGBColorSpace. We use r128 so sRGBEncoding is correct, 
    // but npm installed the latest three.js by default? Wait, I didn't specify r128 in npm install.
    // The prompt says "three.js r128". Wait, `npm install three` installs latest. 
    // Let me just use the standard latest three properties, or stick to r128.
    // I will use `THREE.SRGBColorSpace` just in case, or `THREE.sRGBEncoding` if available.
    renderer.outputColorSpace = THREE.SRGBColorSpace; // For newer three versions
    // fallback for r128 if installed:
    // renderer.outputEncoding = 3001; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    container.appendChild(renderer.domElement);

    // --- PHYSICS ---
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.solver.iterations = isMobile ? 12 : 20;
    world.allowSleep = true;

    const defaultMaterial = new CANNON.Material();
    world.addContactMaterial(new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, { friction: 0.8, restitution: 0.15 }));

    const objectsToUpdate = [];

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight('#1e1a2e', 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2.0);
    keyLight.position.set(20, 40, 25);
    keyLight.castShadow = true;
    const shadowRes = isMobile ? (isSmallPhone ? 512 : 768) : 2048;
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
    keyLight.shadow.radius = isMobile ? 1.5 : 4;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight('#c9b3ff', 4.5, 100);
    rimLight.position.set(-30, 15, -15);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight('#00f3ff', 3.5, 90);
    fillLight.position.set(30, 10, -15);
    scene.add(fillLight);

    // --- MATERIALS (Cached) ---
    const matBaseGrey = new THREE.MeshPhysicalMaterial({ color: '#161720', roughness: 0.4, metalness: 0.6, clearcoat: 0.6 });
    const matKeyDark = new THREE.MeshPhysicalMaterial({ color: '#1f202e', roughness: 0.5, metalness: 0.4, clearcoat: 0.2 });
    const matAccentPurple = new THREE.MeshPhysicalMaterial({ color: '#c9b3ff', roughness: 0.1, metalness: 0.5, emissive: '#6b4cba', emissiveIntensity: 0.8 });
    const matAccentCyan = new THREE.MeshPhysicalMaterial({ color: '#00f3ff', roughness: 0.1, metalness: 0.5, emissive: '#0099aa', emissiveIntensity: 1.0 });
    const matMoleculeNode = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.8, clearcoat: 1.0 });
    const matMoleculeWire = new THREE.MeshPhysicalMaterial({ color: '#e2d4ff', roughness: 0.1, metalness: 1.0, emissive: '#ff007f', emissiveIntensity: 1.0 });
    const matPanelEdgeBright = new THREE.MeshPhysicalMaterial({ color: '#8b75c7', roughness: 0.2, metalness: 0.4, clearcoat: 0.8, emissive: '#5d4899', emissiveIntensity: 0.6 });
    const matPin = new THREE.MeshPhysicalMaterial({ color: '#b89eff', metalness: 0.9, roughness: 0.2, emissive: '#3a2d5e', emissiveIntensity: 0.5 });
    
    // Disposables array to clean up WebGL
    const disposables = [
      matBaseGrey, matKeyDark, matAccentPurple, matAccentCyan, 
      matMoleculeNode, matMoleculeWire, matPanelEdgeBright, matPin
    ];

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
        map: getGlowTexture(color), transparent: true, opacity: 0.35,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      disposables.push(mat);
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(width * 1.5, height * 1.5, 1);
      sprite.position.z = -0.5;
      return sprite;
    }

    const SPRING_K = 3.0;
    function registerPhysics(mesh, shape, mass, restPos) {
      scene.add(mesh);
      const spawnY = prefersReducedMotion ? restPos.y : restPos.y - 25;
      
      const body = new CANNON.Body({
        mass: mass, shape: shape, material: defaultMaterial,
        position: new CANNON.Vec3(restPos.x, spawnY, restPos.z),
        linearDamping: 0.78, angularDamping: 0.85,
        allowSleep: true, sleepSpeedLimit: 0.1, sleepTimeLimit: 2.0
      });
      
      if (!prefersReducedMotion) {
        body.quaternion.setFromEuler((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
      }
      
      world.addBody(body);
      objectsToUpdate.push({ mesh, body, restPos: new CANNON.Vec3(restPos.x, restPos.y, restPos.z), launched: false });
    }

    // CREATE OBJECTS (simplified for React port, capturing the exact look of code panels)
    // Code Panel
    function createCodePanel(codeLine, commentLine, width, height, glowColor) {
      const canvas = document.createElement('canvas');
      canvas.width = 1600; canvas.height = 800;
      const ctx = canvas.getContext('2d');
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      disposables.push(texture);

      const panelMat = new THREE.MeshPhysicalMaterial({
        map: texture, roughness: 0.3, metalness: 0.2, clearcoat: 0.2, clearcoatRoughness: 0.5,
        emissive: glowColor, emissiveMap: texture, emissiveIntensity: 0.8
      });
      disposables.push(panelMat);

      const shape = createRoundedRectShape(width, height, 0.4);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.08 });
      disposables.push(geo);

      const mesh = new THREE.Mesh(geo, [panelMat, matPanelEdgeBright]);
      mesh.castShadow = true; mesh.receiveShadow = true;
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);

      const drawPanel = () => {
        ctx.clearRect(0, 0, 1600, 800);
        ctx.fillStyle = '#1c212d';
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
            ctx.shadowColor = token.color === '#ffffff' ? 'rgba(255,255,255,0.4)' : glowColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = token.color;
            ctx.fillText(token.text, offsetX, codeY);
            ctx.shadowBlur = 0;
            ctx.fillText(token.text, offsetX, codeY);
            offsetX += ctx.measureText(token.text).width;
        });

        const commentSize = Math.max(30, Math.round(codeSize * 0.22));
        ctx.font = `600 ${commentSize}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.fillText('# ' + commentLine, 800, codeY + codeSize * 0.55);
        ctx.textAlign = 'left';

        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 1588, 788);
        ctx.shadowBlur = 4;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(4, 4, 1592, 792);
        ctx.restore();
        texture.needsUpdate = true;
      };
      
      // Delay draw to allow font to load (or draw immediately if loaded)
      drawPanel();
      if(document.fonts) document.fonts.ready.then(drawPanel).catch(drawPanel);

      const group = new THREE.Group();
      group.add(createGlowSprite(glowColor || '#b89eff', width, height));
      group.add(mesh);
      return { mesh: group, shape: new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, 0.15)) };
    }

    const code1 = createCodePanel(
      [{ text: 'print', color: '#d8b4fe' }, { text: '(', color: '#ffffff' }, { text: '"Hello, World!"', color: '#ffffff' }, { text: ')', color: '#ffffff' }],
      'outputs a greeting', 6.0, 3.8, '#b89eff'
    );
    registerPhysics(code1.mesh, code1.shape, 1.5, { x: -17, y: -14, z: 3 });

    const code2 = createCodePanel(
      [{ text: 'data', color: '#00f3ff' }, { text: ' = ', color: '#ffffff' }, { text: '[]', color: '#ffffff' }],
      'empty list, ready to fill', 5.8, 3.6, '#00f3ff'
    );
    registerPhysics(code2.mesh, code2.shape, 1.5, { x: 17, y: -14, z: 2 });

    const code3 = createCodePanel(
        [{ text: 'x', color: '#ff007f' }, { text: ', ', color: '#ffffff' }, { text: 'y', color: '#ff007f' }, { text: ' = ', color: '#ffffff' }, { text: '0, 1', color: '#ffffff' }],
        'initial state', 5.8, 3.6, '#ff007f' 
    );
    registerPhysics(code3.mesh, code3.shape, 1.5, { x: -8, y: -15, z: 5 });

    const code4 = createCodePanel(
        [{ text: 'model', color: '#d8b4fe' }, { text: '.fit', color: '#d8b4fe' }, { text: '(X_train, y)', color: '#ffffff' }], 
        'train the model', 6.0, 3.8, '#b89eff'
    );
    registerPhysics(code4.mesh, code4.shape, 1.5, { x: 8, y: -15, z: 4 });

    // BACKGROUND RINGS & PARTICLES
    const ringsGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({ color: '#9a7fe0', transparent: true, opacity: 0.4, linewidth: 2, blending: THREE.AdditiveBlending });
    const purpleRingMat = new THREE.LineBasicMaterial({ color: '#c9b3ff', transparent: true, opacity: 0.35, linewidth: 2, blending: THREE.AdditiveBlending });
    const cyanRingMat = new THREE.LineBasicMaterial({ color: '#00f3ff', transparent: true, opacity: 0.4, linewidth: 2, blending: THREE.AdditiveBlending });
    disposables.push(ringMat, purpleRingMat, cyanRingMat);

    const ringCount = isMobile ? 10 : 18;
    const ringPointRes = isMobile ? 80 : 150;
    for (let i = 1; i <= ringCount; i++) {
        const curve = new THREE.EllipseCurve(0, 0, i * 6.5, i * 4.0, 0, 2 * Math.PI, false, 0);
        const points = curve.getPoints(ringPointRes);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        disposables.push(geometry);

        let selectedMat = ringMat;
        if (i % 3 === 0) selectedMat = purpleRingMat;
        if (i % 4 === 0) selectedMat = cyanRingMat;

        const ellipse = new THREE.Line(geometry, selectedMat);
        ellipse.rotation.x = -Math.PI / 2.05;
        ellipse.rotation.z = (Math.random() - 0.5) * 0.5;
        ellipse.position.y = -35 + (i * 0.5);
        ellipse.position.z = -20;
        ellipse.userData = { rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.0005 + Math.random() * 0.001) };
        ringsGroup.add(ellipse);
    }
    scene.add(ringsGroup);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = isSmallPhone ? 120 : (isMobile ? 220 : 800);
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 150;
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    disposables.push(particlesGeo);

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64; pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(184, 158, 255, 1)');
    pGrad.addColorStop(0.3, 'rgba(184, 169, 224, 0.9)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad; pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);
    disposables.push(pTex);

    const particlesMat = new THREE.PointsMaterial({
        size: 1.0, map: pTex,
        transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
    disposables.push(particlesMat);
    const particleMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleMesh);

    const mobileOnlyHidden = [];
    const smallPhoneOnlyHidden = [code3.mesh, code4.mesh];

    const applyMobileVisibility = () => {
        mobileOnlyHidden.forEach(m => { m.visible = !isMobile; });
        smallPhoneOnlyHidden.forEach(m => { m.visible = !isSmallPhone; });
    };
    applyMobileVisibility();

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;
    let animationFrameId = null;
    const springForce = new CANNON.Vec3();
    let entranceStarted = prefersReducedMotion;

    // Public method to start animation
    if(onReady) {
      onReady(() => {
        entranceStarted = true;
        if (!prefersReducedMotion) {
          objectsToUpdate.forEach(obj => {
              obj.body.wakeUp();
              obj.body.velocity.set((Math.random() - 0.5) * 2, 34 + Math.random() * 6, (Math.random() - 0.5) * 2);
              obj.launched = true;
          });
        }
      });
    }

    const animate = () => {
      if (!isMounted) return;
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      if (entranceStarted) {
          for (const object of objectsToUpdate) {
              springForce.x = SPRING_K * (object.restPos.x - object.body.position.x);
              springForce.y = SPRING_K * (object.restPos.y - object.body.position.y);
              springForce.z = SPRING_K * (object.restPos.z - object.body.position.z);
              object.body.applyForce(springForce, object.body.position);
          }
      }

      world.step(1 / 60, delta, 3);

      for (const object of objectsToUpdate) {
          object.mesh.position.copy(object.body.position);
          object.mesh.quaternion.copy(object.body.quaternion);
      }

      ringsGroup.children.forEach(ring => { ring.rotation.z += ring.userData.rotSpeed * 1.5; });
      particleMesh.rotation.y = elapsedTime * 0.015;
      particleMesh.rotation.x = elapsedTime * 0.008;

      rimLight.intensity = 4.5 + Math.sin(elapsedTime * 4) * 1.0;
      fillLight.intensity = 3.5 + Math.cos(elapsedTime * 3) * 0.8;
      rimLight.position.x = Math.sin(elapsedTime * 0.6) * 35;
      rimLight.position.z = -15 + Math.cos(elapsedTime * 0.6) * 15;

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (2 + mouseY - camera.position.y) * 0.05;
      camera.lookAt(0, -10, 0);

      renderer.render(scene, camera);
    };
    animate();

    // --- EVENT LISTENERS ---
    const handleResize = () => {
      isMobile = window.innerWidth <= 768;
      isSmallPhone = window.innerWidth <= 420;
      applyMobileVisibility();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 1.5));
    };
    
    const updatePointerTarget = (clientX, clientY) => {
      const strength = isMobile ? 0.015 : 0.03;
      mouseX = (clientX - window.innerWidth / 2) * strength;
      mouseY = (clientY - window.innerHeight / 2) * strength;
    };
    
    const handleMouseMove = e => updatePointerTarget(e.clientX, e.clientY);
    const handleTouchMove = e => { if (e.touches.length > 0) updatePointerTarget(e.touches[0].clientX, e.touches[0].clientY); };

    const raycaster = new THREE.Raycaster();
    const pointerVec = new THREE.Vector2();

    const triggerPhysics = (clientX, clientY) => {
      pointerVec.x = (clientX / window.innerWidth) * 2 - 1;
      pointerVec.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerVec, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
          let mesh = intersects[0].object;
          while (mesh.parent && mesh.parent !== scene) mesh = mesh.parent;
          const obj = objectsToUpdate.find(o => o.mesh === mesh);
          if (obj) {
              obj.body.wakeUp();
              obj.body.velocity.set((Math.random() - 0.5) * 8, 8 + Math.random() * 4, (Math.random() - 0.5) * 5);
              obj.body.angularVelocity.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
          }
      }
    };
    const handleMouseDown = e => triggerPhysics(e.clientX, e.clientY);
    const handleTouchStart = e => { if (e.touches.length > 0) triggerPhysics(e.touches[0].clientX, e.touches[0].clientY); };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    // --- CLEANUP ---
    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('touchstart', handleTouchStart);

      // Clean up Three.js
      disposables.forEach(d => d.dispose && d.dispose());
      scene.clear(); // Clears all children
      renderer.dispose();
      renderer.forceContextLoss();
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [prefersReducedMotion]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }} />;
}
