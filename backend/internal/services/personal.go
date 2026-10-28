package services

import (
	"context"
	"strings"
	"time"

	"github.com/hospital/api/internal/models"
	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/pkg/utils"
)

// Personal aplica las reglas del módulo M5 (exclusivo de admin).
type Personal struct {
	repo repository.Personal
	now  func() time.Time
}

// NewPersonal construye el servicio con su repositorio.
func NewPersonal(repo repository.Personal) *Personal {
	return &Personal{repo: repo, now: time.Now}
}

// PersonalInput es el cuerpo aceptado al crear o editar personal.
// Activo es puntero para distinguir "no enviado" (alta = activo) de false.
type PersonalInput struct {
	Nombre       string `json:"nombre"`
	Apellidos    string `json:"apellidos"`
	Email        string `json:"email"`
	Especialidad string `json:"especialidad"`
	Rol          string `json:"rol"`
	Activo       *bool  `json:"activo"`
}

// List devuelve todo el personal médico.
func (s *Personal) List(ctx context.Context) ([]models.Personal, error) {
	return s.repo.List(ctx)
}

// Get devuelve una ficha de personal por ID.
func (s *Personal) Get(ctx context.Context, id string) (models.Personal, error) {
	return s.repo.Get(ctx, id)
}

// Create valida y guarda una ficha de personal nueva.
func (s *Personal) Create(ctx context.Context, input PersonalInput) (models.Personal, error) {
	rol, err := input.validate()
	if err != nil {
		return models.Personal{}, err
	}

	activo := true
	if input.Activo != nil {
		activo = *input.Activo
	}

	persona := models.Personal{
		ID:           utils.NewID("per"),
		Nombre:       strings.TrimSpace(input.Nombre),
		Apellidos:    strings.TrimSpace(input.Apellidos),
		Email:        strings.TrimSpace(input.Email),
		Especialidad: strings.TrimSpace(input.Especialidad),
		Rol:          rol,
		Activo:       activo,
		CreadoEn:     s.now().UTC(),
	}

	return s.repo.Create(ctx, persona)
}

// Update edita una ficha de personal existente.
func (s *Personal) Update(ctx context.Context, id string, input PersonalInput) (models.Personal, error) {
	rol, err := input.validate()
	if err != nil {
		return models.Personal{}, err
	}

	persona, err := s.repo.Get(ctx, id)
	if err != nil {
		return models.Personal{}, err
	}

	persona.Nombre = strings.TrimSpace(input.Nombre)
	persona.Apellidos = strings.TrimSpace(input.Apellidos)
	persona.Email = strings.TrimSpace(input.Email)
	persona.Especialidad = strings.TrimSpace(input.Especialidad)
	persona.Rol = rol
	if input.Activo != nil {
		persona.Activo = *input.Activo
	}

	return s.repo.Update(ctx, persona)
}

func (in PersonalInput) validate() (models.Role, error) {
	if err := required("nombre", in.Nombre); err != nil {
		return "", err
	}
	if err := required("apellidos", in.Apellidos); err != nil {
		return "", err
	}
	if err := required("email", in.Email); err != nil {
		return "", err
	}
	if !strings.Contains(in.Email, "@") {
		return "", ValidationError{Campo: "email", Detalle: "no parece un email válido"}
	}
	if err := required("especialidad", in.Especialidad); err != nil {
		return "", err
	}

	rol := models.RoleMedico
	if raw := strings.TrimSpace(in.Rol); raw != "" {
		rol = models.Role(raw)
	}
	if !rol.Valid() {
		return "", ValidationError{Campo: "rol", Detalle: "usa admin o medico"}
	}

	return rol, nil
}
