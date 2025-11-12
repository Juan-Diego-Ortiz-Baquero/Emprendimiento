#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AgroTrace System - Dashboard Administrativo de Trazabilidad Ganadera
Versión: 3.0.0
Desarrolladores: Santiago Valenzuela & Juan Ortiz
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from datetime import datetime, timedelta
import random
import uuid
import json

# ============================================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ============================================================================

app = Flask(__name__)
app.config['SECRET_KEY'] = 'agrotrace-2025-secret-key-dev'
app.config['JSON_AS_ASCII'] = False

# ============================================================================
# CONTEXT PROCESSOR - Variables globales para templates
# ============================================================================

@app.context_processor
def inject_globals():
    """
    Inyecta variables globales en todos los templates
    Esto evita el error 'undefined' en Jinja2
    """
    return {
        'app_name': 'AgroTrace',
        'app_version': '3.0.0',
        'current_year': datetime.now().year
    }

# ============================================================================
# MODELO DE DATOS
# ============================================================================

class DataGenerator:
    """Generador de datos simulados para el dashboard"""
    
    @staticmethod
    def generate_animals(count=155):
        """Genera lista de animales con datos realistas"""
        breeds = ['Holstein', 'Brahman', 'Angus', 'Simmental', 'Charolais', 'Hereford', 'Jersey']
        statuses = [
            {'name': 'Saludable', 'class': 'success', 'color': 'green'},
            {'name': 'En Observación', 'class': 'warning', 'color': 'yellow'},
            {'name': 'Tratamiento', 'class': 'danger', 'color': 'red'},
            {'name': 'Cuarentena', 'class': 'info', 'color': 'blue'}
        ]
        locations = [
            'Sector A - Pastoreo', 'Sector B - Pastoreo', 'Sector C - Alimentación',
            'Corral 1', 'Corral 2', 'Corral 3', 'Zona Norte', 'Zona Sur'
        ]
        
        animals = []
        for i in range(1, count + 1):
            last_scan = datetime.now() - timedelta(minutes=random.randint(1, 4320))
            status = random.choices(statuses, weights=[75, 12, 8, 5])[0]
            weight = random.randint(180, 650)
            age_months = random.randint(8, 84)
            
            animal = {
                'id': i,
                'code': f'AG{i:04d}',
                'rfid': f'RF-{uuid.uuid4().hex[:8].upper()}',
                'name': f'Animal-{i:03d}',
                'breed': random.choice(breeds),
                'age_months': age_months,
                'age': age_months // 12,  # Edad en años
                'age_display': f"{age_months // 12}a {age_months % 12}m" if age_months >= 12 else f"{age_months}m",
                'weight': weight,
                'weight_gain': round(random.uniform(-2, 5), 1),
                'status': status,
                'location': random.choice(locations),
                'last_scan': last_scan.isoformat(),
                'last_scan_display': last_scan.strftime('%d/%m/%Y %H:%M'),
                'lastCheck': last_scan.strftime('%d/%m %H:%M'),  # Para la plantilla
                'health_score': random.randint(75, 100) if status['class'] == 'success' else random.randint(40, 85),
                'vaccinated': random.choice([True, False]),
                'temperature': round(random.uniform(37.5, 39.5), 1),
                'birth_date': (datetime.now() - timedelta(days=age_months * 30)).isoformat(),
                'owner': f'Finca {random.choice(["El Paraíso", "La Esperanza", "San José", "Villa Rica"])}',
                'avatarColor': random.choice(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']),
                'observations': '',
                'notes': random.choice([
                    'Sin observaciones', 
                    'Control veterinario pendiente',
                    'Programado para vacunación',
                    'En seguimiento',
                    ''
                ])
            }
            animals.append(animal)
        
        return animals
    
    @staticmethod
    def generate_health_records(count=120):
        """Genera registros de salud simulados para el módulo Health"""
        animals = DataGenerator.generate_animals(155)
        vaccines = [
            'Fiebre Aftosa', 'Brucelosis', 'Rabia Bovina', 'Carbunco', 
            'Clostridiosis', 'IBR/DVB', 'Leptospirosis', 'Triple'
        ]
        treatments = [
            'Desparasitación interna', 'Desparasitación externa', 'Antibiótico general',
            'Vitaminas y minerales', 'Tratamiento respiratorio', 'Tratamiento digestivo',
            'Cicatrización de heridas', 'Control de garrapatas', 'Ninguno'
        ]
        veterinarians = ['Dr. García', 'Dra. Martínez', 'Dr. López', 'Dra. Fernández', 'Dr. Rodríguez']
        
        statuses = [
            {'name': 'Completado', 'class': 'success'},
            {'name': 'Pendiente', 'class': 'warning'},
            {'name': 'Urgente', 'class': 'danger'},
            {'name': 'Programado', 'class': 'info'}
        ]
        
        records = []
        for i in range(1, count + 1):
            animal = random.choice(animals)
            status = random.choices(statuses, weights=[60, 20, 10, 10])[0]
            checkup_date = datetime.now() - timedelta(days=random.randint(0, 180))
            next_checkup = datetime.now() + timedelta(days=random.randint(15, 90))
            
            weight = animal['weight'] + random.randint(-20, 30)
            temperature = round(random.uniform(37.5, 39.8), 1)
            
            record = {
                'id': i,
                'animal_id': animal['id'],
                'animal_name': animal['name'],
                'animal_code': animal['code'],
                'rfid': animal['rfid'],
                'breed': animal['breed'],
                'checkup_date': checkup_date.strftime('%Y-%m-%d'),
                'checkup_date_display': checkup_date.strftime('%d/%m/%Y'),
                'checkup_time': checkup_date.strftime('%H:%M'),
                'next_checkup': next_checkup.strftime('%Y-%m-%d'),
                'next_checkup_display': next_checkup.strftime('%d/%m/%Y'),
                'weight': weight,
                'temperature': temperature,
                'heart_rate': random.randint(55, 85),
                'respiratory_rate': random.randint(20, 40),
                'status': status,
                'vaccine': random.choice(vaccines),
                'treatment': random.choice(treatments),
                'veterinarian': random.choice(veterinarians),
                'observations': random.choice([
                    'Animal en condiciones óptimas',
                    'Requiere seguimiento en 15 días',
                    'Programar próxima vacunación',
                    'Control de peso recomendado',
                    'Sin observaciones',
                    'Revisar alimentación',
                    'Monitorear temperatura',
                    ''
                ]),
                'diagnosis': random.choice([
                    'Saludable', 'Parasitosis leve', 'En recuperación', 
                    'Control rutinario', 'Tratamiento preventivo', 'Normal'
                ]),
                'cost': round(random.uniform(15000, 85000), 2),
                'avatarColor': animal['avatarColor']
            }
            records.append(record)
        
        return sorted(records, key=lambda x: x['checkup_date'], reverse=True)
    
    @staticmethod
    def generate_activity_feed(limit=15):
        """Genera feed de actividad reciente"""
        activity_types = [
            {'type': 'scan', 'icon': 'wifi', 'color': 'blue', 'template': 'Escaneo RFID: {0} en {1}'},
            {'type': 'health', 'icon': 'heart-pulse', 'color': 'red', 'template': 'Alerta de salud: {0} requiere atención'},
            {'type': 'vaccination', 'icon': 'syringe', 'color': 'green', 'template': 'Vacunación completada: {0}'},
            {'type': 'movement', 'icon': 'truck', 'color': 'purple', 'template': 'Traslado: {0} → {1}'},
            {'type': 'weight', 'icon': 'weight-scale', 'color': 'yellow', 'template': 'Pesaje registrado: {0} - {1}kg'},
            {'type': 'treatment', 'icon': 'pills', 'color': 'orange', 'template': 'Tratamiento iniciado: {0}'},
        ]
        
        animals = DataGenerator.generate_animals(50)
        activities = []
        
        for i in range(limit):
            animal = random.choice(animals)
            activity_type = random.choice(activity_types)
            minutes_ago = random.randint(1, 720)
            timestamp = datetime.now() - timedelta(minutes=minutes_ago)
            
            if activity_type['type'] == 'movement':
                locations = ['Sector A', 'Sector B', 'Corral 1', 'Zona Norte']
                message = activity_type['template'].format(animal['name'], random.choice(locations))
            elif activity_type['type'] == 'weight':
                message = activity_type['template'].format(animal['name'], animal['weight'])
            elif activity_type['type'] == 'scan':
                locations = ['Sector A', 'Sector B', 'Corral 1', 'Zona Norte', 'Establo']
                message = activity_type['template'].format(animal['name'], random.choice(locations))
            else:
                message = activity_type['template'].format(animal['name'])
            
            activities.append({
                'id': str(uuid.uuid4()),
                'type': activity_type['type'],
                'icon': activity_type['icon'],
                'color': activity_type['color'],
                'message': message,
                'timestamp': timestamp.isoformat(),
                'time_ago': DataGenerator.time_ago(timestamp),
                'user': random.choice(['Admin', 'Veterinario', 'Operador', 'Sistema'])
            })
        
        return sorted(activities, key=lambda x: x['timestamp'], reverse=True)
    
    @staticmethod
    def time_ago(dt):
        """Convierte datetime a formato 'hace X tiempo'"""
        now = datetime.now()
        diff = now - dt
        
        if diff.total_seconds() < 60:
            return 'Hace unos segundos'
        elif diff.total_seconds() < 3600:
            minutes = int(diff.total_seconds() / 60)
            return f'Hace {minutes} minuto{"s" if minutes > 1 else ""}'
        elif diff.total_seconds() < 86400:
            hours = int(diff.total_seconds() / 3600)
            return f'Hace {hours} hora{"s" if hours > 1 else ""}'
        else:
            days = int(diff.total_seconds() / 86400)
            return f'Hace {days} día{"s" if days > 1 else ""}'

    @staticmethod
    def generate_rfid_readings(count=200):
        """Genera lecturas RFID simuladas para el módulo RFID"""
        animals = DataGenerator.generate_animals(155)
        
        locations = [
            'Entrada Principal', 'Sector A - Pastoreo', 'Sector B - Pastoreo', 
            'Corral 1', 'Corral 2', 'Corral 3', 'Establo Norte', 'Establo Sur',
            'Zona de Alimentación', 'Zona de Ordeño', 'Báscula de Pesaje', 
            'Clínica Veterinaria', 'Zona de Cuarentena', 'Salida/Carga'
        ]
        
        readers = [
            'RFID-001', 'RFID-002', 'RFID-003', 'RFID-004', 'RFID-005',
            'RFID-006', 'RFID-007', 'RFID-008'
        ]
        
        statuses = [
            {'name': 'Exitoso', 'class': 'success', 'icon': 'check-circle'},
            {'name': 'Exitoso', 'class': 'success', 'icon': 'check-circle'},
            {'name': 'Exitoso', 'class': 'success', 'icon': 'check-circle'},
            {'name': 'Exitoso', 'class': 'success', 'icon': 'check-circle'},
            {'name': 'Error de Lectura', 'class': 'danger', 'icon': 'exclamation-circle'},
            {'name': 'Señal Débil', 'class': 'warning', 'icon': 'signal'}
        ]
        
        event_types = [
            {'name': 'Entrada', 'icon': 'sign-in-alt', 'color': '#10B981'},
            {'name': 'Salida', 'icon': 'sign-out-alt', 'color': '#EF4444'},
            {'name': 'Pesaje', 'icon': 'weight', 'color': '#F59E0B'},
            {'name': 'Control', 'icon': 'clipboard-check', 'color': '#3B82F6'},
            {'name': 'Alimentación', 'icon': 'utensils', 'color': '#8B5CF6'},
            {'name': 'Ordeño', 'icon': 'droplet', 'color': '#06B6D4'}
        ]
        
        readings = []
        for i in range(1, count + 1):
            animal = random.choice(animals)
            status = random.choice(statuses)
            event = random.choice(event_types)
            location = random.choice(locations)
            reader = random.choice(readers)
            
            # Generar timestamp aleatorio en los últimos 7 días
            days_ago = random.randint(0, 7)
            hours = random.randint(0, 23)
            minutes = random.randint(0, 59)
            seconds = random.randint(0, 59)
            scan_time = datetime.now() - timedelta(days=days_ago, hours=hours, minutes=minutes, seconds=seconds)
            
            # Simular intensidad de señal
            signal_strength = random.randint(45, 100) if status['class'] == 'success' else random.randint(20, 60)
            
            # Simular temperatura del tag
            tag_temperature = round(random.uniform(18.0, 32.0), 1)
            
            reading = {
                'id': i,
                'rfid_code': animal['rfid'],
                'animal_id': animal['id'],
                'animal_name': animal['name'],
                'animal_code': animal['code'],
                'breed': animal['breed'],
                'weight': animal['weight'],
                'status_animal': animal['status'],
                'location': location,
                'reader_id': reader,
                'event_type': event,
                'scan_timestamp': scan_time.strftime('%Y-%m-%d %H:%M:%S'),
                'scan_date': scan_time.strftime('%d/%m/%Y'),
                'scan_time': scan_time.strftime('%H:%M:%S'),
                'scan_datetime_display': scan_time.strftime('%d/%m/%Y %H:%M'),
                'status': status,
                'signal_strength': signal_strength,
                'tag_temperature': tag_temperature,
                'battery_level': random.randint(60, 100),
                'read_count': random.randint(1, 50),
                'duration_ms': random.randint(50, 500),
                'distance_meters': round(random.uniform(0.5, 5.0), 1),
                'notes': random.choice([
                    'Lectura exitosa', 
                    'Animal identificado correctamente',
                    'Requiere mantenimiento del tag',
                    'Señal óptima',
                    'Tag en buen estado',
                    ''
                ]),
                'avatarColor': animal['avatarColor']
            }
            readings.append(reading)
        
        return sorted(readings, key=lambda x: x['scan_timestamp'], reverse=True)

# Instancia global del generador
data_gen = DataGenerator()

# ============================================================================
# RUTAS PRINCIPALES
# ============================================================================

@app.route('/')
def index():
    """Dashboard principal"""
    # Generar estadísticas
    animals = data_gen.generate_animals()
    total = len(animals)
    healthy = len([a for a in animals if a['status']['class'] == 'success'])
    warning = len([a for a in animals if a['status']['class'] == 'warning'])
    critical = len([a for a in animals if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('index.html', stats=stats)

@app.route('/animals')
def animals():
    """Vista de gestión de animales"""
    animals_list = data_gen.generate_animals()
    total = len(animals_list)
    healthy = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('animals.html', stats=stats, animals_list=animals_list)

@app.route('/health')
def health():
    """Vista de historial de salud animal"""
    # Generar registros de salud simulados
    health_records = data_gen.generate_health_records()
    animals_list = data_gen.generate_animals()
    
    # Calcular estadísticas de salud
    total_records = len(health_records)
    pending_checkups = len([r for r in health_records if r['status']['class'] == 'warning'])
    completed_checkups = len([r for r in health_records if r['status']['class'] == 'success'])
    critical_cases = len([r for r in health_records if r['status']['class'] == 'danger'])
    
    # Calcular estadísticas de animales para el layout
    healthy_animals = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning_animals = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical_animals = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        # Estadísticas de registros de salud
        'total_records': total_records,
        'pending_checkups': pending_checkups,
        'completed_checkups': completed_checkups,
        'critical_cases': critical_cases,
        'vaccination_rate': round((completed_checkups / total_records * 100) if total_records > 0 else 0),
        
        # Estadísticas de animales (para el layout)
        'total': len(animals_list),
        'healthy': healthy_animals,
        'warning': warning_animals,
        'critical': critical_animals,
        'healthy_percentage': round((healthy_animals / len(animals_list) * 100) if len(animals_list) > 0 else 0)
    }
    
    return render_template('health.html', stats=stats, health_records=health_records, animals_list=animals_list)

@app.route('/rfid')
def rfid():
    """Vista de gestión de lecturas RFID"""
    # Generar lecturas RFID simuladas
    rfid_readings = data_gen.generate_rfid_readings(200)
    animals_list = data_gen.generate_animals()
    
    # Calcular estadísticas de lecturas RFID
    total_readings = len(rfid_readings)
    successful_readings = len([r for r in rfid_readings if r['status']['class'] == 'success'])
    error_readings = len([r for r in rfid_readings if r['status']['class'] == 'danger'])
    weak_signal = len([r for r in rfid_readings if r['status']['class'] == 'warning'])
    
    # Lecturas por ubicación (top 5)
    location_counts = {}
    for reading in rfid_readings:
        loc = reading['location']
        location_counts[loc] = location_counts.get(loc, 0) + 1
    top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Lecturas de hoy
    today = datetime.now().date()
    today_readings = len([r for r in rfid_readings if datetime.strptime(r['scan_timestamp'], '%Y-%m-%d %H:%M:%S').date() == today])
    
    # Calcular estadísticas de animales para el layout
    healthy_animals = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning_animals = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical_animals = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        # Estadísticas de lecturas RFID
        'total_readings': total_readings,
        'successful_readings': successful_readings,
        'error_readings': error_readings,
        'weak_signal': weak_signal,
        'success_rate': round((successful_readings / total_readings * 100) if total_readings > 0 else 0),
        'today_readings': today_readings,
        'top_locations': top_locations,
        
        # Estadísticas de animales (para el layout)
        'total': len(animals_list),
        'healthy': healthy_animals,
        'warning': warning_animals,
        'critical': critical_animals,
        'healthy_percentage': round((healthy_animals / len(animals_list) * 100) if len(animals_list) > 0 else 0)
    }
    
    return render_template('rfid.html', stats=stats, rfid_readings=rfid_readings, animals_list=animals_list)

@app.route('/reports')
def reports():
    """Vista de reportes"""
    animals_list = data_gen.generate_animals()
    total = len(animals_list)
    healthy = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('index.html', stats=stats, view='reports')

@app.route('/settings')
def settings():
    """Vista de configuración"""
    animals_list = data_gen.generate_animals()
    total = len(animals_list)
    healthy = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('index.html', stats=stats, view='settings')

@app.route('/analytics')
def analytics():
    """Vista de analíticas - En desarrollo"""
    # Generar stats mínimo para el layout
    animals_list = data_gen.generate_animals()
    total = len(animals_list)
    healthy = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('analytics.html', stats=stats)

@app.route('/history')
def history():
    """Vista de historial - En desarrollo"""
    # Generar stats mínimo para el layout
    animals_list = data_gen.generate_animals()
    total = len(animals_list)
    healthy = len([a for a in animals_list if a['status']['class'] == 'success'])
    warning = len([a for a in animals_list if a['status']['class'] == 'warning'])
    critical = len([a for a in animals_list if a['status']['class'] == 'danger'])
    
    stats = {
        'total': total,
        'healthy': healthy,
        'warning': warning,
        'critical': critical,
        'healthy_percentage': round((healthy / total * 100) if total > 0 else 0)
    }
    
    return render_template('history.html', stats=stats)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/dashboard/stats')
def api_dashboard_stats():
    """Estadísticas principales del dashboard"""
    animals = data_gen.generate_animals()
    
    total = len(animals)
    healthy = len([a for a in animals if a['status']['class'] == 'success'])
    warning = len([a for a in animals if a['status']['class'] == 'warning'])
    critical = len([a for a in animals if a['status']['class'] in ['danger', 'info']])
    
    recent_scans = len([a for a in animals if 
        datetime.fromisoformat(a['last_scan']) > datetime.now() - timedelta(hours=24)])
    
    avg_weight = round(sum(a['weight'] for a in animals) / total, 1)
    avg_health_score = round(sum(a['health_score'] for a in animals) / total, 1)
    vaccination_rate = round(len([a for a in animals if a['vaccinated']]) / total * 100, 1)
    
    return jsonify({
        'success': True,
        'data': {
            'total_animals': total,
            'healthy': healthy,
            'warning': warning,
            'critical': critical,
            'health_percentage': round((healthy / total) * 100, 1),
            'recent_scans_24h': recent_scans,
            'avg_weight': avg_weight,
            'avg_health_score': avg_health_score,
            'vaccination_rate': vaccination_rate,
            'locations': 8,
            'system_uptime': '99.8%',
            'last_sync': datetime.now().strftime('%H:%M:%S')
        }
    })

@app.route('/api/animals')
def api_animals():
    """Lista de animales con paginación y filtros"""
    # Parámetros de consulta
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)
    search = request.args.get('search', '', type=str)
    status_filter = request.args.get('status', '', type=str)
    breed_filter = request.args.get('breed', '', type=str)
    location_filter = request.args.get('location', '', type=str)
    
    animals = data_gen.generate_animals()
    
    # Aplicar filtros
    if search:
        search_lower = search.lower()
        animals = [a for a in animals if 
                  search_lower in a['name'].lower() or 
                  search_lower in a['rfid'].lower() or 
                  search_lower in a['breed'].lower() or
                  search_lower in a['code'].lower()]
    
    if status_filter:
        animals = [a for a in animals if a['status']['class'] == status_filter]
    
    if breed_filter:
        animals = [a for a in animals if a['breed'] == breed_filter]
    
    if location_filter:
        animals = [a for a in animals if location_filter.lower() in a['location'].lower()]
    
    # Paginación
    total = len(animals)
    pages = (total + per_page - 1) // per_page
    start = (page - 1) * per_page
    end = start + per_page
    paginated = animals[start:end]
    
    return jsonify({
        'success': True,
        'data': paginated,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': pages,
            'has_next': page < pages,
            'has_prev': page > 1
        }
    })

