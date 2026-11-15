// Low-poly cutaway of an illustrative pressurized rover cabin. Functional illustration
// only: no terrain, flames, airflow, textures or shadows, and no engineering dimensions.
// THREE is passed in so this module never loads the library by itself.

// Neutral white selection on the black stage (no blue); evidence red/orange stays reserved for real labels.
export const SELECTED_COLOR = 0xffffff;
const SELECTED_EMISSIVE = 0x3a3a3a;
// Selection outline: text-1 hairline edges, so selection reads by shape as well as colour.
const OUTLINE = 0xe8eaed;
const DIM_OPACITY = 0.25;

const HULL = 0x8a93a1;
const SHELL = 0x6c7584;
const FLOOR = 0x3a414c;
const TRIM = 0x4b535f;
const WHEEL = 0x2a2f37;

// [materialId, name, size [x,y,z], position [x,y,z], color, opacity, rotationZ]
const PART_MESHES = [
  ['pmma', 'Front window', [0.06, 1.0, 2.5], [3.0, 1.55, 0], 0x9fb4c8, 0.55, 0],
  ['pmma', 'Display panel', [0.08, 0.42, 1.3], [2.35, 1.2, 0], 0x7d8b9c, 1, -0.45],
  ['nomex', 'Seat base left', [0.7, 0.18, 0.62], [1.35, 0.6, 0.7], 0x7a8799, 1, 0],
  ['nomex', 'Seat back left', [0.16, 0.85, 0.62], [0.98, 1.08, 0.7], 0x7a8799, 1, 0.12],
  ['nomex', 'Seat base right', [0.7, 0.18, 0.62], [1.35, 0.6, -0.7], 0x7a8799, 1, 0],
  ['nomex', 'Seat back right', [0.16, 0.85, 0.62], [0.98, 1.08, -0.7], 0x7a8799, 1, 0.12],
  ['p213', 'Tape wrap aft', [0.14, 0.17, 0.17], [-1.2, 1.95, -1.33], 0xb3ab95, 1, 0],
  ['p213', 'Tape wrap mid', [0.14, 0.17, 0.17], [0.2, 1.95, -1.33], 0xb3ab95, 1, 0],
  ['p213', 'Tape wrap fore', [0.14, 0.17, 0.17], [1.6, 1.95, -1.33], 0xb3ab95, 1, 0],
  ['cotton', 'Garment body', [0.6, 0.85, 0.08], [-1.9, 1.3, -1.36], 0xb8b2a6, 1, 0],
  ['cotton', 'Garment sleeve aft', [0.16, 0.6, 0.08], [-2.3, 1.38, -1.35], 0xb8b2a6, 1, 0.25],
  ['cotton', 'Garment sleeve fore', [0.16, 0.6, 0.08], [-1.5, 1.38, -1.35], 0xb8b2a6, 1, -0.25],
];

// [name, size, position, color, layer] — 'shell' panels hide in the cutaway layer.
const STRUCTURE = [
  ['Floor', [6.2, 0.15, 3.0], [0, 0.08, 0], FLOOR, 'hull'],
  ['Chassis', [6.6, 0.4, 2.6], [0, -0.3, 0], TRIM, 'hull'],
  ['Rear bulkhead', [0.12, 2.3, 3.0], [-3.05, 1.2, 0], HULL, 'hull'],
  ['Far wall', [6.2, 2.3, 0.12], [0, 1.2, -1.5], HULL, 'hull'],
  ['Front lower bulkhead', [0.12, 1.05, 3.0], [3.05, 0.55, 0], HULL, 'hull'],
  ['Console', [0.55, 0.85, 2.3], [2.65, 0.55, 0], TRIM, 'hull'],
  ['Seat post left', [0.14, 0.45, 0.14], [1.35, 0.32, 0.7], TRIM, 'hull'],
  ['Seat post right', [0.14, 0.45, 0.14], [1.35, 0.32, -0.7], TRIM, 'hull'],
  ['Cable conduit', [4.2, 0.1, 0.1], [0.2, 1.95, -1.36], TRIM, 'hull'],
  ['Rear stowage lockers', [0.55, 1.7, 2.0], [-2.7, 0.95, 0.3], TRIM, 'hull'],
  ['Roof', [6.2, 0.12, 3.0], [0, 2.38, 0], SHELL, 'shell'],
  ['Near wall', [6.2, 2.3, 0.12], [0, 1.2, 1.5], SHELL, 'shell'],
  ['Window frame', [0.14, 0.12, 3.0], [3.05, 2.1, 0], SHELL, 'shell'],
];

const ANCHORS = {
  pmma: [3.0, 1.9, 0.9],
  cotton: [-1.9, 1.75, -1.3],
  p213: [0.2, 2.15, -1.3],
  nomex: [1.1, 1.55, 0.7],
};

const WHEEL_POSITIONS = [[-2.2, 1.45], [0, 1.45], [2.2, 1.45], [-2.2, -1.45], [0, -1.45], [2.2, -1.45]];

