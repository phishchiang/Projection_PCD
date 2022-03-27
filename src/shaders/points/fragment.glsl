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
varying vec4 vTexCoords;

void main()
{
  // float distanceToCenter = distance(gl_PointCoord, vec2(0.5)); // cal every point to center
  // float strength = 0.05 / distanceToCenter - 0.1;

  vec2 uv = (vTexCoords.xy / vTexCoords.w) * 0.5 + 0.5;

  vec4 color = texture2D(uTexture, uv);
  // this makes sure we don't render the texture also on the back of the object
  vec3 projectorDirection = normalize(projPosition - vWorldPosition.xyz);
  float dotProduct = dot(vNormal, projectorDirection);
  if (dotProduct < 0.0) {
    color = vec4(vColor);
  }

  // color.r += sin(  10.0 + uTestVec2.x ) * 0.5;
  gl_FragColor = vColor;
}