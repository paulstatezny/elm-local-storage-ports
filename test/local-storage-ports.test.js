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

function mockCall(mockFn, callNumber) {
  return mockFn.mock.calls[callNumber || 0];
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

      expect(mockCall(mockLocalStorage.removeItem))
        .toEqual(['anotherKey']);
    });
  });

  describe('storageClear', () => {
    test('is a passthrough to `window.localStorage.clear`', () => {
      port(mockPorts.storageClear)();

      expect(mockCall(mockLocalStorage.clear))
        .toEqual([]); // Empty array corresponds to a call without args
    });
  });

  describe('storagePushToSet', () => {
    test('pushes a primitive to the array if it does not exist in the array', () => {
      mockLocalStorage.getItem = mockReturn('["one", "two"]');
      port(mockPorts.storagePushToSet)(['someSet', 'three']);

      expect(mockCall(mockLocalStorage.setItem))
        .toEqual(['someSet', '["one","two","three"]']);
    });

    test('does not push a primitive to the array if it already exists in the array', () => {
      mockLocalStorage.getItem = mockReturn('["one", "two"]');
      port(mockPorts.storagePushToSet)(['anotherSet', 'one']);

      expect(mockCall(mockLocalStorage.setItem))
        .toEqual(['anotherSet', '["one","two"]']);
    });

    test('overwrites the value in localstorage with a new array if it is not an array', () => {
      mockLocalStorage.getItem = mockReturn('{"some": "object"}');
      port(mockPorts.storagePushToSet)(['someKey', 123]);

      expect(mockCall(mockLocalStorage.setItem))
        .toEqual(['someKey', '[123]']);
    });
  });


  describe('storageRemoveFromSet', () => {
    beforeEach(() => {
      mockLocalStorage.getItem = mockReturn('["one", 2, {"num": 3}, [4], true]');
    });

    test('updates localStorage with the original set if it does not contain the value being removed', () => {
      port(mockPorts.storageRemoveFromSet)(['aSet', "not-in-set"]);

      expect(mockCall(mockLocalStorage.setItem))
        .toEqual(['aSet', '["one",2,{"num":3},[4],true]']);
    });

    describe('removes items that yield the same JSON as the item removed', () => {
      test('string', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', 'one']);

        expect(mockCall(mockLocalStorage.setItem))
          .toEqual(['aSet', '[2,{"num":3},[4],true]']);
      });

      test('number', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', 2]);

        expect(mockCall(mockLocalStorage.setItem))
          .toEqual(['aSet', '["one",{"num":3},[4],true]']);
      });

      test('object', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', {num: 3}]);

        expect(mockCall(mockLocalStorage.setItem))
          .toEqual(['aSet', '["one",2,[4],true]']);
      });

      test('array', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', [4]]);

        expect(mockCall(mockLocalStorage.setItem))
          .toEqual(['aSet', '["one",2,{"num":3},true]']);
      });

      test('boolean', () => {
        port(mockPorts.storageRemoveFromSet)(['aSet', true]);

        expect(mockCall(mockLocalStorage.setItem))
          .toEqual(['aSet', '["one",2,{"num":3},[4]]']);
      });
    });
  });
});
