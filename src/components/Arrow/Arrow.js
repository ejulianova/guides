const ARROW_SIZE = 10;

// Linear interpolation, used to place bezier control points a fraction of
// the way along the start->end line so the curve departs/arrives smoothly.
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Control points for a vertical curve (top/bottom arrows).
 * dx1 = x1 and dx2 = x2 keep the tangents vertical so the arrowhead
 * arrives perpendicular to the horizontal guide edge.
 */
function verticalAlign(arrow, bottom = false) {
  const { width, distance, target, guideElement } = arrow;

  // Viewport-relative positions
  const targetRect = target.getBoundingClientRect();
  const guideRect = guideElement.getBoundingClientRect();
  const targetCenterX = targetRect.left + targetRect.width / 2;

  // Content width excludes the padding that reserves space for the arrow
  const styles = window.getComputedStyle(guideElement);
  const paddingLeft = parseFloat(styles.paddingLeft) || 0;
  const paddingRight = parseFloat(styles.paddingRight) || 0;
  const contentWidth = guideElement.offsetWidth - paddingLeft - paddingRight;
  const contentStartX = (guideRect.width - contentWidth) / 2;

  // Start: horizontal center of guide content
  const x1 = contentStartX + contentWidth / 2;
  const y1 = bottom ? distance : 0;

  // End: target center X in guide-local coords, clamped within guide width
  const relativeTargetX = targetCenterX - guideRect.left;
  const x2 = Math.max(
    ARROW_SIZE,
    Math.min(relativeTargetX, width - ARROW_SIZE),
  );
  const y2 = bottom ? ARROW_SIZE : distance - ARROW_SIZE;

  const dx1 = x1; // same X as start — vertical departure
  const dy1 = lerp(y1, y2, 0.2);
  const dx2 = x2; // same X as end — vertical arrival
  const dy2 = lerp(y1, y2, 0.7);

  return { x1, y1, x2, y2, dx1, dy1, dx2, dy2 };
}

/**
 * Control points for a horizontal curve (left/right arrows).
 * dy1 = y1 and dy2 = y2 keep the tangents horizontal so the arrowhead
 * arrives perpendicular to the vertical guide edge.
 */
function horizontalAlign(arrow, right = false) {
  const { width, height, distance, target, guideElement } = arrow;

  // Viewport-relative positions
  const targetRect = target.getBoundingClientRect();
  const guideRect = guideElement.getBoundingClientRect();
  const targetCenterY = targetRect.top + targetRect.height / 2;

  // Content height excludes the padding that reserves space for the arrow
  const styles = window.getComputedStyle(guideElement);
  const paddingTop = parseFloat(styles.paddingTop) || 0;
  const paddingBottom = parseFloat(styles.paddingBottom) || 0;
  const contentHeight = guideElement.offsetHeight - paddingTop - paddingBottom;
  const contentStartY = (guideRect.height - contentHeight) / 2;

  // Start: vertical center of guide content
  const x1 = right ? distance : width - distance;
  const y1 = contentStartY + contentHeight / 2;

  // End: target center Y in guide-local coords, clamped within guide height
  const relativeTargetY = targetCenterY - guideRect.top;
  const x2 = right ? ARROW_SIZE : width - ARROW_SIZE;
  const y2 = Math.max(
    ARROW_SIZE,
    Math.min(relativeTargetY, height - ARROW_SIZE),
  );

  const dx1 = lerp(x1, x2, 0.3);
  const dy1 = y1; // same Y as start — horizontal departure
  const dx2 = lerp(x1, x2, 0.7);
  const dy2 = y2; // same Y as end — horizontal arrival

  return { x1, y1, x2, y2, dx1, dy1, dx2, dy2 };
}

class Arrow {
  constructor({
    width,
    height,
    distance,
    position,
    color,
    target,
    guideElement,
  }) {
    this.width = width;
    this.height = height;
    this.distance = distance;
    this.position = position;
    this.color = color;
    this.target = target;
    this.guideElement = guideElement;
  }

  get path() {
    let coord;

    switch (this.position) {
      case "top":
        coord = verticalAlign(this, false);
        break;
      case "bottom":
        coord = verticalAlign(this, true);
        break;
      case "left":
        coord = horizontalAlign(this, false);
        break;
      default: // "right"
        coord = horizontalAlign(this, true);
        break;
    }

    const { x1, y1, x2, y2, dx1, dy1, dx2, dy2 } = coord;
    // SVG cubic Bézier: M = start, C = curve with two control points
    return `M${x1},${y1} C${dx1},${dy1},${dx2},${dy2},${x2},${y2}`;
  }

  get element() {
    const { width, distance, color, path } = this;

    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    element.setAttribute("width", width);
    element.setAttribute("height", distance);
    element.setAttribute("overflow", "visible");

    // orient="auto" rotates the marker to match the curve direction at the endpoint
    element.innerHTML = `
      <defs>
        <marker
          id="arrow"
          markerWidth="13"
          markerHeight="13"
          refX="2"
          refY="6"
          orient="auto">
          <path d="M2,1 L2,${ARROW_SIZE} L${ARROW_SIZE},6 L2,2" style="fill:${color};"></path>
        </marker>
      </defs>
      <path id="line" d="${path}" style="stroke:${color}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>`;
    return element;
  }
}

export default Arrow;
