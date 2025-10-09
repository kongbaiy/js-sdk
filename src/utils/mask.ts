export class Mask {
    private task: { callback: (resolve: any, index: number) => void }[] = [];
    private selectors: string[] = [];
    private opacity: number = 0.3;
    private elementIndex: number = 0;

    constructor( selectors: string[], opacity: number = 0.3) {
        this.selectors = selectors;
        this.opacity = opacity;
    }

    start() {
        this.task.reduce(async (pre, cur, index) => {
            await pre;
            await new Promise((resolve) => {
                cur.callback(resolve, index);
            });
            this.close();
        }, Promise.resolve());
    }

    process(handle: (resolve: any, index: number, element: Element) => void) {
        this.task.push({
            callback: (resolve, index) => {
                this.elementIndex = index;
                this.open();
                handle(resolve, index, document.querySelector(this.selectors[index])!);
            }
        });

        return this;
    }

    open(element?: Element) {
        if (element?.nodeType === Node.ELEMENT_NODE) this.selectors.push(element as any);

        const currentElement = document.querySelector(this.selectors[this.elementIndex]) as HTMLElement;
        if (!currentElement) return

        currentElement.style.position = 'relative';
        currentElement.style.boxShadow = `1px 1px 0 100vw rgba(0, 0, 0, ${this.opacity})`;
    }

    close() {
        const currentElement = document.querySelector(this.selectors[this.elementIndex]) as HTMLElement;

        currentElement.style.removeProperty('position');
        currentElement.style.removeProperty('box-shadow');
    }
}
