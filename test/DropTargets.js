export class NormalTarget {
  drop() {
    return {
      foo: 'bar'
    };
  }
};

export class TargetWithNoDropResult {
  drop() {
  }
};
