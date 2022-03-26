#define PI 3.1415926535897932384626433832795

uniform sampler2D uTexture;
varying vec4 vWorldSpaceNormal;
varying vec4 vViewSpaceNormal;
varying vec3 vNormal;

varying vec2 vUv;
uniform float uTest;
uniform vec2 uUvShift;
uniform vec2 uUvScale;
uniform float uUvRot;
uniform vec3 uTransition;
uniform vec2 uTestVec2;


float random(vec2 st)
{ 
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
  return vec2(
    cos(radians(rotation)) * (uv.x - mid.x) + sin(radians(rotation)) * (uv.y - mid.y) + mid.x,
    cos(radians(rotation)) * (uv.y - mid.y) - sin(radians(rotation)) * (uv.x - mid.x) + mid.y
  );
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//

vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float rectFunc(vec2 uv, float width, float blurVal ){
  float result = smoothstep(width, width-blurVal, uv.x ) * smoothstep(-width, -width+blurVal, uv.x) * smoothstep(-width, -width+blurVal, uv.y) * smoothstep(width, width-blurVal, uv.y);
  // result = smoothstep(-width, -width+blurVal, uv.y) ;
  // result = smoothstep(width, width-blurVal, uv.y) ;
  return result;
} 

float remap_normalized(float a, float b, float t){
  return clamp((t-a) / (b-a), 0.0, 1.0);
}
float remap(float a1, float b1, float a2, float b2, float t){
  // reverse way of remap_normalized
  return remap_normalized(a1, b1, t) * (b2 - a2) + a2;
}

void main()
{
  // default UV look
  // gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0); 

  // horizontal gradient
  // float strength = vUv.x;  
  
  // vertical gradient
  float strength = vUv.y;  

  // inverted vertical gradient
  // float strength = 1.0-vUv.y;  

  // vertical gradient 10X
  // float strength = vUv.y * 10.0;  

  // module gradient
  // float strength = mod(vUv.y * 10.0, 1.0);
  
  // module with step
  // float strength = step(mod(vUv.y * 10.0, 1.0), 0.5);   

  // module with step +=
  // float strength = step(mod(vUv.y * 10.0, 1.0), 0.5);  
  // strength += step(mod(vUv.x * 10.0, 1.0), 0.5);
  
  // *= see things only when they're multiply
  // float strength = step(0.8, mod(vUv.y * 10.0, 1.0));  
  // strength *= step(0.8, mod(vUv.x * 10.0, 1.0));
  
  // // // Pattern arrow
  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));  
  // barX *= step(0.8, mod(vUv.y * 10.0, 1.0));

  // float barY = step(0.4, mod(vUv.y * 10.0, 1.0));  
  // barY *= step(0.8, mod(vUv.x * 10.0, 1.0));

  // float strength = barX + barY;
  
  // // Pattern cross
  // float barX = step(0.4, mod(vUv.x * 10.0, 1.0));  
  // barX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));

  // float barY = step(0.4, mod(vUv.y * 10.0, 1.0));  
  // barY *= step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));

  // float strength = barX + barY;

  // // Pattern abs
  // float strength = abs(vUv.x - 0.5);
  
  // // float gradient01 = clamp(1.0 - vUv.x -0.5, 0.0, 1.0);
  // // float gradient02 = clamp(vUv.x - 0.5, 0.0, 1.0);
  // // float strength = gradient01 + gradient02;

  // Pattern abs + min/ max
  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // float strength = min(uTestVec2.y, abs(vUv.y - 0.5));
  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

  // // Pattern abs + min/ max + step
  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  // // Pattern abs + min/ max + step
  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5))) - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  // // Pattern floor/ round /ceil, low band gradient
  // float strength = round(vUv.x*10.0)/10.0;

  // // Pattern floor/ round /ceil, low band gradient
  // float strength01 = floor(vUv.x*10.0)/10.0;
  // float strength02 = floor(vUv.y*10.0)/10.0;

  // float strength = strength01 * strength02;  

  // // random
  // float strength = random(vUv);

  // // random big pixel
  // float uv_01 = floor(vUv.x*10.0)/10.0;
  // float uv_02 = floor(vUv.y*10.0)/10.0;
  // vec2 gridUv = vec2(uv_01, uv_02);
  // // float strengthLowBand = strength01 * strength02; 

  // float strength = random(gridUv);

  // // distance or length from the vector
  // float strength = distance(vUv, vec2(0.5, 0.6));

  // // distance or length from the vector REVERSED
  // float strength = 1.0 - distance(vUv, vec2(0.5));

  // // distance or length from the vector REVERSED GLOWING
  // float strength = 0.01/distance(vUv, vec2(0.5));

  // // GLOWING stretch
  // float stretch_value = 0.4;
  // vec2 lightUV = vec2(
  //   (vUv.x *stretch_value) + 0.5 - stretch_value * 0.5,
  //   vUv.y
  // );
  // float strength = 0.015/distance(lightUV, vec2(0.5));

  // // GLOWING stretch
  // float stretch_value = 0.2;
  // vec2 lightUV_01 = vec2(
  //   (vUv.x *stretch_value) + 0.5 - stretch_value * 0.5,
  //   vUv.y
  // );
  // float strength_01 = 0.015/distance(lightUV_01, vec2(0.5));

  // vec2 lightUV_02 = vec2(
  //   vUv.x,
  //   vUv.y *stretch_value + 0.5 - stretch_value * 0.5
  // );
  // float strength_02 = 0.015/distance(lightUV_02, vec2(0.5));
  // float strength = strength_01 * strength_02;

  // // GLOWING stretch Rotate
  // vec2 rotatedUV = rotate(vUv, PI/4.0, vec2(0.5));

  // float stretch_value = 0.2;
  // vec2 lightUV_01 = vec2(
  //   (rotatedUV.x *stretch_value) + 0.5 - stretch_value * 0.5,
  //   rotatedUV.y
  // );
  // float strength_01 = 0.015/distance(lightUV_01, vec2(0.5));

  // vec2 lightUV_02 = vec2(
  //   rotatedUV.x,
  //   rotatedUV.y *stretch_value + 0.5 - stretch_value * 0.5
  // );
  // float strength_02 = 0.015/distance(lightUV_02, vec2(0.5));
  // float strength = strength_01 * strength_02;

  // // Step + distance
  // float strength = step(0.2, distance(vUv, vec2(0.5)));

  // Step + distance + step
  // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));

  // // Wave + circle + Y direction
  // vec2 waved_uv = vec2(
  //   vUv.x,
  //   vUv.y + sin(vUv.x*30.0)*0.1
  // );

  // float strength = 1.0 - step(0.01, abs(distance(waved_uv, vec2(0.5)) - 0.25));

  // // Wave + circle + Y direction
  // vec2 waved_uv = vec2(
  //   vUv.x + sin(vUv.y*30.0)*0.1,
  //   vUv.y + sin(vUv.x*30.0)*0.1
  // );

  // float strength = 1.0 - step(0.01, abs(distance(waved_uv, vec2(0.5)) - 0.25));

  // // Angle 01
  // float angle = atan(vUv.x, vUv.y);
  // float strength = angle;

  // // Angle 02
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // float strength = angle;



  // Angle 03
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // angle = angle / PI * 2.0;
  // angle = angle + 0.5;

  // angle = angle / PI ;
  // angle = (angle / PI * 0.5 ) + 0.5;
  // angle = remap(-0.5,0.5,0.0,1.0,angle);


  // // Angle 04
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // angle = angle / PI * 2.0;
  // angle = angle + 0.5;
  // angle = angle * 10.0;
  // angle = mod(angle,1.0);
  // float strength = angle;

  // Angle 05
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // angle = angle / PI * 2.0;
  // angle = angle + 0.5;

  // float test = smoothstep(0.0, 1.0, vUv.y);



  // vec2 newCentralUv = vUv-0.5;
  // // newCentralUv.x = newCentralUv.x * 1.778/1.0; // the geometry ratio
  // float distance = length(newCentralUv);
  // // newCentralUv.x = newCentralUv.y - (newCentralUv.x * newCentralUv.x* 5.0);


  // float transition = smoothstep(uTransition.x + uTransition.y, uTransition.x - uTransition.y, vUv.y);
  
  // // float test_02 = smoothstep(0.3, 0.29, newCentralUv.x ) * smoothstep(-0.3, -0.29, newCentralUv.x) * smoothstep(0.3, 0.29, newCentralUv.y) * smoothstep(-0.3, -0.29, newCentralUv.y);
  // float noise = clamp(cnoise(vUv * uTransitionNoise.y), 0., 1.);
  
  // float n = uTransition.z;
  // float strength = (transition * n) - (n - 1.0) * 0.5 + (transition * noise * uTransitionNoise.x) ;
  // // float test_final = transition + transition -0.5 + (transition * noise) ;

  // // Circle with Waved radiius
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // angle = angle / PI * 2.0;
  // angle = angle + 0.5;
  // float sinusoid = sin(angle*20.0);

  // float radius = 0.4 + sinusoid * 0.02;
  // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));
  
  // // Perlin noise pattern
  // float strength = cnoise(vUv*10.0);

  // // Perlin noise pattern + step
  // float strength = step(0.0, cnoise(vUv*10.0));

  // // Perlin noise pattern + step + neg
  // float strength = 1.0 - abs(cnoise(vUv*10.0));

  // // Perlin noise pattern + step + sin 
  // float strength =  sin(cnoise(vUv*10.0)*20.0);

  // // Perlin noise pattern + step + sin + step
  // float strength =  step(0.95, sin(cnoise(vUv*10.0)*20.0));

  // // Perlin noise mix color
  // float strength =  step(0.95, sin(cnoise(vUv*10.0)*20.0));

  // // Color version
  // vec3 blackColor = vec3(0.0);
  // vec3 uvColor = vec3(vUv, 0.0);
  // vec3 mixedColor = mix(blackColor, uvColor, strength);

  // gl_FragColor = vec4(mixedColor, 1.0);



  // Black and white version
  // gl_FragColor = vec4(strength, strength, strength, 1.0);
  
  vec2 vUv2 = mod(vUv * 1.6, 1.0); // Tile UV
  // gl_FragColor = texture(uTexture, vec2(vUv2));


  // vec4 color;
  // if(gl_FragCoord.x < 400){
  //   color = vec4(1.0, 0.0, 0.0, 1.0);
  // }else{
  //   color = vec4(0.0, 1.0, 0.0, 1.0);
  // }
  float DDD = remap(uTestVec2.x, uTestVec2.y, 0.0, 1.0, gl_FragCoord.x);
  // float DDD = remap_normalized(0.0, 1.0, gl_FragCoord.z);
  // gl_FragColor = vec4(gl_FragDepth, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(vec3(DDD), 1.0);

  vec3 color = vec3(1, 1, 1); 
  vec3 light = normalize(vec3(0, 10, 10));
  float dProd = max(0.0,dot(vNormal, light));

  float strength_test = uTransition.z + uTestVec2.y * pow((1.0 - vViewSpaceNormal.z), uTestVec2.x);
  // gl_FragColor = vec4(vWorldSpaceNormal.w, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(color.r * dProd, color.g * dProd, color.b * dProd, 1.0);

  gl_FragColor = vec4(vec3(pow(gl_FragCoord.z, uTestVec2.x)), 1.0);
}