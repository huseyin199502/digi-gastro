/**
 * digi-gastro Ludo — Embedded entry
 * ?players=4&mode=ai&ai=blue,green,yellow  |  ?net=<ws>&name=&mode=create|join&room=<code>
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import GamePage from './game/GamePage';
import NetLudo from './net/NetLudo';
import LoadingScreen from './components/UI/LoadingScreen';
import { useSettingsStore } from './store/settingsStore';

export default function App() {
  const { darkMode } = useSettingsStore();
  const hasNet = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('net');
  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <LoadingScreen />
        <AnimatePresence mode="wait">
          {hasNet ? <NetLudo /> : (
            <Routes>
              <Route path="*" element={<GamePage />} />
            </Routes>
          )}
        </AnimatePresence>
      </BrowserRouter>
    </div>
  );
}
