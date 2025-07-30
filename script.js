/* =================================
   VARIABLES GLOBALES
   ================================= */

let scene,
  camera,
  renderer,
  cabinet,
  doors,
  isExploded = false;
let isMouseDown = false,
  isTouchDown = false;
let lastX = 0,
  lastY = 0;

/* =================================
   INICIALIZACIÓN
   ================================= */

function init() {
  setupScene();
  setupCamera();
  setupRenderer();
  setupControls();
  setupLighting();
  createCabinet();
  animate();
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x606060);
}

function setupCamera() {
  const viewer = document.getElementById("viewer");
  const aspect = viewer.clientWidth / viewer.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(4, 3, 4);
  camera.lookAt(0, 0, 0);
}

function setupRenderer() {
  const viewer = document.getElementById("viewer");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewer.appendChild(renderer.domElement);
}

function setupLighting() {
  // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  // Luz direccional principal
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Luz direccional secundaria
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-5, 3, -5);
  scene.add(directionalLight2);
}

/* =================================
   CONTROLES DE INTERACCIÓN
   ================================= */

function setupControls() {
  const viewer = document.getElementById("viewer");

  // Eventos de mouse
  viewer.addEventListener("mousedown", onPointerDown, false);
  viewer.addEventListener("mousemove", onPointerMove, false);
  viewer.addEventListener("mouseup", onPointerUp, false);
  viewer.addEventListener("mouseleave", onPointerUp, false);
  viewer.addEventListener("wheel", onMouseWheel, false);

  // Eventos táctiles para móviles
  viewer.addEventListener("touchstart", onTouchStart, { passive: false });
  viewer.addEventListener("touchmove", onTouchMove, { passive: false });
  viewer.addEventListener("touchend", onTouchEnd, { passive: false });

  // Prevenir menú contextual
  viewer.addEventListener("contextmenu", (e) => e.preventDefault());
}

/* =================================
   EVENTOS DE MOUSE
   ================================= */

function onPointerDown(event) {
  isMouseDown = true;
  lastX = event.clientX;
  lastY = event.clientY;
  document.getElementById("viewer").style.cursor = "grabbing";
}

function onPointerMove(event) {
  if (!isMouseDown) return;
  rotateScene(event.clientX, event.clientY);
}

function onPointerUp(event) {
  isMouseDown = false;
  document.getElementById("viewer").style.cursor = "grab";
}

function onMouseWheel(event) {
  event.preventDefault();
  const scale = event.deltaY > 0 ? 1.1 : 0.9;
  zoomCamera(scale);
}

/* =================================
   EVENTOS TÁCTILES
   ================================= */

function onTouchStart(event) {
  event.preventDefault();
  if (event.touches.length === 1) {
    isTouchDown = true;
    const touch = event.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
  }
}

function onTouchMove(event) {
  event.preventDefault();
  if (isTouchDown && event.touches.length === 1) {
    const touch = event.touches[0];
    rotateScene(touch.clientX, touch.clientY);
  }
}

function onTouchEnd(event) {
  event.preventDefault();
  isTouchDown = false;
}

/* =================================
   FUNCIONES DE ROTACIÓN Y ZOOM
   ================================= */

function rotateScene(currentX, currentY) {
  const deltaX = currentX - lastX;
  const deltaY = currentY - lastY;

  cabinet.rotation.y += deltaX * 0.01;
  cabinet.rotation.x += deltaY * 0.01;

  // Limitar rotación vertical
  cabinet.rotation.x = Math.max(
    -Math.PI / 3,
    Math.min(Math.PI / 3, cabinet.rotation.x)
  );

  lastX = currentX;
  lastY = currentY;
}

function zoomCamera(scale) {
  camera.position.multiplyScalar(scale);

  // Limitar zoom
  const distance = camera.position.length();
  if (distance < 2) camera.position.normalize().multiplyScalar(2);
  if (distance > 15) camera.position.normalize().multiplyScalar(15);
}

function zoomIn() {
  zoomCamera(0.9);
}

function zoomOut() {
  zoomCamera(1.1);
}

/* =================================
   CREACIÓN DEL MUEBLE 3D
   ================================= */

function createCabinet() {
  cabinet = new THREE.Group();

  // Materiales
  const mdfMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
  const forMicaMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0xdddddd });

  // Crear componentes del mueble
  createBase(mdfMaterial);
  createRightSide(mdfMaterial);
  createFrontFrame(mdfMaterial);
  createTracks(edgeMaterial);
  createDoors(forMicaMaterial);
  addConnectionPoints();

  scene.add(cabinet);
}

function createBase(material) {
  // Base (120cm x 45cm x 1.8cm) - escalado para visualización
  const baseGeometry = new THREE.BoxGeometry(6, 0.09, 2.25);
  const base = new THREE.Mesh(baseGeometry, material);
  base.position.set(0, -1.375, 0);
  base.name = "base";
  cabinet.add(base);
}

function createRightSide(material) {
  // Lateral derecho (45cm x 55cm x 1.8cm)
  const sideGeometry = new THREE.BoxGeometry(0.09, 2.75, 2.25);
  const rightSide = new THREE.Mesh(sideGeometry, material);
  rightSide.position.set(3, 0, 0);
  rightSide.name = "rightSide";
  cabinet.add(rightSide);
}

function createFrontFrame(material) {
  // Marco frontal (formando U para ancho de 120cm)
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.09, 0.09),
    material
  );
  frameTop.position.set(0, 1.375, 1.1);
  frameTop.name = "frameTop";
  cabinet.add(frameTop);

  const frameBottom = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.09, 0.09),
    material
  );
  frameBottom.position.set(0, -1.375, 1.1);
  frameBottom.name = "frameBottom";
  cabinet.add(frameBottom);

  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 2.75, 0.09),
    material
  );
  frameLeft.position.set(-3, 0, 1.1);
  frameLeft.name = "frameLeft";
  cabinet.add(frameLeft);
}

