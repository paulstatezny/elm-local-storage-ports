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

describe('storageGetItem', () => {
  test('sends contents of item to `storageGetItemResponse`', () => {
    mockLocalStorage.getItem = mockReturn('"foo"');
    port(mockPorts.storageGetItem)('bar');

    expect(portResponse(mockPorts.storageGetItemResponse))
      .toEqual(['bar', 'foo']);
  });
});
