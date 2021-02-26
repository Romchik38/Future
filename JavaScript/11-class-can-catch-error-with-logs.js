'use strict';

let execCount = 0;  //только для логирования

class Future {
  constructor(executor) {
    console.log('Создается новый F');
    execCount++;  //только для логирования
    const executorBody = executor.toString(); //только для логирования
    console.log({ execCount, executorBody }); //только для логирования
    this.number = execCount;
    this.executor = executor;
  }

  static of(err, value) {
    const errMessage = err ? err.message : undefined; //только для логирования
    console.log('Вызывается of', { errMessage, value }); //только для логирования
    return new Future((resolve, reject) =>
      (err ? reject(err) : resolve(value)));
  }

  chain(fn) {
    console.log('Вызывается chain, номер F:', this.number);
    return new Future((resolve, reject) => {
      this.fork(
        value => {
          const resolveBody = resolve.toString();
          console.log('Вызывается resolve, номер F:', this.number, { value }, { resolveBody }); //только для логирования
          return fn(value).fork(resolve, reject);
        },
        error => {
          const rejectBody = reject.toString();
          console.log('Вызывается reject, номер F:', this.number, error.message, { rejectBody });  //только для логирования
          reject(error);
        }
      );
    });
  }

  map(fn) {
    console.log('Вызывается map, номер F:', this.number);  //только для логирования
    return this.chain((value, res) => ((res = fn(value)) instanceof Error ?
      Future.of(res) :
      Future.of(null, res)
    ));
  }

  fork(successed, failed) {
    console.log('Вызывается fork, номер F:', this.number);   //только для логирования
    this.executor(successed, failed);
  }
}

// Usage
const start = 6;

console.log('=========СТАРТ ');
console.log('В новый F кладется ', start);
console.log('1й map - печатает x');
console.log('2й map - увеличивает x на 1');
console.log(`3й map - возводит x в степень 3. Если передана 6, то число будет
  343 и возвратиться ошибка`);
console.log('4й map - увеличивает x на 2');
console.log('после этого происходит fork');
console.log('---------------------------');

Future.of(null, start)
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
  .map(x => x + 2)
  .map(x => x + 2)
  .map(x => x + 2)
  .map(x => x + 2)
  .fork(
    value => {
      console.log('future result', value);
    },
    error => {
      console.log('future failed', error.message);
    }
  );
