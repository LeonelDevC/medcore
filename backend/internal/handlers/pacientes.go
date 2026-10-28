package handlers

import (
	"net/http"

	"github.com/hospital/api/internal/services"
)

// ListPacientes devuelve todos los pacientes (M3).
func (a *API) ListPacientes(w http.ResponseWriter, r *http.Request) {
	pacientes, err := a.Pacientes.List(r.Context())
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, pacientes)
}

// CreatePaciente registra un paciente nuevo (M3).
func (a *API) CreatePaciente(w http.ResponseWriter, r *http.Request) {
	var input services.PacienteInput
	if !decodeJSON(w, r, &input) {
		return
	}

	paciente, err := a.Pacientes.Create(r.Context(), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, paciente)
}

// GetPaciente devuelve la ficha de un paciente (M3).
func (a *API) GetPaciente(w http.ResponseWriter, r *http.Request) {
	paciente, err := a.Pacientes.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, paciente)
}

// UpdatePaciente edita un paciente existente (M3).
func (a *API) UpdatePaciente(w http.ResponseWriter, r *http.Request) {
	var input services.PacienteInput
	if !decodeJSON(w, r, &input) {
		return
	}

	paciente, err := a.Pacientes.Update(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, paciente)
}

// DeletePaciente elimina un paciente (M3).
func (a *API) DeletePaciente(w http.ResponseWriter, r *http.Request) {
	if err := a.Pacientes.Delete(r.Context(), r.PathValue("id")); err != nil {
		a.fail(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
