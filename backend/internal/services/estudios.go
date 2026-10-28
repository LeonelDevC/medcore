package services

import (
	"context"
	"math"
	"strings"
	"time"

	"github.com/hospital/api/internal/models"
	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/pkg/utils"
)

// Estudios aplica las reglas del módulo M6 (DICOM cargado a mano, sin PACS).
type Estudios struct {
	repo      repository.Estudios
	pacientes repository.Pacientes
	now       func() time.Time
}

// NewEstudios construye el servicio con sus repositorios.
func NewEstudios(repo repository.Estudios, pacientes repository.Pacientes) *Estudios {
	return &Estudios{repo: repo, pacientes: pacientes, now: time.Now}
}

// EstudioInput es el cuerpo aceptado al registrar un estudio.
// PixelSpacing llega del propio DICOM: [fila, columna] en milímetros.
type EstudioInput struct {
	PacienteID   string    `json:"pacienteId"`
	MedicoID     string    `json:"medicoId"`
	Modalidad    string    `json:"modalidad"`
	Descripcion  string    `json:"descripcion"`
	FechaEstudio string    `json:"fechaEstudio"`
	NumeroCortes int       `json:"numeroCortes"`
	Ancho        int       `json:"ancho"`
	Alto         int       `json:"alto"`
	PixelSpacing []float64 `json:"pixelSpacing"`
	StoragePath  string    `json:"storagePath"`
}

// MedicionInput es el cuerpo aceptado al añadir una medición.
// En ROI, Valor es el área que ya calculó el visor.
type MedicionInput struct {
	Tipo   string         `json:"tipo"`
	Puntos []models.Punto `json:"puntos"`
	Valor  float64        `json:"valor"`
}

// List devuelve los estudios, filtrados por paciente si se indica.
func (s *Estudios) List(ctx context.Context, pacienteID string) ([]models.Estudio, error) {
	return s.repo.List(ctx, pacienteID)
}

// Get devuelve un estudio por ID.
func (s *Estudios) Get(ctx context.Context, id string) (models.Estudio, error) {
	return s.repo.Get(ctx, id)
}

// Create valida y guarda los metadatos de un estudio.
func (s *Estudios) Create(ctx context.Context, input EstudioInput) (models.Estudio, error) {
	if err := required("pacienteId", input.PacienteID); err != nil {
		return models.Estudio{}, err
	}
	if err := required("medicoId", input.MedicoID); err != nil {
		return models.Estudio{}, err
	}
	if err := required("modalidad", input.Modalidad); err != nil {
		return models.Estudio{}, err
	}

	if _, err := s.pacientes.Get(ctx, strings.TrimSpace(input.PacienteID)); err != nil {
		return models.Estudio{}, err
	}

	if _, err := utils.ParseDate(input.FechaEstudio); err != nil {
		return models.Estudio{}, ValidationError{Campo: "fechaEstudio", Detalle: "usa el formato yyyy-mm-dd"}
	}

	if len(input.PixelSpacing) != 0 {
		if len(input.PixelSpacing) != 2 || input.PixelSpacing[0] <= 0 || input.PixelSpacing[1] <= 0 {
			return models.Estudio{}, ValidationError{
				Campo:   "pixelSpacing",
				Detalle: "envía dos valores positivos [fila, columna] o ninguno",
			}
		}
	}

	estudio := models.Estudio{
		ID:           utils.NewID("est"),
		PacienteID:   strings.TrimSpace(input.PacienteID),
		MedicoID:     strings.TrimSpace(input.MedicoID),
		Modalidad:    strings.ToUpper(strings.TrimSpace(input.Modalidad)),
		Descripcion:  strings.TrimSpace(input.Descripcion),
		FechaEstudio: strings.TrimSpace(input.FechaEstudio),
		NumeroCortes: input.NumeroCortes,
		Ancho:        input.Ancho,
		Alto:         input.Alto,
		PixelSpacing: input.PixelSpacing,
		StoragePath:  strings.TrimSpace(input.StoragePath),
		Mediciones:   []models.Medicion{},
		CreadoEn:     s.now().UTC(),
	}

	return s.repo.Create(ctx, estudio)
}

// AddMedicion calcula y guarda una medición sobre el estudio.
// Con PixelSpacing el resultado va en mm; sin él, en px y marcado como no
// calibrado para que la UI lo etiquete "sin calibración" (§6 M6).
func (s *Estudios) AddMedicion(ctx context.Context, estudioID string, input MedicionInput) (models.Medicion, error) {
	tipo := models.TipoMedicion(strings.TrimSpace(input.Tipo))
	if !tipo.Valid() {
		return models.Medicion{}, ValidationError{Campo: "tipo", Detalle: "usa distancia, angulo o roi"}
	}

	estudio, err := s.repo.Get(ctx, estudioID)
	if err != nil {
		return models.Medicion{}, err
	}

	medicion := models.Medicion{
		ID:        utils.NewID("med"),
		Tipo:      tipo,
		Unidad:    "px",
		Puntos:    input.Puntos,
		Calibrada: false,
		CreadaEn:  s.now().UTC(),
	}

	if estudio.Calibrado() {
		medicion.Unidad = "mm"
		medicion.Calibrada = true
	}

	switch tipo {
	case models.MedicionDistancia:
		if len(input.Puntos) != 2 {
			return models.Medicion{}, ValidationError{Campo: "puntos", Detalle: "distancia requiere 2 puntos"}
		}
		medicion.Valor = distancia(input.Puntos[0], input.Puntos[1], estudio.PixelSpacing, medicion.Calibrada)

	case models.MedicionAngulo:
		if len(input.Puntos) != 3 {
			return models.Medicion{}, ValidationError{Campo: "puntos", Detalle: "angulo requiere 3 puntos"}
		}
		valor, err := angulo(input.Puntos[0], input.Puntos[1], input.Puntos[2])
		if err != nil {
			return models.Medicion{}, err
		}
		medicion.Valor = valor

	case models.MedicionROI:
		if input.Valor <= 0 {
			return models.Medicion{}, ValidationError{Campo: "valor", Detalle: "roi requiere el área calculada en el visor"}
		}
		medicion.Valor = input.Valor
	}

	estudio.Mediciones = append(append([]models.Medicion{}, estudio.Mediciones...), medicion)

	if _, err := s.repo.Update(ctx, estudio); err != nil {
		return models.Medicion{}, err
	}

	return medicion, nil
}

// distancia aplica el espaciado por eje: X usa columnas y Y usa filas.
func distancia(a, b models.Punto, pixelSpacing []float64, calibrada bool) float64 {
	dx := b.X - a.X
	dy := b.Y - a.Y

	if calibrada {
		dx *= pixelSpacing[1]
		dy *= pixelSpacing[0]
	}

	return math.Hypot(dx, dy)
}

// angulo devuelve el ángulo en grados con vértice en b.
func angulo(a, b, c models.Punto) (float64, error) {
	v1x, v1y := a.X-b.X, a.Y-b.Y
	v2x, v2y := c.X-b.X, c.Y-b.Y

	m1 := math.Hypot(v1x, v1y)
	m2 := math.Hypot(v2x, v2y)
	if m1 == 0 || m2 == 0 {
		return 0, ValidationError{Campo: "puntos", Detalle: "los puntos del ángulo no pueden coincidir"}
	}

	coseno := (v1x*v2x + v1y*v2y) / (m1 * m2)
	coseno = math.Max(-1, math.Min(1, coseno))

	return math.Acos(coseno) * 180 / math.Pi, nil
}
