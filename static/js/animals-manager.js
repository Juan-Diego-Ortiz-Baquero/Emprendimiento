/**
 * AgroTrace - Animals Management Module
 * Alpine.js Component for managing animal records
 */

function animalsManager() {
    return {
        // Data Properties
        animals: [],
        filteredAnimals: [],
        showModal: false,
        modalMode: 'add',
        searchQuery: '',
        filterStatus: '',
        filterBreed: '',
        formData: {
            rfid: '',
            name: '',
            breed: '',
            age: '',
            status: '',
            location: '',
            weight: '',
            observations: ''
        },
        currentAnimal: null,

        // Computed Properties
        get healthyCount() {
            return this.animals.filter(a => a.status.class === 'success').length;
        },

        get warningCount() {
            return this.animals.filter(a => a.status.class === 'warning').length;
        },

        get criticalCount() {
            return this.animals.filter(a => a.status.class === 'danger').length;
        },

        // Initialize Component
        init() {
            this.filteredAnimals = [...this.animals];
            this.initLucideIcons();
        },

        // Set Initial Data
        setAnimals(data) {
            this.animals = data;
            this.filteredAnimals = [...data];
        },

        // Filter Animals
        filterAnimals() {
            let filtered = [...this.animals];

            // Search filter
            if (this.searchQuery.trim() !== '') {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(animal => 
                    animal.rfid.toLowerCase().includes(query) ||
                    animal.name.toLowerCase().includes(query) ||
                    animal.breed.toLowerCase().includes(query) ||
                    animal.location.toLowerCase().includes(query)
                );
            }

            // Status filter
            if (this.filterStatus !== '') {
                filtered = filtered.filter(animal => animal.status.class === this.filterStatus);
            }

            // Breed filter
            if (this.filterBreed !== '') {
                filtered = filtered.filter(animal => animal.breed === this.filterBreed);
            }

            this.filteredAnimals = filtered;
            this.$nextTick(() => this.initLucideIcons());
        },

        // Open Add Modal
        openAddModal() {
            this.modalMode = 'add';
            this.resetForm();
            this.showModal = true;
            this.$nextTick(() => this.initLucideIcons());
        },

        // View Animal Details
        viewAnimal(animal) {
            window.location.href = `/animals/${animal.id}`;
        },

        // Edit Animal
        editAnimal(animal) {
            this.modalMode = 'edit';
            this.currentAnimal = animal;
            this.formData = {
                rfid: animal.rfid,
                name: animal.name,
                breed: animal.breed,
                age: animal.age,
                status: animal.status.class,
                location: animal.location,
                weight: animal.weight || '',
                observations: animal.observations || ''
            };
            this.showModal = true;
            this.$nextTick(() => this.initLucideIcons());
        },

        // Delete Animal with confirmation
        async deleteAnimal(animal) {
            const result = await Swal.fire({
                title: '¿Eliminar animal?',
                text: `¿Estás seguro de eliminar a ${animal.name}? Esta acción no se puede deshacer.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EF4444',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                const index = this.animals.findIndex(a => a.id === animal.id);
                if (index > -1) {
                    this.animals.splice(index, 1);
                    this.filterAnimals();
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: `${animal.name} ha sido eliminado del sistema.`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        },

        // Submit Form (Add or Edit)
        async submitForm() {
            // Validate required fields
            if (!this.formData.rfid || !this.formData.name || !this.formData.breed || 
                !this.formData.age || !this.formData.status || !this.formData.location) {
                Swal.fire({
                    title: 'Error',
                    text: 'Por favor completa todos los campos obligatorios',
                    icon: 'error'
                });
                return;
            }

            if (this.modalMode === 'add') {
                // Add new animal
                const newAnimal = {
                    id: 'AN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    rfid: this.formData.rfid,
                    name: this.formData.name,
                    breed: this.formData.breed,
                    age: parseInt(this.formData.age),
                    status: this.getStatusObject(this.formData.status),
                    location: this.formData.location,
                    weight: this.formData.weight,
                    observations: this.formData.observations,
                    lastCheck: 'Hoy',
                    avatarColor: this.getRandomColor()
                };

                this.animals.unshift(newAnimal);
                this.filterAnimals();

                Swal.fire({
                    title: '¡Agregado!',
                    text: `${newAnimal.name} ha sido agregado exitosamente`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                // Update existing animal
                const index = this.animals.findIndex(a => a.id === this.currentAnimal.id);
                if (index > -1) {
                    this.animals[index] = {
                        ...this.animals[index],
                        rfid: this.formData.rfid,
                        name: this.formData.name,
                        breed: this.formData.breed,
                        age: parseInt(this.formData.age),
                        status: this.getStatusObject(this.formData.status),
                        location: this.formData.location,
                        weight: this.formData.weight,
                        observations: this.formData.observations
                    };
                    this.filterAnimals();

                    Swal.fire({
                        title: '¡Actualizado!',
                        text: `${this.formData.name} ha sido actualizado exitosamente`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }

            this.closeModal();
        },

        // Close Modal
        closeModal() {
            this.showModal = false;
            this.resetForm();
        },

        // Reset Form Data
        resetForm() {
            this.formData = {
                rfid: '',
                name: '',
                breed: '',
                age: '',
                status: '',
                location: '',
                weight: '',
                observations: ''
            };
            this.currentAnimal = null;
        },

        // Helper: Get Status Object from class
        getStatusObject(statusClass) {
            const statusMap = {
                'success': { name: 'Saludable', class: 'success', color: 'green' },
                'warning': { name: 'En Observación', class: 'warning', color: 'yellow' },
                'danger': { name: 'Crítico', class: 'danger', color: 'red' }
            };
            return statusMap[statusClass] || statusMap['success'];
        },

        // Helper: Get Random Avatar Color
        getRandomColor() {
            const colors = [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        },

        // Export Data
        exportData() {
            Swal.fire({
                title: 'Exportar Datos',
                text: 'Selecciona el formato de exportación',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Excel',
                cancelButtonText: 'PDF',
                showDenyButton: true,
                denyButtonText: 'CSV'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.exportToExcel();
                } else if (result.isDenied) {
                    this.exportToCSV();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    this.exportToPDF();
                }
            });
        },

        // Export to Excel
        exportToExcel() {
            console.log('Exporting to Excel...', this.filteredAnimals);
            Swal.fire({
                title: 'Exportado',
                text: 'Datos exportados a Excel exitosamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        },

        // Export to CSV
        exportToCSV() {
            console.log('Exporting to CSV...', this.filteredAnimals);
            Swal.fire({
                title: 'Exportado',
                text: 'Datos exportados a CSV exitosamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        },

        // Export to PDF
        exportToPDF() {
            console.log('Exporting to PDF...', this.filteredAnimals);
            Swal.fire({
                title: 'Exportado',
                text: 'Datos exportados a PDF exitosamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        },

        // Initialize Lucide Icons
        initLucideIcons() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    };
}

// Initialize Lucide Icons on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