function createTracks(material) {
  // Rieles internos para puertas corredizas
  const trackTop = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.05, 0.05),
    material
  );
  trackTop.position.set(0, 1.3, 1.05);
  cabinet.add(trackTop);

  const trackBottom = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.05, 0.05),
    material
  );
  trackBottom.position.set(0, -1.3, 1.05);
  cabinet.add(trackBottom);
}

function createDoors(material) {
  // Puertas corredizas internas (62cm x 50cm cada una)
  doors = new THREE.Group();

  const doorGeometry = new THREE.BoxGeometry(3.1, 2.5, 0.05);

  // Puerta izquierda
  const leftDoor = new THREE.Mesh(doorGeometry, material);
  leftDoor.position.set(-1.45, 0, 1.125);
  leftDoor.name = "leftDoor";

  // Puerta derecha (ligeramente adelante para simular superposición)
  const rightDoor = new THREE.Mesh(doorGeometry, material);
  rightDoor.position.set(1.45, 0, 1.15);
  rightDoor.name = "rightDoor";

  // Agregar rejillas de ventilación
  addVentilationGrilles(leftDoor);
  addVentilationGrilles(rightDoor);

  doors.add(leftDoor);
  doors.add(rightDoor);
  cabinet.add(doors);
}

function addVentilationGrilles(door) {
  const grilleGeometry = new THREE.PlaneGeometry(2, 0.4);
  const grilleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });

  const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
  grille.position.set(0, -0.8, 0.026);
  door.add(grille);
}

function addConnectionPoints() {
  const connectorGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1);
  const connectorMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });

  // Conectores de la base
  const baseConnector1 = new THREE.Mesh(connectorGeometry, connectorMaterial);
  baseConnector1.position.set(2.9, -1.325, 0);
  baseConnector1.rotation.z = Math.PI / 2;
  cabinet.add(baseConnector1);

  const baseConnector2 = new THREE.Mesh(connectorGeometry, connectorMaterial);
  baseConnector2.position.set(-2.9, -1.325, 0);
  baseConnector2.rotation.z = Math.PI / 2;
  cabinet.add(baseConnector2);

  // Conectores del marco frontal
  const frameConnector1 = new THREE.Mesh(connectorGeometry, connectorMaterial);
  frameConnector1.position.set(2.9, 0, 1.05);
  frameConnector1.rotation.x = Math.PI / 2;
  cabinet.add(frameConnector1);

  const frameConnector2 = new THREE.Mesh(connectorGeometry, connectorMaterial);
  frameConnector2.position.set(-2.9, 0, 1.05);
  frameConnector2.rotation.x = Math.PI / 2;
  cabinet.add(frameConnector2);
}

/* =================================
   FUNCIONES DE CONTROL DE VISTAS
   ================================= */

function showExploded() {
  isExploded = true;

  // Separar piezas para vista explosionada
  const base = cabinet.getObjectByName("base");
  const rightSide = cabinet.getObjectByName("rightSide");
  const frameTop = cabinet.getObjectByName("frameTop");
  const frameBottom = cabinet.getObjectByName("frameBottom");
  const frameLeft = cabinet.getObjectByName("frameLeft");

  if (base) base.position.set(0, -2.5, -1);
  if (rightSide) rightSide.position.set(4.5, 0, -1);
  if (frameTop) frameTop.position.set(0, 2.5, 2);
  if (frameBottom) frameBottom.position.set(0, -2.5, 2);
  if (frameLeft) frameLeft.position.set(-4.5, 0, 2);

  doors.position.set(0, 0, 3);
}

function showAssembled() {
  isExploded = false;

  // Volver a posiciones originales
  const base = cabinet.getObjectByName("base");
  const rightSide = cabinet.getObjectByName("rightSide");
  const frameTop = cabinet.getObjectByName("frameTop");
  const frameBottom = cabinet.getObjectByName("frameBottom");
  const frameLeft = cabinet.getObjectByName("frameLeft");

  if (base) base.position.set(0, -1.375, 0);
  if (rightSide) rightSide.position.set(3, 0, 0);
  if (frameTop) frameTop.position.set(0, 1.375, 1.1);
  if (frameBottom) frameBottom.position.set(0, -1.375, 1.1);
  if (frameLeft) frameLeft.position.set(-3, 0, 1.1);

  doors.position.set(0, 0, 0);
}

function showDoors() {
  const leftDoor = doors.getObjectByName("leftDoor");
  const rightDoor = doors.getObjectByName("rightDoor");

  if (leftDoor && rightDoor) {
    // Simular deslizamiento interno: puerta derecha se desliza sobre la izquierda
    rightDoor.position.x = -0.1;

    setTimeout(() => {
      rightDoor.position.x = 1.45;
    }, 3000);
  }
}

function resetView() {
  cabinet.rotation.x = 0;
  cabinet.rotation.y = 0;
  cabinet.rotation.z = 0;
  camera.position.set(4, 3, 4);
  camera.lookAt(0, 0, 0);
}

/* =================================
   LOOP DE ANIMACIÓN
   ================================= */

function animate() {
  requestAnimationFrame(animate);

  // Sin rotación automática - solo control manual
  renderer.render(scene, camera);
}

/* =================================
   EVENTOS DE VENTANA
   ================================= */

function handleResize() {
  const viewer = document.getElementById("viewer");
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/* =================================
   INICIALIZACIÓN AL CARGAR
   ================================= */

window.addEventListener("load", init);
window.addEventListener("resize", handleResize);
