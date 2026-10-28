// Package repository define los puertos de persistencia del API.
//
// Los servicios dependen de estas interfaces, no de un motor concreto: hoy
// hay una implementación en memoria (repository/memory) y el día que se elija
// Postgres solo cambia el paquete que las implementa.
package repository

import (
	"context"
	"errors"

	"github.com/hospital/api/internal/models"
)

var (
	// ErrNotFound indica que el recurso pedido no existe.
	ErrNotFound = errors.New("recurso no encontrado")
	// ErrConflict indica un identificador o dato único duplicado.
	ErrConflict = errors.New("recurso duplicado")
	// ErrInmutable indica que el recurso ya no admite cambios (informe firmado).
	ErrInmutable = errors.New("el recurso ya no admite cambios")
)

// Pacientes es el repositorio de M3.
type Pacientes interface {
	List(ctx context.Context) ([]models.Paciente, error)
	Get(ctx context.Context, id string) (models.Paciente, error)
	Create(ctx context.Context, paciente models.Paciente) (models.Paciente, error)
	Update(ctx context.Context, paciente models.Paciente) (models.Paciente, error)
	Delete(ctx context.Context, id string) error
}

// Citas es el repositorio de M4.
type Citas interface {
	List(ctx context.Context, pacienteID string) ([]models.Cita, error)
	Get(ctx context.Context, id string) (models.Cita, error)
	Create(ctx context.Context, cita models.Cita) (models.Cita, error)
	Update(ctx context.Context, cita models.Cita) (models.Cita, error)
}

// Personal es el repositorio de M5.
type Personal interface {
	List(ctx context.Context) ([]models.Personal, error)
	Get(ctx context.Context, id string) (models.Personal, error)
	Create(ctx context.Context, personal models.Personal) (models.Personal, error)
	Update(ctx context.Context, personal models.Personal) (models.Personal, error)
}

// Estudios es el repositorio de M6.
type Estudios interface {
	List(ctx context.Context, pacienteID string) ([]models.Estudio, error)
	Get(ctx context.Context, id string) (models.Estudio, error)
	Create(ctx context.Context, estudio models.Estudio) (models.Estudio, error)
	Update(ctx context.Context, estudio models.Estudio) (models.Estudio, error)
}

// Informes es el repositorio de M7.
type Informes interface {
	List(ctx context.Context, pacienteID string) ([]models.Informe, error)
	Get(ctx context.Context, id string) (models.Informe, error)
	Create(ctx context.Context, informe models.Informe) (models.Informe, error)
	Update(ctx context.Context, informe models.Informe) (models.Informe, error)
}

// Repositories agrupa los repositorios por agregado para inyectarlos una vez.
type Repositories struct {
	Pacientes Pacientes
	Citas     Citas
	Personal  Personal
	Estudios  Estudios
	Informes  Informes
}
