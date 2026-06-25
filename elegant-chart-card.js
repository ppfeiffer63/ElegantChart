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
