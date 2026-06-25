// Elegant Chart Card - Self-contained Bundle
// No external imports, everything inline

class ElegantChartWebSocketManager {
  constructor(hass) {
    this.hass = hass;
    this.ws = null;
  }

  connect(url, onData) {
    try {
      this.ws = new WebSocket(url);
      this.ws.onmessage = (event) => {
        if (onData) onData(JSON.parse(event.data));
      };
    } catch (e) {
      console.error('WebSocket error:', e);
    }
  }
}

class ElegantChartCardEditor extends HTMLElement {
  constructor() {
    super();
    this.hass = null;
  }

  setConfig(config) {
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  get hass() {
    return this._hass;
  }

  render() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .editor {
          padding: 16px;
        }
        .field {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
      </style>
      <div class="editor">
        <div class="field">
          <label>Title:</label>
          <input type="text" id="title" placeholder="Chart Title" 
                 value="${this.config?.title || ''}">
        </div>
        <div class="field">
          <label>Chart Type:</label>
          <select id="chart_type">
            <option ${(this.config?.chart_type || 'line') === 'line' ? 'selected' : ''}>line</option>
            <option ${(this.config?.chart_type || 'line') === 'bar' ? 'selected' : ''}>bar</option>
            <option ${(this.config?.chart_type || 'line') === 'area' ? 'selected' : ''}>area</option>
          </select>
        </div>
        <div class="field">
          <label>Height (px):</label>
          <input type="number" id="height" value="${this.config?.height || 300}">
        </div>
      </div>
    `;
    
    root.querySelector('#title').addEventListener('change', (e) => {
      this.config.title = e.target.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: this.config }));
    });
    
    root.querySelector('#chart_type').addEventListener('change', (e) => {
      this.config.chart_type = e.target.value;
      this.dispatchEvent(new CustomEvent('config-changed', { detail: this.config }));
    });
    
    root.querySelector('#height').addEventListener('change', (e) => {
      this.config.height = parseInt(e.target.value);
      this.dispatchEvent(new CustomEvent('config-changed', { detail: this.config }));
    });
  }
}

customElements.define('elegant-chart-card-editor', ElegantChartCardEditor);

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
      height: 300
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
      </style>
      <div class="card">
        <div class="title">${this.config?.title || 'Chart'}</div>
        <canvas id="myChart"></canvas>
        <div style="padding-top: 16px; font-size: 12px; color: #666;">
          Entities: ${(this.config?.entities || []).join(', ')}
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);

// Lovelace integration
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'elegant-chart-card',
  name: 'Elegant Chart Card',
  description: 'Professional Chart for Home Assistant Lovelace'
});

console.log('✅ Elegant Chart Card loaded');
