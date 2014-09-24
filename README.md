guides.js
======
Guides.js is a lightweight javascript library for making guided webside tours. It finds the element you want to highlight, creates a guide element using the html you specified in the configuration options and connects the guide and the highlighted element with an svg arrow.

#Getting started

Once you have downloaded the source, simply include guides.css in the head of your document:

```html
<head>
	...
	<link rel="stylesheet" type="text/css" href="guides.css" >
</head>
```

and guides.js to your scripts section. Make sure you include it after jquery:

```html
	...
	<script type="text/javascript" src="jquery.js" >
	<script type="text/javascript" src="guides.js" >
</body>
```

Note that you can import guides.scss and compile togerther with your websitse stylesheet if you are using sass.

#Docs

##Dependencies

Guides.js depends on jquery, so you need to make sure you include jquery first.

##Initialization

Guides.js is a jquery plugin so it can be initialized on an element, that will "trigger" the guided tour:

```javascript
$('#'demo'').guides({
	tips: tips
});
```
Now the tour will start everytime $('#'demo'') element is clicked.

##Configuration options

The default options are as follows:

```javascript
{
	distance: 100,
	color: '#fffff',
	guides: []
}
```

* __distance__ _number_ - distance between the guide text and the element that it is related to.
* __color__ _string_ - the guides arrows and text default color
* __guides__ _array of objects_ - the list of guides

###The guides array

A guide object looks like this:

```javascript
{
	element: $('.navbar-brand'),
	html: 'Welcome to Guides.js',
	color: '#fff'
}
```

* __element__ (required) _jquery element_ -  the element you want to highlight
* __html__ (required) _string_ - this is the content of the tip: you can enter plain text or markup
* __color__ (required) _string_ - he guide arrow and text color (falls back to the default color if not specified)

##Methods

* __start__ $('#'demo'').guides("start");
* __end__ $('#'demo'').guides("end");
* __next__ $('#'demo'').guides("next");
* __prev__ $('#'demo'').guides("prev");
* __destroy__ $('#'demo'').guides("destroy");
* __setOptions__ $('#'demo'').guides("setOptions", options);

##Events

* __start__ $('#'demo'').guides({start: onStartFunction});
* __end__ $('#'demo'').guides({end: onStartFunction});
* __next__ $('#'demo'').guides({next: onNextFunction});
* __prev__ $('#'demo'').guides({prev: onPrevFunction});
* __destroy__ $('#'demo'').guides({destroy: onDestroyFunction});
