const localStoragePorts = require('../src/local-storage-ports');

let mockPorts;
let mockLocalStorage;

function portResponse(portFn, responseNumber) {
  const call = portFn.send.mock.calls[0];

  if (!call) {
    throw `call number ${responseNumber || 0} doesn't exist`;
  }

  return call[responseNumber || 0];
}

function port(portFn) {
  return portFn.subscribe.mock.calls[0][0];
}

function mockReturn(value) {
  return jest.fn(() => value);
}

beforeEach(() => {
  mockPorts = {
    storageGetItem: {subscribe: jest.fn()},
    storageSetItem: {subscribe: jest.fn()},
    storageRemoveItem: {subscribe: jest.fn()},
    storageClear: {subscribe: jest.fn()},
    storagePushToSet: {subscribe: jest.fn()},
    storageRemoveFromSet: {subscribe: jest.fn()},

    storageGetItemResponse: {send: jest.fn()}
  };

  localStoragePorts.register(mockPorts);

  window.localStorage = mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
});

describe('local-storage-ports', () => {
  describe('storageGetItem', () => {
    test('sends JSON-parsed contents of item to `storageGetItemResponse`', () => {
      mockLocalStorage.getItem = mockReturn('"myValue"');
      port(mockPorts.storageGetItem)('someKey');

      expect(portResponse(mockPorts.storageGetItemResponse))
        .toEqual(['someKey', 'myValue']);
    });
  });

  describe('storageRemoveItem', () => {
    test('is a passthrough to `window.localStorage.removeItem`', () => {
      port(mockPorts.storageRemoveItem)('anotherKey');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('anotherKey');
    });
  });

  describe('storageClear', () => {
    test('is a passthrough to `window.localStorage.clear`', () => {
      port(mockPorts.storageClear)();

      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('storagePushToSet', () => {
    test('pushes a primitive to the array if it does not exist in the array', () => {
      mockLocalStorage.getItem = mockReturn('["one", "two"]');
      port(mockPorts.storagePushToSet)(['someSet', 'three']);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('someSet', '["one","two","three"]');
    });

    test('does not push a primitive to the array if it already exists in the array', () => {
      mockLocalStorage.getItem = mockReturn('["one", "two"]');
      port(mockPorts.storagePushToSet)(['anotherSet', 'one']);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('anotherSet', '["one","two"]');
    });

    test('overwrites the value in localstorage with a new array if it is not an array', () => {
      mockLocalStorage.getItem = mockReturn('{"some": "object"}');
      port(mockPorts.storagePushToSet)(['someKey', 123]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('someKey', '[123]');
    });
  });


  describe('storageRemoveFromSet', () => {
    beforeEach(() => {
      mockLocalStorage.getItem = mockReturn('["one", 2, {"num": 3}, [4], true]');
    });

    test('updates localStorage with the original set if it does not contain the value being removed', () => {
      port(mockPorts.storageRemoveFromSet)(['aSet', "not-in-set"]);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '["one",2,{"num":3},[4],true]');
    });

    describe('removes items that yield the same JSON as the item removed', () => {
      test('string', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', 'one']);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '[2,{"num":3},[4],true]');
      });

      test('number', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', 2]);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '["one",{"num":3},[4],true]');
      });

      test('object', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', {num: 3}]);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '["one",2,[4],true]');
      });

      test('array', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', [4]]);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '["one",2,{"num":3},true]');
      });

      test('boolean', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', true]);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('aSet', '["one",2,{"num":3},[4]]');
      });
    });
  });
});
