import * as THREE from 'three';
import { STACK_MAX, COLORS } from './config.js';

const tubeMat = new THREE.MeshStandardMaterial({
  color: 0x1a1040, emissive: 0x00e5ff, emissiveIntensity: 0.15,
  roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.55,
});

export class View {
  constructor(stage) {
    this.stage = stage;
    this.group = new THREE.Group();
    stage.scene.add(this.group);
    this.pipes = [];
    this.bricks = []; // mesh per cell
    this.ray = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.desk = null;
  }

  setVisible(on) { this.group.visible = !!on; }

  clear() {
    while (this.group.children.length) {
      const c = this.group.children.pop();
      c.traverse?.((o) => {
        if (o.geometry) o.geometry.dispose?.();
      });
    }
    this.pipes = [];
    this.bricks = [];
    this.desk = null;
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
    this.desk = desk;

    for (let i = 0; i < n; i++) {
      const x = -width / 2 + i * spacing;
      const g = new THREE.Group();
      g.position.set(x, 0, 0);
      g.userData.pipeIndex = i;

      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, STACK_MAX * 0.55 + 0.3, 20, 1, true),
        tubeMat.clone()
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

      // invisible pick capsule
      const hit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, STACK_MAX * 0.55 + 0.6, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.y = (STACK_MAX * 0.55 + 0.6) / 2;
      hit.userData.pipeIndex = i;
      g.add(hit);

      this.group.add(g);
      this.pipes.push({ group: g, tube, hit, bricks: [] });
    }
    this.sync(board);
  }

  sync(board) {
    const lift = board.selected;
    for (let i = 0; i < board.stacks.length; i++) {
      const p = this.pipes[i];
      if (!p) continue;
      // rebuild bricks for pipe
      while (p.bricks.length) {
        const m = p.bricks.pop();
        p.group.remove(m);
        m.geometry?.dispose?.();
      }
      const stack = board.stacks[i];
      const run = board.topRun(i);
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
        // lift top run visually
        if (i === lift && k >= stack.length - board.liftCount) y += 0.35;
        m.position.y = y;
        m.userData.pipeIndex = i;
        p.group.add(m);
        p.bricks.push(m);
      }
      p.tube.material.emissiveIntensity = i === lift ? 0.45 : 0.15;
      p.tube.material.emissive.setHex(i === lift ? 0xff2bd6 : 0x00e5ff);
    }
  }

  shake(pipeIndex) {
    const p = this.pipes[pipeIndex];
    if (!p) return;
    const g = p.group;
    const ox = g.position.x;
    let t = 0;
    const iv = setInterval(() => {
      t += 1;
      g.position.x = ox + Math.sin(t * 1.8) * 0.08;
      if (t > 8) { g.position.x = ox; clearInterval(iv); }
    }, 16);
  }

  pickPipe(clientX, clientY) {
    const cam = this.stage.camera;
    const rect = this.stage.renderer.domElement.getBoundingClientRect();
    this.ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.ray.setFromCamera(this.ndc, cam);
    const hits = this.pipes.map((p) => p.hit);
    const found = this.ray.intersectObjects(hits, false);
    if (!found.length) return -1;
    return found[0].object.userData.pipeIndex ?? -1;
  }

  frameCamera(cam, n, dt, attract = false) {
    const target = new THREE.Vector3(0, 1.6, 0);
    const want = new THREE.Vector3(0, 5.2 + n * 0.15, 6.5 + n * 0.2);
    if (attract) {
      const t = performance.now() * 0.0002;
      want.x = Math.sin(t) * 0.8;
    }
    cam.position.lerp(want, Math.min(1, dt * 3));
    cam.lookAt(target);
  }
}
