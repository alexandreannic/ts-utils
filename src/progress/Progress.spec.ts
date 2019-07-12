import {Progress} from './Progress';

describe('progress', function () {

  it('should works', function (done) {
    // TODO Test is not automated
    const p = new Progress(100);
    setTimeout(() => {
      const t = p.snapshot(1);
      console.log(t.remainingTime.toString(), t.percent, t.linesPerSecond);
      done();
    }, 2000);
  });
});
