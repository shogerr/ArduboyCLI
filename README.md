# arduboy
This is a general utility for the [Arduboy](https://arduboy.com). The module is currently in
development.

## Requirements

This module requires that _Imagemagick_ and _GraphicsMagick_ are installed.

### Linux

~~~~~~~~
apt-get install imagemagick graphicsmagick
~~~~~~~~

### Windows

Install the Windows releases for each library.

**ImageMagick**
http://www.imagemagick.org/script/binary-releases.php#windows

**GraphicsMagick**
https://sourceforge.net/projects/graphicsmagick/files/graphicsmagick/

## Install

It is possible to install from the npm registry, or by using git.

### Using `npm`
The Arduboy `node` module can be installed using `npm`.

```
npm install arduboy -g
```

### Current Source Using `git`

This will locally install the current development build of the `arduboy` module.

```
npm install git+https://git@github.com/rogosher/ArduboyCLI.git
```

Or use `npm link` from the project directory after cloning the project.

## Use

From the command line, use the `arduboy` command.

### Commands

- help
- config
- image

### Examples

#### `image`

Use `arduboy help image` to get details and a full list of commands.

##### `test`
To generate a series of test images run,

~~~~~~~~
arduboy image test
~~~~~~~~

##### `test`
To generate a series of test images run,

~~~~~~~~
arduboy tobytes --input=./a-file.png > source_file.c
~~~~~~~~

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
