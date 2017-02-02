# Full API Reference

## Commands

### `storageGetItem`

> Retrieve an item from LocalStorage.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    GetCart ->
      (model, LocalStorage.storageGetItem "cart") -- "cart" is the key in local storage
```

Note that you'll have to use the `storageGetItemResponse` Subscription in order to receive the response.

---

### `storageSetItem`

> Set an item from LocalStorage.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage
import Json.Encode as JE


type Msg
  = CacheUserId String


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    CacheUserId userId ->
      ( model
      , LocalStorage.storageSetItem ("userId", JE.string userId)
      )
```

---

### `storageRemoveItem`

> Remove an item from LocalStorage.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage


type Msg
  = LogOut


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    LogOut ->
      ( model
      , LocalStorage.storageRemoveItem ("userId", JE.string userId)
      )
```

---

### `storageClear`

> Clear all items in LocalStorage.

Note that `()` (i.e. "unit", or an empty tuple) must be passed to this port, since all ports must receive some data.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage


type Msg
  = EraseLocalData


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    EraseLocalData ->
      ( model
      , LocalStorage.storageClear ()
      )
```

---

### `storagePushToSet`

> Push a value into a "set" in LocalStorage.

A "set" is analogous to a `Set` in Elm. (It's essentially a List with no duplicate values.)

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage
import Json.Encode as JE


type Msg
  = ViewedItem String


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    ViewedItem itemId ->
      ( model
      , LocalStorage.storagePushToSet ("viewedItems", JE.string itemId)
      )
```

Sets are stored as JSON arrays in LocalStorage, so they can be retrieved as Lists using `storageGetItem`. If an item is pushed to a LocalStorage key that does *not* contain a JSON array, that key will be overwritten with a new array/set.

---

### `storageRemoveFromSet`

> Remove a value from a "set" in LocalStorage.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage
import Json.Encode as JE


type Msg
  = UnFavoriteItem String


update : Msg -> Model -> (Cmd Msg)
update msg model =
  case msg of
    UnFavoriteItem itemId ->
      ( model
      , LocalStorage.storageRemoveFromSet ("favoritedItems", JE.string itemId)
      )
```

## Subscriptions

### `storageGetItemResponse`

> This subscription must be in place in order to receive anything when the `storageGetItem` Cmd is dispatched.

**Usage:**

```elm
import Ports.LocalStorage as LocalStorage


type Msg
  = Receive (LocalStorage.Key, LocalStorage.Value)


subscriptions : Model -> Sub Msg
subscriptions model =
  LocalStorage.storageGetItemResponse Receive
```
