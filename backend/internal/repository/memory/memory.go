// Package memory implementa los repositorios del MVP en memoria.
//
// Es una pieza de desarrollo: el contrato (repository.*) es el que importa y
// permite sustituirla por Postgres sin tocar servicios ni handlers. Cada
// agregado tiene su propio store y su propio mutex para no acoplar dominios.
package memory

import (
	"context"
	"sort"
	"sync"

	"github.com/hospital/api/internal/models"
	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/pkg/utils"
)

// New devuelve el juego completo de repositorios en memoria.
func New() repository.Repositories {
	return repository.Repositories{
		Pacientes: NewPacientes(),
		Citas:     NewCitas(),
		Personal:  NewPersonal(),
		Estudios:  NewEstudios(),
		Informes:  NewInformes(),
	}
}

// PacienteStore guarda pacientes (M3).
type PacienteStore struct {
	mu    sync.RWMutex
	items map[string]models.Paciente
}

// NewPacientes crea un repositorio de pacientes vacío.
func NewPacientes() *PacienteStore {
	return &PacienteStore{items: make(map[string]models.Paciente)}
}

// List devuelve los pacientes ordenados por apellidos.
func (s *PacienteStore) List(_ context.Context) ([]models.Paciente, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]models.Paciente, 0, len(s.items))
	for _, item := range s.items {
		items = append(items, item)
	}

	sort.Slice(items, func(i, j int) bool {
		if items[i].Apellidos == items[j].Apellidos {
			return items[i].Nombre < items[j].Nombre
		}
		return items[i].Apellidos < items[j].Apellidos
	})

	return items, nil
}

// Get devuelve un paciente por ID.
func (s *PacienteStore) Get(_ context.Context, id string) (models.Paciente, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	paciente, ok := s.items[id]
	if !ok {
		return models.Paciente{}, repository.ErrNotFound
	}
	return paciente, nil
}

// Create guarda un paciente nuevo.
func (s *PacienteStore) Create(_ context.Context, paciente models.Paciente) (models.Paciente, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if paciente.ID == "" {
		paciente.ID = utils.NewID("pac")
	}
	if _, exists := s.items[paciente.ID]; exists {
		return models.Paciente{}, repository.ErrConflict
	}

	s.items[paciente.ID] = paciente
	return paciente, nil
}

// Update sobrescribe un paciente existente.
func (s *PacienteStore) Update(_ context.Context, paciente models.Paciente) (models.Paciente, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[paciente.ID]; !exists {
		return models.Paciente{}, repository.ErrNotFound
	}

	s.items[paciente.ID] = paciente
	return paciente, nil
}

// Delete elimina un paciente.
func (s *PacienteStore) Delete(_ context.Context, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[id]; !exists {
		return repository.ErrNotFound
	}

	delete(s.items, id)
	return nil
}

// CitaStore guarda citas (M4).
type CitaStore struct {
	mu    sync.RWMutex
	items map[string]models.Cita
}

// NewCitas crea un repositorio de citas vacío.
func NewCitas() *CitaStore {
	return &CitaStore{items: make(map[string]models.Cita)}
}

// List devuelve las citas por fecha ascendente, filtradas por paciente si se pide.
func (s *CitaStore) List(_ context.Context, pacienteID string) ([]models.Cita, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]models.Cita, 0, len(s.items))
	for _, item := range s.items {
		if pacienteID != "" && item.PacienteID != pacienteID {
			continue
		}
		items = append(items, item)
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].Fecha.Before(items[j].Fecha)
	})

	return items, nil
}

// Get devuelve una cita por ID.
func (s *CitaStore) Get(_ context.Context, id string) (models.Cita, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cita, ok := s.items[id]
	if !ok {
		return models.Cita{}, repository.ErrNotFound
	}
	return cita, nil
}

// Create guarda una cita nueva.
func (s *CitaStore) Create(_ context.Context, cita models.Cita) (models.Cita, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if cita.ID == "" {
		cita.ID = utils.NewID("cit")
	}
	if _, exists := s.items[cita.ID]; exists {
		return models.Cita{}, repository.ErrConflict
	}

	s.items[cita.ID] = cita
	return cita, nil
}

// Update sobrescribe una cita existente.
func (s *CitaStore) Update(_ context.Context, cita models.Cita) (models.Cita, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[cita.ID]; !exists {
		return models.Cita{}, repository.ErrNotFound
	}

	s.items[cita.ID] = cita
	return cita, nil
}

// PersonalStore guarda el personal médico (M5).
type PersonalStore struct {
	mu    sync.RWMutex
	items map[string]models.Personal
}

// NewPersonal crea un repositorio de personal vacío.
func NewPersonal() *PersonalStore {
	return &PersonalStore{items: make(map[string]models.Personal)}
}

