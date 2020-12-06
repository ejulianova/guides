const ARROW_SIZE = 10;

function getFluctuation() {
  return Math.floor(Math.random() * 20) + 10;
}

function verticalAlign(bottom = false, arrow) {
  const { width, distance, target } = arrow;
  const x1 = width / 2;
  const y1 = bottom ? distance : 0;
  const x2 = Math.max(
    Math.min(
      target.offsetLeft + target.offsetWidth / 2 - target.offsetLeft,
      width - ARROW_SIZE
    ),
    ARROW_SIZE
  );
  const y2 = bottom ? ARROW_SIZE : distance - ARROW_SIZE;
  const dx1 = Math.max(
    0,
    Math.min(Math.abs(2 * x1 - x2) / 3, width) + getFluctuation()
  );
  const dy1 = bottom
    ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3) / 4)
    : Math.max(0, y1 + (Math.abs(y1 - y2) * 3) / 4);
  const dx2 = Math.max(
    0,
    Math.min(Math.abs(x1 - x2 * 3) / 2, width) - getFluctuation()
  );
  const dy2 = bottom
    ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3) / 4)
    : Math.max(0, y1 + (Math.abs(y1 - y2) * 3) / 4);
  return { x1, y1, x2, y2, dx1, dy1, dx2, dy2 };
}

function horizontalAlign(right = false, arrow) {
  const { width, height, distance, target } = arrow;
  const x1 = right ? distance : width - distance;
  const y1 = height / 2;
  const x2 = right ? ARROW_SIZE : width - ARROW_SIZE;
  const y2 = Math.max(
    Math.min(
      target.offsetTop + target.offsetHeight / 2 - target.offsetTop,
      height - ARROW_SIZE
    ),
    ARROW_SIZE
  );
  const dx1 = right
    ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3) / 4)
    : Math.max(0, x1 + (Math.abs(x1 - x2) * 3) / 4);
  const dy1 = Math.max(
    0,
    Math.min(Math.abs(2 * y1 - y2) / 3, height) + getFluctuation()
  );
  const dx2 = right
    ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3) / 4)
    : Math.max(0, x1 + (Math.abs(x1 - x2) * 3) / 4);
  const dy2 = Math.max(
    0,
    Math.min(Math.abs(y1 - y2 * 3) / 2, height) + getFluctuation()
  );
  return { x1, y1, x2, y2, dx1, dy1, dx2, dy2 };
}

class Arrow {
  constructor({ width, height, distance, position, color, target }) {
    this.width = width;
    this.height = height;
    this.distance = distance;
    this.position = position;
    this.color = color;
    this.target = target;
  }

  get path() {
    let coord;

    switch (this.position) {
      case 'top':
        coord = verticalAlign(false, this);
        break;
      case 'bottom':
        coord = verticalAlign(true, this);
        break;
      case 'left':
        coord = horizontalAlign(false, this);
        break;
      default:
        coord = horizontalAlign(true, this);
        break;
    }

    const { x1, y1, x2, y2, dx1, dy1, dx2, dy2 } = coord;

    return `M${x1},${y1} C${dx1},${dy1},${dx2},${dy2},${x2},${y2}`;
  }

  get element() {
    const { width, distance, color, path } = this;
    // Mx1,y1, Cdx1,dy1,dx2,dy2,x2,y2
    // (x1,y1) - start point
    // (dx1,dy1) - curve control point 1
    // (dx2,dy2) - curve control point 2
    // (x2,y2) - end point
    const element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    element.setAttribute('width', width);
    element.setAttribute('height', distance);
    element.innerHTML = `
      <defs>
        <marker id="arrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">
          <path d="M2,1 L2,${ARROW_SIZE} L${ARROW_SIZE},6 L2,2" style="fill:${color};"></path>
        </marker>
      </defs>
      <path id="line" d="${path}" style="stroke:${color}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>`;
    return element;
  }
}

export default Arrow;
