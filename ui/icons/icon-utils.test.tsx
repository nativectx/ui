/**
 * @expo/vector-icons is an optional peer, but `ui/index.ts` re-exports the icons
 * barrel, so a static import of it would land in the module graph of every
 * consumer — an app that renders a Button and no icons at all would fail to
 * bundle with "Unable to resolve module @expo/vector-icons". These tests pin
 * the guarded-require behaviour that keeps it optional.
 */

describe('renderIcon with @expo/vector-icons installed', () => {
  it('returns an element', () => {
    jest.isolateModules(() => {
      const { renderIcon } = require('./icon-utils');
      expect(renderIcon({ library: 'Feather', name: 'save' })).not.toBeNull();
    });
  });
});

describe('renderIcon without @expo/vector-icons', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    warn.mockClear();
    jest.dontMock('@expo/vector-icons');
  });

  afterAll(() => warn.mockRestore());

  it('renders nothing instead of throwing', () => {
    jest.isolateModules(() => {
      jest.doMock('@expo/vector-icons', () => {
        throw new Error('Cannot find module @expo/vector-icons');
      });
      const { renderIcon } = require('./icon-utils');
      expect(renderIcon({ library: 'Feather', name: 'save' })).toBeNull();
    });
  });

  it('names the package and the install command, once', () => {
    jest.isolateModules(() => {
      jest.doMock('@expo/vector-icons', () => {
        throw new Error('Cannot find module @expo/vector-icons');
      });
      const { renderIcon } = require('./icon-utils');
      renderIcon({ library: 'Feather', name: 'save' });
      renderIcon({ library: 'Feather', name: 'trash' });

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('@expo/vector-icons');
      expect(warn.mock.calls[0][0]).toContain('npx expo install');
    });
  });

  it('still normalizes icon config, which needs no native module', () => {
    jest.isolateModules(() => {
      jest.doMock('@expo/vector-icons', () => {
        throw new Error('Cannot find module @expo/vector-icons');
      });
      const { normalizeIcon } = require('./icon-utils');
      expect(normalizeIcon('save')).toEqual({ library: 'Feather', name: 'save' });
    });
  });
});
