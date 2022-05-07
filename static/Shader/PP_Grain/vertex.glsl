varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;

void main() {

  // vec3 diffuse = texture( tDiffuse, vUv ).rgb;
  // vec3 normal = texture( tNormal, vUv ).rgb;

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}