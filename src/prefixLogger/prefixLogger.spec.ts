import {prefixLog, prefixLogger} from './prefixLogger';
import {expect} from 'chai';
import * as winston from 'winston';

const mockConsoleLog = (message?: any, ...optionalParams: any[]): string => {
  return message + ' ' + optionalParams.join(' ');
};

describe('prefixLogger', function () {

  // TODO Add tests using winston since the behavior is different than console.log

  it('should prefixLog correctly', function () {
    const loggedMessage = prefixLog('PREFIX')(mockConsoleLog)('Hello world', {a: 'a'});
    expect(loggedMessage).to.be.equal('PREFIX Hello world [object Object]');
  });

  it('should prefixLogger correctly', function () {
    const winstonMock = {
      debug: mockConsoleLog,
      info: mockConsoleLog,
    } as any;
    const prefixedWinstonMock = prefixLogger('PREFIX')(winstonMock);

    expect((prefixedWinstonMock.debug)('Hello world', 1))
      .to.be.equal('PREFIX Hello world 1');

    expect((prefixedWinstonMock.info)('Hello world', [2, 3]))
      .to.be.equal('PREFIX Hello world 2,3');
  });
});
