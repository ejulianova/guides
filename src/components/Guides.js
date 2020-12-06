import Guide from './Guide';

const DEFAULTS = {
  distance: 100,
  color: '#fff',
  className: '',
  guides: [],
};

const KEYS = {
  ESC: 27,
  SPACE: 32,
  BACKPACE: 8,
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39,
};

function renderCanvas() {
  const canvas = document.createElement('div');
  canvas.className = 'guides-canvas guides-fade-in';
  canvas.innerHTML =
    '<div class="guides-overlay"></div><div class="guides-mask"></div>';
  document.body.appendChild(canvas);
  return canvas;
}

class Guides {
  constructor(options) {
    this.options = { ...DEFAULTS, ...options };
    this.current = 0;
    this.inProgress = false;
    this.onClick = this.onClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  start() {
    if (!this.inProgress) {
      this.current = 0;
      this.canvas = renderCanvas();
      this.bind();
      document.body.classList.add('guides-in-progress');
      this.renderGuide(this.options.guides[this.current]);
      this.callback('start');
    }
  }

  renderGuide(guide) {
    if (!guide) {
      //no more guides
      this.end();
      return;
    }

    if (this.currentGuide) {
      this.currentGuide.destroy();
    }

    this.callback('render', guide);

    if (typeof guide.render === 'function') {
      guide.render.apply(this, [guide]);
    }

    this.currentGuide = new Guide(guide, this.canvas, this.options);
  }

  onClick(e) {
    this.next();
  }

  onKeyUp(e) {
    switch (e.which) {
      case KEYS.ESC:
        this.end();
        break;
      case KEYS.RIGHT_ARROW:
      case KEYS.SPACE:
        this.next();
        break;
      case KEYS.LEFT_ARROW:
      case KEYS.BACKPACE:
        e.preventDefault();
        this.prev();
        break;
      default:
        break;
    }
  }

  bind() {
    this.canvas.addEventListener('click', this.onClick);
    document.body.addEventListener('keyup', this.onKeyUp);
  }

  unbind() {
    this.canvas && this.canvasremoveEventListener('click', this.onClick);
    document.body.removeEventListener('keyup', this.onKeyUp);
  }

  next() {
    this.renderGuide(this.options.guides[++this.current]);
    this.callback('next');
  }

  prev() {
    if (!this.current) {
      return;
    }
    this.renderGuide(this.options.guides[--this.current]);
    this.callback('prev');
  }

  end() {
    if (this.canvas) {
      document.body.removeChild(this.canvas);
      document.body.classList.add('guides-in-progress');
      this.canvas = null;
    }
    if (this.currentGuide) {
      this.currentGuide.destroy();
      this.currentGuide = null;
    }
    this.callback('end');
  }

  callback(eventName, guide = this.currentGuide && this.currentGuide.guide) {
    const callback = this.options[eventName];
    const eventObject = { sender: this, guide };

    if (typeof callback === 'function') {
      callback.apply(this, [eventObject]);
    }
  }

  destroy() {
    this.end();
    this.unbind();
    return this;
  }
}

export default Guides;
