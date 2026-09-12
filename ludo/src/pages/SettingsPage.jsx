/**
 * LudoVerse 3D — Settings Page
 * All game settings with toggles, sliders, and quality presets
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import GlassCard from '../components/UI/GlassCard';
import GradientButton from '../components/UI/GradientButton';

function Toggle({ label, description, value, onChange, id }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        {description && <p className="text-white/40 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          value ? 'bg-indigo-600' : 'bg-white/20'
        }`}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ x: value ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </button>
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 1, step = 0.05, id }) {
  return (
    <div className="py-3 border-b border-white/8 last:border-0">
      <div className="flex justify-between mb-2">
        <p className="text-white font-semibold text-sm">{label}</p>
        <span className="text-indigo-400 text-sm font-mono">{Math.round(value * 100)}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-white/20 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-indigo-500
          [&::-webkit-slider-thumb]:shadow-lg"
      />
    </div>
  );
}

function QualitySelect({ value, onChange }) {
  const opts = ['low', 'medium', 'high', 'ultra'];
  return (
    <div className="py-3 border-b border-white/8">
      <p className="text-white font-semibold text-sm mb-2">Graphics Quality</p>
      <div className="flex gap-2">
        {opts.map(q => (
          <button
            key={q}
            id={`quality-${q}`}
            onClick={() => onChange(q)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              value === q
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/20'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();

  useEffect(() => {
    document.title = 'LudoMaster 3D — Settings';
  }, []);

  const sections = [
    {
      title: '🔊 Audio',
      content: (
        <>
          <Toggle id="music-toggle" label="Background Music" description="Ambient soundtrack" value={settings.musicEnabled} onChange={settings.setMusicEnabled} />
          <Slider id="music-vol" label="Music Volume" value={settings.musicVolume} onChange={settings.setMusicVolume} />
          <Toggle id="sfx-toggle" label="Sound Effects" description="Dice, moves, captures" value={settings.sfxEnabled} onChange={settings.setSfxEnabled} />
          <Slider id="sfx-vol" label="SFX Volume" value={settings.sfxVolume} onChange={settings.setSfxVolume} />
        </>
      ),
    },
    {
      title: '🎨 Graphics',
      content: (
        <>
          <QualitySelect value={settings.graphicsQuality} onChange={settings.setGraphicsQuality} />
          <Toggle id="shadows-toggle" label="Shadows" description="Dynamic shadow casting" value={settings.shadows} onChange={settings.setShadows} />
          <Toggle id="bloom-toggle" label="Bloom Effect" description="Glow on tokens and dice" value={settings.bloom} onChange={settings.setBloom} />
          <Toggle id="particles-toggle" label="Particles" description="Sparkles, trails, confetti" value={settings.particles} onChange={settings.setParticles} />
          <Toggle id="fps-toggle" label="FPS Counter" description="Show frame rate" value={settings.showFPS} onChange={settings.setShowFPS} />
        </>
      ),
    },
    {
      title: '📷 Camera',
      content: (
        <>
          <Toggle id="autocam-toggle" label="Auto Camera" description="Follow active player" value={settings.autoCamera} onChange={settings.setAutoCamera} />
          <Slider id="cam-speed" label="Camera Speed" value={settings.cameraSpeed} onChange={settings.setCameraSpeed} min={0.2} max={2} step={0.1} />
          <Slider id="cam-fov" label="Field of View" value={(settings.cameraFOV - 40) / 60} onChange={(v) => settings.setCameraFOV(Math.round(v * 60 + 40))} />
        </>
      ),
    },
    {
      title: '⚡ Animation',
      content: (
        <>
          <Slider id="anim-speed" label="Animation Speed" value={settings.animationSpeed - 0.5} onChange={(v) => settings.setAnimationSpeed(v + 0.5)} min={0} max={1} />
        </>
      ),
    },
    {
      title: '🖥️ Display',
      content: (
        <>
          <Toggle id="darkmode-toggle" label="Dark Mode" description="Dark theme (recommended)" value={settings.darkMode} onChange={settings.setDarkMode} />
          <Toggle id="fullscreen-toggle" label="Fullscreen" description="Toggle fullscreen mode" value={settings.fullscreen} onChange={() => settings.toggleFullscreen()} />
        </>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 overflow-auto py-8 px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)' }}
    >
      {/* Back button */}
      <motion.button
        className="fixed top-4 left-4 text-white/60 hover:text-white flex items-center gap-1 text-sm z-10"
        onClick={() => navigate(-1)}
        whileHover={{ x: -3 }}
      >
        ← Back
      </motion.button>

      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-8 pt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-black text-white mb-1">⚙️ Settings</h1>
          <p className="text-white/40 font-body text-sm">Customize your experience</p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <GlassCard key={section.title} animate delay={i * 0.1}>
              <h2 className="font-display text-white font-bold text-base mb-3">{section.title}</h2>
              {section.content}
            </GlassCard>
          ))}
        </div>

        <div className="mt-6 pb-8">
          <GradientButton
            variant="danger"
            fullWidth
            id="reset-settings-btn"
            onClick={() => {
              if (confirm('Reset all settings to defaults?')) {
                localStorage.removeItem('ludoverse-settings');
                window.location.reload();
              }
            }}
          >
            🔄 Reset to Defaults
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
