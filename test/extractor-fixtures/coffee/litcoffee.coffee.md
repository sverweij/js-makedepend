# Literate coffee script
Is sort of cool, I guess. Here's some stuff to see if js-makedepend can
make chocolate with it.

## Imports
We'll be using precious little of these, just 'path'

    import * as path from "path"

## The Ching class
Here's an _extremely_ simple base class - we'll just export it and later on
it'll be extended to Ka.

    export class Ching
      message = "nothing much"

      constructor: (@message) ->

## The Ka class
It's just dummy stuff, but you can see the potential here

    export class Ka extends Ching
      NAME = "FatalError"

      constructor: (@message) ->
        super message

      usePathForSomething: ->
        path.sep
