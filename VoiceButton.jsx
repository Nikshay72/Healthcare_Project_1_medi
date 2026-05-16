// frontend/src/components/VoiceButton.jsx
// Floating mic button — appears on every page, handles all voice commands

import React, { useState } from 'react'
import { useVoiceCommands } from '../hooks/useVoiceCommands'

export default function VoiceButton({ onConditionChange, onSeverityChange, onTriggerRoute, onGetLocation }) {
  const {
    isListening,
    transcript,
    lastCommand,
    supported,
    showHelp,
    setShowHelp,
    toggleListening,
    COMMANDS,
  } = useVoiceCommands({ onConditionChange, onSeverityChange, onTriggerRoute, onGetLocation })

  if (!supported) return null  // hide on unsupported browsers silently

  return (
    <>
      {/* ── Floating mic button ───────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}>

        {/* Live transcript bubble */}
        {isListening && transcript && (
          <div style={{
            background: '#1E1B4B',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 20,
            fontSize: 13,
            maxWidth: 260,
            textAlign: 'right',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            🎤 "{transcript}"
          </div>
        )}

        {/* Last command feedback */}
        {lastCommand && !isListening && (
          <div style={{
            background: '#F0FDF4',
            color: '#16A34A',
            border: '1px solid #86EFAC',
            padding: '6px 12px',
            borderRadius: 16,
            fontSize: 12,
            fontWeight: 600,
            maxWidth: 220,
            textAlign: 'right',
          }}>
            ✓ {lastCommand.label}
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={toggleListening}
          title={isListening ? 'Stop voice commands' : 'Start voice commands'}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            background: isListening
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : 'linear-gradient(135deg, #5B5FEF, #4347C8)',
            color: '#fff',
            boxShadow: isListening
              ? '0 0 0 4px rgba(239,68,68,0.3), 0 6px 20px rgba(239,68,68,0.4)'
              : '0 0 0 4px rgba(91,95,239,0.2), 0 6px 20px rgba(91,95,239,0.35)',
            transition: 'all 0.2s',
            animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isListening ? '🔴' : '🎤'}
        </button>

        {/* Help toggle */}
        <button
          onClick={() => setShowHelp(h => !h)}
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--text3)',
          }}
        >
          {showHelp ? '✕ Close' : '? Commands'}
        </button>
      </div>

      {/* ── Help panel ────────────────────────────────────────────────────── */}
      {showHelp && (
        <div style={{
          position: 'fixed',
          bottom: 120,
          right: 28,
          width: 320,
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          zIndex: 998,
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'var(--sidebar-bg)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🎤</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Voice Commands</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Say these phrases out loud</div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}
            >✕</button>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '10px 0' }}>
            {[
              { group: '🧭 Navigation', actions: ['go to dashboard', 'open hospitals', 'emergency router', 'ambulance tracker', 'budget finder', 'emergency log'] },
              { group: '🚨 Emergency Type', actions: ['cardiac arrest', 'trauma', 'burns', 'neurological', 'kidney failure', 'general emergency'] },
              { group: '⚡ Severity', actions: ['critical', 'high severity'] },
              { group: '🎯 Actions', actions: ['find hospital now', 'use my location', 'help', 'stop listening'] },
            ].map(section => (
              <div key={section.group} style={{ padding: '8px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  {section.group}
                </div>
                {section.actions.map(a => (
                  <div key={a} style={{
                    display: 'inline-block',
                    background: 'var(--primary-l)',
                    color: 'var(--primary)',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    margin: '2px 3px 2px 0',
                  }}>
                    "{a}"
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 11, color: 'var(--text3)' }}>
            🌐 Works in Chrome & Edge • Say "help" anytime
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(239,68,68,0.3), 0 6px 20px rgba(239,68,68,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(239,68,68,0.1), 0 6px 24px rgba(239,68,68,0.5); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
