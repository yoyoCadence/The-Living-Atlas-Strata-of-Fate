export const DISPLAY_SETTINGS_STORAGE_KEY = 'living-atlas.display';
export const DEFAULT_DISPLAY_BRIGHTNESS = 1.18;
export const MIN_DISPLAY_BRIGHTNESS = 0.75;
export const MAX_DISPLAY_BRIGHTNESS = 1.6;
export const DISPLAY_BRIGHTNESS_STEP = 0.05;

export function clampDisplayBrightness(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_DISPLAY_BRIGHTNESS;
  return Math.min(MAX_DISPLAY_BRIGHTNESS, Math.max(MIN_DISPLAY_BRIGHTNESS, numeric));
}

export function loadDisplaySettings() {
  const settings = { brightness: DEFAULT_DISPLAY_BRIGHTNESS };

  try {
    const saved = window.localStorage.getItem(DISPLAY_SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      settings.brightness = clampDisplayBrightness(parsed.brightness);
    }
  } catch {
    settings.brightness = DEFAULT_DISPLAY_BRIGHTNESS;
  }

  try {
    const urlBrightness = new URLSearchParams(window.location.search).get('brightness');
    if (urlBrightness !== null) settings.brightness = clampDisplayBrightness(urlBrightness);
  } catch {
    // URL parsing can fail in non-browser test contexts.
  }

  return settings;
}

export function saveDisplaySettings(settings) {
  try {
    window.localStorage.setItem(DISPLAY_SETTINGS_STORAGE_KEY, JSON.stringify({
      brightness: clampDisplayBrightness(settings.brightness)
    }));
  } catch {
    // Storage can be unavailable in private contexts; the live setting still applies.
  }
}
