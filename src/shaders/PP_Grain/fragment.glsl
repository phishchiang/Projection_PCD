  uniform float amount;
  uniform sampler2D tDiffuse;
  uniform vec2 uGrain_Multiplier;

  varying vec2 vUv;

  float random( vec2 p )
  {
    vec2 K1 = vec2(
      23.14069263277926, // e^pi (Gelfond's constant)
      2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
  }

  void main() {

    vec4 color = texture2D( tDiffuse, vUv );
    vec2 uvRandom = vUv;
    uvRandom.y *= random(vec2(uvRandom.y,amount));
    color.rgb += random(uvRandom) * uGrain_Multiplier.x;
    gl_FragColor = vec4( color  );
  }