precision highp float;

uniform mat4 viewMatrixCamera;
uniform mat4 projectionMatrixCamera;
uniform mat4 modelMatrixCamera;
uniform vec3 projPosition;
uniform vec2 uTestVec2;
uniform float uPixelRatio;
uniform float uSize;

attribute vec4 color;

varying vec2 vUv;
varying vec4 vColor;
varying vec4 vWorldSpaceNormal;
varying vec4 vViewSpaceNormal;
varying vec3 vNormal;
varying vec4 vWorldPosition;
varying vec4 vTexCoords;
varying vec4 vTexCoords_02;

void main()
{
  vUv = uv;
  vColor = color;

  vWorldSpaceNormal = modelMatrix * vec4(normal, 0.0);
  vViewSpaceNormal = viewMatrix * modelMatrix * vec4(normal, 0.0);
  // vViewSpaceNormal = normalize(viewMatrix * modelMatrix * vec4(normal, 0.0));

  // vNormal = mat3(modelMatrix) * normal;
  // vNormal = normalMatrix * normal;
  vNormal = normal;
  vWorldPosition = modelMatrix * vec4(position, 1.0);
  vTexCoords = projectionMatrixCamera * viewMatrixCamera * vWorldPosition;


  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  // gl_Position = projectionPosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = uSize * max( uTestVec2.x / gl_Position.w, 1.0) * 0.02; //every point size
  vTexCoords_02 = gl_Position;
}