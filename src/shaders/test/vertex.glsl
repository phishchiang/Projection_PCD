varying vec2 vUv;
varying vec4 vWorldSpaceNormal;
varying vec4 vViewSpaceNormal;
varying vec3 vNormal;

void main()
{
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vWorldSpaceNormal = modelMatrix * vec4(normal, 0.0);
  vViewSpaceNormal = viewMatrix * modelMatrix * vec4(normal, 0.0);

  vUv = uv;
  vNormal = normal;
}