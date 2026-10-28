// Package config carga la configuración del API desde el entorno.
package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/hospital/api/internal/models"
)

// Config es la configuración efectiva del proceso.
type Config struct {
	// Env es "development", "staging" o "production".
	Env string
	// Address es la dirección de escucha (por defecto ":8080").
	Address string
	// AllowedOrigin es el origen permitido por CORS (el dev server de Vite).
	AllowedOrigin string
	// DatabaseDSN, si está definido, exige un backend de base de datos real.
	DatabaseDSN string
	// Tokens mapea token de acceso a rol. Sustituye a JWT mientras no haya
	// autenticación real; sin tokens, los endpoints protegidos dan 401.
	Tokens map[string]models.Role
}

// Load lee el entorno. Nada es obligatorio para arrancar en desarrollo: sin
// API_TOKENS el API responde 401 en las rutas protegidas, que es un fallo
// seguro y explícito.
func Load() (Config, error) {
	tokens, err := parseTokens(os.Getenv("API_TOKENS"))
	if err != nil {
		return Config{}, err
	}

	return Config{
		Env:           envOr("APP_ENV", "development"),
		Address:       envOr("API_ADDR", ":8080"),
		AllowedOrigin: envOr("API_ALLOWED_ORIGIN", "http://localhost:5173"),
		DatabaseDSN:   strings.TrimSpace(os.Getenv("DATABASE_URL")),
		Tokens:        tokens,
	}, nil
}

// parseTokens espera "token:rol,token:rol". Es un sustituto temporal de JWT
// para poder probar admin y médico sin añadir dependencias.
func parseTokens(raw string) (map[string]models.Role, error) {
	tokens := make(map[string]models.Role)

	for _, entry := range strings.Split(raw, ",") {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}

		parts := strings.SplitN(entry, ":", 2)
		if len(parts) != 2 {
			return nil, fmt.Errorf("API_TOKENS mal formado en %q: usa token:rol", entry)
		}

		token := strings.TrimSpace(parts[0])
		role := models.Role(strings.TrimSpace(parts[1]))
		if token == "" || !role.Valid() {
			return nil, fmt.Errorf("API_TOKENS: token o rol inválido en %q", entry)
		}

		tokens[token] = role
	}

	return tokens, nil
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}
