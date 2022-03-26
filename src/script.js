import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';
import pointsVertexShader from './shaders/points/vertex.glsl';
import pointsFragmentShader from './shaders/points/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.BoxGeometry(10, 5, 10, 32, 64, 64);
const geometry_sphere = new THREE.SphereGeometry( 1, 64 , 32 );

// Load Textures 
const texture_map = new THREE.TextureLoader().load( '/textures/test.JPG' );
// console.log(texture_map);


// Material
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms:
  {
    uTest: { value: 0 },
    uUvShift: { value: new THREE.Vector2(0, 0) },
    uUvScale: { value: new THREE.Vector2(1, 1) },
    uUvRot: { value: 1 },
    uTransition: { value: new THREE.Vector3(0.5, 0.25, 1) },
    uTestVec2: { value: new THREE.Vector2(1, 0) },
    uTexture: {type: 't', value: texture_map},
  },
  side: THREE.DoubleSide,
});




/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  camera.updateWorldMatrix();
  

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 0, 2.5);
scene.add(camera);

const projector = new THREE.PerspectiveCamera( 75, 1, 0.1,10000)
projector.position.set(0, 10, 5)
projector.lookAt(0, 0, 0)
scene.add(projector);

const viewMatrixCamera = projector.matrixWorldInverse.clone()
const projectionMatrixCamera = projector.projectionMatrix.clone();
const modelMatrixCamera = projector.matrixWorld.clone()
const projPosition = projector.position.clone()

console.log(projector);
projector.updateProjectionMatrix();
projector.updateMatrixWorld();
projector.updateWorldMatrix();

const helper = new THREE.CameraHelper(projector);
scene.add(helper);
gui.add(projector.position, 'x').min(-100).max(100).step(0.01).name('Projector_X');



const loader = new FBXLoader();

loader.load('/fbx/ball_uv.fbx', function (object) {

  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(object);
  object.scale.set(1, 1, 1);
  // object.translateZ = 10.0;
  object.children[0].material = material;
  object.position.z = 5;
  // console.log(object);
  // console.log(object.children[0].geometry.attributes);
});

const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms:
  {
      uSize: { value: 100 },
      uTime: { value: 0 },
      uTestVec2: { value: new THREE.Vector2(1, 0) },
      uTexture: { value: texture_map },
      viewMatrixCamera: { value: viewMatrixCamera },
      projectionMatrixCamera: { value: projectionMatrixCamera },
      modelMatrixCamera: { value: modelMatrixCamera },
      projPosition: { value: projPosition },
  },
  // blending: THREE.AdditiveBlending,
  vertexShader: pointsVertexShader,
  fragmentShader: pointsFragmentShader, 
})

gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'x').min(-100).max(100).step(0.01).name('uTest_X');
gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'y').min(0).max(1).step(0.01).name('uTest_Y');

const mesh = new THREE.Mesh(geometry, firefliesMaterial);
mesh.position.z = -10;
scene.add(mesh);
const mesh_sphere = new THREE.Mesh(geometry_sphere, firefliesMaterial);
mesh_sphere.position.z = -2.5;
scene.add(mesh_sphere);

gui.add(mesh.position, 'x').min(-10).max(10).step(0.01).name('mesh_X');
gui.add(mesh.position, 'y').min(-10).max(10).step(0.01).name('mesh_Y');
gui.add(mesh.position, 'z').min(-10).max(10).step(0.01).name('mesh_Z');
gui.add(mesh_sphere.position, 'x').min(-10).max(10).step(0.01).name('mesh_sphere_X');
gui.add(mesh_sphere.position, 'y').min(-10).max(10).step(0.01).name('mesh_sphere_Y');
gui.add(mesh_sphere.position, 'z').min(-10).max(10).step(0.01).name('mesh_sphere_Z');



// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  const elapsedTime = clock.getElapsedTime();
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
};

tick();
