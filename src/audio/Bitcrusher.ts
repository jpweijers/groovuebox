type AudioWorkletInputs = Float32Array[][]
type AudioWorkletOutputs = Float32Array[][]
type AudioWorkletParameters = Record<string, Float32Array>

declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort
}

declare function registerProcessor(name: string, processor: typeof AudioWorkletProcessor): void

class Bitcrusher extends AudioWorkletProcessor {
  static readonly parameterDescriptors = [
    {
      name: 'bitDepth',
      defaultValue: 16,
      minValue: 1,
      maxValue: 16,
      automationRate: 'k-rate',
    },
    {
      name: 'sampleRateReduction',
      defaultValue: 1,
      minValue: 1,
      maxValue: 32,
      automationRate: 'k-rate',
    },
  ] as const

  private phase = 0
  private readonly heldSamples: number[] = []

  process(
    inputs: AudioWorkletInputs,
    outputs: AudioWorkletOutputs,
    parameters: AudioWorkletParameters,
  ): boolean {
    const input = inputs[0]
    const output = outputs[0]
    const firstOutputChannel = output?.[0]

    if (!input || !output || !firstOutputChannel) {
      return true
    }

    const bitDepth = Math.round(parameters.bitDepth?.[0] ?? 16)
    const reduction = Math.round(parameters.sampleRateReduction?.[0] ?? 1)
    const levels = 2 ** (bitDepth - 1)

    for (let frame = 0; frame < firstOutputChannel.length; frame++) {
      for (let channel = 0; channel < output.length; channel++) {
        const outputChannel = output[channel]
        const inputChannel = input[channel] ?? input[0]

        if (!outputChannel) continue

        if (!inputChannel) {
          outputChannel[frame] = 0
          continue
        }

        if (this.phase === 0) {
          const sample = Math.min(1, Math.max(-1, inputChannel[frame] ?? 0))
          this.heldSamples[channel] = Math.round(sample * levels) / levels
        }

        outputChannel[frame] = this.heldSamples[channel] ?? 0
      }

      this.phase = (this.phase + 1) % reduction
    }

    return true
  }
}

registerProcessor('bitcrusher', Bitcrusher)
