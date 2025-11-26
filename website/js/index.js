/**
 * Cube animation and face bounds for particle interaction
 * Particles appear white when crossing the black face area.
 */

let scene, camera, renderer, cube, blackFace;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;
let isSpinning = false;
let blackFaceBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
let cubeCenter = { x: 0, y: 0 };

function initCube() {
  const canvas = document.getElementById('cube-canvas');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Responsive camera positioning
  const isMobile = window.innerWidth <= 600;
  camera.position.z = isMobile ? 1.5 : 2;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 0);

  // Responsive cube size
  const cubeSize = getCubeSize();
  
  // Wireframe cube
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const edges = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 6,
    transparent: false
  });
  cube = new THREE.LineSegments(edges, edgeMaterial);
  scene.add(cube);

  // Black window (rear plane)
  const planeGeometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide
  });
  blackFace = new THREE.Mesh(planeGeometry, planeMaterial);
  blackFace.position.set(0, 0, -cubeSize/2);
  scene.add(blackFace);

  window.addEventListener('resize', onWindowResize, false);
  animate();
}

function getCubeSize() {
  const width = window.innerWidth;
  
  if (width <= 480) {
    return 0.5; // Very small for mobile portrait
  } else if (width <= 600) {
    return 0.6; // Small for mobile landscape  
  } else if (width <= 900) {
    return 0.7; // Medium for tablet
  } else {
    return 0.8; // Full size for desktop
  }
}

function getScreenBounds() {
  const cubeSize = getCubeSize();
  const halfSize = cubeSize / 2;
  
  const corners = [
    new THREE.Vector3(-halfSize, -halfSize, -halfSize), // Use dynamic cube size
    new THREE.Vector3(halfSize, -halfSize, -halfSize),
    new THREE.Vector3(halfSize, halfSize, -halfSize),
    new THREE.Vector3(-halfSize, halfSize, -halfSize)
  ];

  const screenCorners = corners.map(corner => {
    const worldCorner = corner.clone();
    worldCorner.applyMatrix4(blackFace.matrixWorld);

    const vector = worldCorner.project(camera);
    return {
      x: (vector.x + 1) / 2 * window.innerWidth,
      y: -(vector.y - 1) / 2 * window.innerHeight,
      z: vector.z
    };
  });

  // Check if face is behind camera - instead of returning -1, use fallback bounds
  const avgZ = screenCorners.reduce((sum, c) => sum + c.z, 0) / screenCorners.length;
  if (avgZ > 1) {
    // Face is behind camera, return center area as fallback
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    // Scale fallback size based on screen size
    const size = window.innerWidth <= 600 ? 60 : 100;
    return { 
      minX: centerX - size, 
      maxX: centerX + size, 
      minY: centerY - size, 
      maxY: centerY + size 
    };
  }

  const xs = screenCorners.map(c => c.x);
  const ys = screenCorners.map(c => c.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function getCubeCenter() {
  const center = new THREE.Vector3(0, 0, 0);
  const projected = center.project(camera);
  return {
    x: (projected.x + 1) / 2 * window.innerWidth,
    y: -(projected.y - 1) / 2 * window.innerHeight
  };
}

function animate() {
  requestAnimationFrame(animate);

  if (isSpinning) {
    currentRotationX += (targetRotationX - currentRotationX) * 0.1;
    currentRotationY += (targetRotationY - currentRotationY) * 0.1;

    cube.rotation.x = currentRotationX;
    cube.rotation.y = currentRotationY;
    blackFace.rotation.x = currentRotationX;
    blackFace.rotation.y = currentRotationY;

    if (
      Math.abs(targetRotationX - currentRotationX) < 0.001 &&
      Math.abs(targetRotationY - currentRotationY) < 0.001
    ) {
      isSpinning = false;
    }
  }

  blackFaceBounds = getScreenBounds();
  cubeCenter = getCubeCenter();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Update cube size and camera position on resize
  const cubeSize = getCubeSize();
  const isMobile = window.innerWidth <= 600;
  camera.position.z = isMobile ? 1.5 : 2;
  
  // Update cube geometry
  if (cube && blackFace) {
    // Remove old cube and face
    scene.remove(cube);
    scene.remove(blackFace);
    
    // Create new cube with updated size
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 6,
      transparent: false
    });
    cube = new THREE.LineSegments(edges, edgeMaterial);
    scene.add(cube);

    // Create new black window with updated size
    const planeGeometry = new THREE.PlaneGeometry(cubeSize, cubeSize);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide
    });
    blackFace = new THREE.Mesh(planeGeometry, planeMaterial);
    blackFace.position.set(0, 0, -cubeSize/2);
    scene.add(blackFace);
  }
}

function spinCube() {
  targetRotationX = currentRotationX + Math.PI;
  targetRotationY = currentRotationY + Math.PI;
  isSpinning = true;
}

function getBlackFaceBounds() {
  return blackFaceBounds;
}

function getCubeCenterPosition() {
  return cubeCenter;
}

document.addEventListener('DOMContentLoaded', () => {
  initCube();

  // Menu elements are now loaded dynamically by menu-loader.js
  // So we don't need to set up menu events here anymore
  
  // Only handle cube-specific click events
  document.addEventListener('click', (e) => {
    // Only spin cube if we're not clicking on menu elements
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    
    if (menuToggle && sideMenu && 
        !menuToggle.contains(e.target) && 
        !sideMenu.contains(e.target)) {
      spinCube();
    } else if (!menuToggle && !sideMenu) {
      // Menu not loaded yet, spin anyway
      spinCube();
    }
  });
});
