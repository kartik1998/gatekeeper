export default class Queue {
    private elements: Array<any>;

    constructor() {
        this.elements = [];
    }

    public enqueue(element: any): void {
        this.elements.push(element);
    }

    public dequeue(): any {
        if (this.isEmpty()) return null;
        return this.elements.shift();
    }

    public peek(): any {
        if (this.isEmpty()) return null;
        return this.elements[0];
    }

    public isEmpty(): boolean {
        return this.elements.length === 0;
    }
}