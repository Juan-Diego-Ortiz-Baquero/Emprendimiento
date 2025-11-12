/**
 * Vue Components for Responsive Animals Module
 */

// Mobile Card Component for Animals
const AnimalCard = {
  props: ['animal'],
  template: `
    <div class="table-card-item">
      <div class="table-card-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div 
            class="avatar"
            :style="{ background: animal.avatarColor }"
          >
            {{ animal.name.charAt(0) }}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.938rem; color: var(--text-primary);">
              {{ animal.name }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">
              {{ animal.code }}
            </div>
          </div>
        </div>
        <span 
          :class="'status-indicator status-indicator-' + animal.status.class"
        >
          {{ animal.status.name }}
        </span>
      </div>
      
      <div class="table-card-body">
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-wifi"></i> RFID Tag
          </span>
          <span class="table-card-value" style="font-family: monospace; font-size: 0.813rem;">
            {{ animal.rfid }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-dna"></i> Raza
          </span>
          <span class="table-card-value">
            {{ animal.breed }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-calendar"></i> Edad
          </span>
          <span class="table-card-value">
            {{ animal.age_display }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-weight"></i> Peso
          </span>
          <span class="table-card-value">
            {{ animal.weight }} kg
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-map-marker-alt"></i> Ubicación
          </span>
          <span class="table-card-value">
            {{ animal.location }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-clock"></i> Último escaneo
          </span>
          <span class="table-card-value">
            {{ animal.last_scan_display }}
          </span>
        </div>
      </div>
      
      <div class="table-card-actions">
        <button 
          @click="$emit('view', animal)"
          class="btn btn-outline"
          style="flex: 1;"
          title="Ver detalles"
        >
          <i class="fas fa-eye"></i>
          Ver
        </button>
        <button 
          @click="$emit('edit', animal)"
          class="btn btn-outline"
          style="flex: 1;"
          title="Editar"
        >
          <i class="fas fa-edit"></i>
          Editar
        </button>
        <button 
          @click="$emit('delete', animal)"
          class="btn btn-outline"
          style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: transparent;"
          title="Eliminar"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `
};

// Health Record Card Component
const HealthRecordCard = {
  props: ['record'],
  template: `
    <div class="table-card-item">
      <div class="table-card-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div 
            class="avatar"
            :style="{ background: record.avatarColor }"
          >
            {{ record.animal_name.charAt(0) }}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.938rem; color: var(--text-primary);">
              {{ record.animal_name }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">
              {{ record.animal_code }}
            </div>
          </div>
        </div>
        <span 
          :class="'status-indicator status-indicator-' + record.status.class"
        >
          {{ record.status.name }}
        </span>
      </div>
      
      <div class="table-card-body">
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-calendar-check"></i> Fecha
          </span>
          <span class="table-card-value">
            {{ record.checkup_date_display }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-syringe"></i> Vacuna
          </span>
          <span class="table-card-value">
            {{ record.vaccine }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-pills"></i> Tratamiento
          </span>
          <span class="table-card-value">
            {{ record.treatment }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-user-md"></i> Veterinario
          </span>
          <span class="table-card-value">
            {{ record.veterinarian }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-thermometer-half"></i> Temperatura
          </span>
          <span class="table-card-value">
            {{ record.temperature }}°C
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-weight"></i> Peso
          </span>
          <span class="table-card-value">
            {{ record.weight }} kg
          </span>
        </div>
      </div>
      
      <div class="table-card-actions">
        <button 
          @click="$emit('view', record)"
          class="btn btn-outline"
          style="flex: 1;"
        >
          <i class="fas fa-eye"></i>
          Ver Detalles
        </button>
        <button 
          @click="$emit('edit', record)"
          class="btn btn-outline"
          style="flex: 1;"
        >
          <i class="fas fa-edit"></i>
          Editar
        </button>
      </div>
    </div>
  `
};

// RFID Reading Card Component
const RFIDReadingCard = {
  props: ['reading'],
  template: `
    <div class="table-card-item">
      <div class="table-card-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div 
            class="icon-wrapper"
            :style="{ 
              background: 'linear-gradient(135deg, ' + reading.event_type.color + ' 0%, ' + reading.event_type.color + 'dd 100%)',
              width: '40px',
              height: '40px'
            }"
          >
            <i :class="'fas fa-' + reading.event_type.icon" style="color: white; font-size: 18px;"></i>
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.938rem; color: var(--text-primary);">
              {{ reading.animal_name }}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary); font-family: monospace;">
              {{ reading.rfid_code }}
            </div>
          </div>
        </div>
        <span 
          :class="'status-indicator status-indicator-' + reading.status.class"
        >
          <i :class="'fas fa-' + reading.status.icon"></i>
          {{ reading.status.name }}
        </span>
      </div>
      
      <div class="table-card-body">
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-tag"></i> Evento
          </span>
          <span 
            class="table-card-value"
            :style="{ color: reading.event_type.color, fontWeight: 600 }"
          >
            {{ reading.event_type.name }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-map-marker-alt"></i> Ubicación
          </span>
          <span class="table-card-value">
            {{ reading.location }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-router"></i> Lector
          </span>
          <span class="table-card-value">
            {{ reading.reader_id }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-clock"></i> Fecha y Hora
          </span>
          <span class="table-card-value">
            {{ reading.scan_datetime_display }}
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-signal"></i> Señal
          </span>
          <span class="table-card-value">
            {{ reading.signal_strength }}%
          </span>
        </div>
        
        <div class="table-card-row">
          <span class="table-card-label">
            <i class="fas fa-dna"></i> Raza
          </span>
          <span class="table-card-value">
            {{ reading.breed }}
          </span>
        </div>
      </div>
      
      <div class="table-card-actions">
        <button 
          @click="$emit('view', reading)"
          class="btn btn-outline"
          style="flex: 1;"
        >
          <i class="fas fa-info-circle"></i>
          Ver Detalles
        </button>
        <button 
          @click="$emit('viewAnimal', reading)"
          class="btn btn-outline"
          style="flex: 1;"
        >
          <i class="fas fa-cow"></i>
          Ver Animal
        </button>
      </div>
    </div>
  `
};

// Export components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AnimalCard,
    HealthRecordCard,
    RFIDReadingCard
  };
}

// Make available globally
window.VueResponsiveComponents = {
  AnimalCard,
  HealthRecordCard,
  RFIDReadingCard
};
