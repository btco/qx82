# QX82
QX82 is a tiny Javascript engine that lets you create games and experiences inspired by the look and feel of a retro 80s computer. It's not an emulator or a fantasy console: it's just a Javascript library. It's free and open source.

For more information, check out the
[QX82 site](https://btco.github.io/qx82).

![Screenshot 0](https://btco.github.io/qx82/images/screenshot2.webp)

## How To Use

See the [How-To section](https://btco.github.io/qx82/howto.html) and
the [API reference](https://btco.github.io/qx82/reference.html) in the QX82 website.

## Why no Typescript? Why no build system?

For this project, I really want to keep things simple - plain Javascript, just edit
in a text editor and run it on your browser: no compilation, no type safety,
no frameworks, no unit tests, no overthinking.

If you want to do something more complicated, you're of course welcome to adapt it to your
build or deployment system in your separate fork of this repo that I'll be happy to link to,
but please don't send pull requests introducing build systems, Typescript, frameworks, etc, into this repo.

## Special Thanks
(In reverse cron order)

* [HoofedEar](https://github.com/HoofedEar) for implementing multiline support in the `readLine` function
* [Alfonso Saavedra](https://github.com/son-link) for tweaks to the sound effects API and the example-sounds sample.
* [Lena Trauman](https://mastodon.gamedev.place/@lenatrauman@merveilles.town) for editing colmar.png, reducing dithering and giving it a much cleaner look.
* [Roberto](https://twitter.com/altavox) for helping debug and fix a canvas scaling issue on some devices.
