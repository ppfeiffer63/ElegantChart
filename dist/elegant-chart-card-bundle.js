export class ElegantChartWebSocketManager {
  constructor(hass) {
    this.hass = hass;
    this.subscriptions = new Map();
    this.dataBuffer = new Map();
    // 3 Tage Historisierung bei 5-Minuten-Intervallen = 864 Datenpunkte
    // 3 Tage = 72 Stunden = 4320 Minuten / 5 Minuten pro Punkt = 864 Punkte
    this.maxBufferSize = 864;
    this.updateCallbacks = new Map();
    this.dataPointInterval = 5 * 60 * 1000; // 5 Minuten in Millisekunden
    this.lastDataPointTime = new Map();
  }

  subscribe(entities, callback) {
    if (!this.hass?.connection?.subscribeMessage) {
      console.warn('WebSocket nicht verfügbar, Fallback auf State');
      return this.fallbackSubscribe(entities, callback);
    }

    const unsubscribe = this.hass.connection.subscribeMessage(
      (message) => {
        if (message.type === 'state_changed') {
          const state = message.data.new_state;
          const entityId = state.entity_id;
          const value = parseFloat(state.state);

          if (isNaN(value)) {
            console.warn(`Ungültige Daten von ${entityId}:`, state.state);
            return;
          }

          if (!this.dataBuffer.has(entityId)) {
            this.dataBuffer.set(entityId, []);
            this.lastDataPointTime.set(entityId, 0);
          }

          const buffer = this.dataBuffer.get(entityId);
          const timestamp = new Date(state.last_updated);
          const now = timestamp.getTime();
          const lastTime = this.lastDataPointTime.get(entityId);

          // Nur jeden 5. Minute einen neuen Datenpunkt speichern
          // Das verhindert Speicherverschwendung bei hochfrequenten Updates
          if (now - lastTime >= this.dataPointInterval) {
            buffer.push({
              value,
              timestamp,
              attributes: state.attributes,
              unit: state.attributes?.unit_of_measurement || ''
            });

            // Älteste Datenpunkte entfernen wenn Buffer voll
            if (buffer.length > this.maxBufferSize) {
              buffer.shift();
            }

            this.lastDataPointTime.set(entityId, now);

            callback({
              entity_id: entityId,
              state: value,
              attributes: state.attributes,
              timestamp,
              history: [...buffer],
              unit: state.attributes?.unit_of_measurement || '',
              bufferSize: buffer.length,
              maxBufferSize: this.maxBufferSize
            });
          }
        }
      },
      {
        type: 'subscribe_entities',
        entity_ids: entities
      }
    );

    const key = entities.join(',');
    this.subscriptions.set(key, unsubscribe);
    this.updateCallbacks.set(key, callback);

    return unsubscribe;
  }

  fallbackSubscribe(entities, callback) {
    const pollInterval = setInterval(() => {
      entities.forEach(entityId => {
        const state = this.hass.states[entityId];
        if (state) {
          const value = parseFloat(state.state);
          
          if (!isNaN(value)) {
            if (!this.dataBuffer.has(entityId)) {
              this.dataBuffer.set(entityId, []);
              this.lastDataPointTime.set(entityId, 0);
            }

            const buffer = this.dataBuffer.get(entityId);
            const timestamp = new Date();
            const now = timestamp.getTime();
            const lastTime = this.lastDataPointTime.get(entityId);

            // Nur alle 5 Minuten einen neuen Datenpunkt speichern
            if (now - lastTime >= this.dataPointInterval) {
              buffer.push({
                value,
                timestamp,
                attributes: state.attributes,
                unit: state.attributes?.unit_of_measurement || ''
              });

              if (buffer.length > this.maxBufferSize) {
                buffer.shift();
              }

              this.lastDataPointTime.set(entityId, now);

              callback({
                entity_id: entityId,
                state: value,
                attributes: state.attributes,
                timestamp,
                history: [...buffer],
                unit: state.attributes?.unit_of_measurement || '',
                bufferSize: buffer.length,
                maxBufferSize: this.maxBufferSize
              });
            }
          }
        }
      });
    }, 1000);

    const key = entities.join(',');
    this.subscriptions.set(key, () => clearInterval(pollInterval));
    
    return () => clearInterval(pollInterval);
  }

  unsubscribe(entities) {
    const key = entities.join(',');
    const unsub = this.subscriptions.get(key);
    
    if (unsub) {
      unsub();
    }
    
    this.subscriptions.delete(key);
    this.updateCallbacks.delete(key);
    this.dataBuffer.delete(key);
  }

  getBuffer(entityId) {
    return this.dataBuffer.get(entityId) || [];
  }

  getAllBuffers() {
    return Object.fromEntries(this.dataBuffer);
  }

  clearBuffers() {
    this.dataBuffer.clear();
  }

  getLastValue(entityId) {
    const buffer = this.getBuffer(entityId);
    return buffer.length > 0 ? buffer[buffer.length - 1].value : null;
  }
}
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
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/lit@3/+esm';
import { ElegantChartWebSocketManager } from './websocket-manager.js';
import './editor.js';

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

  setConfig(config) {
    if (!config.entities?.length) {
      throw new Error('Mindestens 1 Sensor erforderlich');
    }
    if (config.entities.length > 5) {
      throw new Error('Maximum 5 Sensoren');
    }
    this.config = { ...ElegantChartCard.getStubConfig(), ...config };
  }

  connectedCallback() {
    super.connectedCallback();
    this._loading = true;

    if (this.config.use_websocket !== false) {
      this.wsManager = new ElegantChartWebSocketManager(this.hass);

      this.wsManager.subscribe(this.config.entities, (update) => {
        this.onSensorUpdate(update);
      });
    }

    setTimeout(() => {
      this.renderChart();
      this._loading = false;
    }, 100);
  }

  onSensorUpdate(update) {
    if (window.elegantChart) {
      const idx = this.config.entities.indexOf(update.entity_id);
      if (idx >= 0) {
        window.elegantChart.data.datasets[idx].data[0] = update.state;
        window.elegantChart.update('none');
      }
    }
  }

  async renderChart() {
    const canvas = this.shadowRoot?.querySelector('#elegant-chart-canvas');
    if (!canvas || !this.hass) return;

    const { Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js@4/+esm');

    const colors = [
      { border: 'rgba(59, 130, 246, 1)', bg: 'rgba(59, 130, 246, 0.1)' },
      { border: 'rgba(239, 68, 68, 1)', bg: 'rgba(239, 68, 68, 0.1)' },
      { border: 'rgba(16, 185, 129, 1)', bg: 'rgba(16, 185, 129, 0.1)' },
      { border: 'rgba(245, 158, 11, 1)', bg: 'rgba(245, 158, 11, 0.1)' },
      { border: 'rgba(139, 92, 246, 1)', bg: 'rgba(139, 92, 246, 0.1)' }
    ];

    const datasets = this.config.entities
      .map((entity, idx) => {
        const state = this.hass.states[entity];
        if (!state) return null;

        const value = parseFloat(state.state);
        if (isNaN(value)) return null;

        const color = colors[idx % colors.length];

        return {
          label: state.attributes?.friendly_name || entity,
          data: [value],
          borderColor: color.border,
          backgroundColor: color.bg,
          tension: 0.4,
          fill: this.config.chart_type !== 'scatter',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: true
        };
      })
      .filter(d => d);

    if (window.elegantChart) {
      window.elegantChart.destroy();
    }

    const chartConfig = {
      type: this.config.chart_type || 'line',
      data: {
        labels: [
          new Date().toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        ],
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 200
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: this.config.show_legend !== false,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 12, weight: '500' },
              color: 'var(--primary-text-color, #212121)'
            }
          },
          title: {
            display: !!this.config.title,
            text: this.config.title,
            font: { size: 14, weight: 'bold' },
            padding: 12,
            color: 'var(--primary-text-color, #212121)'
          },
          filler: {
            propagate: true
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: this.config.min !== undefined ? this.config.min : undefined,
            max: this.config.max !== undefined ? this.config.max : undefined,
            grid: {
              display: this.config.show_grid !== false,
              drawBorder: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: v => {
                if (v === null) return '';
                return typeof v === 'number' ? v.toFixed(1) : v;
              },
              font: { size: 11 },
              color: 'var(--secondary-text-color, #757575)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 },
              color: 'var(--secondary-text-color, #757575)'
            }
          }
        }
      }
    };

    window.elegantChart = new Chart(canvas, chartConfig);
  }

  updated(changed) {
    if (changed.has('hass') || changed.has('config')) {
      if (!this._loading) {
        this.renderChart();
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.wsManager) {
      this.wsManager.unsubscribe(this.config.entities);
    }

    if (window.elegantChart) {
      window.elegantChart.destroy();
      window.elegantChart = null;
    }
  }

  render() {
    return html`
      <ha-card .header="${this.config.title || 'Chart'}">
        <div class="card-content">
          ${this._loading
            ? html` <div class="loading">Laden...</div> `
            : html`
                <div id="chart-container">
                  <canvas id="elegant-chart-canvas"></canvas>
                </div>
              `}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      height: 100%;
    }

    .card-content {
      padding: 16px;
      position: relative;
      overflow: hidden;
    }

    #chart-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: var(--secondary-text-color, #757575);
      font-size: 14px;
    }

    canvas {
      max-width: 100%;
    }
  `;

  constructor() {
    super();
    this._loading = true;
    this._chart = null;
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);
