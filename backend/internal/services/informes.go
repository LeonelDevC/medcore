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

// Informes aplica las reglas del módulo M7: borrador editable y firmado
// inmutable, con corrección por adenda.
type Informes struct {
	repo      repository.Informes
	pacientes repository.Pacientes
	estudios  repository.Estudios
	now       func() time.Time
}

// NewInformes construye el servicio con sus repositorios.
func NewInformes(repo repository.Informes, pacientes repository.Pacientes, estudios repository.Estudios) *Informes {
	return &Informes{repo: repo, pacientes: pacientes, estudios: estudios, now: time.Now}
}

// InformeInput es el cuerpo aceptado al crear o editar un borrador.
type InformeInput struct {
	PacienteID      string `json:"pacienteId"`
	EstudioID       string `json:"estudioId"`
	MedicoID        string `json:"medicoId"`
	Motivo          string `json:"motivo"`
	Hallazgos       string `json:"hallazgos"`
	Conclusion      string `json:"conclusion"`
	Recomendaciones string `json:"recomendaciones"`
}

// AdendaInput es el cuerpo aceptado al corregir un informe firmado.
type AdendaInput struct {
	Texto   string `json:"texto"`
	AutorID string `json:"autorId"`
}

// List devuelve los informes, filtrados por paciente si se indica.
func (s *Informes) List(ctx context.Context, pacienteID string) ([]models.Informe, error) {
	return s.repo.List(ctx, pacienteID)
}

// Get devuelve un informe por ID.
func (s *Informes) Get(ctx context.Context, id string) (models.Informe, error) {
	return s.repo.Get(ctx, id)
}

// Create guarda un informe en estado borrador.
func (s *Informes) Create(ctx context.Context, input InformeInput) (models.Informe, error) {
	if err := s.validate(ctx, input); err != nil {
		return models.Informe{}, err
	}

	now := s.now().UTC()
	informe := models.Informe{
		ID:              utils.NewID("inf"),
		PacienteID:      strings.TrimSpace(input.PacienteID),
		EstudioID:       strings.TrimSpace(input.EstudioID),
		MedicoID:        strings.TrimSpace(input.MedicoID),
		Motivo:          strings.TrimSpace(input.Motivo),
		Hallazgos:       strings.TrimSpace(input.Hallazgos),
		Conclusion:      strings.TrimSpace(input.Conclusion),
		Recomendaciones: strings.TrimSpace(input.Recomendaciones),
		Estado:          models.InformeBorrador,
		CreadoEn:        now,
		ActualizadoEn:   now,
		Adendas:         []models.Adenda{},
	}

	return s.repo.Create(ctx, informe)
}

// Update edita un borrador. Un informe firmado devuelve ErrInmutable.
func (s *Informes) Update(ctx context.Context, id string, input InformeInput) (models.Informe, error) {
	if err := s.validate(ctx, input); err != nil {
		return models.Informe{}, err
	}

	informe, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Informe{}, err
	}
	if informe.Estado != models.InformeBorrador {
		return models.Informe{}, fmt.Errorf("%w: el informe está %s", repository.ErrInmutable, informe.Estado)
	}

	informe.PacienteID = strings.TrimSpace(input.PacienteID)
	informe.EstudioID = strings.TrimSpace(input.EstudioID)
	informe.MedicoID = strings.TrimSpace(input.MedicoID)
	informe.Motivo = strings.TrimSpace(input.Motivo)
	informe.Hallazgos = strings.TrimSpace(input.Hallazgos)
	informe.Conclusion = strings.TrimSpace(input.Conclusion)
	informe.Recomendaciones = strings.TrimSpace(input.Recomendaciones)
	informe.ActualizadoEn = s.now().UTC()

	return s.repo.Update(ctx, informe)
}

// Firmar pasa el informe a firmado y registra la fecha. Es irreversible.
func (s *Informes) Firmar(ctx context.Context, id string) (models.Informe, error) {
	informe, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Informe{}, err
	}
	if informe.Estado == models.InformeFirmado {
		return models.Informe{}, fmt.Errorf("%w: el informe ya está firmado", repository.ErrInmutable)
	}

	now := s.now().UTC()
	informe.Estado = models.InformeFirmado
	informe.FirmadoEn = &now
	informe.ActualizadoEn = now

	return s.repo.Update(ctx, informe)
}

// AddAdenda corrige un informe firmado sin modificarlo.
func (s *Informes) AddAdenda(ctx context.Context, id string, input AdendaInput) (models.Informe, error) {
	if err := required("texto", input.Texto); err != nil {
		return models.Informe{}, err
	}
	if err := required("autorId", input.AutorID); err != nil {
		return models.Informe{}, err
	}

	informe, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Informe{}, err
	}
	if informe.Estado != models.InformeFirmado {
		return models.Informe{}, fmt.Errorf("%w: solo se corrige un informe firmado", ErrTransicionInvalida)
	}

	now := s.now().UTC()
	adenda := models.Adenda{
		ID:       utils.NewID("adn"),
		Texto:    strings.TrimSpace(input.Texto),
		AutorID:  strings.TrimSpace(input.AutorID),
		CreadaEn: now,
	}

	informe.Adendas = append(append([]models.Adenda{}, informe.Adendas...), adenda)
	informe.ActualizadoEn = now

	return s.repo.Update(ctx, informe)
}

func (s *Informes) validate(ctx context.Context, input InformeInput) error {
	if err := required("pacienteId", input.PacienteID); err != nil {
		return err
	}
	if err := required("medicoId", input.MedicoID); err != nil {
		return err
	}
	if err := required("motivo", input.Motivo); err != nil {
		return err
	}

	if _, err := s.pacientes.Get(ctx, strings.TrimSpace(input.PacienteID)); err != nil {
		return err
	}

	if estudioID := strings.TrimSpace(input.EstudioID); estudioID != "" {
		estudio, err := s.estudios.Get(ctx, estudioID)
		if err != nil {
			return err
		}
		if estudio.PacienteID != strings.TrimSpace(input.PacienteID) {
			return ValidationError{Campo: "estudioId", Detalle: "el estudio pertenece a otro paciente"}
		}
	}

	return nil
}
