import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'
import type { TimeDivision } from '@/domain/time-division.interface.ts'
import bitcrusherUrl from '@/audio/Bitcrusher.ts?worker&url'

interface SampleDefinition {
  id: string
  url: string
}

interface ActiveVoice {
  source: AudioBufferSourceNode
  gain: GainNode
}

class AudioEngine {
  private bpm: number = 90
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private reverbImpulse: AudioBuffer | null = null
  private bitcrusherLoaded: boolean = false

  private readonly buffers = new Map<string, AudioBuffer>()
  private readonly trackGains = new Map<string, GainNode>()
  private readonly chokeSources = new Map<string, AudioBufferSourceNode>()
  private readonly trackPanners = new Map<string, StereoPannerNode>()
  private readonly trackMuteGains = new Map<string, GainNode>()
  private readonly trackFilters = new Map<string, BiquadFilterNode>()
  private readonly trackDistortions = new Map<string, WaveShaperNode>()
  private readonly trackDryGains = new Map<string, GainNode>()
  private readonly trackWetGains = new Map<string, GainNode>()
  private readonly trackReverbs = new Map<string, ConvolverNode>()
  private readonly trackBitcrushers = new Map<string, AudioWorkletNode>()

  private readonly trackDelaySends = new Map<string, GainNode>()
  private readonly trackDelayFeedbacks = new Map<string, GainNode>()
  private readonly trackDelays = new Map<string, DelayNode>()

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

    await this.loadBitcrusher()
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
    const bitcrusher = this.trackBitcrushers.get(id)

