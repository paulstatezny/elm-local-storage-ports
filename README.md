# Elm LocalStorage Ports

Interface with LocalStorage in Elm.

## Quick Start

### 1. Install via NPM

```
$ npm install --save elm-local-storage-ports
```

### 2. In `elm-package.json`, import [`Ports/LocalStorage.elm`](lib/elm/Ports/LocalStorage.elm)

Add `node_modules/elm-local-storage-ports/lib/elm` to your `source-directories`:

```js
// elm-package.json

{
    // ...

    "source-directories": [
        "../../node_modules/elm-local-storage-ports/lib/elm", // Exact path to node_modules may be different for you
        "./"
    ],

    // ...
}
```

### 3. Use it in your Elm code

```elm
type Msg
  = SaveSearch String
  | RequestLastSearch
  | ReceiveFromLocalStorage (String, Json.Decode.Value)


subscriptions : Model -> Sub Msg
subscriptions model =
  Ports.LocalStorage.storageGetItemResponse ReceiveFromLocalStorage


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    SaveSearch searchQuery ->
      ( model
      , Ports.LocalStorage.storageSetItem ("lastSearch", Json.Encode.string searchQuery)
      )

    RequestLastSearch ->
      (model, Ports.LocalStorage.storageGetItem "lastSearch")

    ReceiveFromLocalStorage ("lastSearch", value) ->
      case JD.decodeValue JD.string value of
        Ok searchQuery ->
          -- Do something with searchQuery
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
