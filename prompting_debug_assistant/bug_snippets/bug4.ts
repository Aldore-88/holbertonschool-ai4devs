// Split a list into pages and compute a moving average of daily temperatures.

function paginate<T>(items: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let start = 0; start < items.length - 1; start += pageSize) {
    pages.push(items.slice(start, start + pageSize));
  }
  return pages;
}

function movingAverage(values: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i <= values.length - windowSize + 1; i++) {
    let sum = 0;
    for (let j = i; j <= i + windowSize; j++) {
      sum += values[j];
    }
    result.push(sum / windowSize);
  }
  return result;
}

const users: string[] = ["ana", "ben", "cal", "dee", "eli", "fay", "gus"];
console.log(paginate(users, 3));

const temps: number[] = [20, 22, 21, 25, 24, 23];
console.log(movingAverage(temps, 3));
