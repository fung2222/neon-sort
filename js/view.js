import * as THREE from 'three';
import { STACK_MAX, COLORS } from './config.js';

const tubeMat = () => new THREE.MeshStandardMaterial({
  color: 0x1a1040, emissive: 0x00e5ff, emissiveIntensity: 0.15,
  roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.55,
});

export class View {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.pipes = [];
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.hint = -1; // valid drop target pulse
  }

  setVisible(on) { this.group.visible = !!on; }

  clear() {
    while (this.group.children.length) {
      const c = this.group.children.pop();
      c.traverse?.((o) => { o.geometry?.dispose?.(); });
    }
    this.pipes = [];
  }

  build(board) {
    this.clear();
    const n = board.stacks.length;
    const spacing = 1.55;
    const width = (n - 1) * spacing;

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(width + 3.2, 0.18, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x0a0520, emissive: 0x12083a, emissiveIntensity: 0.4, roughness: 0.7, metalness: 0.3 })
    );
    desk.position.set(0, -0.05, 0);
    this.group.add(desk);

    for (let i = 0; i < n; i++) {
      const x = -width / 2 + i * spacing;
      const g = new THREE.Group();
      g.position.set(x, 0, 0);
      g.userData.pipeIndex = i;

      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, STACK_MAX * 0.55 + 0.3, 20, 1, true),
        tubeMat()
      );
      tube.position.y = (STACK_MAX * 0.55 + 0.3) / 2;
      tube.userData.pipeIndex = i;
      g.add(tube);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.52, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.6 })
      );
      base.position.y = 0.06;
      base.userData.pipeIndex = i;
      g.add(base);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.5, 0.62, 24),
        new THREE.MeshBasicMaterial({ color: 0x3bff8a, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.14;
      ring.userData.pipeIndex = i;
      g.add(ring);

      // large invisible hit volume for mobile taps
      const hit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, STACK_MAX * 0.55 + 1.0, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.y = (STACK_MAX * 0.55 + 1.0) / 2;
      hit.userData.pipeIndex = i;
      g.add(hit);

      this.group.add(g);
      this.pipes.push({ group: g, tube, base, ring, hit, bricks: [] });
    }
    this.sync(board);
  }

  sync(board) {
    const lift = board.selected;
    for (let i = 0; i < board.stacks.length; i++) {
      const p = this.pipes[i];
      if (!p) continue;
      while (p.bricks.length) {
        const m = p.bricks.pop();
        p.group.remove(m);
        m.geometry?.dispose?.();
      }
      const stack = board.stacks[i];
      for (let k = 0; k < stack.length; k++) {
        const c = COLORS[stack[k]] || COLORS[0];
        const m = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.28, 0.12, 4, 10),
          new THREE.MeshStandardMaterial({
            color: c.hex, emissive: c.hex, emissiveIntensity: 0.85,
            roughness: 0.3, metalness: 0.45,
          })
        );
        let y = 0.35 + k * 0.55;
        if (i === lift && k >= stack.length - board.liftCount) {
          y += 0.42;
          m.material.emissiveIntensity = 1.35;
          m.scale.setScalar(1.06);
        }
        m.position.y = y;
        m.userData.pipeIndex = i;
        p.group.add(m);
        p.bricks.push(m);
      }
      const selected = i === lift;
      const valid = lift >= 0 && board.canMove(lift, i);
      p.tube.material.emissiveIntensity = selected ? 0.55 : valid ? 0.35 : 0.15;
      p.tube.material.emissive.setHex(selected ? 0xff2bd6 : valid ? 0x3bff8a : 0x00e5ff);
      p.base.material.emissiveIntensity = selected ? 0.9 : valid ? 0.7 : 0.45;
      p.ring.material.opacity = valid ? 0.75 : 0;
    }
  }

  flashIllegal(pipeIndex) {
    const p = this.pipes[pipeIndex];
    if (!p) return;
    p.tube.material.emissive.setHex(0xff3355);
    p.tube.material.emissiveIntensity = 0.8;
    this.shake(pipeIndex);
    setTimeout(() => { if (p.tube) p.tube.material.emissive.setHex(0x00e5ff); }, 180);
  }

  shake(pipeIndex) {
    const p = this.pipes[pipeIndex];
    if (!p) return;
    const g = p.group;
    const ox = g.position.x;
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      g.position.x = ox + Math.sin(t * 2.2) * 0.1;
      if (t > 10) { g.position.x = ox; clearInterval(iv); }
    }, 16);
  }

  celebrate() {
    for (const p of this.pipes) {
      p.ring.material.opacity = 0.9;
      p.tube.material.emissiveIntensity = 0.6;
    }
  }

  pickPipe(clientX, clientY) {
    const cam = this.stage.camera;
    const el = this.stage.renderer.domElement;
    const rect = el.getBoundingClientRect();
    this.ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.ray.setFromCamera(this.ndc, cam);
    const hits = this.pipes.map((p) => p.hit);
    const found = this.ray.intersectObjects(hits, false);
    if (found.length) return found[0].object.userData.pipeIndex ?? -1;
    // fallback: nearest pipe in screen X for fat-finger misses
    let best = -1, bestD = 48;
    for (let i = 0; i < this.pipes.length; i++) {
      const wp = this.pipes[i].group.position.clone();
      wp.y = 1.2;
      wp.project(cam);
      const sx = (wp.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-wp.y * 0.5 + 0.5) * rect.height + rect.top;
      const d = Math.hypot(clientX - sx, clientY - sy);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  frameCamera(cam, n, dt) {
    const target = new THREE.Vector3(0, 1.6, 0);
    const want = new THREE.Vector3(0, 5.2 + n * 0.12, 6.8 + n * 0.18);
    cam.position.lerp(want, Math.min(1, dt * 3));
    cam.lookAt(target);
  }
}
