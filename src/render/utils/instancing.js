import * as THREE from 'three';

export function createInstancedMesh(geometry, material, count, name = '') {
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.name = name;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return mesh;
}

export function setInstanceTransform(mesh, index, position, scale = 1, rotationY = 0) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0));
  const s = typeof scale === 'number'
    ? new THREE.Vector3(scale, scale, scale)
    : new THREE.Vector3(scale.x, scale.y, scale.z);
  matrix.compose(new THREE.Vector3(position.x, position.y, position.z), quaternion, s);
  mesh.setMatrixAt(index, matrix);
}
