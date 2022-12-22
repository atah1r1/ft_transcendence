export default class Queue<T> {
  data: T[] = [];

  push(val: T) {
    this.data.push(val);
  }

  pop(): T | undefined {
    return this.data.shift();
  }

  peek(): T | undefined {
    return this.data[0];
  }

  contains(val: T): boolean {
    return this.data.includes(val);
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  size(): number {
    return this.data.length;
  }

  remove(val: T): boolean {
    const index = this.data.indexOf(val);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    return false;
  }

  clear() {
    this.data = [];
  }
}
