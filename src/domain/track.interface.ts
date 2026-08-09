export interface Track {
  id: string
  name: string
  sampleUrl: string
  volume: number
  steps: boolean[]
  chokeGroup?: string
}
