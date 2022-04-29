import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
import pointsVertexShader from './shaders/points/vertex.glsl';
import pointsFragmentShader from './shaders/points/fragment.glsl';
import { RepeatWrapping, ClampToEdgeWrapping } from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';

const loadingScreen = document.getElementById( 'loading-screen' );
THREE.DefaultLoadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onLoad = function ( ) {
  loadingScreen.classList.add( 'fade-out' );
	console.log( 'Loading Complete!');
  // optional: remove loader from DOM via event listener
  loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
};


THREE.DefaultLoadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

THREE.DefaultLoadingManager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

const fbx_path_01 = './fbx/Test_0327_cam_fbx.fbx';
const pcd_path_01 = './fbx/42402_96k_pcd.pcd';

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
const texture_map = new THREE.TextureLoader().load( './textures/map.png' );
texture_map.wrapS = texture_map.wrapT = ClampToEdgeWrapping





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
camera.position.set(-300, 35, -150);
// camera.position.set(-1.2, 1.6, 6.5);
scene.add(camera);



const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms:
  {
    uSize: { value: 100 },
    uTime: { value: 0 },
    uTestVec2: { value: new THREE.Vector2(1, 0) },
    uTexture: { value: texture_map },
  },
  // blending: THREE.AdditiveBlending,
  vertexShader: pointsVertexShader,
  fragmentShader: pointsFragmentShader, 
  transparent: true,
  blending: THREE.AdditiveBlending,
  alphaTest: 0.5,
  depthWrite: false,
})

gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'x').min(0).max(10000).step(0.01).name('uTest_X');
// gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'y').min(0).max(1).step(0.01).name('uTest_Y');

const loader = new FBXLoader();

loader.load(fbx_path_01, function (object) {
  scene.add(object);
  // console.log(object.children);
for (const element of object.children) {
  const cam_geometry = new THREE.BoxGeometry(0.1, 0.5625, 1, 2, 2, 2);
  const cam_mesh = new THREE.Mesh(cam_geometry, firefliesMaterial);
  cam_mesh.position.set(element.position.x, element.position.y, element.position.z);
  cam_mesh.rotation.set(element.rotation.x, element.rotation.y, element.rotation.z);
  // scene.add(cam_mesh);
  // console.log(element);
}
});

const PCDLoader_01 = new PCDLoader();

PCDLoader_01.load(
  pcd_path_01,
	// called when the resource is loaded
	function ( mesh ) {
    // const geometry_PCD = new THREE.SphereGeometry( 0.1, 8 , 8 );
    // mesh.geometry = geometry_PCD;
    let rot = {x:0,x:0,z:0};
    mesh.geometry.center();
    mesh.rotation.x = -1.3107;
    mesh.rotation.y = 0.0667;
    mesh.rotation.z = 0;
    mesh.material = firefliesMaterial;
    // firefliesMaterial.uniforms.uBBB = mesh.geometry.attributes.color;
		scene.add( mesh );
    console.log(mesh);
    gui.add(mesh.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_X');
    gui.add(mesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_Y');
    gui.add(mesh.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_Z');
    // gui.add(mesh.material, 'size').min(0).max(0.005).step(0.0001).name('SIZE');
	},
	// called when loading has errors
	function ( error ) {
		console.log( 'An error happened' );
	}
);

const mesh = new THREE.Mesh(geometry, firefliesMaterial);
mesh.position.z = -1;
// scene.add(mesh);
const mesh_sphere = new THREE.Mesh(geometry_sphere, firefliesMaterial);
mesh_sphere.position.z = -2.5;
mesh_sphere.scale.z = 1.5;
// scene.add(mesh_sphere);



// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.panSpeed = 0;
// controls.zoomSpeed = 0;


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

function onTransitionEnd( event ) {
	event.target.remove();
}

tick();
