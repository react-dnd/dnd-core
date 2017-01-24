import expect from 'expect.js';
import { isValidSourceType } from '../src';
import { isValidTargetType } from '../src';

describe('API', () => {
  describe('utils', (done) => {
    it('exposes isValidSourceType', () => {
      expect(isValidSourceType).to.be.a("function");
    });

    it('exposes isValidTargetType', () => {
      expect(isValidTargetType).to.be.a("function");
    });
  });
});

