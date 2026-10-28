package models

import "time"

// Role es el rol de un usuario. El MVP solo contempla admin y médico (§6).
type Role string

const (
	RoleAdmin  Role = "admin"
	RoleMedico Role = "medico"
)

// Valid indica si el rol pertenece al MVP.
func (r Role) Valid() bool {
	return r == RoleAdmin || r == RoleMedico
}

// Paciente es la ficha mínima del módulo M3.
type Paciente struct {
	ID              string    `json:"id"`
	Nombre          string    `json:"nombre"`
	Apellidos       string    `json:"apellidos"`
	Documento       string    `json:"documento"`
	FechaNacimiento string    `json:"fechaNacimiento"`
	Telefono        string    `json:"telefono,omitempty"`
	Email           string    `json:"email,omitempty"`
	Notas           string    `json:"notas,omitempty"`
	CreadoEn        time.Time `json:"creadoEn"`
}

// EstadoCita son los tres estados admitidos por el módulo M4.
type EstadoCita string

const (
	EstadoProgramada EstadoCita = "programada"
	EstadoRealizada  EstadoCita = "realizada"
	EstadoCancelada  EstadoCita = "cancelada"
)

// Valid indica si el estado es uno de los tres del MVP.
func (e EstadoCita) Valid() bool {
	switch e {
	case EstadoProgramada, EstadoRealizada, EstadoCancelada:
		return true
	default:
		return false
	}
}

// Cita es una cita de la agenda (M4).
type Cita struct {
	ID         string     `json:"id"`
	PacienteID string     `json:"pacienteId"`
	MedicoID   string     `json:"medicoId"`
	Fecha      time.Time  `json:"fecha"`
	Motivo     string     `json:"motivo"`
	Estado     EstadoCita `json:"estado"`
	CreadaEn   time.Time  `json:"creadaEn"`
}

// Personal es una ficha del personal médico (M5).
type Personal struct {
	ID           string    `json:"id"`
	Nombre       string    `json:"nombre"`
	Apellidos    string    `json:"apellidos"`
	Email        string    `json:"email"`
	Especialidad string    `json:"especialidad"`
	Rol          Role      `json:"rol"`
	Activo       bool      `json:"activo"`
	CreadoEn     time.Time `json:"creadoEn"`
}

// Punto es una coordenada en píxeles del viewport DICOM.
type Punto struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// TipoMedicion son las mediciones básicas de M6.
type TipoMedicion string

const (
	MedicionDistancia TipoMedicion = "distancia"
	MedicionAngulo    TipoMedicion = "angulo"
	MedicionROI       TipoMedicion = "roi"
)

// Valid indica si el tipo de medición está soportado.
func (t TipoMedicion) Valid() bool {
	switch t {
	case MedicionDistancia, MedicionAngulo, MedicionROI:
		return true
	default:
		return false
	}
}

// Medicion es una medición guardada de un estudio.
// Unidad es "mm" con PixelSpacing y "px" sin él; en ese caso Calibrada=false
// y la UI la etiqueta "sin calibración" (§6 M6).
type Medicion struct {
	ID        string       `json:"id"`
	Tipo      TipoMedicion `json:"tipo"`
	Valor     float64      `json:"valor"`
	Unidad    string       `json:"unidad"`
	Calibrada bool         `json:"calibrada"`
	Puntos    []Punto      `json:"puntos,omitempty"`
	CreadaEn  time.Time    `json:"creadaEn"`
}

// Estudio es un estudio DICOM cargado manualmente (M6, sin PACS).
// PixelSpacing guarda [espaciado de fila, espaciado de columna] en mm.
type Estudio struct {
	ID           string     `json:"id"`
	PacienteID   string     `json:"pacienteId"`
	MedicoID     string     `json:"medicoId"`
	Modalidad    string     `json:"modalidad"`
	Descripcion  string     `json:"descripcion,omitempty"`
	FechaEstudio string     `json:"fechaEstudio"`
	NumeroCortes int        `json:"numeroCortes"`
	Ancho        int        `json:"ancho"`
	Alto         int        `json:"alto"`
	PixelSpacing []float64  `json:"pixelSpacing,omitempty"`
	StoragePath  string     `json:"storagePath,omitempty"`
	Mediciones   []Medicion `json:"mediciones"`
	CreadoEn     time.Time  `json:"creadoEn"`
}

// Calibrado indica si las medidas pueden expresarse en milímetros.
func (e Estudio) Calibrado() bool {
	return len(e.PixelSpacing) == 2 && e.PixelSpacing[0] > 0 && e.PixelSpacing[1] > 0
}

// EstadoInforme son los estados del M7: borrador editable y firmado inmutable.
type EstadoInforme string

const (
	InformeBorrador EstadoInforme = "borrador"
	InformeFirmado  EstadoInforme = "firmado"
)

// Valid indica si el estado es uno de los dos del MVP.
func (e EstadoInforme) Valid() bool {
	return e == InformeBorrador || e == InformeFirmado
}

// Adenda es una corrección que referencia un informe ya firmado (M7).
type Adenda struct {
	ID       string    `json:"id"`
	Texto    string    `json:"texto"`
	AutorID  string    `json:"autorId"`
	CreadaEn time.Time `json:"creadaEn"`
}

// Informe es un informe médico (M7).
type Informe struct {
	ID              string        `json:"id"`
	PacienteID      string        `json:"pacienteId"`
	EstudioID       string        `json:"estudioId,omitempty"`
	MedicoID        string        `json:"medicoId"`
	Motivo          string        `json:"motivo"`
	Hallazgos       string        `json:"hallazgos"`
	Conclusion      string        `json:"conclusion"`
	Recomendaciones string        `json:"recomendaciones"`
	Estado          EstadoInforme `json:"estado"`
	CreadoEn        time.Time     `json:"creadoEn"`
	ActualizadoEn   time.Time     `json:"actualizadoEn"`
	FirmadoEn       *time.Time    `json:"firmadoEn,omitempty"`
	Adendas         []Adenda      `json:"adendas"`
}
