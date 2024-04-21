/**
 * Unit tests for src/index.ts
 */
import { Torrentdone } from '../src/class/torrentdone';
import { Config } from '../src/class/config';

// Mock the action's entrypoint
let mainMock: jest.SpyInstance;

describe('index.ts', () => {
  beforeAll(() => {
    mainMock = jest.spyOn(Torrentdone.prototype, 'main').mockImplementation();
    jest.spyOn(Config.prototype, 'check').mockImplementation();
    // fix EACCES: permission denied, mkdir '/var/log/transmission'
    jest.spyOn(Config.prototype, 'logFilePath', 'get').mockReturnValue('./var/log/transmission');
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('Torrentdone main run', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/index');
    expect(mainMock).toHaveBeenCalled();
  });
});
