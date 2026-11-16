// "What I do": each service gets one of the toy pieces from the hero. It pops in when it comes into view
// and then sways slowly on its own. "About me" uses the same renderer for the technology logos, which stand still. One WebGL renderer draws every piece and copies it into that piece's
// own 2D canvas, so the page keeps a single GPU context for all of them.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

let renderer: THREE.WebGLRenderer | undefined;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch {
  // No WebGL: the flat icons stay.
}

if (renderer) start(renderer);

type Token = { el: HTMLElement; ctx: CanvasRenderingContext2D; piece: THREE.Group; n: number; visible: boolean; shown: number; still: boolean };

function start(renderer: THREE.WebGLRenderer) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 1.5, 5.6);
  camera.lookAt(0, 0.6, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.9 * Math.PI));
  const key = new THREE.DirectionalLight(0xffffff, 1.0 * Math.PI);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf7930e, 0.4 * Math.PI);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const tokens: Token[] = [];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const tk = tokens.find((x) => x.el === e.target);
      if (tk) tk.visible = e.isIntersecting;
    }
    wake();
  });

  document.querySelectorAll<HTMLElement>("[data-model]").forEach((el, n) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d")!;
    const piece = new THREE.Group();
    piece.visible = false;
    scene.add(piece);
    // A badge-sized piece ([data-still]) faces front and fills its frame; the big ones sway.
    const still = "still" in el.dataset;
    const tk: Token = { el, ctx, piece, n, visible: false, shown: reduce ? 1 : 0, still };

    loader.load(`/models/${el.dataset.model}.glb`, (gltf) => {
      const m = gltf.scene;
      const box = new THREE.Box3().setFromObject(m);
      const s = box.getSize(new THREE.Vector3());
      const c = box.getCenter(new THREE.Vector3());
      const k = (still ? 2 : 1.45) / Math.max(s.x, s.y, s.z);
      m.scale.setScalar(k);
      // Still pieces are centred on the point the camera looks at instead of standing on the floor.
      m.position.set(-c.x * k, still ? 0.6 - c.y * k : -box.min.y * k, -c.z * k);
      piece.add(m);
      el.replaceChildren(canvas);
      el.classList.add("token");
      tokens.push(tk);
      io.observe(el);
    });
  });

  // The loop runs only while a piece is on screen.
  let running = false;
  function wake() {
    if (!running && tokens.some((t) => t.visible)) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  function tick(now: number) {
    const live = tokens.filter((t) => t.visible);
    if (!live.length) {
      running = false;
      return;
    }
    for (const tk of live) {
      const size = Math.round(tk.el.clientWidth * dpr);
      if (!size) continue;
      if (tk.ctx.canvas.width !== size) tk.ctx.canvas.width = tk.ctx.canvas.height = size;
      if (renderer.domElement.width !== size) renderer.setSize(size, size, false);
      const t = now / 1000 + tk.n * 1.7;
      tk.shown += (1 - tk.shown) * 0.08;
      // A soft overshoot as the piece arrives, then a slow sway and float.
      const pop = tk.shown < 0.999 ? 1 + Math.sin(tk.shown * Math.PI) * 0.12 : 1;
      tk.piece.scale.setScalar(tk.shown * pop);
      const calm = reduce || tk.still;
      // Still pieces face the camera squarely, tipped up by the camera's own elevation.
      tk.piece.rotation.x = tk.still ? 0.16 : 0;
      tk.piece.rotation.y = tk.still ? 0 : -0.5 + (calm ? 0 : Math.sin(t * 0.6) * 0.35) + (1 - tk.shown) * -1.2;
      tk.piece.position.y = calm ? 0 : Math.sin(t * 1.1) * 0.04;
      for (const other of tokens) other.piece.visible = other === tk;
      renderer.render(scene, camera);
      tk.ctx.clearRect(0, 0, size, size);
      tk.ctx.drawImage(renderer.domElement, 0, 0);
    }
    // Pieces that stand still need no more frames once they have arrived.
    if (live.every((t) => (reduce || t.still) && t.shown > 0.999)) {
      running = false;
      return;
    }
    requestAnimationFrame(tick);
  }
}
