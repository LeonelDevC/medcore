// Package handlers expone el API REST sobre los servicios de dominio.
package handlers

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/hospital/api/internal/repository"
	"github.com/hospital/api/internal/services"
)

// Version del API. Se sube junto con cambios incompatibles.
const Version = "0.1.0"

// API agrupa los servicios que usan los handlers.
type API struct {
	Log       *slog.Logger
	Pacientes *services.Pacientes
	Citas     *services.Citas
	Personal  *services.Personal
	Estudios  *services.Estudios
	Informes  *services.Informes
}

// fail traduce los errores de dominio a respuestas HTTP.
func (a *API) fail(w http.ResponseWriter, err error) {
	var validation services.ValidationError

	switch {
	case errors.As(err, &validation):
		writeError(w, http.StatusBadRequest, "validacion", validation.Error())
	case errors.Is(err, repository.ErrNotFound):
		writeError(w, http.StatusNotFound, "no_encontrado", "El recurso no existe")
	case errors.Is(err, repository.ErrConflict):
		writeError(w, http.StatusConflict, "conflicto", "El recurso ya existe")
	case errors.Is(err, repository.ErrInmutable):
		writeError(w, http.StatusConflict, "inmutable", err.Error())
	case errors.Is(err, services.ErrTransicionInvalida):
		writeError(w, http.StatusConflict, "transicion_invalida", err.Error())
	default:
		a.Log.Error("error interno", "error", err)
		writeError(w, http.StatusInternalServerError, "error_interno", "Error interno del servidor")
	}
}
