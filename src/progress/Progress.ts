import {performance} from 'perf_hooks';
import {formatPerformance, toPercent} from '..';

export class Progress {

  constructor(private totalLines: number, private t0 = performance.now()) {
  }

  readonly snapshot = (lines: number) => {
    const timeElapsed = performance.now() - this.t0;
    const percent = this.getPercent(lines);
    const remainingTime = timeElapsed * (100 / percent) - timeElapsed;
    const linesPerSecond = lines / timeElapsed * 1000;
    return {
      percent: toPercent(percent),
      remainingTime: formatPerformance(remainingTime),
      linesPerSecond: linesPerSecond,
    };
  };

  private readonly getPercent = (lines: number) => {
    return lines / this.totalLines * 100;
  };
}
