// Elegant Chart Card - Full Featured

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
          <input type="text" id="title" placeholder="Chart Title" value="${this._config.title || ''}">
        </div>

        <h3>Entities (Sensoren)</h3>
        <div class="field">
          <label>Sensoren eingeben (eine pro Zeile):</label>
          <textarea id="entities" placeholder="sensor.temperature&#10;sensor.humidity">${(this._config.entities || []).join('\n')}</textarea>
          <div class="hint">Verfügbar: ${this.availableEntities.slice(0, 5).join(', ')}...</div>
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
            <label>Min Value:</label>
            <input type="number" id="min" value="${this._config.min !== undefined ? this._config.min : 0}">
          </div>
        </div>

        <div class="field-double">
          <div class="field">
            <label>Max Value:</label>
            <input type="number" id="max" value="${this._config.max !== undefined ? this._config.max : 100}">
          </div>
          <div class="field">
            <label>Show Legend:</label>
            <select id="show_legend">
              <option ${this._config.show_legend !== false ? 'selected' : ''}>true</option>
              <option ${this._config.show_legend === false ? 'selected' : ''}>false</option>
            </select>
          </div>
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    this.querySelector('#title')?.addEventListener('change', (e) => {
      this.updateConfig({ title: e.target.value });
    });

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

    this.querySelector('#chart_type')?.addEventListener('change', (e) => {
      this.updateConfig({ chart_type: e.target.value });
    });

    this.querySelector('#height')?.addEventListener('change', (e) => {
      this.updateConfig({ height: parseInt(e.target.value) || 300 });
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
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateChart();
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
      min: 0,
      max: 100,
      show_legend: true
    };
  }

  render() {
    const root = this.attachShadow({ mode: 'open' });
    const height = this.config?.height || 300;
    
    root.innerHTML = `
      <style>
        :host { display: block; padding: 16px; }
        .card { background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 16px; }
        .title { font-size: 20px; font-weight: bold; margin-bottom: 16px; }
        canvas { display: block; width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 4px; }
        .info { margin-top: 12px; font-size: 12px; color: #666; }
      </style>
      <div class="card">
        <div class="title">${this.config?.title || 'Chart'}</div>
        <canvas id="chart" width="600" height="${height}"></canvas>
        <div class="info">
          Sensoren: ${(this.config?.entities || []).join(', ')}
        </div>
      </div>
    `;

    setTimeout(() => this.drawChart(), 50);
  }

  drawChart() {
    const canvas = this.shadowRoot?.querySelector('#chart');
    if (!canvas) {
      console.error('❌ Canvas nicht gefunden!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas Context fehlt!');
      return;
    }

    console.log('✅ Canvas gefunden, zeichne Chart...');

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const min = this.config?.min || 0;
    const max = this.config?.max || 100;

    // Weiß füllen
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grau Gridlines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Y-Achse Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = max - ((max - min) * i / 5);
      const y = padding + ((height - 2 * padding) * i / 5);
      ctx.fillText(val.toFixed(1), padding - 10, y + 4);
    }

    // X-Achse
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Y-Achse
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Datenpunkte zeichnen
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const entities = this.config?.entities || [];

    let x_pos = padding + 50;
    entities.forEach((entity, idx) => {
      const state = this._hass?.states[entity];
      const value = state ? parseFloat(state.state) : 0;
      const normalized = (value - min) / (max - min);
      const y = height - padding - ((height - 2 * padding) * normalized);

      const color = colors[idx % colors.length];

      // Punkt
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x_pos, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Wert
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(2), x_pos, y - 15);

      // Label
      ctx.fillStyle = '#666';
      ctx.font = '11px Arial';
      ctx.fillText(state?.attributes?.friendly_name || entity, x_pos, height - 15);

      x_pos += (width - 2 * padding - 100) / entities.length;
    });

    console.log('✅ Chart gezeichnet!');
  }

  updateChart() {
    if (this._hass) {
      this.drawChart();
    }
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);
customElements.define('elegant-chart-card-editor', ElegantChartCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'elegant-chart-card',
  name: 'Elegant Chart Card',
  description: 'Professional Chart for Home Assistant',
  preview: false,
  editor: 'elegant-chart-card-editor'
});

console.log('✅ Elegant Chart Card loaded');
