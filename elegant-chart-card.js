// Elegant Chart Card - Professional Configuration Editor

class ElegantChartCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _render() {
    if (!this._config) return;

    this.innerHTML = `
      <style>
        .editor { padding: 16px; }
        h3 { margin-top: 20px; margin-bottom: 12px; font-size: 14px; font-weight: bold; 
             border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; }
        .field { margin-bottom: 16px; }
        .field-double { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 6px;
                color: var(--secondary-text-color); }
        input, select { 
          width: 100%; padding: 8px; border: 1px solid var(--divider-color);
          border-radius: 4px; background: var(--card-background-color);
          color: var(--primary-text-color); box-sizing: border-box;
          font-size: 13px;
        }
        input:focus, select:focus { outline: none; border-color: var(--primary-color); }
        
        .entities-section { margin: 16px 0; }
        .entity-item {
          display: grid; grid-template-columns: 1fr 40px; gap: 8px; 
          align-items: center; margin-bottom: 12px; padding: 12px;
          background: var(--divider-color); border-radius: 4px;
        }
        .entity-input { grid-column: 1; }
        .btn-remove { 
          padding: 6px 12px; background: var(--error-color, #d32f2f);
          color: white; border: none; border-radius: 4px; cursor: pointer;
          font-size: 12px;
        }
        .btn-remove:hover { background: var(--error-color, #b71c1c); }
        .btn-add {
          width: 100%; padding: 10px; background: var(--primary-color);
          color: white; border: none; border-radius: 4px; cursor: pointer;
          font-weight: bold; margin-top: 8px;
        }
        .btn-add:hover { opacity: 0.9; }
        
        .hint { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; }
      </style>

      <div class="editor">
        <h3>Basic Settings</h3>
        
        <div class="field">
          <label>Title:</label>
          <input type="text" id="title" placeholder="Chart Title" value="${this._config.title || ''}">
        </div>

        <h3>Entities</h3>
        <div class="entities-section" id="entities-container"></div>
        <button class="btn-add" id="add-entity">+ Add Entity</button>

        <h3>Chart Configuration</h3>
        
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
            <label>Height (px):</label>
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
            <input type="number" id="min" value="${this._config.min !== undefined ? this._config.min : ''}">
            <div class="hint">Leave empty for auto</div>
          </div>
          <div class="field">
            <label>Max Value:</label>
            <input type="number" id="max" value="${this._config.max !== undefined ? this._config.max : ''}">
            <div class="hint">Leave empty for auto</div>
          </div>
        </div>

        <h3>Display Options</h3>
        
        <div class="field-double">
          <div class="field">
            <label>Show Legend:</label>
            <select id="show_legend">
              <option ${this._config.show_legend !== false ? 'selected' : ''}>true</option>
              <option ${this._config.show_legend === false ? 'selected' : ''}>false</option>
            </select>
          </div>
          <div class="field">
            <label>Show Grid:</label>
            <select id="show_grid">
              <option ${this._config.show_grid !== false ? 'selected' : ''}>true</option>
              <option ${this._config.show_grid === false ? 'selected' : ''}>false</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>Use WebSocket:</label>
          <select id="use_websocket">
            <option ${this._config.use_websocket !== false ? 'selected' : ''}>true</option>
            <option ${this._config.use_websocket === false ? 'selected' : ''}>false</option>
          </select>
        </div>
      </div>
    `;

    this._renderEntities();
    this._attachListeners();
  }

  _renderEntities() {
    const container = this.querySelector('#entities-container');
    if (!container) return;

    container.innerHTML = '';
    const entities = this._config.entities || [];

    entities.forEach((entity, index) => {
      const div = document.createElement('div');
      div.className = 'entity-item';
      div.innerHTML = `
        <input type="text" class="entity-input" placeholder="sensor.temperature" value="${entity}">
        <button class="btn-remove" data-index="${index}">Delete</button>
      `;
      container.appendChild(div);
    });
  }

  _attachListeners() {
    // Title
    this.querySelector('#title')?.addEventListener('change', (e) => {
      this._config.title = e.target.value;
      this._notifyChange();
    });

    // Entities
    this.querySelector('#add-entity')?.addEventListener('click', () => {
      this._config.entities = [...(this._config.entities || []), ''];
      this._renderEntities();
      this._attachListeners();
    });

    this.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this._config.entities = this._config.entities.filter((_, i) => i !== index);
        this._renderEntities();
        this._attachListeners();
        this._notifyChange();
      });
    });

    this.querySelectorAll('.entity-input').forEach((input, index) => {
      input.addEventListener('change', (e) => {
        this._config.entities[index] = e.target.value;
        this._notifyChange();
      });
    });

    // Chart settings
    this.querySelector('#chart_type')?.addEventListener('change', (e) => {
      this._config.chart_type = e.target.value;
      this._notifyChange();
    });

    this.querySelector('#height')?.addEventListener('change', (e) => {
      this._config.height = parseInt(e.target.value);
      this._notifyChange();
    });

    this.querySelector('#update_interval')?.addEventListener('change', (e) => {
      this._config.update_interval = parseInt(e.target.value);
      this._notifyChange();
    });

    this.querySelector('#min')?.addEventListener('change', (e) => {
      this._config.min = e.target.value ? parseFloat(e.target.value) : undefined;
      this._notifyChange();
    });

    this.querySelector('#max')?.addEventListener('change', (e) => {
      this._config.max = e.target.value ? parseFloat(e.target.value) : undefined;
      this._notifyChange();
    });

    this.querySelector('#show_legend')?.addEventListener('change', (e) => {
      this._config.show_legend = e.target.value === 'true';
      this._notifyChange();
    });

    this.querySelector('#show_grid')?.addEventListener('change', (e) => {
      this._config.show_grid = e.target.value === 'true';
      this._notifyChange();
    });

    this.querySelector('#use_websocket')?.addEventListener('change', (e) => {
      this._config.use_websocket = e.target.value === 'true';
      this._notifyChange();
    });
  }

  _notifyChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
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
      throw new Error('At least one entity is required');
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
      show_legend: true,
      show_grid: true,
      use_websocket: true
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
          ${(this.config?.entities || []).length > 0 
            ? `Monitoring: ${this.config.entities.join(', ')}`
            : 'No entities configured'}
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
