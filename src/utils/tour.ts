
type TourPlaceholder = {
    title: string;
    text: string;
    next: string;
}
export class Tour {
    private selectors: any[] = [];
    private elementIndex: number = 0;
    private tourTargetElement: HTMLElement | null = null;
    private tourElement: HTMLElement | null = null;
    private tourElementContentTemplate: string = `
        <style>
            .tour-content-title {
                font-size: 16px;
                font-weight: 500;
            }

            .tour-buttons {
                display: flex;
                justify-content: end;
                margin-top: 14px;
            }

            .tour-prev, .tour-next {
                padding: 4px;
                min-width: 40px;
                text-align: center;
                border: 1px solid #000;
                border-radius: 4px;
                cursor: pointer;
            }

            .tour-next {
                margin-left: 6px;
            }
        </style>
        <div class="tour-content">
            <p class="tour-content-title">
                <$title>
            </p>
            <p class="tour-content-text">
                <$text>
            </p>
        </div>
        <div class="tour-buttons">
            <div class="tour-prev">prev</div>
            <div class="tour-next"><$next></div>
        </div>
    `
    private placeholder: TourPlaceholder = {
        title: '<$title>',
        text: '<$text>',
        next: '<$next>',
    }

    private config = {
       prev: '.tour-prev',
       next: '.tour-next',
       nextText: 'next',
       closeText: 'close',
    }

    constructor(selectors: string[]) {
        this.selectors = selectors;
        this.tourTargetElement = document.createElement('div');
        this.tourElement = document.createElement('div');
    }

    setPlaceholder(placeholder: TourPlaceholder) {
        this.placeholder = placeholder;
    }

    setContentTemplate(template: string) {
        this.tourElementContentTemplate = template;
    }

    setConfig(config: Partial<typeof this.config>) {
        this.config = { ...this.config, ...config };
    }

    start() {
        const elementName = this.selectors[this.elementIndex].el;
        const element = document.querySelector(elementName);

        if (element instanceof HTMLElement) this.layout(element);
    }

    layout(element: HTMLElement) {
        const rect = element?.getBoundingClientRect();
        const tourTargetElement = this.tourTargetElement;
        const tourElement = this.tourElement;
        
        if (!tourTargetElement || !tourElement) return;

        tourTargetElement.style.padding = '4px';
        tourTargetElement.style.position = 'fixed';
        tourTargetElement.style.top = `${rect?.top - 4}px`;
        tourTargetElement.style.left = `${rect?.left - 4}px`;
        tourTargetElement.style.width = `${rect?.width}px`;
        tourTargetElement.style.height = `${rect?.height}px`;
        tourTargetElement.style.zIndex = '60';
        tourTargetElement.style.boxShadow = `1px 1px 0 1000vw rgba(0, 0, 0, 0.3)`;

        document.body.appendChild(tourTargetElement);

        tourElement.style.padding = '16px';
        tourElement.style.position = 'fixed';
        tourElement.style.width = `200px`;
        tourElement.style.backgroundColor = '#fff';
        tourElement.style.borderRadius = '4px';
        tourElement.style.zIndex = '62';
        tourElement.innerHTML = this.tourElementContentTemplate
        .replace(this.placeholder.title, this.selectors[this.elementIndex].title)
        .replace(this.placeholder.text, this.selectors[this.elementIndex].text)
        .replace(this.placeholder.next, this.elementIndex === this.selectors.length - 1 ? this.config.closeText : this.config.nextText);

        const prevButton = tourElement.querySelector(this.config.prev);
        const nextButton = tourElement.querySelector(this.config.next);

        prevButton?.addEventListener('click', () => {
            this.elementIndex --;

            if (this.elementIndex < 0) this.elementIndex = this.selectors.length - 1;
            this.start();
        });

        nextButton?.addEventListener('click', () => {
            this.elementIndex ++;

            if (this.elementIndex > this.selectors.length - 1) {
                this.elementIndex = 0;
                this.close();
                return;
            }

            this.start();
        });

        document.body.appendChild(tourElement);

        if (rect.bottom + 14 + tourElement.offsetHeight >= document.documentElement.clientHeight) 
            tourElement.style.top = `${rect?.top - tourElement.offsetHeight - 14}px`; 
        else tourElement.style.top = `${rect?.bottom + 14}px`;

        if (rect.left + tourElement.offsetWidth >= document.documentElement.clientWidth) 
            tourElement.style.left = `${rect?.left - tourElement.offsetWidth - 14}px`; 
        else tourElement.style.left = `${rect?.left + 14}px`;
    }

    close() {
        const tourElement = this.tourElement;

        document.body.removeChild(tourElement!);
        document.body.removeChild(this.tourTargetElement!);
    }
}