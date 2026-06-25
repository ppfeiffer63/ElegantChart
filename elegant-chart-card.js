// Elegant Chart Card - Full Editor with Entity Validation

class ElegantChartCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this.errors = [];
    this.availableEntities = [];
  }

  setConfig(config) {
    this._config = config || {};
    this.errors = [];
    this.updateAvailableEntities();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateAvailableEntities();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    this._render();
  }

  updateAvailableEntities() {
    if (!this._hass) return;
    this.availableEntities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('sensor.'))
      .sort();
  }

  validateEntities(entities) {
    this.errors = [];

    if (!entities || entities.length === 0) {
      this.errors.push('Mindestens 1 Sensor erforderlich');
      return false;
    }

    if (entities.length > 5) {
      this.errors.push('Maximum 5 Sensoren erlaubt');
      return false;
    }

    const invalidEntities = entities.filter(e => !this._hass.states[e]);
    if (invalidEntities.length > 0) {
      this.errors.push(`Unbekannte Sensoren: ${invalidEntities.join(', ')}`);
      return false;
    }

    return true;
  }

  updateConfig(changes) {
    const newConfig = {
      type: 'custom:elegant-chart-card',
      ...this._config,
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

  _render() {
    this.innerHTML = `
      <style>
        .editor { padding: 16px; }
        
        .errors {
          background: #ffebee;
          border: 1px solid #ef5350;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .error {
          color: #c62828;
          font-size: 13px;
          margin: 4px 0;
        }

        h3 { 
          margin-top: 20px; 
          margin-bottom: 12px; 
          font-size: 14px; 
          font-weight: bold;
          border-bottom: 1px solid var(--divider-color);
          padding-bottom: 8px;
        }

        .field { margin-bottom: 16px; }
        .field-double { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        label { 
          display: block; 
          font-size: 12px; 
          font-weight: bold; 
          margin-bottom: 6px;
          color: var(--secondary-text-color); 
        }

        input, select, textarea { 
          width: 100%; 
          padding: 8px; 
          border: 1px solid var(--divider-color);
          border-radius: 4px; 
          background: var(--card-background-color);
          color: var(--primary-text-color); 
          box-sizing: border-box;
          font-size: 13px;
          font-family: monospace;
        }

        input:focus, select:focus, textarea:focus { 
          outline: none; 
          border-color: var(--primary-color); 
        }

        textarea {
          min-height: 100px;
          resize: vertical;
          font-family: monospace;
        }

        .entity-selector {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
        }

        .entity-option {
          padding: 8px;
          cursor: pointer;
          border-bottom: 1px solid var(--divider-color);
          font-size: 12px;
        }

        .entity-option:hover {
          background: var(--divider-color);
        }

        .hint { 
          font-size: 11px; 
          color: var(--secondary-text-color); 
          margin-top: 4px; 
        }

        .button-group { display: flex; gap: 8px; margin-top: 8px; }
        button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        }

        .btn-add {
          background: var(--primary-color);
          color: white;
        }
        .btn-add:hover { opacity: 0.9; }

        .btn-clear {
          background: var(--error-color, #d32f2f);
          color: white;
        }
        .btn-clear:hover { opacity: 0.9; }
      </style>

      <div class="editor">
        ${this.errors.length > 0 ? `
          <div class="errors">
            ${this.errors.map(err => `<div class="error">⚠️ ${err}</div>`).join('')}
          </div>
        ` : ''}

        <h3>Basic Settings</h3>
        
        <div class="field">
          <label>Title:</label>
          <input type="text" id="title" placeholder="Chart Title" 
                 value="${this._config.title || ''}">
        </div>

        <h3>Entities (Sensoren)</h3>
        
        <div class="field">
          <label>Sensoren eingeben (eine pro Zeile):</label>
          <textarea id="entities" placeholder="sensor.temperature&#10;sensor.humidity&#10;sensor.pressure">${(this._config.entities || []).join('\n')}</textarea>
          <div class="hint">Gültige Sensoren: ${this.availableEntities.slice(0, 5).join(', ')}...</div>
        </div>

        <div class="button-group">
          <button class="btn-add" id="validate">✓ Validieren</button>
          <button class="btn-clear" id="clear">✕ Löschen</button>
        </div>

        <h3>Chart Konfiguration</h3>
        
        <div class="field">
          <label>Chart Type:</label>
          <select id="chart_type">
            <option ${(this._config.chart_type || 'line') === 'line' ? 'selected' : ''}>line</option>
            <option ${(this._config.chart_type || 'line') === 'bar' ? 'selected' : ''}>bar</option>
            <option ${(this._config.chart_type || 'line') === 'area' ? 'selected' : ''}>area</option>
          </select>
        </div>

        <div class="field-double">
          <div class="field">
            <label>Höhe (px):</label>
            <input type="number" id="height" value="${this._config.height || 300}">
          </div>
          <div class="field">
            <label>Update Interval (ms):</label>
            <input type="number" id="update_interval" value="${this._config.update_interval || 1000}">
          </div>
        </div>

        <div class="field-double">
          <div class="field">
            <label>Min Value:</label>
            <input type="number" id="min" value="${this._config.min !== undefined ? this._config.min : 0}">
            <div class="hint">Minimum Y-Achsen Wert</div>
          </div>
          <div class="field">
            <label>Max Value:</label>
            <input type="number" id="max" value="${this._config.max !== undefined ? this._config.max : 100}">
            <div class="hint">Maximum Y-Achsen Wert</div>
          </div>
        </div>

        <h3>Display Optionen</h3>
        
        <div class="field-double">
          <div class="field">
            <label>Legende anzeigen:</label>
            <select id="show_legend">
              <option ${this._config.show_legend !== false ? 'selected' : ''}>true</option>
              <option ${this._config.show_legend === false ? 'selected' : ''}>false</option>
            </select>
          </div>
          <div class="field">
            <label>Grid anzeigen:</label>
            <select id="show_grid">
              <option ${this._config.show_grid !== false ? 'selected' : ''}>true</option>
              <option ${this._config.show_grid === false ? 'selected' : ''}>false</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>WebSocket Live-Updates:</label>
          <select id="use_websocket">
            <option ${this._config.use_websocket !== false ? 'selected' : ''}>true</option>
            <option ${this._config.use_websocket === false ? 'selected' : ''}>false</option>
          </select>
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    // Title
    this.querySelector('#title')?.addEventListener('change', (e) => {
      this.updateConfig({ title: e.target.value });
    });

    // Entities
    this.querySelector('#validate')?.addEventListener('click', () => {
      const input = this.querySelector('#entities').value;
      const entities = input.split('\n').map(e => e.trim()).filter(e => e);
      
      if (this.validateEntities(entities)) {
        this.updateConfig({ entities });
        this._render();
      } else {
        this._render();
      }
    });

    this.querySelector('#clear')?.addEventListener('click', () => {
      this.querySelector('#entities').value = '';
      this.updateConfig({ entities: [] });
    });

    // Chart settings
    this.querySelector('#chart_type')?.addEventListener('change', (e) => {
      this.updateConfig({ chart_type: e.target.value });
    });

    this.querySelector('#height')?.addEventListener('change', (e) => {
      this.updateConfig({ height: parseInt(e.target.value) || 300 });
    });

    this.querySelector('#update_interval')?.addEventListener('change', (e) => {
      this.updateConfig({ update_interval: parseInt(e.target.value) || 1000 });
    });

    this.querySelector('#min')?.addEventListener('change', (e) => {
      this.updateConfig({ min: parseFloat(e.target.value) || 0 });
    });

    this.querySelector('#max')?.addEventListener('change', (e) => {
      this.updateConfig({ max: parseFloat(e.target.value) || 100 });
    });

    this.querySelector('#show_legend')?.addEventListener('change', (e) => {
      this.updateConfig({ show_legend: e.target.value === 'true' });
    });

    this.querySelector('#show_grid')?.addEventListener('change', (e) => {
      this.updateConfig({ show_grid: e.target.value === 'true' });
    });

    this.querySelector('#use_websocket')?.addEventListener('change', (e) => {
      this.updateConfig({ use_websocket: e.target.value === 'true' });
    });
  }
}

// Card Element
class ElegantChartCard extends HTMLElement {
  constructor() {
    super();
    this.hass = null;
    this.config = null;
  }

  setConfig(config) {
    if (!config.entities || !config.entities.length) {
      throw new Error('Mindestens einen Sensor angeben');
    }
    if (config.entities.length > 5) {
      throw new Error('Maximum 5 Sensoren');
    }
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  get hass() {
    return this._hass;
  }

  static getConfigElement() {
    return document.createElement('elegant-chart-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:elegant-chart-card',
      title: 'Elegant Chart',
      entities: [],
      chart_type: 'line',
      height: 300,
      update_interval: 1000,
      show_legend: true,
      show_grid: true,
      use_websocket: true,
      min: 0,
      max: 100
    };
  }

  render() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
        }
        .card {
          background: var(--ha-card-background, white);
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 16px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 16px;
        }
        canvas {
          max-width: 100%;
          height: ${this.config?.height || 300}px;
        }
        .info {
          padding-top: 16px;
          font-size: 12px;
          color: #666;
        }
      </style>
      <div class="card">
        <div class="title">${this.config?.title || 'Chart'}</div>
        <canvas id="myChart"></canvas>
        <div class="info">
          Entities: ${(this.config?.entities || []).join(', ') || 'None configured'}
        </div>
      </div>
    `;
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);
customElements.define('elegant-chart-card-editor', ElegantChartCardEditor);

// Register with Home Assistant Lovelace
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'elegant-chart-card',
  name: 'Elegant Chart Card',
  description: 'Professional Chart Card for Home Assistant',
  preview: false,
  editor: 'elegant-chart-card-editor'
});

console.log('✅ Elegant Chart Card loaded');
