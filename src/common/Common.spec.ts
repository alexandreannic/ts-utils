import { mapFor } from './Common';
import { expect } from 'chai';

describe('mapFor', function () {
  it('should create an array 0..20', function () {
    const generatedArray = mapFor(20, i => i);
    expect(generatedArray.length).to.equal(20);
    expect(generatedArray[10]).to.be.equal(10);
  });
});
