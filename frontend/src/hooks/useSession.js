import { useState, useRef, useCallback, useEffect } from 'react'

function getWsUrl() {
  const host = window.location.host
  const isCodespaces = host.includes('app.github.dev') || host.includes('githubpreview.dev')
  if (isCodespaces) {
    return `wss://${host.replace(/-\d{4}\./, '-8000.')}/ws/session`
  }
  return 'ws://localhost:8000/ws/session'
}

export function useSession() {
  const [connected, setConnected] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState([])
  const [griefState, setGriefState] = useState(null)
  const [nodes, setNodes] = useState([])
  const [letter, setLetter] = useState(null)
  const [crisis, setCrisis] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [partial, setPartial] = useState('')
  const [status, setStatus] = useState('idle')

  const ws = useRef(null)
  const stream = useRef(null)
  const audioCtx = useRef(null)
  const shouldReconnect = useRef(false)
  const reconnectTimer = useRef(null)
  const intervalRef = useRef(null)

  const cleanupAudio = useCallback(() => {
    clearInterval(intervalRef.current)
    try { audioCtx.current?.close() } catch {}
    stream.current?.getTracks().forEach(t => t.stop())
    audioCtx.current = null
    stream.current = null
  }, [])

  const cleanupWs = useCallback(() => {
    shouldReconnect.current = false
    clearTimeout(reconnectTimer.current)
    try {
      if (ws.current) {
        ws.current.onclose = null
        ws.current.onerror = null
        ws.current.onmessage = null
        ws.current.close()
        ws.current = null
      }
    } catch {}
  }, [])

  const stopMic = useCallback(() => {
    cleanupAudio()
    setListening(false)
    setPartial('')
  }, [cleanupAudio])

  const resetSession = useCallback(() => {
    cleanupAudio()
    cleanupWs()
    setConnected(false)
    setListening(false)
    setTranscript([])
    setGriefState(null)
    setNodes([])
    setLetter(null)
    setCrisis(false)
    setSessionEnded(false)
    setPartial('')
    setStatus('idle')
  }, [cleanupAudio, cleanupWs])

  const openWs = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        if (ws.current) {
          ws.current.onclose = null
          ws.current.onerror = null
          ws.current.close()
          ws.current = null
        }
      } catch {}

      const url = getWsUrl()
      console.log('WS connecting to:', url)
      setStatus('connecting')

      const socket = new WebSocket(url)
      socket.binaryType = 'arraybuffer'
      ws.current = socket

      const timeout = setTimeout(() => reject(new Error('WS timeout')), 10000)

      socket.onopen = () => {
        clearTimeout(timeout)
        setConnected(true)
        setStatus('connected')
        console.log('WS connected')
        resolve()
      }
      socket.onerror = (e) => {
        clearTimeout(timeout)
        setStatus('error')
        reject(new Error('WS error'))
      }
      socket.onclose = (e) => {
        console.log('WS closed', e.code)
        setConnected(false)
        setStatus('idle')
        shouldReconnect.current = false
        clearTimeout(reconnectTimer.current)
      }
      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'crisis_override') { setCrisis(true); stopMic(); return }
          if (msg.type === 'letter') { setLetter(msg.text); setSessionEnded(true); stopMic(); return }
          if (msg.type === 'partial') { setPartial(msg.text); return }
          if (msg.type === 'turn') {
            setPartial('')
            setTranscript(prev => [...prev, {
              user: msg.transcript, assistant: msg.response, ts: Date.now()
            }])
            setGriefState(msg.grief_state)
            if (msg.nodes?.length > 0) setNodes(msg.nodes)
          }
        } catch (err) { console.error('msg parse error', err) }
      }
    })
  }, [stopMic])

  const startListening = useCallback(async () => {
    try {
      shouldReconnect.current = true
      await openWs()

      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
      })

      // Use AudioContext at native rate, then downsample to 16kHz manually
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
      const nativeRate = audioCtx.current.sampleRate
      console.log('Native sample rate:', nativeRate)

      const source = audioCtx.current.createMediaStreamSource(stream.current)

      // Use AudioWorklet-compatible approach via OfflineAudioContext for resampling
      // Buffer 100ms of audio, resample to 16kHz, send as PCM16
      const BUFFER_MS = 100
      const nativeSamplesRaw = Math.floor(nativeRate * BUFFER_MS / 1000)
      const nativeSamples = Math.pow(2, Math.ceil(Math.log2(nativeSamplesRaw)))

      const scriptNode = audioCtx.current.createScriptProcessor(nativeSamples, 1, 1)
      let nodeStarted = false

      scriptNode.onaudioprocess = async (e) => {
        if (ws.current?.readyState !== WebSocket.OPEN) return
        if (!nodeStarted) { nodeStarted = true; console.log('onaudioprocess firing!') }

        const inputData = e.inputBuffer.getChannelData(0)

        // Resample from native rate to 16kHz
        const resampleRatio = 16000 / nativeRate
        const outputLength = Math.floor(inputData.length * resampleRatio)
        const resampled = new Float32Array(outputLength)
        for (let i = 0; i < outputLength; i++) {
          const srcIdx = i / resampleRatio
          const idx = Math.floor(srcIdx)
          const frac = srcIdx - idx
          resampled[i] = idx + 1 < inputData.length
            ? inputData[idx] * (1 - frac) + inputData[idx + 1] * frac
            : inputData[idx]
        }

        // Convert to PCM16
        const pcm16 = new Int16Array(resampled.length)
        for (let i = 0; i < resampled.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, resampled[i] * 32768))
        }
        ws.current.send(pcm16.buffer)
      }

      source.connect(scriptNode)
      scriptNode.connect(audioCtx.current.destination)

      await audioCtx.current.resume()
      console.log('AudioContext state:', audioCtx.current.state, '— streaming PCM16 at 16kHz')
      setListening(true)

    } catch (err) {
      console.error('startListening error:', err)
      setStatus('error')
    }
  }, [openWs])

  const stopListening = useCallback(() => {
    shouldReconnect.current = false
    clearTimeout(reconnectTimer.current)
    stopMic()
  }, [stopMic])

  const endSession = useCallback(() => {
    shouldReconnect.current = false
    clearTimeout(reconnectTimer.current)
    stopMic()
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'end_session' }))
    }
  }, [stopMic])

  useEffect(() => () => {
    cleanupAudio()
    cleanupWs()
  }, [])

  return {
    connected, listening, transcript, griefState, partial,
    nodes, letter, crisis, sessionEnded, status,
    startListening, stopListening, endSession, resetSession,
  }
}
