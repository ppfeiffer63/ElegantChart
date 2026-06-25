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
