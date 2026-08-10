import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

interface SampleDefinition {
  id: string
  url: string
}

class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null

  private readonly buffers = new Map<string, AudioBuffer>()
  private readonly trackGains = new Map<string, GainNode>()
  private readonly chokeSources = new Map<string, AudioBufferSourceNode>()
  private readonly trackPanners = new Map<string, StereoPannerNode>()
  private readonly trackMuteGains = new Map<string, GainNode>()

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

  playSample(id: string, time: number, chokeGroup: ChokeGroup): void {
    const context = this.getContext()
    const buffer = this.buffers.get(id)
    const gain = this.trackGains.get(id)

    if (!buffer || !gain) {
      throw new Error(`Could not load sample "${id}"`)
    }

    const startTime = time ?? context.currentTime

    if (chokeGroup) {
      const previousSource = this.chokeSources.get(chokeGroup.toString())
      if (previousSource) {
        previousSource.stop(startTime)
      }
    }

    const source = context.createBufferSource()

    source.buffer = buffer
    source.connect(gain)

    if (chokeGroup) {
      this.chokeSources.set(chokeGroup.toString(), source)
      source.addEventListener('ended', () => {
        if (this.chokeSources.get(chokeGroup.toString()) === source) {
          this.chokeSources.delete(chokeGroup.toString())
        }
      })
    }

    source.start(startTime)
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

  async close(): Promise<void> {
    if (!this.context) return

    await this.context.close()

    this.context = null
    this.masterGain = null
    this.buffers.clear()
    this.trackGains.clear()
    this.trackPanners.clear()
    this.trackMuteGains.clear()
  }

  get currentTime(): number {
    return this.getContext().currentTime
  }

  private createTrack(id: string): void {
    const existingGain = this.trackGains.get(id)
    const existingPan = this.trackPanners.get(id)

    if (existingPan && existingGain) return

    const context = this.getContext()

    const gain = context.createGain()
    const panner = context.createStereoPanner()
    const muteGain = context.createGain()

    gain.connect(panner)
    panner.connect(muteGain)
    muteGain.connect(this.masterGain!)

    muteGain.gain.value = 1

    this.trackGains.set(id, gain)
    this.trackPanners.set(id, panner)
    this.trackMuteGains.set(id, muteGain)
  }
}

export const audioEngine = new AudioEngine()
