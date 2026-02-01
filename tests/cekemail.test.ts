import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CekEmail } from '../src/cekemail';

describe('CekEmail', () => {
  let widget: CekEmail;

  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Reset window globals
    delete (window as any).CekEmail_APIKEY;
    delete (window as any).CekEmail_API_URL;

    // Create fresh instance
    widget = new CekEmail();

    // Mock fetch
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(widget.config.apiKey).toBe(null);
      expect(widget.config.debounce).toBe(800);
      expect(widget.config.showIndicator).toBe(true);
    });

    it('should initialize with empty state', () => {
      expect(widget.state.initialized).toBe(false);
      expect(widget.state.cache.size).toBe(0);
      expect(widget.state.observedInputs.size).toBe(0);
    });
  });

  describe('init', () => {
    it('should not initialize without API key', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      widget.init();

      expect(widget.state.initialized).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API key not found')
      );

      consoleSpy.mockRestore();
    });

    it('should initialize with API key in config', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      widget.init({ apiKey: 'test-key' });

      expect(widget.state.initialized).toBe(true);
      expect(widget.config.apiKey).toBe('test-key');
      expect(consoleSpy).toHaveBeenCalledWith('[CekEmail] Widget initialized');

      consoleSpy.mockRestore();
    });

    it('should read API key from window global', () => {
      (window as any).CekEmail_APIKEY = 'global-key';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      widget.init();

      expect(widget.state.initialized).toBe(true);
      expect(widget.config.apiKey).toBe('global-key');

      consoleSpy.mockRestore();
    });

    it('should read API URL from window global', () => {
      (window as any).CekEmail_APIKEY = 'test-key';
      (window as any).CekEmail_API_URL = 'https://custom.api.com/validate';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      widget.init();

      expect(widget.config.apiUrl).toBe('https://custom.api.com/validate');

      consoleSpy.mockRestore();
    });

    it('should not re-initialize', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      widget.init({ apiKey: 'test-key' });
      widget.init({ apiKey: 'another-key' });

      expect(widget.config.apiKey).toBe('test-key');
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe('attachToInput', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      widget.init({ apiKey: 'test-key', autoAttach: false });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should attach to email input', () => {
      const input = document.createElement('input');
      input.type = 'email';
      document.body.appendChild(input);

      widget.attachToInput(input);

      expect(input.hasAttribute('data-cekemail-attached')).toBe(true);
      expect(widget.state.observedInputs.has(input)).toBe(true);
    });

    it('should not attach to disabled input', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.setAttribute('data-cekemail-disable', '');
      document.body.appendChild(input);

      widget.attachToInput(input);

      expect(input.hasAttribute('data-cekemail-attached')).toBe(false);
      expect(widget.state.observedInputs.has(input)).toBe(false);
    });

    it('should not attach twice to same input', () => {
      const input = document.createElement('input');
      input.type = 'email';
      document.body.appendChild(input);

      widget.attachToInput(input);
      widget.attachToInput(input);

      expect(widget.state.observedInputs.size).toBe(1);
    });

    it('should wrap input with indicator when showIndicator is true', () => {
      const input = document.createElement('input');
      input.type = 'email';
      document.body.appendChild(input);

      widget.attachToInput(input);

      expect(input.parentElement?.classList.contains('cekemail-wrapper')).toBe(true);
    });
  });

  describe('clearValidationState', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      widget.init({ apiKey: 'test-key', autoAttach: false });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should remove validation classes', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.classList.add('cekemail-valid', 'cekemail-invalid');
      document.body.appendChild(input);

      widget.clearValidationState(input);

      expect(input.classList.contains('cekemail-valid')).toBe(false);
      expect(input.classList.contains('cekemail-invalid')).toBe(false);
    });

    it('should remove data attributes', () => {
      const input = document.createElement('input');
      input.type = 'email';
      input.setAttribute('data-cekemail-state', 'valid');
      input.setAttribute('data-cekemail-message', 'test');
      document.body.appendChild(input);

      widget.clearValidationState(input);

      expect(input.hasAttribute('data-cekemail-state')).toBe(false);
      expect(input.hasAttribute('data-cekemail-message')).toBe(false);
    });
  });

  describe('cache', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      widget.init({ apiKey: 'test-key', autoAttach: false });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return cache size', () => {
      expect(widget.getCacheSize()).toBe(0);

      widget.state.cache.set('test@example.com', {
        is_valid: true,
        is_reachable: true,
        is_disposable_email: false,
      });

      expect(widget.getCacheSize()).toBe(1);
    });

    it('should clear cache', () => {
      widget.state.cache.set('test@example.com', {
        is_valid: true,
        is_reachable: true,
        is_disposable_email: false,
      });

      widget.clearCache();

      expect(widget.getCacheSize()).toBe(0);
    });
  });

  describe('validateEmailDirectly', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw if not initialized', async () => {
      await expect(widget.validateEmailDirectly('test@example.com')).rejects.toThrow(
        'CekEmail not initialized'
      );
    });

    it('should return cached result', async () => {
      widget.init({ apiKey: 'test-key', autoAttach: false });

      const cachedResult = {
        is_valid: true,
        is_reachable: true,
        is_disposable_email: false,
      };
      widget.state.cache.set('test@example.com', cachedResult);

      const result = await widget.validateEmailDirectly('TEST@EXAMPLE.COM');

      expect(result).toEqual(cachedResult);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call API and cache result', async () => {
      widget.init({ apiKey: 'test-key', autoAttach: false });

      const apiResult = {
        is_valid: true,
        is_reachable: true,
        is_disposable_email: false,
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: apiResult }),
      } as Response);

      const result = await widget.validateEmailDirectly('new@example.com');

      expect(result).toEqual(apiResult);
      expect(widget.state.cache.has('new@example.com')).toBe(true);
    });
  });
});
