// three-scene.js — THREE r128 CDN (non-module). 3D background visuals.
(() => {
  if (!window.THREE) { console.error("THREE.js not found"); return; }

  const container = document.getElementById("canvas-container") || (() => {
    const c = document.createElement("div"); c.id = "canvas-container"; document.body.prepend(c); return c;
  })();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  Object.assign(renderer.domElement.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none",
    background: "radial-gradient(1200px 800px at 70% 30%, rgba(61,0,99,0.35), rgba(0,0,0,0))",
  });
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070011, 0.02);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera.position.set(0, 0, 60);

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.PointLight(0x66ccff, 0.8); key.position.set(40, 30, 50); scene.add(key);
  const fill = new THREE.PointLight(0xff66cc, 0.6); fill.position.set(-40, -20, -20); scene.add(fill);

  // particles
  const COUNT = 5000; const positions = new Float32Array(COUNT * 3);
  const rand = (min, max) => Math.random() * (max - min) + min;
  for (let i = 0; i < COUNT; i++) {
    positions[i*3+0] = rand(-150, 150);
    positions[i*3+1] = rand(-100, 100);
    positions[i*3+2] = rand(-120, 40);
  }
  const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ size: .75, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x88ccff });
  const particles = new THREE.Points(pGeo, pMat); scene.add(particles);

  // spheres
  const spheres = [];
  [
    { color: 0x00ffff, r: 12, pos: new THREE.Vector3(-18, 10, -20), rot: [0.0012, 0.0018] },
    { color: 0xaa66ff, r:  9, pos: new THREE.Vector3(20, -8, -35),  rot: [-0.001, 0.0015] },
    { color: 0xff66aa, r:  7, pos: new THREE.Vector3(0, 18, -28),   rot: [0.0016, -0.0009] },
  ].forEach(({ color, r, pos, rot }) => {
    const g = new THREE.IcosahedronGeometry(r, 3);
    const m = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: .7 });
    const mesh = new THREE.Mesh(g, m); mesh.position.copy(pos);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(r*1.15, 32, 32),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.12, blending:THREE.AdditiveBlending, side:THREE.BackSide }));
    mesh.add(halo); mesh.userData.rot = rot; scene.add(mesh); spheres.push(mesh);
  });

  const torus = new THREE.Mesh(new THREE.TorusGeometry(22, 1.8, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0x66ffee, wireframe: true, transparent: true, opacity: .25 }));
  torus.position.set(0,0,-50); scene.add(torus);

  const grid = new THREE.GridHelper(400, 40, 0x00ccff, 0x00ccff);
  grid.material.transparent = true; grid.material.opacity = .08; grid.position.set(0,-40,-80); scene.add(grid);

  const clock = new THREE.Clock();
  const mouse = { x:0, y:0, tx:0, ty:0 }; const zDrift = { speed: 1.5, depth: 220 };
  const onPointer = (x, y) => { const nx = (x / innerWidth) * 2 - 1; const ny = (y / innerHeight) * 2 - 1; mouse.tx = nx*.8; mouse.ty = ny*.6; };
  addEventListener("mousemove", e => onPointer(e.clientX, e.clientY), { passive: true });
  addEventListener("touchmove", e => { if (e.touches?.[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  addEventListener("resize", () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  const animate = () => {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;

    const baseZ = 60 + Math.sin(t*.2) * 4;
    camera.position.set(mouse.x*8, -mouse.y*6, baseZ);
    camera.lookAt(0,0,-20);

    spheres.forEach((s, i) => { s.rotation.x += s.userData.rot[0]; s.rotation.y += s.userData.rot[1]; s.position.y += Math.sin(t*.8 + i)*.005; });
    torus.rotation.x += .002; torus.rotation.y -= .0015;

    const pos = particles.geometry.attributes.position;
    for (let i=0;i<pos.count;i++){ let z = pos.getZ(i) + zDrift.speed*.04; if (z > 40) z = -zDrift.depth; pos.setZ(i, z); }
    pos.needsUpdate = true;

    renderer.render(scene, camera);
  };
  animate();
})();
