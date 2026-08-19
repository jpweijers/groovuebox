import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

interface SampleDefinition {
  id: string
  url: string
}

interface ActiveVoice {
  source: AudioBufferSourceNode
  gain: GainNode
}

class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null

  private readonly buffers = new Map<string, AudioBuffer>()
  private readonly trackGains = new Map<string, GainNode>()
  private readonly chokeSources = new Map<string, AudioBufferSourceNode>()
  private readonly trackPanners = new Map<string, StereoPannerNode>()
  private readonly trackMuteGains = new Map<string, GainNode>()
  private readonly trackFilters = new Map<string, BiquadFilterNode>()
  private readonly trackDistortions = new Map<string, WaveShaperNode>()

  private readonly trackSources = new Map<string, AudioBufferSourceNode>()

  private readonly trackVoices = new Map<string, ActiveVoice>()
  private readonly chokeVoices = new Map<string, ActiveVoice>()

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext()

      this.masterGain = this.context.createGain()
      this.masterGain.connect(this.context.destination)
    }

    return this.context
  }

  async resume(): Promise<void> {
    const context = this.getContext()

    if (context.state === 'suspended') {
      await context.resume()
    }
  }

  async loadSamples(samples: SampleDefinition[]): Promise<void> {
    const context = this.getContext()

    await Promise.all(
      samples.map(async ({ id, url }) => {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Could not load sample "${id}" from "${url}"`)
        }

        const data = await response.arrayBuffer()
        const buffer = await context.decodeAudioData(data)

        this.buffers.set(id, buffer)
        this.createTrack(id)
      }),
    )
  }

  playSample(
    id: string,
    time: number,
    chokeGroup: ChokeGroup,
    velocity: number,
    pitch: number,
    decay: number,
  ): void {
    const context = this.getContext()
    const buffer = this.buffers.get(id)
    const distortion = this.trackDistortions.get(id)

    if (!buffer || !distortion) {
      throw new Error(`Could not load sample "${id}"`)
    }

    const voicesToRelease = new Set<ActiveVoice>()
    const trackVoice = this.trackVoices.get(id)
    if (trackVoice) voicesToRelease.add(trackVoice)

    const startTime = time ?? context.currentTime

    if (chokeGroup) {
      const chokeVoice = this.chokeVoices.get(chokeGroup.toString())
      if (chokeVoice) voicesToRelease.add(chokeVoice)
    }

    for (const voice of voicesToRelease) {
      this.releaseVoice(voice, startTime)
    }

    const source = context.createBufferSource()
    source.buffer = buffer

    const voiceGain = context.createGain()
    const attack = 0.002
    const safeVelocity = Math.min(1, Math.max(0, velocity))
    voiceGain.gain.setValueAtTime(0, startTime)
    voiceGain.gain.linearRampToValueAtTime(safeVelocity, startTime + attack)
    voiceGain.connect(distortion)

    source.playbackRate.setValueAtTime(Math.pow(2, pitch / 12), startTime)

    source.connect(voiceGain)

    const voice: ActiveVoice = { source, gain: voiceGain }

    if (chokeGroup) {
      this.chokeVoices.set(chokeGroup.toString(), voice)
      source.addEventListener('ended', () => {
        if (this.chokeVoices.get(chokeGroup.toString())?.source === source) {
          this.chokeVoices.delete(chokeGroup.toString())
        }
      })
    }

    this.trackVoices.set(id, voice)

    source.start(startTime)

    if (decay < 2000) {
      const decayEnd = startTime + decay / 1000
      const attackEnd = startTime + attack

      voiceGain.gain.exponentialRampToValueAtTime(0.0001, Math.max(decayEnd, attackEnd + 0.001))

      source.stop(Math.max(decayEnd, attackEnd + 0.001))
    }
  }

  setTrackVolume(id: string, volume: number): void {
    const context = this.getContext()
    const gain = this.trackGains.get(id)

    if (!gain) {
      console.warn(`Could not load gain for track "${id}".`)
      return
    }

    const safeVolume = Math.min(1, Math.max(0, volume))

    gain.gain.cancelScheduledValues(context.currentTime)
    gain.gain.setTargetAtTime(safeVolume, context.currentTime, 0.01)
  }

  setTrackPan(id: string, pan: number): void {
    const context = this.getContext()
    const panner = this.trackPanners.get(id)

    if (!panner) {
      console.warn(`Could not load pan for track "${id}".`)
      return
    }

    const safePan = Math.min(1, Math.max(-1, pan))

    panner.pan.cancelScheduledValues(context.currentTime)
    panner.pan.setTargetAtTime(safePan, context.currentTime, 0.01)
  }

  setTrackMute(id: string, mute: boolean): void {
    const muteGain = this.trackMuteGains.get(id)

    if (!muteGain) return

    muteGain.gain.value = mute ? 0 : 1
  }

  setTrackFilter(id: string, frequency: number): void {
    const context = this.getContext()
    const filter = this.trackFilters.get(id)

    if (!filter) return

    const safeFrequency = Math.min(context.sampleRate / 2, Math.max(20, frequency))

    filter.frequency.cancelScheduledValues(context.currentTime)
    filter.frequency.setTargetAtTime(safeFrequency, context.currentTime, 0.01)
  }

  setTrackDistortion(id: string, amount: number): void {
    const distortion = this.trackDistortions.get(id)

    if (!distortion) return

    distortion.curve = this.createDistortionCurve(amount)
  }

  stop(): void {
    for (const voice of this.trackVoices.values()) {
      this.releaseVoice(voice, this.getContext().currentTime)
    }
  }

  async close(): Promise<void> {
    if (!this.context) return

    await this.context.close()

    this.context = null
    this.masterGain = null
    this.buffers.clear()
    this.trackGains.clear()
    this.trackPanners.clear()
    this.trackMuteGains.clear()
    this.trackSources.clear()
    this.chokeSources.clear()
  }

  get currentTime(): number {
    return this.getContext().currentTime
  }

  private createTrack(id: string): void {
    const existingGain = this.trackGains.get(id)
    const existingPan = this.trackPanners.get(id)

    if (existingPan && existingGain) return

    const context = this.getContext()

    const velocityGain = context.createGain()
    const gain = context.createGain()
    const panner = context.createStereoPanner()
    const muteGain = context.createGain()

    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 20_000
    filter.Q.value = 0.7

    const distortion = context.createWaveShaper()
    distortion.curve = this.createDistortionCurve(0)
    distortion.oversample = '2x'

    velocityGain.connect(distortion)
    distortion.connect(filter)
    filter.connect(gain)
    gain.connect(panner)
    panner.connect(muteGain)
    muteGain.connect(this.masterGain!)

    muteGain.gain.value = 1

    this.trackGains.set(id, gain)
    this.trackPanners.set(id, panner)
    this.trackMuteGains.set(id, muteGain)
    this.trackFilters.set(id, filter)
    this.trackDistortions.set(id, distortion)
  }

  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const sampleCount = 2048
    const curve = new Float32Array(sampleCount)

    const safeAmount = Math.min(1, Math.max(0, amount))
    const drive = 1 + safeAmount * 33
    const normalization = Math.tanh(drive)

    for (let i = 0; i < sampleCount; i++) {
      const input = (i / (sampleCount - 1)) * 2 - 1
      const distorted = Math.tanh(input * drive) / normalization
      curve[i] = input + (distorted - input) * safeAmount
    }

    return curve
  }

  private releaseVoice(voice: ActiveVoice, stopTime: number): void {
    const context = this.getContext()

    const releaseDuration = 0.005
    const releaseStart = Math.max(context.currentTime, stopTime - releaseDuration)

    const gain = voice.gain.gain
    const currentValue = gain.value

    gain.cancelScheduledValues(releaseStart)
    gain.setValueAtTime(currentValue, releaseStart)
    gain.linearRampToValueAtTime(0, stopTime)

    voice.source.stop(stopTime)
  }
}

export const audioEngine = new AudioEngine()
