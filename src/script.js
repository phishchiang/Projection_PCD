import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
import pointsVertexShader from './shaders/points/vertex.glsl';
import pointsFragmentShader from './shaders/points/fragment.glsl';
import { RepeatWrapping } from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';

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
texture_map.wrapS = texture_map.wrapT = RepeatWrapping





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

const projector = new THREE.PerspectiveCamera( 10, 1, 0.1,10)
projector.position.set(0, 10, 5)
projector.lookAt(0, 0, 0)
scene.add(projector);

const viewMatrixCamera = projector.matrixWorldInverse
const projectionMatrixCamera = projector.projectionMatrix;
const modelMatrixCamera = projector.matrixWorld
const projPosition = projector.position

console.log(projector);
projector.updateProjectionMatrix();
projector.updateMatrixWorld();
projector.updateWorldMatrix();

const helper = new THREE.CameraHelper(projector);
scene.add(helper);
gui.add(projector.position, 'x').min(-100).max(100).step(0.01).name('Projector_X');
gui.add(projector.position, 'y').min(-100).max(100).step(0.01).name('Projector_Y');
gui.add(projector.position, 'z').min(-100).max(100).step(0.01).name('Projector_Z');





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

gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'x').min(0).max(1000).step(0.01).name('uTest_X');
gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'y').min(0).max(1).step(0.01).name('uTest_Y');

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
  object.children[0].material = firefliesMaterial;
  object.position.z = 5;
  // console.log(object);
  // console.log(object.children[0].geometry.attributes);
});

const PCDLoader_01 = new PCDLoader();
PCDLoader_01.load(
	// resource URL
	// '/fbx/R02_0_0_01.pcd',
	'/fbx/Test_0327.pcd',
	// called when the resource is loaded
	function ( mesh ) {
    mesh.geometry.center();
    mesh.material = firefliesMaterial;
    // firefliesMaterial.uniforms.uBBB = mesh.geometry.attributes.color;
		scene.add( mesh );
    console.log(mesh);
    // gui.add(mesh.material, 'size').min(0).max(0.005).step(0.0001).name('SIZE');
    
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);

const mesh = new THREE.Mesh(geometry, firefliesMaterial);
mesh.position.z = -1;
scene.add(mesh);
const mesh_sphere = new THREE.Mesh(geometry_sphere, firefliesMaterial);
mesh_sphere.position.z = -2.5;
// scene.add(mesh_sphere);

// gui.add(mesh.position, 'x').min(-10).max(10).step(0.01).name('mesh_X');
// gui.add(mesh.position, 'y').min(-10).max(10).step(0.01).name('mesh_Y');
// gui.add(mesh.position, 'z').min(-10).max(10).step(0.01).name('mesh_Z');
// gui.add(mesh_sphere.position, 'x').min(-10).max(10).step(0.01).name('mesh_sphere_X');
// gui.add(mesh_sphere.position, 'y').min(-10).max(10).step(0.01).name('mesh_sphere_Y');
// gui.add(mesh_sphere.position, 'z').min(-10).max(10).step(0.01).name('mesh_sphere_Z');



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
