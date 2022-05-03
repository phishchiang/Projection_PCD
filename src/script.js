import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
import pointsVertexShader from './shaders/points/vertex.glsl';
import pointsFragmentShader from './shaders/points/fragment.glsl';
import { RepeatWrapping, ClampToEdgeWrapping } from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { FXAAShader } from './jsm/shaders/FXAAShader.js';

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

const fbx_path_01 = './fbx/MSH_Matchbox.fbx';
const pcd_path_01 = './fbx/42402_96k_pcd.pcd';

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x262626);
console.log(scene.background);

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.BoxGeometry(10, 5, 10, 32, 64, 64);
const geometry_sphere = new THREE.SphereGeometry( 1, 64 , 32 );

// Load Textures 
const texture_map = new THREE.TextureLoader().load( './textures/map.png' );
texture_map.wrapS = texture_map.wrapT = ClampToEdgeWrapping
const T_match_out_Color = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_Base_color.png' );
const T_match_out_Roughness = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_Roughness.png' );
const T_match_out_Normal = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_Normal_OpenGL.png' );
const T_match_in_Color = new THREE.TextureLoader().load( './textures/T_Matchbox_In_Base_color.png' );
const T_match_in_Roughness = new THREE.TextureLoader().load( './textures/T_Matchbox_In_Roughness.png' );
const T_match_in_Normal = new THREE.TextureLoader().load( './textures/T_Matchbox_In_Normal_OpenGL.png' );





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
camera.position.set(-5, 6, 5);
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

// gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'x').min(0).max(10000).step(0.01).name('uTest_X');
// gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'y').min(0).max(1).step(0.01).name('uTest_Y');

// Lighting

const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.12, 1, 0.85 );
dirLight.position.set( 1, 1.75, -1 );
dirLight.position.multiplyScalar( 30 );
dirLight.castShadow = true;
scene.add( dirLight );


const dirLight_rim = new THREE.DirectionalLight( 0xffffff, 0.15 );
dirLight_rim.color.setHSL( 0.55, 1, 0.85 );
dirLight_rim.position.set( -0.4, 0.45, -1 );
dirLight_rim.position.multiplyScalar( 30 );
scene.add( dirLight_rim );


const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.95 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 50, 0 );
scene.add( hemiLight );

const dirLight_fill = new THREE.DirectionalLight( 0xffffff, 0.05 );
dirLight_fill.color.setHSL( 0.55, 1, 0.85 );
dirLight_fill.position.set( 3, 5.5, 15 );
// dirLight_fill.position.multiplyScalar( 30 );
scene.add( dirLight_fill );


// const rectLightHelper = new THREE.DirectionalLightHelper( dirLight_fill, 5 );
// scene.add( rectLightHelper );


// FBX Materials

const PBR_Material_in = new THREE.MeshStandardMaterial({
  map: T_match_in_Color,
  roughnessMap: T_match_in_Roughness,
  normalMap: T_match_in_Normal,
})
const PBR_Material_out = new THREE.MeshStandardMaterial({
  map: T_match_out_Color,
  roughnessMap: T_match_out_Roughness,
  normalMap: T_match_out_Normal,
})

const loader = new FBXLoader();

loader.load(fbx_path_01, function (object) {
  // scene.add(object);
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

loader.load(fbx_path_01, function (object) {

  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(object);
  // object.translateZ = 10.0;
  // object.children[0].material = firefliesMaterial;
  object.children[0].material = PBR_Material_in;
  object.children[1].material = PBR_Material_out;
  // object.rotation.set(0, Math.PI , 0);
  console.log(object);
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
		// scene.add( mesh );
    console.log(mesh);
    // gui.add(mesh.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_X');
    // gui.add(mesh.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_Y');
    // gui.add(mesh.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.0001).name('Rot_Z');
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
  // antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.12, 0.32, 0.6 );

let composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  // Update controls
  controls.update();

  // Render
  // renderer.render(scene, camera);
  composer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  const elapsedTime = clock.getElapsedTime();
  firefliesMaterial.uniforms.uTime.value = elapsedTime;
};

function onTransitionEnd( event ) {
	event.target.remove();
}

tick();
