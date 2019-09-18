import {mapFor, multipleFilters} from './Common';
import {expect} from 'chai';

describe('mapFor', function () {
  it('should create an array 0..20', function () {
    const generatedArray = mapFor(20, i => i);
    expect(generatedArray.length).to.equal(20);
    expect(generatedArray[10]).to.be.equal(10);
  });
});

describe('multipleFilters', function () {
  it('should return the original array when there is not filters', function () {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const filteredData = multipleFilters()(data);
    expect(data).to.be.deep.equal(filteredData);
  });

  it('should works with multiple filters', function () {
    const data: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const filteredData = multipleFilters(
      (x: number) => x % 2 === 0,
      (x: number) => x > 5,
    )(data);
    expect(filteredData).to.be.deep.equal([6, 8, 10]);
  });

  it('should works when filters are added conditionally', function () {
    const data: string[] = ['aaa', 'bbb', 'ab', 'ba', 'c'];
    const filterA = true;
    const filterC = false;
    const filteredData = multipleFilters<string>(
      filterA && ((x: string) => x.indexOf('a') === -1),
      filterC && ((x: string) => x.indexOf('c') === -1),
    )(data);
    expect(filteredData).to.be.deep.equal(['bbb', 'c']);
  });
});
