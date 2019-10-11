import {performance} from 'perf_hooks';
import {toPercent} from '..';
import {duration} from '../duration/Duration';

export class Progress {

  constructor(private totalLines: number, public t0 = performance.now()) {
  }

  readonly snapshot = (lines: number) => {
    const elapsedTime = performance.now() - this.t0;
    const percent = this.getPercent(lines);
    const remainingTime = elapsedTime * (100 / percent) - elapsedTime;
    const linesPerSecond = lines / duration(elapsedTime).toSeconds;
    return {
      percent,
      elapsedTime: duration(elapsedTime),
      remainingTime: duration(remainingTime),
      linesPerSecond: linesPerSecond,
    };
  };

  private readonly getPercent = (lines: number) => {
    return lines / this.totalLines * 100;
  };
}
