import {Progress} from './Progress';
import {expect} from 'chai';

describe('progress', function () {

  it('should works', function (done) {
    // TODO Test is not automated
    const p = new Progress(1000);
    setTimeout(() => {
      const t = p.snapshot(200);
      expect(t.elapsedTime.toSeconds).to.eq(2);
      expect(t.remainingTime.toSeconds).to.eq(8);
      expect(t.percent).to.eq(20);
      expect(t.linesPerSecond).to.eq(100);
      done();
    }, 2000);
  });
});
