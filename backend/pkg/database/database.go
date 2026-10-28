// Package database decide el motor de persistencia del API.
//
// El MVP arranca con repositorios en memoria (repository/memory). Este paquete
// es el único punto que debe cambiar cuando se elija el motor definitivo:
// ningún servicio ni handler importa un driver.
package database

import "fmt"

// Backend identifica el motor activo.
type Backend string

const (
	// BackendMemory es el repositorio en memoria del MVP.
	BackendMemory Backend = "memory"
	// BackendPostgres es el motor previsto para producción.
	BackendPostgres Backend = "postgres"
)

// Config es la configuración de persistencia.
type Config struct {
	DSN string
}

// Select decide el backend. Un DSN configurado sin driver enlazado es un error
// explícito: nunca se cae en silencio a memoria cuando se pidió base de datos.
func Select(cfg Config) (Backend, error) {
	if cfg.DSN == "" {
		return BackendMemory, nil
	}

	return "", fmt.Errorf(
		"DATABASE_URL está definido pero el driver Postgres aún no está incluido; " +
			"decide el driver (y su dependencia) antes de activar la persistencia real",
	)
}
