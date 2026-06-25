// Simple Elegant Chart Card - Self-contained Bundle
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
    this.chart = null;
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
      </div>
    `;

    setTimeout(() => this.initChart(), 100);
  }

  initChart() {
    const canvas = this.shadowRoot.getElementById('myChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const datasets = (this.config.entities || []).map((entity, idx) => {
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
      return {
        label: entity.split('.')[1] || entity,
        data: [Math.random() * 100],
        borderColor: colors[idx % colors.length],
        backgroundColor: colors[idx % colors.length] + '20',
        tension: 0.3
      };
    });

    this.chart = {
      type: this.config.chart_type || 'line',
      data: {
        labels: ['Now'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: this.config.show_legend !== false
          }
        },
        scales: {
          y: {
            min: this.config.min,
            max: this.config.max,
            grid: {
              display: this.config.show_grid !== false
            }
          }
        }
      }
    };

    this.drawChart(ctx);
  }

  drawChart(ctx) {
    // Simple canvas drawing without Chart.js library
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Chart Data', 20, 30);
    
    // Draw dummy data
    ctx.strokeStyle = '#36A2EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(150, 100);
    ctx.lineTo(250, 120);
    ctx.stroke();
    
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText(this.config?.entities?.[0] || 'Sensor 1', 20, 60);
  }

  updateChart() {
    if (!this.config || !this.hass) return;
    
    // Update with real data from entities
    if (this.config.entities && this.config.entities.length > 0) {
      const entity = this.config.entities[0];
      const state = this.hass.states[entity];
      if (state) {
        console.log(`${entity}: ${state.state}`);
      }
    }
  }

  static get properties() {
    return {
      hass: {},
      config: {}
    };
  }
}

customElements.define('elegant-chart-card', ElegantChartCard);

// Export for custom element editor
const getConfigElement = () => {
  return document.createElement('elegant-chart-card-editor');
};

const getStubConfig = () => ({
  type: 'custom:elegant-chart-card',
  title: 'Elegant Chart',
  entities: [],
  chart_type: 'line',
  height: 300
});

console.log('✅ Elegant Chart Card loaded');
