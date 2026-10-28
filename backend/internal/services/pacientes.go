package services

import (
	"context"
	"strings"
	"time"

	"github.com/hospital/api/internal/models"
	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/pkg/utils"
)

// Pacientes aplica las reglas del módulo M3.
type Pacientes struct {
	repo repository.Pacientes
	now  func() time.Time
}

// NewPacientes construye el servicio con su repositorio.
func NewPacientes(repo repository.Pacientes) *Pacientes {
	return &Pacientes{repo: repo, now: time.Now}
}

// PacienteInput es el cuerpo aceptado al crear o editar un paciente.
type PacienteInput struct {
	Nombre          string `json:"nombre"`
	Apellidos       string `json:"apellidos"`
	Documento       string `json:"documento"`
	FechaNacimiento string `json:"fechaNacimiento"`
	Telefono        string `json:"telefono"`
	Email           string `json:"email"`
	Notas           string `json:"notas"`
}

// List devuelve todos los pacientes.
func (s *Pacientes) List(ctx context.Context) ([]models.Paciente, error) {
	return s.repo.List(ctx)
}

// Get devuelve un paciente por ID.
func (s *Pacientes) Get(ctx context.Context, id string) (models.Paciente, error) {
	return s.repo.Get(ctx, id)
}

// Create valida y guarda un paciente nuevo.
func (s *Pacientes) Create(ctx context.Context, input PacienteInput) (models.Paciente, error) {
	if err := input.validate(); err != nil {
		return models.Paciente{}, err
	}

	paciente := models.Paciente{
		ID:              utils.NewID("pac"),
		Nombre:          strings.TrimSpace(input.Nombre),
		Apellidos:       strings.TrimSpace(input.Apellidos),
		Documento:       strings.TrimSpace(input.Documento),
		FechaNacimiento: strings.TrimSpace(input.FechaNacimiento),
		Telefono:        strings.TrimSpace(input.Telefono),
		Email:           strings.TrimSpace(input.Email),
		Notas:           strings.TrimSpace(input.Notas),
		CreadoEn:        s.now().UTC(),
	}

	return s.repo.Create(ctx, paciente)
}

// Update edita un paciente existente.
func (s *Pacientes) Update(ctx context.Context, id string, input PacienteInput) (models.Paciente, error) {
	if err := input.validate(); err != nil {
		return models.Paciente{}, err
	}

	paciente, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Paciente{}, err
	}

	paciente.Nombre = strings.TrimSpace(input.Nombre)
	paciente.Apellidos = strings.TrimSpace(input.Apellidos)
	paciente.Documento = strings.TrimSpace(input.Documento)
	paciente.FechaNacimiento = strings.TrimSpace(input.FechaNacimiento)
	paciente.Telefono = strings.TrimSpace(input.Telefono)
	paciente.Email = strings.TrimSpace(input.Email)
	paciente.Notas = strings.TrimSpace(input.Notas)

	return s.repo.Update(ctx, paciente)
}

// Delete elimina un paciente.
func (s *Pacientes) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (in PacienteInput) validate() error {
	if err := required("nombre", in.Nombre); err != nil {
		return err
	}
	if err := required("apellidos", in.Apellidos); err != nil {
		return err
	}
	if err := required("documento", in.Documento); err != nil {
		return err
	}
	if err := required("fechaNacimiento", in.FechaNacimiento); err != nil {
		return err
	}
	if _, err := utils.ParseDate(in.FechaNacimiento); err != nil {
		return ValidationError{Campo: "fechaNacimiento", Detalle: "usa el formato yyyy-mm-dd"}
	}
	if email := strings.TrimSpace(in.Email); email != "" && !strings.Contains(email, "@") {
		return ValidationError{Campo: "email", Detalle: "no parece un email válido"}
	}
	return nil
}