@app.route('/api/activity/feed')
def api_activity_feed():
    """Feed de actividad reciente"""
    limit = request.args.get('limit', 15, type=int)
    activities = data_gen.generate_activity_feed(limit)
    
    return jsonify({
        'success': True,
        'data': activities
    })

@app.route('/api/charts/scans-timeline')
def api_scans_timeline():
    """Datos para gráfico de escaneos en el tiempo"""
    labels = []
    data = []
    
    for i in range(7, 0, -1):
        date = datetime.now() - timedelta(days=i)
        labels.append(date.strftime('%d/%m'))
        data.append(random.randint(80, 200))
    
    return jsonify({
        'success': True,
        'data': {
            'labels': labels,
            'datasets': [{
                'label': 'Escaneos RFID',
                'data': data,
                'borderColor': 'rgb(59, 130, 246)',
                'backgroundColor': 'rgba(59, 130, 246, 0.1)',
                'tension': 0.4
            }]
        }
    })

@app.route('/api/charts/health-distribution')
def api_health_distribution():
    """Distribución de estados de salud"""
    animals = data_gen.generate_animals()
    
    distribution = {}
    for animal in animals:
        status = animal['status']['name']
        distribution[status] = distribution.get(status, 0) + 1
    
    return jsonify({
        'success': True,
        'data': {
            'labels': list(distribution.keys()),
            'datasets': [{
                'data': list(distribution.values()),
                'backgroundColor': [
                    'rgb(34, 197, 94)',
                    'rgb(234, 179, 8)',
                    'rgb(239, 68, 68)',
                    'rgb(59, 130, 246)'
                ]
            }]
        }
    })

