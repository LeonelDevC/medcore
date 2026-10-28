package handlers

import (
	"net/http"

	"github.com/hospital/api/internal/services"
)

// ListPersonal devuelve el personal médico (M5, solo admin).
func (a *API) ListPersonal(w http.ResponseWriter, r *http.Request) {
	personal, err := a.Personal.List(r.Context())
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, personal)
}

// CreatePersonal registra una ficha de personal (M5, solo admin).
func (a *API) CreatePersonal(w http.ResponseWriter, r *http.Request) {
	var input services.PersonalInput
	if !decodeJSON(w, r, &input) {
		return
	}

	persona, err := a.Personal.Create(r.Context(), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, persona)
}

// GetPersonal devuelve una ficha de personal (M5, solo admin).
func (a *API) GetPersonal(w http.ResponseWriter, r *http.Request) {
	persona, err := a.Personal.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, persona)
}

// UpdatePersonal edita una ficha de personal (M5, solo admin).
func (a *API) UpdatePersonal(w http.ResponseWriter, r *http.Request) {
	var input services.PersonalInput
	if !decodeJSON(w, r, &input) {
		return
	}

	persona, err := a.Personal.Update(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, persona)
}
