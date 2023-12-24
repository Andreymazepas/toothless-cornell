import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Color, PositionalAudio as tPositionalAudio } from 'three';
import {
  OrbitControls,
  PositionalAudio,
  Shadow,
  useVideoTexture,
} from '@react-three/drei';

const chromaKeyShader = {
  uniforms: {
    tDiffuse: { value: null },
    color: { value: new Color('green') },
    uKeyed: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    uniform float uKeyed;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float diff = length(texel.rgb - color.rgb);

      // Adjust the threshold as needed
      float threshold = 0.5;

      // Set a range for chroma keying
      if (diff > threshold) {
        // Make the pixel transparent
        discard;
      } else {
        // Keep the original pixel color
        gl_FragColor = texel;
      }

      // add slight red tint to the left side and green tint to the right side, make them blend in the middle
      
        gl_FragColor.r += (1.0 - vUv.x ) * 0.07;
        gl_FragColor.g += vUv.x * 0.07;
      
      
    }`,
};

const Box = () => {
  return (
    <>
      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color={new Color('red')} />
      </mesh>

      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[0.2, 6, 6]} />
        <meshStandardMaterial color={new Color('green')} />
      </mesh>

      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[6, 0.2, 6]} />
        <meshStandardMaterial color={new Color('white')} />
      </mesh>

      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[6, 0.2, 6]} />
        <meshStandardMaterial color={new Color('white')} />
      </mesh>

      <mesh position={[0, 2.9, 0]}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial
          emissive={new Color('white')}
          emissiveIntensity={1}
        />
      </mesh>
      <rectAreaLight
        position={[0, 2.9, 0]}
        width={1}
        height={1}
        intensity={200}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      <mesh position={[0, 0, -3]}>
        <boxGeometry args={[6, 6, 0.2]} />
        <meshStandardMaterial color={new Color('white')} />
      </mesh>
    </>
  );
};

const Toothless = ({
  audioRef,
}: {
  audioRef: React.RefObject<tPositionalAudio>;
}) => {
  const texture = useVideoTexture('/toothless.webm');
  return (
    <mesh position={[0, -1.4, 0]}>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        attach="material"
        args={[chromaKeyShader]}
        uniforms-tDiffuse-value={texture}
      />
      <PositionalAudio
        url="/driftveil.mp3"
        distance={10}
        loop
        ref={audioRef}
        hasPlaybackControl={true}
      />
    </mesh>
  );
};

function App() {
  const [playState, setPlayState] = useState(false);
  const audioRef = useRef<tPositionalAudio>(null);

  useEffect(() => {
    if (audioRef.current) {
      playState ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [playState]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'black',
          color: 'white',
          zIndex: 2,
          padding: '8px',
        }}
      >
        <input
          type="checkbox"
          id="toggle"
          checked={playState}
          onChange={() => setPlayState((prev) => !prev)}
        />
        <label htmlFor="toggle">Toggle Music</label>
      </div>
      <Canvas camera={{ position: [0, 0, 5] }} color="black">
        <OrbitControls
          minPolarAngle={1}
          maxPolarAngle={2}
          minAzimuthAngle={-0.5}
          maxAzimuthAngle={0.5}
        />
        <ambientLight intensity={0.5} />
        <Box />
        <Toothless audioRef={audioRef} />
        <Shadow
          color="#000"
          scale={[2, 2, 1]}
          position={[0, -2.89, 0]}
          opacity={0.6}
        />
      </Canvas>
    </>
  );
}

export default App;
