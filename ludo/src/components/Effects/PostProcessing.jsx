/**
 * LudoVerse 3D — Post Processing Effects
 * Subtle bloom only on tokens, no harsh vignette
 */

import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useSettingsStore } from '../../store/settingsStore';

export default function PostProcessing() {
  const { graphicsQuality, bloom } = useSettingsStore();
  if (!bloom) return null;
  const isHigh = graphicsQuality === 'high' || graphicsQuality === 'ultra';

  return (
    <EffectComposer multisampling={isHigh ? 4 : 2}>
      {/* Very subtle bloom — only affects bright emissive token highlights */}
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.5}
        mipmapBlur={false}
        radius={0.4}
      />
      {/* Gentle vignette */}
      <Vignette
        offset={0.4}
        darkness={0.4}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
