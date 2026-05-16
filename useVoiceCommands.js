// frontend/src/hooks/useVoiceCommands.js
// ─────────────────────────────────────────────────────────────────────────────
//  Web Speech API voice command engine
//  Works in Chrome, Edge, Safari (partial). Firefox needs flag enabled.
//  No API key, no cost, runs 100% in the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ── All voice commands and what they do ──────────────────────────────────────
const COMMANDS = [
  // Navigation
  { phrases: ['go to dashboard', 'open dashboard', 'show dashboard', 'home'],
    action: 'navigate', target: '/dashboard', label: 'Dashboard' },

  { phrases: ['open hospitals', 'show hospitals', 'hospital directory', 'find hospital'],
    action: 'navigate', target: '/hospitals', label: 'Hospital Directory' },

  { phrases: ['emergency router', 'find route', 'emergency route', 'route emergency', 'find best hospital'],
    action: 'navigate', target: '/emergency-router', label: 'Emergency Router' },

  { phrases: ['ambulance tracker', 'show ambulances', 'track ambulance', 'open map'],
    action: 'navigate', target: '/ambulances', label: 'Ambulance Tracker' },

  { phrases: ['budget finder', 'find budget hospital', 'show budget', 'cheap hospital', 'affordable hospital'],
    action: 'navigate', target: '/budget', label: 'Budget Finder' },

  { phrases: ['emergency log', 'show log', 'show emergencies', 'emergency history'],
    action: 'navigate', target: '/emergency-log', label: 'Emergency Log' },

  // Emergency conditions — auto-fill Emergency Router
  { phrases: ['cardiac arrest', 'heart attack'],
    action: 'route_condition', target: 'Cardiac Arrest', label: 'Routing for Cardiac Arrest' },

  { phrases: ['trauma', 'accident', 'road accident'],
    action: 'route_condition', target: 'Trauma / Accident', label: 'Routing for Trauma' },

  { phrases: ['burns', 'burn patient'],
    action: 'route_condition', target: 'Burns', label: 'Routing for Burns' },

  { phrases: ['neurological', 'brain', 'stroke'],
    action: 'route_condition', target: 'Neurological', label: 'Routing for Neurological' },

  { phrases: ['kidney failure', 'dialysis'],
    action: 'route_condition', target: 'Kidney Failure', label: 'Routing for Kidney Failure' },

  { phrases: ['general emergency', 'emergency'],
    action: 'route_condition', target: 'General Emergency', label: 'Routing for General Emergency' },

  // Severity
  { phrases: ['critical', 'severity critical'],
    action: 'set_severity', target: 'Critical', label: 'Severity set to Critical' },

  { phrases: ['high severity', 'severity high'],
    action: 'set_severity', target: 'High', label: 'Severity set to High' },

  // Actions
  { phrases: ['find route', 'search route', 'go', 'find hospital now', 'route now'],
    action: 'trigger_route', label: 'Finding best hospital...' },

  { phrases: ['use my location', 'get my location', 'use current location'],
    action: 'get_location', label: 'Getting your location...' },

  // Help
  { phrases: ['help', 'what can i say', 'commands', 'voice help'],
    action: 'show_help', label: 'Showing help' },

  // Stop
  { phrases: ['stop listening', 'stop voice', 'turn off voice', 'quiet'],
    action: 'stop', label: 'Voice commands stopped' },
]

// ── Match spoken text to a command ───────────────────────────────────────────
function matchCommand(transcript) {
  const text = transcript.toLowerCase().trim()
  for (const cmd of COMMANDS) {
    for (const phrase of cmd.phrases) {
      if (text.includes(phrase)) return cmd
    }
  }
  return null
}

// ── Text-to-Speech feedback ──────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate   = 1.05
  utt.pitch  = 1
  utt.volume = 0.9
  // Prefer a natural voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v =>
    v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')
  )
  if (preferred) utt.voice = preferred
  window.speechSynthesis.speak(utt)
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useVoiceCommands({ onConditionChange, onSeverityChange, onTriggerRoute, onGetLocation } = {}) {
  const [isListening, setIsListening]   = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [lastCommand, setLastCommand]   = useState(null)
  const [showHelp, setShowHelp]         = useState(false)
  const [supported, setSupported]       = useState(false)
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SpeechRecognition)
  }, [])

  const executeCommand = useCallback((cmd, raw) => {
    setLastCommand({ label: cmd.label, time: new Date().toLocaleTimeString() })

    switch (cmd.action) {
      case 'navigate':
        speak(`Opening ${cmd.label}`)
        navigate(cmd.target)
        break

      case 'route_condition':
        speak(`Setting condition to ${cmd.target}. Opening emergency router.`)
        if (onConditionChange) onConditionChange(cmd.target)
        navigate('/emergency-router')
        break

      case 'set_severity':
        speak(`Severity set to ${cmd.target}`)
        if (onSeverityChange) onSeverityChange(cmd.target)
        break

      case 'trigger_route':
        speak('Finding the best hospital for you now.')
        if (onTriggerRoute) onTriggerRoute()
        break

      case 'get_location':
        speak('Getting your current location.')
        if (onGetLocation) onGetLocation()
        break

      case 'show_help':
        speak('Here are the available voice commands.')
        setShowHelp(true)
        break

      case 'stop':
        speak('Voice commands stopped.')
        stopListening()
        break

      default:
        break
    }
  }, [navigate, onConditionChange, onSeverityChange, onTriggerRoute, onGetLocation])

  const startListening = useCallback(() => {
    if (!supported) return
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.continuous     = true   // keep listening until stopped
    recognition.interimResults = true
    recognition.lang           = 'en-IN' // Indian English
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsListening(true)
      speak('Voice commands active. How can I help?')
    }

    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1]
      const text   = latest[0].transcript
      setTranscript(text)

      if (latest.isFinal) {
        const cmd = matchCommand(text)
        if (cmd) {
          executeCommand(cmd, text)
        } else {
          speak(`Sorry, I didn't understand: ${text}. Say "help" for a list of commands.`)
        }
      }
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return  // ignore silence
      if (e.error === 'not-allowed') {
        speak('Microphone access denied. Please allow microphone in your browser.')
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current && isListening) {
        try { recognition.start() } catch (_) {}
      }
    }

    recognitionRef.current = recognition
    try { recognition.start() } catch (_) {}
  }, [supported, executeCommand, isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setTranscript('')
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    transcript,
    lastCommand,
    supported,
    showHelp,
    setShowHelp,
    toggleListening,
    startListening,
    stopListening,
    COMMANDS,
  }
}
