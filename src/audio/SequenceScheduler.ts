import type { Track } from '@/domain/track.interface'
import { audioEngine } from './AudioEngine'
import type { ChokeGroup } from '@/domain/choke-groups.enum.ts'

const SCHEDULER_INTERVAL_MS = 25
const AUDIO_LOOKAHEAD_SECONDS = 0.1
const START_DELAY_SECONDS = 0.05

type SchedulerOptions = {
  getTempo: () => number
  getTracks: () => Track[]
  onStep: (step: number) => void
}

interface ScheduledHit {
  trackId: string
  time: number
  chokeGroup: ChokeGroup
  velocity: number
  pitch: number
  decay: number
}

export class SequencerScheduler {
  private timer: ReturnType<typeof setInterval> | null = null
  private nextStep = 0
  private nextStepTime = 0
  private readonly visualTimers = new Set<ReturnType<typeof setTimeout>>()

  private readonly scheduledHits: ScheduledHit[] = []

  constructor(private readonly options: SchedulerOptions) {}

  start(): void {
    if (this.timer) return

    this.nextStep = 0
    this.scheduledHits.length = 0

    const maximumEarlyOffset = this.getMaximumEarlyOffset()
    this.nextStepTime = audioEngine.currentTime + maximumEarlyOffset + START_DELAY_SECONDS

    this.schedule()

    this.timer = setInterval(() => this.schedule(), SCHEDULER_INTERVAL_MS)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    for (const timer of this.visualTimers) {
      clearTimeout(timer)
    }

    this.visualTimers.clear()
    this.nextStep = 0
    this.options.onStep(0)
    this.scheduledHits.length = 0
  }

  private schedule(): void {
    const now = audioEngine.currentTime
    const dispatchUntil = now + AUDIO_LOOKAHEAD_SECONDS
    const maximumEarlyOffset = this.getMaximumEarlyOffset()

    const scheduleUntil = dispatchUntil + maximumEarlyOffset

    this.scheduleHits(scheduleUntil)
    this.dispatchHits(dispatchUntil)
  }

  private scheduleHits(scheduleUntil: number) {
    while (this.nextStepTime < scheduleUntil) {
      this.scheduleHit(this.nextStep, this.nextStepTime)
      this.scheduleVisibleStep(this.nextStep, this.nextStepTime)
      this.advance()
    }
  }

  private dispatchHits(dispatchUntil: number) {
    this.scheduledHits.sort((a, b) => a.time - b.time)

    while (this.scheduledHits.length && this.scheduledHits[0]!.time < dispatchUntil) {
      const hit = this.scheduledHits.shift()!
      audioEngine.playSample(
        hit.trackId,
        hit.time,
        hit.chokeGroup,
        hit.velocity,
        hit.pitch,
        hit.decay,
      )
    }
  }

  private scheduleHit(stepIndex: number, straightTime: number): void {
    for (const track of this.options.getTracks()) {
      const step = track.steps[stepIndex]

      if (!step?.active || !track.sampleUrl) continue

      this.scheduledHits.push({
        trackId: track.id,
        time: this.getTrackHitTime(track, stepIndex, straightTime),
        chokeGroup: track.chokeGroup,
        velocity: step.velocity,
        pitch: track.pitch,
        decay: track.decay,
      })
    }
  }

  private scheduleVisibleStep(stepIndex: number, straightTime: number): void {
    const delay = Math.max(0, (straightTime - audioEngine.currentTime) * 1000)

    const timer = setTimeout(() => {
      this.visualTimers.delete(timer)
      this.options.onStep(stepIndex)
    }, delay)

    this.visualTimers.add(timer)
  }

  get stepDuration(): number {
    return 60 / this.options.getTempo() / 4
  }

  private advance(): void {
    this.nextStep = (this.nextStep + 1) % 16
    this.nextStepTime += this.stepDuration
  }

  private isSwungStep(stepIndex: number, division: 8 | 16): boolean {
    return division === 16 ? stepIndex % 2 === 1 : stepIndex % 4 === 2
  }

  private getSwingOffset(track: Track, stepIndex: number): number {
    if (!this.isSwungStep(stepIndex, track.swingDivision)) {
      return 0
    }

    return this.calculateSwingOffset(track)
  }

  private getTrackHitTime(track: Track, stepIndex: number, straightTime: number): number {
    const swingOffset = this.getSwingOffset(track, stepIndex)
    const trackOffset = this.calculateTrackOffset(track)
    return straightTime + swingOffset + trackOffset
  }

  private calculateSwingOffset(track: Track): number {
    const subdivisionDuration =
      track.swingDivision === 16 ? this.stepDuration : this.stepDuration * 2

    return subdivisionDuration * ((2 * track.swing) / 100 - 1)
  }

  private calculateTrackOffset(track: Track): number {
    return track.offset / 1000
  }

  private getMaximumEarlyOffset(): number {
    let maximumEarlyOffset = 0

    for (const track of this.options.getTracks()) {
      const trackOffset = this.calculateTrackOffset(track)
      const swingOffset = this.calculateSwingOffset(track)

      maximumEarlyOffset = Math.max(maximumEarlyOffset, Math.abs(trackOffset + swingOffset))
    }

    return Math.max(0, maximumEarlyOffset)
  }
}
