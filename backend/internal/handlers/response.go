package handlers

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse es el cuerpo uniforme de error del API.
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)

	if payload == nil {
		return
	}

	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{Error: message, Code: code})
}

// decodeJSON lee el cuerpo con un límite de 1 MiB y rechaza campos
// desconocidos: un typo en el cliente devuelve 400 en vez de ignorarse.
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) bool {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(dst); err != nil {
		writeError(w, http.StatusBadRequest, "cuerpo_invalido", "El cuerpo JSON no es válido: "+err.Error())
		return false
	}

	return true
}
