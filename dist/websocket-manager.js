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
