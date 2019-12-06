const RealDate = Date;

export function mockDate(isoDate) {
  // @ts-ignore Type 'typeof Date' is not assignable to type 'DateConstructor'
  global.Date = class extends RealDate {
    constructor(...date) {
      // @ts-ignore Expected 0-7 arguments, but got 0 or more.ts(2556)
      super(...date);
      // @ts-ignore Expected 0-7 arguments, but got 0 or more.ts(2556)
      return date.length ? new RealDate(...date) : new RealDate(isoDate);
    }

    static now() {
      return new RealDate(isoDate).valueOf();
    }
  };
}

export function clearMockDate() {
  global.Date = RealDate;
}
