import { getElapsedTime } from './ElapsedTime';
import { expect } from 'chai';
import { performance } from 'perf_hooks';

describe('getElapsedTime', function () {
  it('should print 2 sec', function (done) {
    setTimeout(() => {
      expect(getElapsedTime() + '').to.be.equal('0 Hr 0 Min 2 Sec');
      done();
    }, 2000);
  });

  it('should get seconds as the sum of the 2 previous setTimeout', function (done) {
    setTimeout(() => {
      expect(getElapsedTime().getSeconds()).to.be.equal(3);
      done();
    }, 1000);
  });

  it('should get correct amount of hours related to argument', function () {
    expect(getElapsedTime(performance.now() - 1000 * 60 * 60 * 2).getHour()).to.be.equal(2);
  });
});
