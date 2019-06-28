import {expect} from 'chai';
import {logObject} from './LogObject';

const conf = {
  server: {
    host: 'mediarithmics.com',
    port: 22,
    database: {
      name: 'hubit',
      password: 'hubit',
      tables: {
        user: true,
        profile: false,
      }
    },
    policy: 1,
  },
  client: {
    apiKey: 'kpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeajkpioegjioeajgioeaj'
  }
};

const trim = (str: string) => str.replace(/\s/g, '');

describe('getMissingPropertiesDeep', function () {
  it('should correctly print nested object', function () {
    let res = '';
    const expectedRes = `- server:
  - host: mediarithmics.com
  - port: 22
  - database:
    - name: hubit
    - password: hubit
    - tables:
      - user: true
      - profile: false
  - policy: 1
- client:
  - apiKey: kpioegjioeajgioeajkp...
    `;

    logObject(conf, {
      truncate: 20,
      log: (msg: string) => res += msg
    });

    expect(trim(res)).to.be.equal(trim(expectedRes));
  });

  it('should correctly print nested object with hidden properties', function () {
    let res = '';
    const expectedRes = `- server:
  - host: mediarithmics.com
  - port: 22
  - database: <hidden>
  - policy: 1
- client:
  - apiKey: <hidden>
    `;

    logObject(conf, {
      truncate: 20,
      hiddenKeys: ['server.database', 'client.apiKey'],
      log: (msg: string) => res += msg
    });

    expect(trim(res)).to.be.equal(trim(expectedRes));
  });
});
