package handlers

import (
	"net/http"

	"github.com/hospital/api/internal/services"
)

// ListEstudios devuelve estudios, filtrables con ?pacienteId= (M6).
func (a *API) ListEstudios(w http.ResponseWriter, r *http.Request) {
	estudios, err := a.Estudios.List(r.Context(), r.URL.Query().Get("pacienteId"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, estudios)
}

// ListEstudiosPaciente devuelve los estudios de un paciente (M6).
func (a *API) ListEstudiosPaciente(w http.ResponseWriter, r *http.Request) {
	estudios, err := a.Estudios.List(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, estudios)
}

// CreateEstudioPaciente registra los metadatos de un estudio del paciente (M6).
func (a *API) CreateEstudioPaciente(w http.ResponseWriter, r *http.Request) {
	var input services.EstudioInput
	if !decodeJSON(w, r, &input) {
		return
	}

	// El paciente sale de la ruta: no se acepta uno distinto en el cuerpo.
	input.PacienteID = r.PathValue("id")

	estudio, err := a.Estudios.Create(r.Context(), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, estudio)
}

// GetEstudio devuelve un estudio con sus mediciones (M6).
func (a *API) GetEstudio(w http.ResponseWriter, r *http.Request) {
	estudio, err := a.Estudios.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, estudio)
}

// CreateMedicion calcula y guarda una medición del estudio (M6).
func (a *API) CreateMedicion(w http.ResponseWriter, r *http.Request) {
	var input services.MedicionInput
	if !decodeJSON(w, r, &input) {
		return
	}

	medicion, err := a.Estudios.AddMedicion(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, medicion)
}
