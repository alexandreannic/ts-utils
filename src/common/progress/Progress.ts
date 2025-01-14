import {duration} from '../duration/Duration'

export class Progress {

  constructor(public totalLines: number, public t0 = new Date().getTime()) {
    this.previoustN = t0
  }

  private previoustN: number
  private previousLines: number = 0

  readonly snapshot = (lines: number) => {
    const percent = lines / this.totalLines * 100
    const tN = new Date().getTime()
    const {
      elapsedTime,
      remainingTime: remainingTimeAvg,
      linesPerSecond: linesPerSecondAvg,
    } = this.getMetrics(0, lines, this.t0, tN)
    const {
      remainingTime,
      linesPerSecond,
    } = this.getMetrics(this.previousLines, lines, this.previoustN, tN)
    this.previoustN = tN
    this.previousLines = lines
    return {
      percent,
      elapsedTime,
      remainingTime,
      remainingTimeAvg,
      linesPerSecond,
      linesPerSecondAvg,
      toString: () => {
        const totalLinesStr = this.totalLines.toLocaleString()
        return `${percent.toFixed(1).padStart(5)}%\t`
          + `${lines.toLocaleString().padStart(totalLinesStr.length)}/${totalLinesStr}\t`
          + `Remaining: ${remainingTimeAvg.toString().padStart(20)}\t`
          + `${linesPerSecondAvg.toFixed(2)} Lines/s`
      }
    }
  }

  private readonly getMetrics = (t0Lines: number, t1Lines: number, t0: number, t1: number) => {
    const linesDone = t1Lines - t0Lines
    const elapsedTime = t1 - t0
    const linesPerSecond = linesDone / duration(elapsedTime).toSeconds
    const remainingTime = linesDone === 0 || elapsedTime === 0 ? Number.POSITIVE_INFINITY : (this.totalLines - t1Lines) / (linesDone / elapsedTime)
    return {
      elapsedTime: duration(elapsedTime),
      remainingTime: duration(remainingTime),
      linesPerSecond,
    }
  }
}
