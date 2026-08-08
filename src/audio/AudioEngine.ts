interface SampleDefinition {
  id: string
  url: string
}

class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null

  private readonly buffers = new Map<string, AudioBuffer>()
  private readonly trackGains = new Map<string, GainNode>()

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
        this.createTrackGain(id)
      }),
    )
  }

  playSample(id: string, time?: number): void {
    const context = this.getContext()
    const buffer = this.buffers.get(id)
    const gain = this.trackGains.get(id)

    if (!buffer || !gain) {
      throw new Error(`Could not load sample "${id}"`)
    }

    const source = context.createBufferSource()

    source.buffer = buffer
    source.connect(gain)
    source.start(time ?? context.currentTime)
  }

  setTrackVolume(id: string, volume: number): void {
    const context = this.getContext()
    const gain = this.trackGains.get(id)

    if (!gain) {
      throw new Error(`Could not load track "${id}".`)
    }

    const safeVolume = Math.min(1, Math.max(0, volume))

    gain.gain.cancelScheduledValues(context.currentTime)
    gain.gain.setTargetAtTime(safeVolume, context.currentTime, 0.01)
  }

  async close(): Promise<void> {
    if (!this.context) return

    await this.context.close()

    this.context = null
    this.masterGain = null
    this.buffers.clear()
    this.trackGains.clear()
  }

  get currentTime(): number {
    return this.getContext().currentTime
  }

  private createTrackGain(id: string): void {
    const existing = this.trackGains.get(id)

    if (existing) return

    const context = this.getContext()
    const gain = context.createGain()

    gain.connect(this.masterGain!)
    this.trackGains.set(id, gain)
  }
}

export const audioEngine = new AudioEngine()
