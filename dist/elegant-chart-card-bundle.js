// WebSocket Manager
export class ElegantChartWebSocketManager {
  constructor(hass) {
    this.hass = hass;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(wsUrl) {
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => this.onOpen();
      this.ws.onmessage = (event) => this.onMessage(event);
      this.ws.onerror = () => this.onError();
      this.ws.onclose = () => this.onClose();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.reconnect(wsUrl);
    }
  }

  onOpen() {
    this.reconnectAttempts = 0;
  }

  onMessage(event) {
    if (this.onData) {
      this.onData(JSON.parse(event.data));
    }
  }

  onError() {
    console.error('WebSocket error');
  }

  onClose() {
    this.reconnect(this.currentUrl);
  }

  reconnect(wsUrl) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(wsUrl), 1000 * this.reconnectAttempts);
    }
  }
}

// Editor
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/lit@3/+esm';

class ElegantChartEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object }
  };

  static getMetaConfig() {
    return {
      steps: [{
        id: 'user',
        title: 'Configure Elegant Chart Card',
        description: 'Setup your chart configuration',
        data: {
          title: { selector: { text: {} } },
          sensors: { selector: { entity: { domain: 'sensor' } } }
        }
      }]
    };
  }

  render() {
    return html`
      <div>
        <label>
          Chart Title:
          <input type="text" .value="${this.config?.title || ''}" 
                 @change="${(e) => this.updateConfig('title', e.target.value)}">
        </label>
      </div>
    `;
  }

  updateConfig(key, value) {
    this.config = { ...this.config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: this.config }));
  }
}

customElements.define('elegant-chart-editor', ElegantChartEditor);

// Main Card
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/lit@3/+esm';

class ElegantChartCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _chart: { type: Object, state: true },
    _loading: { type: Boolean, state: true }
  };

  static getConfigElement() {
    return document.createElement('elegant-chart-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:elegant-chart-card',
      title: 'Elegant Chart',
      sensors: []
    };
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--ha-card-background);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;

  render() {
    return html`
      <div class="card">
        <h1>${this.config?.title || 'Elegant Chart'}</h1>
        <canvas id="chart"></canvas>
      </div>
    `;
  }

  firstUpdated() {
    this.wsManager = new ElegantChartWebSocketManager(this.hass);
    this.wsManager.onData = (data) => this.updateChart(data);
  }

  updateChart(data) {
    // Chart update logic
  }

  setConfig(config) {
    this.config = config;
  }

  setHass(hass) {
    this.hass = hass;
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);