export function buildRoverScene(THREE) {
  const scene = new THREE.Scene();
  const rover = new THREE.Group();
  rover.name = 'Illustrative rover cabin';
  rover.position.y = -1.0;
  scene.add(rover);
  scene.add(new THREE.HemisphereLight(0xdfe7f2, 0x1b1f25, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 7, 5);
  scene.add(key);

  const geometries = new Set();
  const materials = new Set();
  const own = (geometry, material) => { geometries.add(geometry); materials.add(material); };
  const box = ([x, y, z]) => new THREE.BoxGeometry(x, y, z);
  const lambert = (color, opacity = 1) => new THREE.MeshLambertMaterial({
    color, opacity, transparent: opacity < 1, depthWrite: opacity >= 1, flatShading: true,
  });

  const shellMeshes = [];
  const occluders = [];
  const structureMaterials = new Map();
  for (const [name, size, position, color, layer] of STRUCTURE) {
    const key2 = `${color}:${layer}`;
    if (!structureMaterials.has(key2)) structureMaterials.set(key2, lambert(color));
    const mesh = new THREE.Mesh(box(size), structureMaterials.get(key2));
    own(mesh.geometry, mesh.material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.userData.layer = layer;
    rover.add(mesh);
    occluders.push(mesh);
    if (layer === 'shell') shellMeshes.push(mesh);
  }

  const parts = new Map();
  for (const [materialId, name, size, position, color, opacity, rotationZ] of PART_MESHES) {
    const mesh = new THREE.Mesh(box(size), lambert(color, opacity));
    own(mesh.geometry, mesh.material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.rotation.z = rotationZ;
    Object.assign(mesh.userData, { materialId, baseColor: color, baseOpacity: opacity });
    rover.add(mesh);
    if (!parts.has(materialId)) parts.set(materialId, []);
    parts.get(materialId).push(mesh);
  }

  // Six wheels in one instanced draw call.
  const wheelGeometry = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 16);
  const wheelMaterial = lambert(WHEEL);
  own(wheelGeometry, wheelMaterial);
  const wheels = new THREE.InstancedMesh(wheelGeometry, wheelMaterial, WHEEL_POSITIONS.length);
  wheels.name = 'Wheels';
  const matrix = new THREE.Matrix4();
  const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const unit = new THREE.Vector3(1, 1, 1);
  WHEEL_POSITIONS.forEach(([x, z], index) => {
    wheels.setMatrixAt(index, matrix.compose(new THREE.Vector3(x, -0.55, z), turn, unit));
  });
  wheels.computeBoundingSphere();
  rover.add(wheels);
  occluders.push(wheels);

  // One merged edge outline per material, shown only while that material is selected.
  const outlines = new Map();
  const outlineMaterial = new THREE.LineBasicMaterial({ color: OUTLINE });
  materials.add(outlineMaterial);
  for (const [materialId, meshes] of parts) {
    const points = [];
    for (const mesh of meshes) {
      mesh.updateMatrix();
      const edges = new THREE.EdgesGeometry(mesh.geometry).applyMatrix4(mesh.matrix);
      points.push(...edges.getAttribute('position').array);
      edges.dispose();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometries.add(geometry);
    const outline = new THREE.LineSegments(geometry, outlineMaterial);
    outline.name = `Selection outline ${materialId}`;
    outline.visible = false;
    rover.add(outline);
    outlines.set(materialId, outline);
  }

  rover.updateMatrixWorld(true);
  const anchors = new Map(Object.entries(ANCHORS).map(([id, local]) => [id, rover.localToWorld(new THREE.Vector3(...local))]));
  const sphere = new THREE.Box3().setFromObject(rover).getBoundingSphere(new THREE.Sphere());
  const partList = [...parts.values()].flat();
  let disposed = false;

  return {
    scene,
    center: sphere.center.clone(),
    radius: sphere.radius,
    anchors,
    pickables: partList,
    occluders,
    partMeshes: id => [...(parts.get(id) ?? [])],
    setLayer(layer) {
      for (const mesh of shellMeshes) mesh.visible = layer === 'shell';
    },
    setWireframe(on) {
      for (const material of materials) {
        if (material === outlineMaterial) continue;
        if (material.wireframe !== Boolean(on)) { material.wireframe = Boolean(on); material.needsUpdate = true; }
      }
    },
    applyState({ highlightId = null, inRequest = new Set() } = {}) {
      for (const [id, outline] of outlines) outline.visible = id === highlightId;
      for (const mesh of partList) {
        const { materialId, baseColor, baseOpacity } = mesh.userData;
        const selected = materialId === highlightId;
        mesh.material.color.setHex(selected ? SELECTED_COLOR : baseColor);
        mesh.material.emissive.setHex(selected ? SELECTED_EMISSIVE : 0x000000);
        const opacity = inRequest.has(materialId) ? baseOpacity : Math.min(baseOpacity, DIM_OPACITY);
        const transparent = opacity < 1;
        if (mesh.material.transparent !== transparent) mesh.material.needsUpdate = true;
        Object.assign(mesh.material, { opacity, transparent, depthWrite: !transparent });
      }
    },
    drawCalls() {
      let count = 0;
      scene.traverseVisible(object => { if (object.isMesh) count += 1; });
      return count;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      wheels.dispose();
      scene.clear();
    },
  };
}
