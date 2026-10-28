package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/hospital/api/internal/models"
	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/pkg/utils"
)

// Citas aplica las reglas del módulo M4.
type Citas struct {
	repo      repository.Citas
	pacientes repository.Pacientes
	now       func() time.Time
}

// NewCitas construye el servicio con sus repositorios.
func NewCitas(repo repository.Citas, pacientes repository.Pacientes) *Citas {
	return &Citas{repo: repo, pacientes: pacientes, now: time.Now}
}

// CitaInput es el cuerpo aceptado al crear una cita.
type CitaInput struct {
	PacienteID string `json:"pacienteId"`
	MedicoID   string `json:"medicoId"`
	Fecha      string `json:"fecha"`
	Motivo     string `json:"motivo"`
	Estado     string `json:"estado"`
}

// EstadoInput es el cuerpo aceptado al cambiar el estado de una cita.
type EstadoInput struct {
	Estado string `json:"estado"`
}

// List devuelve las citas, filtradas por paciente si se indica.
func (s *Citas) List(ctx context.Context, pacienteID string) ([]models.Cita, error) {
	return s.repo.List(ctx, pacienteID)
}

// Get devuelve una cita por ID.
func (s *Citas) Get(ctx context.Context, id string) (models.Cita, error) {
	return s.repo.Get(ctx, id)
}

// Create valida y guarda una cita nueva (estado inicial: programada).
func (s *Citas) Create(ctx context.Context, input CitaInput) (models.Cita, error) {
	if err := required("pacienteId", input.PacienteID); err != nil {
		return models.Cita{}, err
	}
	if err := required("medicoId", input.MedicoID); err != nil {
		return models.Cita{}, err
	}
	if err := required("motivo", input.Motivo); err != nil {
		return models.Cita{}, err
	}

	if _, err := s.pacientes.Get(ctx, strings.TrimSpace(input.PacienteID)); err != nil {
		return models.Cita{}, err
	}

	fecha, err := utils.ParseDateTime(input.Fecha)
	if err != nil {
		return models.Cita{}, ValidationError{Campo: "fecha", Detalle: "usa RFC3339 (2026-10-27T09:30:00Z)"}
	}

	estado := models.EstadoProgramada
	if strings.TrimSpace(input.Estado) != "" {
		estado = models.EstadoCita(strings.TrimSpace(input.Estado))
		if !estado.Valid() {
			return models.Cita{}, ValidationError{Campo: "estado", Detalle: "usa programada, realizada o cancelada"}
		}
	}

	cita := models.Cita{
		ID:         utils.NewID("cit"),
		PacienteID: strings.TrimSpace(input.PacienteID),
		MedicoID:   strings.TrimSpace(input.MedicoID),
		Fecha:      fecha,
		Motivo:     strings.TrimSpace(input.Motivo),
		Estado:     estado,
		CreadaEn:   s.now().UTC(),
	}

	return s.repo.Create(ctx, cita)
}

// UpdateEstado aplica la transición programada -> realizada|cancelada.
// Los estados finales (realizada, cancelada) no se reabren.
func (s *Citas) UpdateEstado(ctx context.Context, id string, input EstadoInput) (models.Cita, error) {
	estado := models.EstadoCita(strings.TrimSpace(input.Estado))
	if !estado.Valid() {
		return models.Cita{}, ValidationError{Campo: "estado", Detalle: "usa programada, realizada o cancelada"}
	}

	cita, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Cita{}, err
	}

	if cita.Estado == estado {
		return cita, nil
	}
	if cita.Estado != models.EstadoProgramada {
		return models.Cita{}, fmt.Errorf("%w: %s no puede pasar a %s", ErrTransicionInvalida, cita.Estado, estado)
	}

	cita.Estado = estado
	return s.repo.Update(ctx, cita)
}
