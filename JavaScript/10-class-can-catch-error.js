'use strict';

class Future {
  constructor(executor) {
    this.executor = executor;
  }

  static of(err, value) {
    return new Future((resolve, reject) =>
      (err ? reject(err) : resolve(value)));
  }

  chain(fn) {
    return new Future((resolve, reject) => this.fork(
      value => fn(value).fork(resolve, reject),
      error => reject(error)
    ));
  }

  map(fn) {
    return this.chain((value, res) => ((res = fn(value)) instanceof Error ?
      Future.of(res) :
      Future.of(null, res)
    ));
  }

  fork(successed, failed) {
    this.executor(successed, failed);
  }
}

// Usage

Future.of(null, 6)
  .map(x => {
    console.log('future1 started');
    return x;
  })
  .map(x => ++x)
  .map(x => {
    const res = x ** 3;
    if (res === 343) return new Error('number not allowed');
    else {
      return res;
    }
  })
  .map(x => x + 2)
  .fork(
    value => {
      console.log('future result', value);
    },
    error => {
      console.log('future failed', error.message);
    }
  );
