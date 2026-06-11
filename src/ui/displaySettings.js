import {
  DEFAULT_DISPLAY_BRIGHTNESS,
  DISPLAY_BRIGHTNESS_STEP,
  MAX_DISPLAY_BRIGHTNESS,
  MIN_DISPLAY_BRIGHTNESS,
  clampDisplayBrightness,
  loadDisplaySettings,
  saveDisplaySettings
} from '../settings/display.js';

export class DisplaySettingsPanel {
  constructor(renderer) {
    this.renderer = renderer;
    this.settings = loadDisplaySettings();
    this.root = document.getElementById('display-settings');
    this.toggle = document.getElementById('display-settings-toggle');
    this.panel = document.getElementById('display-settings-panel');
    this.slider = document.getElementById('brightness-slider');
    this.value = document.getElementById('brightness-value');
    this.reset = document.getElementById('brightness-reset');

    this.configureControl();
    this.bind();
    this.apply(false);
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.apply(false);
  }

  configureControl() {
    if (!this.slider) return;
    this.slider.min = String(MIN_DISPLAY_BRIGHTNESS);
    this.slider.max = String(MAX_DISPLAY_BRIGHTNESS);
    this.slider.step = String(DISPLAY_BRIGHTNESS_STEP);
    this.slider.value = String(this.settings.brightness);
  }

  bind() {
    this.toggle?.addEventListener('click', () => this.togglePanel());
    this.slider?.addEventListener('input', () => {
      this.settings.brightness = clampDisplayBrightness(this.slider.value);
      this.apply(true);
    });
    this.reset?.addEventListener('click', () => {
      this.settings.brightness = DEFAULT_DISPLAY_BRIGHTNESS;
      this.apply(true);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.panel && !this.panel.hidden) this.setOpen(false);
    });
  }

  togglePanel() {
    this.setOpen(this.panel?.hidden ?? false);
  }

  setOpen(open) {
    if (!this.panel) return;
    this.panel.hidden = !open;
    this.toggle?.setAttribute('aria-expanded', String(open));
  }

  apply(shouldSave) {
    this.settings.brightness = clampDisplayBrightness(this.settings.brightness);
    this.renderer?.setBrightness?.(this.settings.brightness);
    if (this.slider) this.slider.value = String(this.settings.brightness);
    if (this.value) this.value.textContent = `${Math.round(this.settings.brightness * 100)}%`;
    if (shouldSave) saveDisplaySettings(this.settings);
  }
}