    if (!buffer || !bitcrusher) {
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
    voiceGain.connect(bitcrusher)

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

  setBpm(bpm: number): void {
    this.bpm = bpm
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

  setTrackReverb(id: string, amount: number): void {
    const context = this.getContext()
    const dryGain = this.trackDryGains.get(id)
    const wetGain = this.trackWetGains.get(id)

    if (!dryGain || !wetGain) return

    const { dry, wet } = this.getWetDryMix(amount)

    dryGain.gain.cancelScheduledValues(context.currentTime)
    wetGain.gain.cancelScheduledValues(context.currentTime)

    dryGain.gain.setTargetAtTime(dry, context.currentTime, 0.01)
    wetGain.gain.setTargetAtTime(wet, context.currentTime, 0.01)
  }

  setTrackDelay(id: string, delayAmount: number): void {
    const context = this.getContext()
    const send = this.trackDelaySends.get(id)

    if (!send) return

    const safeAmount = Math.min(1, Math.max(0, delayAmount))
    send.gain.cancelScheduledValues(context.currentTime)
    send.gain.setTargetAtTime(safeAmount, context.currentTime, 0.01)
  }

  setTrackDelayFeedback(id: string, amount: number): void {
    const context = this.getContext()
    const delay = this.trackDelayFeedbacks.get(id)

    if (!delay) return

    const safeAmount = Math.min(1, Math.max(0, amount))

    delay.gain.cancelScheduledValues(context.currentTime)
    delay.gain.setTargetAtTime(safeAmount, context.currentTime, 0.01)
  }

  setTrackDelayTime(id: string, time: TimeDivision): void {
    const context = this.getContext()
    const delay = this.trackDelays.get(id)

    if (!delay) return

    const seconds = this.delayTimeInSeconds(time)

    delay.delayTime.cancelScheduledValues(context.currentTime)
    delay.delayTime.setTargetAtTime(seconds, context.currentTime, 0.01)
  }

  setTrackBitDepth(id: string, amount: number): void {
    const context = this.getContext()
    const bitcrusher = this.trackBitcrushers.get(id)
    const parameter = bitcrusher?.parameters.get('bitDepth')

    if (!parameter) return

    const safeAmount = Math.round(Math.min(16, Math.max(1, amount)))

    parameter.cancelScheduledValues(context.currentTime)
    parameter.setTargetAtTime(safeAmount, context.currentTime, 0.01)
  }

  setTrackSampleRateReduction(id: string, amount: number): void {
    const context = this.getContext()
    const bitcrusher = this.trackBitcrushers.get(id)
    const parameter = bitcrusher?.parameters.get('sampleRateReduction')

    if (!parameter) return

    const safeAmount = Math.round(Math.min(32, Math.max(1, amount)))

    parameter.cancelScheduledValues(context.currentTime)
    parameter.setTargetAtTime(safeAmount, context.currentTime, 0.01)
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
    this.trackDryGains.clear()
    this.trackWetGains.clear()
    this.trackReverbs.clear()
    this.trackBitcrushers.clear()
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

    const reverb = context.createConvolver()
    const dryGain = context.createGain()
    const wetGain = context.createGain()

    this.reverbImpulse ??= this.createReverbImpulse()
    reverb.buffer = this.reverbImpulse

    const delaySend = context.createGain()
    const delay = context.createDelay(4)
    const delayFeedback = context.createGain()

    delaySend.gain.value = 0
    delay.delayTime.value = this.delayTimeInSeconds('1/8')
    delayFeedback.gain.value = 0.35

    const preReverbMix = context.createGain()

    const bitcrusher = new AudioWorkletNode(context, 'bitcrusher', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    velocityGain.connect(bitcrusher)
    bitcrusher.connect(distortion)
    distortion.connect(filter)
    filter.connect(gain)
    gain.connect(panner)
    panner.connect(preReverbMix)

    // Delay
    panner.connect(delaySend)
    delaySend.connect(delay)
    delay.connect(preReverbMix)
    delay.connect(delayFeedback)
    delayFeedback.connect(delay)

    // Reverb
    preReverbMix.connect(dryGain)
    dryGain.connect(muteGain)
    preReverbMix.connect(wetGain)
    wetGain.connect(reverb)
    reverb.connect(muteGain)

    muteGain.connect(this.masterGain!)

    muteGain.gain.value = 1

    this.trackGains.set(id, gain)
    this.trackPanners.set(id, panner)
    this.trackMuteGains.set(id, muteGain)
    this.trackFilters.set(id, filter)
    this.trackDistortions.set(id, distortion)
    this.trackDryGains.set(id, dryGain)
    this.trackWetGains.set(id, wetGain)
    this.trackReverbs.set(id, reverb)
    this.trackDelaySends.set(id, delaySend)
    this.trackDelays.set(id, delay)
    this.trackDelayFeedbacks.set(id, delayFeedback)
    this.trackBitcrushers.set(id, bitcrusher)
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

  private createReverbImpulse(): AudioBuffer {
    const context = this.getContext()
    const duration = 2
    const sampleCount = Math.floor(context.sampleRate * duration)
    const impulse = context.createBuffer(2, sampleCount, context.sampleRate)

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const samples = impulse.getChannelData(channel)

      for (let index = 0; index < sampleCount; index++) {
        const progress = index / sampleCount
        const envelope = Math.pow(1 - progress, 2.5)
        samples[index] = (Math.random() * 2 - 1) * envelope
      }
    }

    return impulse
  }

  private getWetDryMix(amount: number): { wet: number; dry: number } {
    const safeAmount = Math.min(1, Math.max(0, amount))
    const angle = safeAmount * Math.PI * 0.5

    return {
      dry: 1,
      wet: Math.sin(angle),
    }
  }

  private delayTimeInSeconds(division: TimeDivision): number {
    const quarterNote = 60 / this.bpm

    switch (division) {
      case '1/4':
        return quarterNote
      case '1/8':
        return quarterNote / 2
      case '1/8T':
        return quarterNote / 3
      case '1/16':
        return quarterNote / 4
      default:
        return 0
    }
  }

  private async loadBitcrusher(): Promise<void> {
    if (this.bitcrusherLoaded) return

    const context = this.getContext()

    await context.audioWorklet.addModule(bitcrusherUrl)
    this.bitcrusherLoaded = true
  }
}

export const audioEngine = new AudioEngine()
