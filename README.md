# Elm LocalStorage Ports

Interface with LocalStorage in Elm.

## Quick Start

### 1. Copy [`LocalStorage.elm`](src/LocalStorage.elm) into your Elm project

```
$ npm install -g elm-local-storage-ports
$ cd /path/to/elm/project
$ elm-local-storage-ports init
```

You will be asked,

```
Are you inside one of the "source-directories" from your project's elm-package.json? (y/n)
```

Type `y` and `elm-local-storage-ports` will create all of the necessary Elm files.

**Note:** `elm-local-storage-ports init` must be run from a directory in the `"source-directories\"` array in your project's `elm-package.json`. The above commands assume that `/path/to/elm/project` is the path containing `elm-package.json`, and that you have not modified `"source-directories"`.

### 2. Use it in your Elm code

#### Example

```elm
module MyElmApp.App exposing (main)


import Json.Decode as JD
import Ports.LocalStorage as LocalStorage


type Msg
  = SaveToLocalStorage String
  | LoadFromStorage
  | ReceiveFromLocalStorage (LocalStorage.Key, LocalStorage.Value)


type alias Model =
  { favoriteFruit : String }

  -- ...

subscriptions : Model -> Sub Msg
subscriptions model =
  LocalStorage.storageGetItemResponse ReceiveFromLocalStorage

-- ...

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    SaveToLocalStorage fruit ->
      ( { model | favoriteFruit = fruit }
      , LocalStorage.storageSetItem ("favoriteFruit", fruit)
      )

    LoadFromStorage ->
      (model, LocalStorage.storageGetItem "favoriteFruit")

    ReceiveFromLocalStorage ("favoriteFruit", value) ->
      case JD.decodeValue JD.string value of
        Ok fruit ->
          { model | favoriteFruit = fruit } ! []

        Err _ ->
          model ! []

-- ...
```

### 3. Register your Elm app in JavaScript

```javascript
var node = document.getElementById("my-elm-app-container");
var myElmApp = Elm.MyElmApp.embed(node);
var localStoragePorts = require("elm-local-storage-ports");

localStoragePorts.register(myElmApp.ports);
```

## API Reference

[View the full API reference here.](./API.md)

## Questions or Problems?

Feel free to create an issue in the [GitHub issue tracker](https://github.com/knledg/elm-local-storage-ports/issues).
