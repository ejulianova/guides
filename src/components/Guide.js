import Arrow from './Arrow';

class Guide {
  constructor(guide, container, options) {
    this.guide = guide;
    this.container = container;
    this.options = options;
    this.showHighlight();
    this.guideElement = document.createElement('div');
    this.guideElement.className = this.className;
    this.guideElement.innerHTML = this.content;
    this.render();
  }

  get distance() {
    return this.guide.distance || this.options.distance;
  }

  get color() {
    return this.guide.color || this.options.color;
  }

  get className() {
    const customClassNames =
      this.guide.className || this.options.className || '';
    return `guides-fade-in guides-guide ${customClassNames}`;
  }

  get highlightedElement() {
    return this.guide.element;
  }

  get content() {
    return `<span>${this.guide.html}</span>`;
  }

  showHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.add('guides-current-element');
    }
  }

  hideHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('guides-current-element');
    }
  }

  render() {
    if (this.highlightedElement) {
      this.attachToElement();
      this.container.appendChild(this.guideElement);
      this.renderArrow();
    } else {
      this.center();
    }
    this.scrollIntoView();
  }

  center() {
    this.guideElement.classList.add('guides-center');
    this.container.appendChild(this.guideElement);
  }

  attachToElement() {
    const docWidth = document.body.offsetWidth;
    const docHeight = document.body.offsetHeight;
    const leftSpace = this.highlightedElement.offsetLeft;
    const topSpace = this.highlightedElement.offsetTop;
    const highlightedElementWidth = this.highlightedElement.offsetWidth;
    const highlightedElementHeight = this.highlightedElement.offsetHeight;
    const rightSpace = docWidth - leftSpace - highlightedElementWidth;
    const bottomSpace = docHeight - topSpace - highlightedElementHeight;
    const css = {
      color: this.color,
      top: docHeight / 2 > topSpace ? `${topSpace}px` : 'auto',
      left: docWidth / 2 > leftSpace ? `${leftSpace}px` : 'auto',
      right:
        docWidth / 2 > leftSpace
          ? 'auto'
          : `${docWidth - leftSpace - highlightedElementWidth}px`,
      bottom: docHeight / 2 > topSpace ? 'auto' : `${bottomSpace}px`,
    };

    switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
      case leftSpace:
        this.position = 'left';
        css.paddingRight = `${this.distance}px`;
        css.right = `${docWidth - leftSpace}px`;
        css.left = 'auto';
        break;
      case topSpace:
        this.position = 'top';
        css.paddingBottom = `${this.distance}px`;
        css.bottom = `${docHeight - topSpace}px`;
        css.top = 'auto';
        break;
      case rightSpace:
        this.position = 'right';
        css.paddingLeft = `${this.distance}px`;
        css.left = `${leftSpace + highlightedElementWidth}px`;
        css.right = 'auto';
        break;
      default:
        this.position = 'bottom';
        css.paddingTop = `${this.distance}px`;
        css.top = `${topSpace + highlightedElementHeight}px`;
        css.bottom = 'auto';
        break;
    }
    this.guideElement.classList.add(`guides-${this.position}`);
    Object.entries(css).forEach(([prop, value]) => {
      this.guideElement.style[prop] = value;
    });
  }

  renderArrow() {
    const arrow = new Arrow({
      width: this.guideElement.offsetWidth,
      height: this.guideElement.offsetHeight,
      distance: this.distance,
      position: this.position,
      color: this.color,
      target: this.highlightedElement,
    });
    this.guideElement.appendChild(arrow.element);
  }

  scrollIntoView() {
    this.guideElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  destroy() {
    this.hideHighlight();
    this.guideElement.remove();
  }
}

export default Guide;
