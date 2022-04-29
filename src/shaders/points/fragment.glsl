precision highp float;

uniform float uTime;
uniform vec2 uTestVec2;
uniform vec3 projPosition;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec4 vColor;
varying vec4 vWorldSpaceNormal;
varying vec4 vViewSpaceNormal;
varying vec3 vNormal;
varying vec4 vWorldPosition;


void main()
{
  // float distanceToCenter = distance(gl_PointCoord, vec2(0.5)); // cal every point to center
  // float strength = 0.05 / distanceToCenter - 0.1;


  vec4 color;
  float fade = 0.05;

  // color += vec4(vColor);

  color = texture2D(uTexture, gl_PointCoord );
  color *= vec4(vColor)*0.5;
  // color = vec4(vColor);

  // color.r += sin(  10.0 + uTestVec2.x ) * 0.5;
  // gl_FragColor = vec4(vec3(vNormal), 1.0);;
  gl_FragColor = color;
}