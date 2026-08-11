import type { Track } from '@/domain/track.interface'
import { audioEngine } from './AudioEngine'

type SchedulerOptions = {
  getTempo: () => number
  getTracks: () => Track[]
  onStep: (step: number) => void
}

export class SequencerScheduler {
  private timer: ReturnType<typeof setInterval> | null = null
  private nextStep = 0
  private nextStepTime = 0
  private readonly visualTimers = new Set<ReturnType<typeof setTimeout>>()

  constructor(private readonly options: SchedulerOptions) {}

  start(): void {
    if (this.timer) return

    this.nextStep = 0
    this.nextStepTime = audioEngine.currentTime + 0.05

    this.schedule()
    this.timer = setInterval(() => this.schedule(), 25)
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
  }

  private schedule(): void {
    const scheduleUntil = audioEngine.currentTime + 0.1

    while (this.nextStepTime < scheduleUntil) {
      this.scheduleStep(this.nextStep, this.nextStepTime)
      this.advance()
    }
  }

  private scheduleStep(step: number, time: number): void {
    for (const track of this.options.getTracks()) {
      if (track.steps[step]!.active && track.sampleUrl) {
        const swungTime = this.getTrackHitTime(track, step, time, this.stepDuration)
        audioEngine.playSample(track.id, swungTime, track.chokeGroup, track.steps[step]!.velocity)
      }
    }

    const delay = Math.max(0, (time - audioEngine.currentTime) * 1000)

    const timer = setTimeout(() => {
      this.visualTimers.delete(timer)
      this.options.onStep(step)
    }, delay)

    this.visualTimers.add(timer)
  }

  get stepDuration(): number {
    return 60 / this.options.getTempo() / 4
  }

  private advance(): void {
    const secondsPerStep = 60 / this.options.getTempo() / 4

    this.nextStep = (this.nextStep + 1) % 16
    this.nextStepTime += secondsPerStep
  }

  private isSwungStep(stepIndex: number, division: 8 | 16): boolean {
    return division === 16 ? stepIndex % 2 === 1 : stepIndex % 4 === 2
  }

  private getSwingOffset(track: Track, stepIndex: number, stepDuration: number): number {
    if (!this.isSwungStep(stepIndex, track.swingDivision)) {
      return 0
    }

    const subdivisionDuration = track.swingDivision === 16 ? stepDuration : stepDuration * 2

    return subdivisionDuration * ((2 * track.swing) / 100 - 1)
  }

  private getTrackHitTime(
    track: Track,
    stepIndex: number,
    straightTime: number,
    stepDuration: number,
  ): number {
    const swingOffset = this.getSwingOffset(track, stepIndex, stepDuration)
    const trackOffset = track.offset / 1000
    return straightTime + swingOffset + trackOffset
  }
}
