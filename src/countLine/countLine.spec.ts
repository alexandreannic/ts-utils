import {countLines, countLinesSync} from './countLine';
import {expect} from 'chai';

describe('countLine', function () {

  it('should return the correct number', async function () {
    const count = await countLines(__dirname + '/countLine.fixture.json');
    expect(count).to.be.equal(23);
  });

  it('should throw an error', function (done) {
    countLines('/unexistingfile.void').catch(e => {
      expect(e).to.be.an('Error');
      done();
    })
  });
});

describe('countLineSync', function () {

  it('should return the correct number', function () {
    const count = countLinesSync(__dirname + '/countLine.fixture.json');
    expect(count).to.be.equal(23);
  });

  it('should throw an error', function () {
    expect(() => countLinesSync('/unexistingfile.void')).to.throw();
  });
});
