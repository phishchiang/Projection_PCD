import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as dat from 'dat.gui';
// import PP_Grain_VertexShader from './shaders/PP_Grain/vertex.glsl';
// import PP_Grain_FragmentShader from './shaders/PP_Grain/fragment.glsl';
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';

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
let fxaaPass, composer, smaaPass, currentIndex;
const pointer = new THREE.Vector2();
let bar_audio, match_audio, match_mesh;

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
const match_out_Color = [
  new THREE.TextureLoader().load( './textures/T_Matchbox_Out_01_Base_color.png' ),
  new THREE.TextureLoader().load( './textures/T_Matchbox_Out_02_Base_color.png' ),
  new THREE.TextureLoader().load( './textures/T_Matchbox_Out_03_Base_color.png' ),
  new THREE.TextureLoader().load( './textures/T_Matchbox_Out_04_Base_color.png' )
]
// const T_match_out_Color_01 = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_01_Base_color.png' );
// const T_match_out_Color_02 = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_02_Base_color.png' );
// const T_match_out_Color_03 = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_03_Base_color.png' );
// const T_match_out_Color_04 = new THREE.TextureLoader().load( './textures/T_Matchbox_Out_04_Base_color.png' );
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
currentIndex = 0;
window.addEventListener('click', (event) => {
  event.preventDefault();
  // console.log(`${PBR_Material_out.map}_${currentIndex}`);


  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  // console.log(pointer);
  
  // find intersections
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( scene.children[5].children, false ); 
  if (intersects.length > 0) {
    currentIndex = (currentIndex+1)%4;
    PBR_Material_out.map = match_out_Color[currentIndex];

    if(!bar_audio.isPlaying)bar_audio.play();
  
    // Scale Animation
    new TWEEN.Tween(match_mesh.scale)
      .to({x:0.9, y:0.9, z:0.9}, 150)
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
      .onComplete(()=>{
        new TWEEN.Tween(match_mesh.scale)
          .to(({x:1, y:1, z:1}),500)
          .easing(TWEEN.Easing.Elastic.Out)
          .start()
      });

    // console.log(intersects[0]);
    if(match_audio.isPlaying){
      match_audio.stop();
      match_audio.play();
    } else match_audio.play();
  }
});

window.addEventListener('touchstart', (event) => {
  event.preventDefault();
  // console.log(`${PBR_Material_out.map}_${currentIndex}`);
  
  pointer.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
  
  // find intersections
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( scene.children[5].children, false ); 
  if (intersects.length > 0) {
    currentIndex = (currentIndex+1)%4;
    PBR_Material_out.map = match_out_Color[currentIndex];

    if(!bar_audio.isPlaying)bar_audio.play();
    
    // Scale Animation
    new TWEEN.Tween(match_mesh.scale)
    .to({x:0.9, y:0.9, z:0.9}, 200)
    .easing(TWEEN.Easing.Cubic.In)
    .start()
    .onComplete(()=>{
      new TWEEN.Tween(match_mesh.scale)
        .to(({x:1, y:1, z:1}),500)
        .easing(TWEEN.Easing.Elastic.Out)
        .start()
    });
    
    if(match_audio.isPlaying){
      match_audio.stop();
      match_audio.play();
    } else match_audio.play();
  }
}, { passive: false });



/**
 * Camera
 */
// Base cameraAudio
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(-5, 6, 5);
// camera.position.set(-1.2, 1.6, 6.5);
scene.add(camera);


// Audio

// create an AudioListener and add it to the camera
const listener_bar = new THREE.AudioListener();
camera.add( listener_bar );

// create a global audio source
bar_audio = new THREE.Audio( listener_bar );

// load a sound and set it as the Audio object's buffer
const bar_audio_audioLoader = new THREE.AudioLoader();
bar_audio_audioLoader.load( './audio/One_Morning_In_May_128.mp3', function( buffer ) {
	bar_audio.setBuffer( buffer );
	bar_audio.setLoop( true );
	// bar_audio.setVolume( 0.5 );
	// bar_audio.play();
});

// create an AudioListener and add it to the camera
const listener_matchbox = new THREE.AudioListener();
camera.add( listener_matchbox );
// create a global audio source
match_audio = new THREE.Audio( listener_matchbox );

// load a sound and set it as the Audio object's buffer
const match_audio_audioLoader = new THREE.AudioLoader();
match_audio_audioLoader.load( './audio/matchbox.mp3', function( buffer ) {
	match_audio.setBuffer( buffer );
	// match_audio.setLoop( true );
	match_audio.setVolume( 0.25 );
	// match_audio.play();
});

// Lighting

const dirLight = new THREE.DirectionalLight( 0xffffff, 0.70 );
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


const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.05, 0.5, 0.85 );
hemiLight.groundColor.setHSL( 0.55, 1, 0.75 );
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
  map: match_out_Color[0],
  roughnessMap: T_match_out_Roughness,
  normalMap: T_match_out_Normal,
})

const loader = new FBXLoader();


loader.load(fbx_path_01, function (object) {
  match_mesh = object;
  object.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(object);
  // object.translateZ = 10.0;
  object.children[0].material = PBR_Material_in;
  object.children[1].material = PBR_Material_out;
  // object.rotation.set(0, Math.PI , 0);
  console.log(object);
});




// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.panSpeed = 0;
controls.minDistance = 5;
controls.maxDistance = 12;
// controls.zoomSpeed = 0;

let raycaster = new THREE.Raycaster();

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
smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());

// let counter = 0.0;

// const PP_Grain_Shader = new THREE.ShaderMaterial({
//   uniforms: {
//     uGrain_Multiplier: { value: new THREE.Vector2(0.08, 0) },
//     "tDiffuse": { value: null },
//     "amount": { value: counter }
//   },
//   vertexShader: PP_Grain_VertexShader,
//   fragmentShader: PP_Grain_FragmentShader
// })

// gui.add(PP_Grain_Shader.uniforms, 'uGrain_Multiplier').min(0).max(50).step(0.01).name('uTest_X');
// gui.add(PP_Grain_Shader.uniforms.uGrain_Multiplier.value, 'x').min(0).max(0.2).step(0.001).name('uGrain_Multiplier');



// const PP_Grain_Pass = new ShaderPass( PP_Grain_Shader );

composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );
composer.addPass( smaaPass );
// composer.addPass( PP_Grain_Pass );

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

  // Animation
  TWEEN.update()

  // // PP_Grain
  // counter += 0.01;
  // PP_Grain_Pass.uniforms["amount"].value = counter;

  const elapsedTime = clock.getElapsedTime();
};

function onTransitionEnd( event ) {
	event.target.remove();
}

tick();
