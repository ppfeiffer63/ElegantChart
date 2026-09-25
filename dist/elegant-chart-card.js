import{LitElement,html,css}from"https://cdn.jsdelivr.net/gh/lit/lit@3/+esm";class ElegantChartEditor extends LitElement{static properties={config:{type:Object},hass:{type:Object},errors:{type:Array},availableEntities:{type:Array}};constructor(){super(),this.errors=[],this.availableEntities=[]}setConfig(t){this.config=t||{},this.errors=[],this.updateAvailableEntities()}set hass(t){this._hass=t,this.updateAvailableEntities()}get hass(){return this._hass}updateAvailableEntities(){if(!this.hass)return;const t=Object.keys(this.hass.states).filter(t=>t.startsWith("sensor.")).sort();this.availableEntities=t}validateEntities(t){const e=t.split("\n").map(t=>t.trim()).filter(t=>t);if(this.errors=[],0===e.length)return this.errors.push("Mindestens 1 Sensor erforderlich"),!1;if(e.length>5)return this.errors.push("Maximum 5 Sensoren erlaubt"),!1;const i=e.filter(t=>!this.hass.states[t]);return!(i.length>0)||(this.errors.push(`Unbekannte Sensoren: ${i.join(", ")}`),!1)}handleEntitiesChange(t){const e=t.target.value;if(this.validateEntities(e)){const t=e.split("\n").map(t=>t.trim()).filter(t=>t);this.updateConfig({entities:t}),this.errors=[]}}updateConfig(t){const e={type:"custom:elegant-chart-card",...this.config,...t};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},composed:!0,bubbles:!0}))}render(){return html`
      <div class="editor">
        ${this.errors.length>0?html`
              <div class="errors">
                ${this.errors.map(t=>html`<div class="error">⚠️ ${t}</div>`)}
              </div>
            `:""}

        <div class="form-group">
          <label>Kartentitel</label>
          <input
            type="text"
            .value="${this.config.title||""}"
            @change="${t=>this.updateConfig({title:t.target.value})}"
            placeholder="z.B. Garten Live"
          />
        </div>

        <div class="form-group">
          <label>Diagramm-Typ</label>
          <select
            @change="${t=>this.updateConfig({chart_type:t.target.value})}"
            .value="${this.config.chart_type||"line"}"
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
              .value="${this.config.height||300}"
              @change="${t=>this.updateConfig({height:parseInt(t.target.value)})}"
              min="200"
              max="800"
              step="50"
            />
          </div>

          <div class="form-group half">
            <label>Update Interval (ms)</label>
            <input
              type="number"
              .value="${this.config.update_interval||1e3}"
              @change="${t=>this.updateConfig({update_interval:parseInt(t.target.value)})}"
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
              .value="${this.config.min??0}"
              @change="${t=>this.updateConfig({min:parseFloat(t.target.value)})}"
              step="0.1"
            />
          </div>

          <div class="form-group half">
            <label>Max Y-Wert</label>
            <input
              type="number"
              .value="${this.config.max??100}"
              @change="${t=>this.updateConfig({max:parseFloat(t.target.value)})}"
              step="0.1"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Sensoren (eine pro Zeile)</label>
          <textarea
            .value="${(this.config.entities||[]).join("\n")}"
            @change="${t=>this.handleEntitiesChange(t)}"
            placeholder="sensor.gartensensor_temperature&#10;sensor.gartensensor_humidity&#10;sensor.solar_power"
            rows="5"
          ></textarea>
          <div class="hint">Verfügbare Sensoren: ${this.availableEntities.length}</div>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${!1!==this.config.show_legend}"
              @change="${t=>this.updateConfig({show_legend:t.target.checked})}"
            />
            Legende anzeigen
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${!1!==this.config.show_grid}"
              @change="${t=>this.updateConfig({show_grid:t.target.checked})}"
            />
            Gitternetz anzeigen
          </label>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              .checked="${!1!==this.config.use_websocket}"
              @change="${t=>this.updateConfig({use_websocket:t.target.checked})}"
            />
            WebSocket für Updates nutzen
          </label>
        </div>
      </div>
    `}static styles=css`
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
  `}customElements.define("elegant-chart-editor",ElegantChartEditor);import{LitElement,html,css}from"https://cdn.jsdelivr.net/gh/lit/lit@3/+esm";import{ElegantChartWebSocketManager}from"./websocket-manager.js";import"./editor.js";class ElegantChartCard extends LitElement{static properties={hass:{type:Object},config:{type:Object},_chart:{type:Object,state:!0},_loading:{type:Boolean,state:!0}};static getConfigElement(){return document.createElement("elegant-chart-editor")}static getStubConfig(){return{type:"custom:elegant-chart-card",title:"Elegant Chart",entities:[],chart_type:"line",height:300,update_interval:1e3,show_legend:!0,show_grid:!0,use_websocket:!0,min:0,max:100}}setConfig(t){if(!t.entities?.length)throw new Error("Mindestens 1 Sensor erforderlich");if(t.entities.length>5)throw new Error("Maximum 5 Sensoren");this.config={...ElegantChartCard.getStubConfig(),...t}}connectedCallback(){super.connectedCallback(),this._loading=!0,!1!==this.config.use_websocket&&(this.wsManager=new ElegantChartWebSocketManager(this.hass),this.wsManager.subscribe(this.config.entities,t=>{this.onSensorUpdate(t)})),setTimeout(()=>{this.renderChart(),this._loading=!1},100)}onSensorUpdate(t){if(window.elegantChart){const e=this.config.entities.indexOf(t.entity_id);e>=0&&(window.elegantChart.data.datasets[e].data[0]=t.state,window.elegantChart.update("none"))}}async renderChart(){const t=this.shadowRoot?.querySelector("#elegant-chart-canvas");if(!t||!this.hass)return;const{Chart:e}=await(import("https://cdn.jsdelivr.net/npm/chart.js@4/+esm")),i=[{border:"rgba(59, 130, 246, 1)",bg:"rgba(59, 130, 246, 0.1)"},{border:"rgba(239, 68, 68, 1)",bg:"rgba(239, 68, 68, 0.1)"},{border:"rgba(16, 185, 129, 1)",bg:"rgba(16, 185, 129, 0.1)"},{border:"rgba(245, 158, 11, 1)",bg:"rgba(245, 158, 11, 0.1)"},{border:"rgba(139, 92, 246, 1)",bg:"rgba(139, 92, 246, 0.1)"}],a=this.config.entities.map((t,e)=>{const a=this.hass.states[t];if(!a)return null;const s=parseFloat(a.state);if(isNaN(s))return null;const r=i[e%i.length];return{label:a.attributes?.friendly_name||t,data:[s],borderColor:r.border,backgroundColor:r.bg,tension:.4,fill:"scatter"!==this.config.chart_type,borderWidth:2,pointRadius:4,pointHoverRadius:6,pointBackgroundColor:r.border,pointBorderColor:"#fff",pointBorderWidth:2,spanGaps:!0}}).filter(t=>t);window.elegantChart&&window.elegantChart.destroy();const s={type:this.config.chart_type||"line",data:{labels:[(new Date).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"})],datasets:a},options:{responsive:!0,maintainAspectRatio:!1,animation:{duration:200},interaction:{mode:"index",intersect:!1},plugins:{legend:{display:!1!==this.config.show_legend,position:"top",labels:{usePointStyle:!0,padding:15,font:{size:12,weight:"500"},color:"var(--primary-text-color, #212121)"}},title:{display:!!this.config.title,text:this.config.title,font:{size:14,weight:"bold"},padding:12,color:"var(--primary-text-color, #212121)"},filler:{propagate:!0}},scales:{y:{beginAtZero:!1,min:void 0!==this.config.min?this.config.min:void 0,max:void 0!==this.config.max?this.config.max:void 0,grid:{display:!1!==this.config.show_grid,drawBorder:!0,color:"rgba(0, 0, 0, 0.05)"},ticks:{callback:t=>null===t?"":"number"==typeof t?t.toFixed(1):t,font:{size:11},color:"var(--secondary-text-color, #757575)"}},x:{grid:{display:!1},ticks:{font:{size:11},color:"var(--secondary-text-color, #757575)"}}}}};window.elegantChart=new e(t,s)}updated(t){(t.has("hass")||t.has("config"))&&(this._loading||this.renderChart())}disconnectedCallback(){super.disconnectedCallback(),this.wsManager&&this.wsManager.unsubscribe(this.config.entities),window.elegantChart&&(window.elegantChart.destroy(),window.elegantChart=null)}render(){return html`
      <ha-card .header="${this.config.title||"Chart"}">
        <div class="card-content">
          ${this._loading?html` <div class="loading">Laden...</div> `:html`
                <div id="chart-container">
                  <canvas id="elegant-chart-canvas"></canvas>
                </div>
              `}
        </div>
      </ha-card>
    `}static styles=css`
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
  `;constructor(){super(),this._loading=!0,this._chart=null}}customElements.define("elegant-chart-card",ElegantChartCard);export class ElegantChartWebSocketManager{constructor(t){this.hass=t,this.subscriptions=new Map,this.dataBuffer=new Map,this.maxBufferSize=864,this.updateCallbacks=new Map,this.dataPointInterval=3e5,this.lastDataPointTime=new Map}subscribe(t,e){if(!this.hass?.connection?.subscribeMessage)return console.warn("WebSocket nicht verfügbar, Fallback auf State"),this.fallbackSubscribe(t,e);const i=this.hass.connection.subscribeMessage(t=>{if("state_changed"===t.type){const i=t.data.new_state,a=i.entity_id,s=parseFloat(i.state);if(isNaN(s))return void console.warn(`Ungültige Daten von ${a}:`,i.state);this.dataBuffer.has(a)||(this.dataBuffer.set(a,[]),this.lastDataPointTime.set(a,0));const r=this.dataBuffer.get(a),n=new Date(i.last_updated),o=n.getTime();o-this.lastDataPointTime.get(a)>=this.dataPointInterval&&(r.push({value:s,timestamp:n,attributes:i.attributes,unit:i.attributes?.unit_of_measurement||""}),r.length>this.maxBufferSize&&r.shift(),this.lastDataPointTime.set(a,o),e({entity_id:a,state:s,attributes:i.attributes,timestamp:n,history:[...r],unit:i.attributes?.unit_of_measurement||"",bufferSize:r.length,maxBufferSize:this.maxBufferSize}))}},{type:"subscribe_entities",entity_ids:t}),a=t.join(",");return this.subscriptions.set(a,i),this.updateCallbacks.set(a,e),i}fallbackSubscribe(t,e){const i=setInterval(()=>{t.forEach(t=>{const i=this.hass.states[t];if(i){const a=parseFloat(i.state);if(!isNaN(a)){this.dataBuffer.has(t)||(this.dataBuffer.set(t,[]),this.lastDataPointTime.set(t,0));const s=this.dataBuffer.get(t),r=new Date,n=r.getTime();n-this.lastDataPointTime.get(t)>=this.dataPointInterval&&(s.push({value:a,timestamp:r,attributes:i.attributes,unit:i.attributes?.unit_of_measurement||""}),s.length>this.maxBufferSize&&s.shift(),this.lastDataPointTime.set(t,n),e({entity_id:t,state:a,attributes:i.attributes,timestamp:r,history:[...s],unit:i.attributes?.unit_of_measurement||"",bufferSize:s.length,maxBufferSize:this.maxBufferSize}))}}})},1e3),a=t.join(",");return this.subscriptions.set(a,()=>clearInterval(i)),()=>clearInterval(i)}unsubscribe(t){const e=t.join(","),i=this.subscriptions.get(e);i&&i(),this.subscriptions.delete(e),this.updateCallbacks.delete(e),this.dataBuffer.delete(e)}getBuffer(t){return this.dataBuffer.get(t)||[]}getAllBuffers(){return Object.fromEntries(this.dataBuffer)}clearBuffers(){this.dataBuffer.clear()}getLastValue(t){const e=this.getBuffer(t);return e.length>0?e[e.length-1].value:null}}