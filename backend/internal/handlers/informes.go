package handlers

import (
	"net/http"

	"github.com/hospital/api/internal/services"
)

// ListInformes devuelve informes, filtrables con ?pacienteId= (M7).
func (a *API) ListInformes(w http.ResponseWriter, r *http.Request) {
	informes, err := a.Informes.List(r.Context(), r.URL.Query().Get("pacienteId"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, informes)
}

// CreateInforme crea un informe en borrador (M7, solo médico).
func (a *API) CreateInforme(w http.ResponseWriter, r *http.Request) {
	var input services.InformeInput
	if !decodeJSON(w, r, &input) {
		return
	}

	informe, err := a.Informes.Create(r.Context(), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, informe)
}

// GetInforme devuelve un informe por ID (M7).
func (a *API) GetInforme(w http.ResponseWriter, r *http.Request) {
	informe, err := a.Informes.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, informe)
}

// UpdateInforme edita un borrador (M7, solo médico).
func (a *API) UpdateInforme(w http.ResponseWriter, r *http.Request) {
	var input services.InformeInput
	if !decodeJSON(w, r, &input) {
		return
	}

	informe, err := a.Informes.Update(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, informe)
}

// FirmarInforme pasa el informe a firmado e inmutable (M7, solo médico).
func (a *API) FirmarInforme(w http.ResponseWriter, r *http.Request) {
	informe, err := a.Informes.Firmar(r.Context(), r.PathValue("id"))
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusOK, informe)
}

// CreateAdenda corrige un informe firmado sin editarlo (M7, solo médico).
func (a *API) CreateAdenda(w http.ResponseWriter, r *http.Request) {
	var input services.AdendaInput
	if !decodeJSON(w, r, &input) {
		return
	}

	informe, err := a.Informes.AddAdenda(r.Context(), r.PathValue("id"), input)
	if err != nil {
		a.fail(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, informe)
}
