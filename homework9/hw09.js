import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Scene
const scene = new THREE.Scene();

// Camera (Perspective 기본, 이후 Orthographic 전환 가능하도록 let)
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(120, 60, 180);
camera.lookAt(scene.position);
scene.add(camera);

// Texture
const textureLoader = new THREE.TextureLoader();
const mercuryTexture = textureLoader.load('./mercury.jpg');
const venusTexture = textureLoader.load('./venus.jpg');
const earthTexture = textureLoader.load('./earth.jpg');
const marsTexture = textureLoader.load('./mars.jpg');

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

// OrbitControls (camera 변경 시 다시 생성해야 해서 let)
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

// Geometry
const sunGeometry = new THREE.SphereGeometry(10);
const mercuryGeometry = new THREE.SphereGeometry(1.5);
const venusGeometry = new THREE.SphereGeometry(3);
const earthGeometry = new THREE.SphereGeometry(3.5);
const marsGeometry = new THREE.SphereGeometry(2.5);

// Materials
const sunMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 1,
  metalness: 0,
  roughness: 0.5,
});

const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
  color: 0xaaaaaa,
  roughness: 0.8,
  metalness: 0.2,
});

const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
  color: 0xffd700,
  roughness: 0.8,
  metalness: 0.2,
});

const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  color: 0x88ccff,
  roughness: 0.8,
  metalness: 0.2,
});

const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  color: 0xff6666,
  roughness: 0.8,
  metalness: 0.2,
});

// Meshes
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
mercury.position.set(20, 0, 20);
scene.add(mercury);

const venus = new THREE.Mesh(venusGeometry, venusMaterial);
venus.position.set(35, 0, 35);
scene.add(venus);

const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.set(50, 0, 50);
scene.add(earth);

const mars = new THREE.Mesh(marsGeometry, marsMaterial);
mars.position.set(65, 0, 65);
scene.add(mars);

// Lights
// 태양에서 발산되는 빛
const sunLight = new THREE.PointLight(0xffff00, 500, 300);
sunLight.position.set(0, 10, 0);
scene.add(sunLight);

const sunLightHelper = new THREE.PointLightHelper(sunLight);
scene.add(sunLightHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(70, 40, 50);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// AxesHelper
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

// GUI
const gui = new GUI();
const guiCamera = gui.addFolder('Camera');
const guiMercury = gui.addFolder('Mercury');
const guiVenus = gui.addFolder('Venus');
const guiEarth = gui.addFolder('Earth');
const guiMars = gui.addFolder('Mars');

const controls = new (function () {
  this.perspective = 'Perspective';

  this.switchCamera = function () {
    if (camera instanceof THREE.PerspectiveCamera) {
      scene.remove(camera);

      // OrthographicCamera(left, right, top, bottom, near, far)
      camera = new THREE.OrthographicCamera(
        window.innerWidth / -16,
        window.innerWidth / 16,
        window.innerHeight / 16,
        window.innerHeight / -16,
        -200,
        500
      );
      camera.position.set(120, 60, 180);
      camera.lookAt(scene.position);

      orbitControls.dispose();
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;

      this.perspective = 'Orthographic';
    } else {
      scene.remove(camera);

      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(120, 60, 180);
      camera.lookAt(scene.position);

      orbitControls.dispose();
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.enableDamping = true;

      this.perspective = 'Perspective';
    }
  };

  // 각 행성의 자전/공전 속도
  this.mercuryRotationSpeed = 0.02;
  this.mercuryOrbitSpeed = 0.02;

  this.venusRotationSpeed = 0.015;
  this.venusOrbitSpeed = 0.015;

  this.earthRotationSpeed = 0.01;
  this.earthOrbitSpeed = 0.01;

  this.marsRotationSpeed = 0.008;
  this.marsOrbitSpeed = 0.008;
})();

guiCamera.add(controls, 'switchCamera').name('Switch Camera');;
guiCamera.add(controls, 'perspective').listen();

guiMercury.add(controls, 'mercuryRotationSpeed', 0, 0.1, 0.01).name('Rotation Speed');
guiMercury.add(controls, 'mercuryOrbitSpeed', 0, 0.1, 0.01).name('Orbit Speed');;

guiVenus.add(controls, 'venusRotationSpeed', 0, 0.1, 0.01).name('Rotation Speed');
guiVenus.add(controls, 'venusOrbitSpeed', 0, 0.1, 0.01).name('Orbit Speed');;

guiEarth.add(controls, 'earthRotationSpeed', 0, 0.1, 0.01).name('Rotation Speed');
guiEarth.add(controls, 'earthOrbitSpeed', 0, 0.1, 0.01).name('Orbit Speed');;

guiMars.add(controls, 'marsRotationSpeed', 0, 0.1, 0.01).name('Rotation Speed');
guiMars.add(controls, 'marsOrbitSpeed', 0, 0.1, 0.01).name('Orbit Speed');;

// 회전/공전 상태 값
const mercuryRotation = { x: 0, y: 0, z: 0 };
const venusRotation = { x: 0, y: 0, z: 0 };
const earthRotation = { x: 0, y: 0, z: 0 };
const marsRotation = { x: 0, y: 0, z: 0 };

const mercuryOrbit = { x: 0, y: 0, z: 0 };
const venusOrbit = { x: 0, y: 0, z: 0 };
const earthOrbit = { x: 0, y: 0, z: 0 };
const marsOrbit = { x: 0, y: 0, z: 0 };

// Render loop
function render() {
  orbitControls.update();
  stats.update();

  // 수성
  mercuryRotation.y += controls.mercuryRotationSpeed;
  mercuryOrbit.y += controls.mercuryOrbitSpeed;
  mercury.rotation.y = mercuryRotation.y;
  mercury.position.x = 20 * Math.cos(mercuryOrbit.y);
  mercury.position.z = 20 * Math.sin(mercuryOrbit.y);

  // 금성
  venusRotation.y += controls.venusRotationSpeed;
  venusOrbit.y += controls.venusOrbitSpeed;
  venus.rotation.y = venusRotation.y;
  venus.position.x = 35 * Math.cos(venusOrbit.y);
  venus.position.z = 35 * Math.sin(venusOrbit.y);

  // 지구
  earthRotation.y += controls.earthRotationSpeed;
  earthOrbit.y += controls.earthOrbitSpeed;
  earth.rotation.y = earthRotation.y;
  earth.position.x = 50 * Math.cos(earthOrbit.y);
  earth.position.z = 50 * Math.sin(earthOrbit.y);

  // 화성
  marsRotation.y += controls.marsRotationSpeed;
  marsOrbit.y += controls.marsOrbitSpeed;
  mars.rotation.y = marsRotation.y;
  mars.position.x = 65 * Math.cos(marsOrbit.y);
  mars.position.z = 65 * Math.sin(marsOrbit.y);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

render();
