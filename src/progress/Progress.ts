import {performance} from 'perf_hooks';
import {toPercent} from '..';
import {duration} from '../duration/Duration';

export class Progress {

  constructor(private totalLines: number, public t0 = performance.now()) {
  }

  readonly snapshot = (lines: number) => {
    const timeElapsed = performance.now() - this.t0;
    const percent = this.getPercent(lines);
    const remainingTime = timeElapsed * (100 / percent) - timeElapsed;
    const linesPerSecond = lines / duration(timeElapsed).toSeconds;
    return {
      percent: toPercent(percent),
      remainingTime: duration(remainingTime),
      linesPerSecond: linesPerSecond,
    };
  };

  private readonly getPercent = (lines: number) => {
    return lines / this.totalLines * 100;
  };
}