// List devuelve el personal ordenado por apellidos.
func (s *PersonalStore) List(_ context.Context) ([]models.Personal, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]models.Personal, 0, len(s.items))
	for _, item := range s.items {
		items = append(items, item)
	}

	sort.Slice(items, func(i, j int) bool {
		if items[i].Apellidos == items[j].Apellidos {
			return items[i].Nombre < items[j].Nombre
		}
		return items[i].Apellidos < items[j].Apellidos
	})

	return items, nil
}

// Get devuelve una ficha de personal por ID.
func (s *PersonalStore) Get(_ context.Context, id string) (models.Personal, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	persona, ok := s.items[id]
	if !ok {
		return models.Personal{}, repository.ErrNotFound
	}
	return persona, nil
}

// Create guarda una ficha de personal nueva.
func (s *PersonalStore) Create(_ context.Context, persona models.Personal) (models.Personal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if persona.ID == "" {
		persona.ID = utils.NewID("per")
	}
	if _, exists := s.items[persona.ID]; exists {
		return models.Personal{}, repository.ErrConflict
	}

	s.items[persona.ID] = persona
	return persona, nil
}

// Update sobrescribe una ficha de personal existente.
func (s *PersonalStore) Update(_ context.Context, persona models.Personal) (models.Personal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[persona.ID]; !exists {
		return models.Personal{}, repository.ErrNotFound
	}

	s.items[persona.ID] = persona
	return persona, nil
}

// EstudioStore guarda estudios DICOM (M6).
type EstudioStore struct {
	mu    sync.RWMutex
	items map[string]models.Estudio
}

// NewEstudios crea un repositorio de estudios vacío.
func NewEstudios() *EstudioStore {
	return &EstudioStore{items: make(map[string]models.Estudio)}
}

// List devuelve los estudios de un paciente (o todos) por fecha descendente.
func (s *EstudioStore) List(_ context.Context, pacienteID string) ([]models.Estudio, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]models.Estudio, 0, len(s.items))
	for _, item := range s.items {
		if pacienteID != "" && item.PacienteID != pacienteID {
			continue
		}
		items = append(items, item)
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].CreadoEn.After(items[j].CreadoEn)
	})

	return items, nil
}

// Get devuelve un estudio por ID.
func (s *EstudioStore) Get(_ context.Context, id string) (models.Estudio, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	estudio, ok := s.items[id]
	if !ok {
		return models.Estudio{}, repository.ErrNotFound
	}
	return estudio, nil
}

// Create guarda un estudio nuevo.
func (s *EstudioStore) Create(_ context.Context, estudio models.Estudio) (models.Estudio, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if estudio.ID == "" {
		estudio.ID = utils.NewID("est")
	}
	if _, exists := s.items[estudio.ID]; exists {
		return models.Estudio{}, repository.ErrConflict
	}
	if estudio.Mediciones == nil {
		estudio.Mediciones = []models.Medicion{}
	}

	s.items[estudio.ID] = estudio
	return estudio, nil
}

// Update sobrescribe un estudio existente (incluidas sus mediciones).
func (s *EstudioStore) Update(_ context.Context, estudio models.Estudio) (models.Estudio, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[estudio.ID]; !exists {
		return models.Estudio{}, repository.ErrNotFound
	}

	s.items[estudio.ID] = estudio
	return estudio, nil
}

// InformeStore guarda informes médicos (M7).
type InformeStore struct {
	mu    sync.RWMutex
	items map[string]models.Informe
}

// NewInformes crea un repositorio de informes vacío.
func NewInformes() *InformeStore {
	return &InformeStore{items: make(map[string]models.Informe)}
}

// List devuelve los informes de un paciente (o todos) por fecha descendente.
func (s *InformeStore) List(_ context.Context, pacienteID string) ([]models.Informe, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	items := make([]models.Informe, 0, len(s.items))
	for _, item := range s.items {
		if pacienteID != "" && item.PacienteID != pacienteID {
			continue
		}
		items = append(items, item)
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].CreadoEn.After(items[j].CreadoEn)
	})

	return items, nil
}

// Get devuelve un informe por ID.
func (s *InformeStore) Get(_ context.Context, id string) (models.Informe, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	informe, ok := s.items[id]
	if !ok {
		return models.Informe{}, repository.ErrNotFound
	}
	return informe, nil
}

// Create guarda un informe nuevo.
func (s *InformeStore) Create(_ context.Context, informe models.Informe) (models.Informe, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if informe.ID == "" {
		informe.ID = utils.NewID("inf")
	}
	if _, exists := s.items[informe.ID]; exists {
		return models.Informe{}, repository.ErrConflict
	}
	if informe.Adendas == nil {
		informe.Adendas = []models.Adenda{}
	}

	s.items[informe.ID] = informe
	return informe, nil
}

// Update sobrescribe un informe existente.
func (s *InformeStore) Update(_ context.Context, informe models.Informe) (models.Informe, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.items[informe.ID]; !exists {
		return models.Informe{}, repository.ErrNotFound
	}

	s.items[informe.ID] = informe
	return informe, nil
}
