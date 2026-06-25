import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/lit@3/+esm';

class ElegantChartEditor extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    errors: { type: Array },
    availableEntities: { type: Array }
  };

  constructor() {
    super();
    this.errors = [];
    this.availableEntities = [];
  }

  setConfig(config) {
    this.config = config || {};
    this.errors = [];
    this.updateAvailableEntities();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateAvailableEntities();
  }

  get hass() {
    return this._hass;
  }

  updateAvailableEntities() {
    if (!this.hass) return;

    const sensors = Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith('sensor.'))
      .sort();

    this.availableEntities = sensors;
  }

  validateEntities(input) {
    const entities = input.split('\n').map(e => e.trim()).filter(e => e);

    this.errors = [];

    if (entities.length === 0) {
      this.errors.push('Mindestens 1 Sensor erforderlich');
      return false;
    }

    if (entities.length > 5) {
      this.errors.push('Maximum 5 Sensoren erlaubt');
      return false;
    }

    const invalidEntities = entities.filter(e => !this.hass.states[e]);
    if (invalidEntities.length > 0) {
      this.errors.push(`Unbekannte Sensoren: ${invalidEntities.join(', ')}`);
      return false;
    }

    return true;
  }

  handleEntitiesChange(e) {
    const input = e.target.value;

    if (this.validateEntities(input)) {
      const entities = input.split('\n').map(e => e.trim()).filter(e => e);
      this.updateConfig({ entities });
      this.errors = [];
    }
  }

  updateConfig(changes) {
    const newConfig = {
      type: 'custom:elegant-chart-card',
      ...this.config,
      ...changes
    };

    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: newConfig },
        composed: true,
        bubbles: true
      })
    );
  }

  render() {
    return html`
      <div class="editor">
        ${this.errors.length > 0
          ? html`
              <div class="errors">
                ${this.errors.map(err => html`<div class="error">⚠️ ${err}</div>`)}
              </div>
            `
          : ''}

        <div class="form-group">
          <label>Kartentitel</label>
          <input
            type="text"
            .value="${this.config.title || ''}"
            @change="${e => this.updateConfig({ title: e.target.value })}"
            placeholder="z.B. Garten Live"
          />
        </div>

        <div class="form-group">
          <label>Diagramm-Typ</label>
          <select
            @change="${e => this.updateConfig({ chart_type: e.target.value })}"
            .value="${this.config.chart_type || 'line'}"
          >
            <option value="line">Liniendiagramm</option>
            <option value="bar">Balkendiagramm</option>
            <option value="area">Flächendiagramm</option>
            <option value="scatter">Streudiagramm</option>
            <option value="radar">Radar</option>
            <option value="doughnut">Ring-Diagramm</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>Diagramm Höhe (px)</label>
            <input
              type="number"
              .value="${this.config.height || 300}"
              @change="${e => this.updateConfig({ height: parseInt(e.target.value) })}"
              min="200"
              max="800"
              step="50"
            />
          </div>

          <div class="form-group half">
            <label>Update Interval (ms)</label>
            <input
              type="number"
              .value="${this.config.update_interval || 1000}"
              @change="${e => this.updateConfig({ update_interval: parseInt(e.target.value) })}"
              min="100"
              max="60000"
              step="100"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>Min Y-Wert</label>
            <input
              type="number"
              .value="${this.config.min ?? 0}"
              @change="${e => this.updateConfig({ min: parseFloat(e.target.value) })}"
              step="0.1"
            />
          </div>

          <div class="form-group half">
            <label>Max Y-Wert</label>
            <input
              type="number"
              .value="${this.config.max ?? 100}"
              @change="${e => this.updateConfig({ max: parseFloat(e.target.value) })}"
              step="0.1"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Sensoren (eine pro Zeile)</label>
          <textarea
            .value="${(this.config.entities || []).join('\n')}"
            @change="${e => this.handleEntitiesChange(e)}"
            placeholder="sensor.gartensensor_temperature&#10;sensor.gartensensor_humidity&#10;sensor.solar_power"
            rows="5"
          ></textarea>
          <div class="hint">Verfügbare Sensoren: ${this.availableEntities.length}</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${this.config.show_legend !== false}"
              @change="${e => this.updateConfig({ show_legend: e.target.checked })}"
            />
            Legende anzeigen
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${this.config.show_grid !== false}"
              @change="${e => this.updateConfig({ show_grid: e.target.checked })}"
            />
            Gitternetz anzeigen
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${this.config.use_websocket !== false}"
              @change="${e => this.updateConfig({ use_websocket: e.target.checked })}"
            />
            WebSocket für Updates nutzen
          </label>
        </div>
      </div>
    `;
  }

  static styles = css`
    .editor {
      padding: 16px 0;
    }

    .errors {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }

    .error {
      color: rgb(239, 68, 68);
      font-size: 12px;
      margin: 4px 0;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group.half {
      margin-bottom: 0;
    }

    .form-group.checkbox {
      display: flex;
      align-items: center;
    }

    .form-group.checkbox input {
      margin-right: 8px;
      width: auto;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--primary-text-color, #212121);
    }

    .form-group.checkbox label {
      margin-bottom: 0;
      display: flex;
      align-items: center;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      box-sizing: border-box;
      background-color: var(--card-background-color, #ffffff);
      color: var(--primary-text-color, #212121);
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--primary-color, #1976d2);
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    textarea {
      font-family: monospace;
      resize: vertical;
    }

    .hint {
      font-size: 11px;
      color: var(--secondary-text-color, #757575);
      margin-top: 4px;
    }
  `;
}

customElements.define('elegant-chart-editor', ElegantChartEditor);