@app.route('/api/charts/weight-trends')
def api_weight_trends():
    """Tendencias de peso promedio"""
    months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    weights = [round(random.uniform(400, 500), 1) for _ in range(6)]
    
    return jsonify({
        'success': True,
        'data': {
            'labels': months,
            'datasets': [{
                'label': 'Peso Promedio (kg)',
                'data': weights,
                'backgroundColor': 'rgba(16, 185, 129, 0.8)'
            }]
        }
    })

# ============================================================================
# MANEJO DE ERRORES
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Página no encontrada"""
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'error': 'Endpoint no encontrado'}), 404
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Error interno del servidor"""
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500
    return render_template('index.html'), 500

# ============================================================================
# CONTEXTO DE PLANTILLAS
# ============================================================================

@app.context_processor
def inject_globals():
    """Inyecta variables globales en todas las plantillas"""
    return {
        'app_name': 'AgroTrace System',
        'app_version': '3.0.0',
        'current_year': datetime.now().year,
        'current_date': datetime.now().strftime('%d/%m/%Y'),
        'current_time': datetime.now().strftime('%H:%M')
    }

# ============================================================================
# PUNTO DE ENTRADA
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 AgroTrace System - Dashboard Administrativo")
    print("=" * 70)
    print(f"📡 Versión: 3.0.0")
    print(f"🐄 Animales registrados: 155")
    print(f"🌐 Servidor: http://localhost:5000")
    print(f"📊 Dashboard: http://localhost:5000/")
    print("=" * 70)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
    def __init__(self):
        self.animals = self._generate_animals()
        self.activity_log = []
        self.last_update = datetime.datetime.now()
    
    def _generate_animals(self):
        """Genera datos simulados de animales con trazabilidad RFID"""
        breeds = ['Holstein', 'Brahman', 'Angus', 'Simmental', 'Charolais']
        statuses = [
            {'name': 'Saludable', 'class': 'healthy'},
            {'name': 'En Observación', 'class': 'warning'},
            {'name': 'Tratamiento', 'class': 'critical'},
            {'name': 'Cuarentena', 'class': 'quarantine'}
        ]
        locations = ['Sector A', 'Sector B', 'Sector C', 'Corral 1', 'Corral 2', 'Pastoreo Norte']
        
        animals = []
        for i in range(1, 156):  # 155 animales
            last_scan = datetime.datetime.now() - datetime.timedelta(
                minutes=random.randint(1, 2880)  # Últimas 48 horas
            )
            status = random.choices(statuses, weights=[75, 12, 8, 5])[0]
            
            animal = {
                'id': f'AG{i:04d}',
                'rfid': f'RFID_{uuid.uuid4().hex[:8].upper()}',
                'name': f'Animal-{i:03d}',
                'breed': random.choice(breeds),
                'age_months': random.randint(8, 84),
                'weight': random.randint(180, 650),
                'status': status,
                'location': random.choice(locations),
                'last_scan': last_scan.isoformat(),
                'health_score': random.randint(75, 100) if status['class'] == 'healthy' else random.randint(40, 85),
                'vaccinated': random.choice([True, False]),
                'birth_date': (datetime.datetime.now() - datetime.timedelta(days=random.randint(240, 2520))).isoformat()
            }
            animals.append(animal)
        
        return animals
    
    def get_dashboard_stats(self):
        """Retorna estadísticas principales del dashboard"""
        total_animals = len(self.animals)
        healthy_count = len([a for a in self.animals if a['status']['class'] == 'healthy'])
        recent_scans = len([a for a in self.animals if 
            datetime.datetime.fromisoformat(a['last_scan']) > 
            datetime.datetime.now() - datetime.timedelta(hours=24)])
        alerts = len([a for a in self.animals if a['status']['class'] in ['critical', 'quarantine']])
        
        return {
            'total_animals': total_animals,
            'healthy_animals': healthy_count,
            'health_percentage': round((healthy_count / total_animals) * 100, 1),
            'recent_scans': recent_scans,
            'active_alerts': alerts,
            'vaccination_rate': round(len([a for a in self.animals if a['vaccinated']]) / total_animals * 100, 1),
            'avg_health_score': round(sum(a['health_score'] for a in self.animals) / total_animals, 1),
            'system_uptime': '99.8%',
            'last_sync': datetime.datetime.now().strftime('%H:%M:%S')
        }
    
    def get_activity_feed(self, limit=10):
        """Genera feed de actividad reciente"""
        activities = []
        activity_types = [
            {'type': 'scan', 'template': 'Animal {} escaneado en {}'},
            {'type': 'health', 'template': 'Alerta de salud: {} requiere atención'},
            {'type': 'vaccination', 'template': 'Vacunación completada para {}'},
            {'type': 'movement', 'template': 'Animal {} trasladado a {}'},
        ]
        
        for i in range(limit):
            animal = random.choice(self.animals)
            activity_type = random.choice(activity_types)
            minutes_ago = random.randint(1, 180)
            timestamp = datetime.datetime.now() - datetime.timedelta(minutes=minutes_ago)
            
            if activity_type['type'] == 'movement':
                message = activity_type['template'].format(animal['name'], animal['location'])
            elif activity_type['type'] == 'scan':
                message = activity_type['template'].format(animal['name'], animal['location'])
            else:
                message = activity_type['template'].format(animal['name'])
            
            activities.append({
                'id': str(uuid.uuid4()),
                'type': activity_type['type'],                'message': message,
                'description': message,
                'timestamp': timestamp.isoformat(),
                'status': 'success' if activity_type['type'] != 'health' else 'warning'
            })
        
        return sorted(activities, key=lambda x: x['timestamp'], reverse=True)

# ═══════════════════════════════════════════════════════════════
# ERROR HANDLERS
# ═══════════════════════════════════════════════════════════════

@app.errorhandler(404)
def not_found(error):
    """Manejo de errores 404"""
    return jsonify({'error': 'Endpoint no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Manejo de errores 500"""
    return jsonify({'error': 'Error interno del servidor'}), 500

# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 AgroTrace System v3.0.0 - Dashboard de Trazabilidad Ganadera")
    print("=" * 70)
    print("📡 Sistema RFID/NFC activo")
    print(f"🐄 155 animales registrados")
    print("🌐 Servidor ejecutándose en: http://localhost:5000")
    print("=" * 70)
    print("")
    app.run(debug=True, host='0.0.0.0', port=5000)
