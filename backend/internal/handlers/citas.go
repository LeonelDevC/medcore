package handlers

import (
	"net/http"

	"github.com/hospital/api/internal/services"
)

// ListCitas devuelve la agenda, filtrable con ?pacienteId= (M4).
func (a *API) ListCitas(w http.ResponseWriter, r *http.Request) {
	citas, err := a.Citas.List(r.Context(), r.URL.Query().Get("pacienteId"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, citas)
}

// CreateCita programa una cita nueva (M4).
func (a *API) CreateCita(w http.ResponseWriter, r *http.Request) {
	var input services.CitaInput
	if !decodeJSON(w, r, &input) {
		return
	}

	cita, err := a.Citas.Create(r.Context(), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, cita)
}

// GetCita devuelve una cita por ID (M4).
func (a *API) GetCita(w http.ResponseWriter, r *http.Request) {
	cita, err := a.Citas.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, cita)
}

// UpdateEstadoCita aplica una transición de estado (M4).
func (a *API) UpdateEstadoCita(w http.ResponseWriter, r *http.Request) {
	var input services.EstadoInput
	if !decodeJSON(w, r, &input) {
		return
	}

	cita, err := a.Citas.UpdateEstado(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, cita)
}
