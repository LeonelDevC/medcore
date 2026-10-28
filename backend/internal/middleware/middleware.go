// Package middleware contiene los middlewares HTTP del API.
package middleware

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/hospital/api/internal/models"
)

type contextKey string

const roleKey contextKey = "rol"

// Middleware envuelve un handler.
type Middleware func(http.Handler) http.Handler

// Chain aplica los middlewares en orden: el primero es el más externo.
func Chain(handler http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}

// RoleFrom devuelve el rol que dejó Auth en el contexto.
func RoleFrom(ctx context.Context) (models.Role, bool) {
	role, ok := ctx.Value(roleKey).(models.Role)
	return role, ok
}

// BearerToken extrae el token de `Authorization: Bearer <token>`.
func BearerToken(r *http.Request) string {
	const prefix = "bearer "

	header := r.Header.Get("Authorization")
	if len(header) <= len(prefix) || !strings.EqualFold(header[:len(prefix)], prefix) {
		return ""
	}

	return strings.TrimSpace(header[len(prefix):])
}

// Auth valida el token contra la tabla configurada y deja el rol en el contexto.
//
// Sustituto temporal de JWT: cuando exista login real, solo cambia esta
// función; los permisos por ruta ya están declarados en routes.
func Auth(tokens map[string]models.Role) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := BearerToken(r)
			role, ok := tokens[token]
			if token == "" || !ok {
				writeError(w, http.StatusUnauthorized, "no_autenticado", "Falta el token o no es válido")
				return
			}

			ctx := context.WithValue(r.Context(), roleKey, role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole deja pasar solo los roles indicados. La UI oculta; el API impide.
func RequireRole(roles ...models.Role) Middleware {
	allowed := make(map[models.Role]struct{}, len(roles))
	for _, role := range roles {
		allowed[role] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := RoleFrom(r.Context())
			if !ok {
				writeError(w, http.StatusUnauthorized, "no_autenticado", "La petición no está autenticada")
				return
			}

			if _, ok := allowed[role]; !ok {
				writeError(w, http.StatusForbidden, "sin_permiso", "El rol "+string(role)+" no puede realizar esta acción")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// Logger registra método, ruta, estado y duración de cada petición.
func Logger(log *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(recorder, r)

			log.Info("petición",
				"metodo", r.Method,
				"ruta", r.URL.Path,
				"estado", recorder.status,
				"duracion", time.Since(start).Round(time.Millisecond).String(),
			)
		})
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

// Recoverer evita que un panic tumbe el servidor.
func Recoverer(log *slog.Logger) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if recovered := recover(); recovered != nil {
					log.Error("panic recuperado", "valor", recovered, "ruta", r.URL.Path)
					writeError(w, http.StatusInternalServerError, "error_interno", "Error interno del servidor")
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}

// CORS permite el dev server del frontend y responde al preflight.
func CORS(allowedOrigin string) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Vary", "Origin")

			origin := r.Header.Get("Origin")
			if allowedOrigin == "*" || origin == allowedOrigin {
				w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Max-Age", "600")
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message, "code": code})
}
