export function fastMapJoin<T>(items: T[] | IterableIterator<T>, render: (item: T, i?: number) => string): string {
  let result = "";
  let index = 0;  

  for(let item of items) {
    result += render(item, index);
    index = index + 1;
  }

  return result;
}
