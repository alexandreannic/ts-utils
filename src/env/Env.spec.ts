import {int, required} from './EnvParser';
import {env} from './Env';
import {expect} from 'chai';

process.env.PORT = '3000';
process.env.IS_PRODUCTION = 'true';
process.env.API_TOKEN = 'api:token';

describe('Env', function () {
  it('Should parse an int', function () {
    const port = env(int)('PORT');
    expect(port, 'parse a number').to.eq(3000);
  });

  it('should throw an error when a required variable is not defined', function () {
    try {
      env(required, int)('DB_PORT');
      expect(false, 'should throw an error').to.be.true;
    } catch (e) {
      expect(true).to.be.true;
    }
  });

  it('should throw an error when a required variable is not defined', function () {
    try {
      env(required, int)('DB_PORT');
      expect(false, 'should throw an error').to.be.true;
    } catch (e) {
      expect(true).to.be.true;
    }
  });
});
