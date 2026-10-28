package handlers

import (
	"net/http"
	"time"
)

type healthResponse struct {
	Status   string    `json:"status"`
	Servicio string    `json:"servicio"`
	Version  string    `json:"version"`
	Hora     time.Time `json:"hora"`
}

// Health responde el estado del API. Es la única ruta pública.
func (a *API) Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, healthResponse{
		Status:   "ok",
		Servicio: "hospital-api",
		Version:  Version,
		Hora:     time.Now().UTC(),
	})
}
