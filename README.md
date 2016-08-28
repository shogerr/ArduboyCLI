# Arduboy
This is a general utility for the Arduboy. The module is currently in
development, and will most likely fail. :D

## Requirements
This module requires that _Imagemagick_ and _GraphicMagick_ are installed.

## Install
It is possible to insall from the npm registry, or by using git.

### `npm`
The Arduboy `node` module can be installed using `npm`.

```
npm install arduboy
```

### `git`
This will locally install the current development build of the `arduboy` module.

```
npm install git+https://git@github.com/rogosher/ArduboyCLI.git
```

## Use

From the command line, use the `arduboy` command.

### Commands

- config
- image

### Examples
To generate a test image,
```
arduboy image
```

## Develop

To help develop the Arduboy Node module: fork and clone the project locally.
Use `npm link` in the folder the Arduboy repository is cloned into. You can now
run `arduboy` from the command line interface.

## Links

**Node.js**
https://nodejs.org/en/download/

**ImageMagick**
http://www.imagemagick.org/script/binary-releases.php
**GraphicsMagick**
http://www.graphicsmagick.org/download.html
