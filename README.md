# guides.js

Guides.js is a lightweight javascript library for guided website tours. It finds the element you want to highlight, creates a "tip" using the html you specified pointing to the highlighted element.

## Demo

[http://ejulianova.github.io/guides/](http://ejulianova.github.io/guides/)

## Installaton

```shell
npm i guides
```

## Usage

```javascript
import Guides from 'guides';

const tour = new Guides({
  color: 'white',
  distance: 100,
  guides: [
    {
      html: 'Welcome to Guides.js',
    },
    {
      element: document.querySelector('.navbar'),
      html: 'Navigate through guides.js website',
    },
    {
      element: document.querySelector('#demo'),
      html: 'See how it works',
    },
    {
      element: document.querySelector('#download'),
      html: 'Download guides.js',
    },
    {
      element: document.querySelector('#installation'),
      html: 'Check out how to get started with guides.js',
    },
    {
      element: document.querySelector('#docs'),
      html: 'Read the docs',
    },
  ],
  render: (event) => console.log(event),
  start: (event) => console.log(event),
  end: (event) => console.log(event),
  next: (event) => console.log(event),
  prev: (event) => console.log(event),
});

document.querySelectorAll('.demo').forEach((button) => {
  button.addEventListener('click', () => tour.start());
});
```

Now the tour will start everytime any of the `.demo` buttons are clicked.

## Configuration

| option     |          | type     | default | description                                                              |
| ---------- | -------- | -------- | ------- | ------------------------------------------------------------------------ |
| `guides`   | required | array    |         | list of guides                                                           |
| `distance` | optional | number   | 100     | distance between the tip and the highlighted element                     |
| `color`    | optional | string   | #fff    | arrows and text color                                                    |
| `start`    | optional | function |         | a callback function that is called when the tour starts                  |
| `end`      | optional | function |         | a callback function that is called when the tour ends                    |
| `next`     | optional | function |         | a callback function that is called after moving forward to the next tip  |
| `prev`     | optional | function |         | a callback function that is called after moving back to the previous tip |
| `render`   | optional | function |         | a callback function that is called before guide is rendered              |

For each guide in the guides array you can specify the following options

| Option Name | Type     | Description                                                              |
| ----------- | -------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `html`      | required | string                                                                   | the tip's content - either plain text or markup              |
| `element`   | optional | DOM node the element to highlight; if omitted the guide will be centered |
| `color`     | optional | string                                                                   | arrows and text color; if omitted the global one will be use |

## Methods

| Method  | Name                      | Description |
| ------- | ------------------------- | ----------- |
| `start` | starts the guided tour    |
| `end`   | exits the guided tour     |
| `next`  | moves to the next tip     |
| `prev`  | moves to the previous tip |
