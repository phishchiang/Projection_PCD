import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
import pointsVertexShader from './shaders/points/vertex.glsl';
import pointsFragmentShader from './shaders/points/fragment.glsl';
import { RepeatWrapping, ClampToEdgeWrapping } from 'three';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';



const fbx_path_01 = '/fbx/Test_0327_cam_fbx.fbx';
const fbx_path_02 = '/fbx/ball_uv.fbx';

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
// const texture_map = new THREE.TextureLoader().load( '/textures/test.JPG' );
const texture_map = new THREE.TextureLoader().load( '/textures/map.png' );
// texture_map.wrapS = texture_map.wrapT = RepeatWrapping
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
camera.position.set(-1.2, 1.6, 6.5);
scene.add(camera);

const projector = new THREE.PerspectiveCamera( 45, 1, 0.1,10)
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
  transparent: true,
  blending: THREE.AdditiveBlending,
  alphaTest: 0.5,
  depthWrite: false,
})

gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'x').min(0).max(50).step(0.01).name('uTest_X');
gui.add(firefliesMaterial.uniforms.uTestVec2.value, 'y').min(0).max(1).step(0.01).name('uTest_Y');

const loader = new FBXLoader();

loader.setPath('/fbx/');
loader.load('ball_uv.fbx', function (object) {

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
  // gui.add(object.position, 'x').min(-10).max(10).step(0.01).name('object_X');
  // gui.add(object.position, 'y').min(-10).max(10).step(0.01).name('object_Y');
  // gui.add(object.position, 'z').min(-10).max(10).step(0.01).name('object_Z');
  // gui.add(object.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('object_Rotate_X');
  // gui.add(object.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('object_Rotate_Y');
  // gui.add(object.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('object_Rotate_Z');
  // gui.add(object.scale, 'x').min(0.1).max(1).step(0.01).name('object_Scale_X');
  // gui.add(object.scale, 'y').min(0.1).max(1).step(0.01).name('object_Scale_Y');
  // gui.add(object.scale, 'z').min(0.1).max(1).step(0.01).name('object_Scale_Z');

});

loader.load('Test_0327_cam_fbx.fbx', function (object) {
  scene.add(object);
  // console.log(object.children);

for (const element of object.children) {
  const cam_geometry = new THREE.BoxGeometry(0.1, 0.5625, 1, 2, 2, 2);
  const cam_mesh = new THREE.Mesh(cam_geometry, firefliesMaterial);
  cam_mesh.position.set(element.position.x, element.position.y, element.position.z);
  cam_mesh.rotation.set(element.rotation.x, element.rotation.y, element.rotation.z);
  scene.add(cam_mesh);
  // console.log(element);
}
});
const pcb_path_01 = '/fbx/test_0327_02.pcd';
const PCDLoader_01 = new PCDLoader();
PCDLoader_01.setPath('/fbx/');

PCDLoader_01.load(
	// resource URL
	// '/fbx/R02_0_0_01.pcd',
	// '/fbx/Test_0327.pcd',
  'test_0327_02.pcd',
	// called when the resource is loaded
	function ( mesh ) {
    // const geometry_PCD = new THREE.SphereGeometry( 0.1, 8 , 8 );
    // mesh.geometry = geometry_PCD;
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
// scene.add(mesh);
const mesh_sphere = new THREE.Mesh(geometry_sphere, firefliesMaterial);
mesh_sphere.position.z = -2.5;
mesh_sphere.scale.z = 1.5;
// scene.add(mesh_sphere);

// gui.add(mesh.position, 'x').min(-10).max(10).step(0.01).name('mesh_X');
// gui.add(mesh.position, 'y').min(-10).max(10).step(0.01).name('mesh_Y');
// gui.add(mesh.position, 'z').min(-10).max(10).step(0.01).name('mesh_Z');



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

tick();
