// Package utils reúne utilidades sin dependencias externas.
package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

// NewID genera un identificador opaco con prefijo legible (por ejemplo
// "pac_9f1c..."): útil en logs y en URLs sin exponer un contador.
func NewID(prefix string) string {
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("%s_%d", prefix, time.Now().UnixNano())
	}
	return prefix + "_" + hex.EncodeToString(buf)
}

// ParseDate acepta una fecha ISO (yyyy-mm-dd) y la devuelve en UTC.
func ParseDate(value string) (time.Time, error) {
	fecha, err := time.Parse("2006-01-02", value)
	if err != nil {
		return time.Time{}, fmt.Errorf("fecha inválida %q: usa yyyy-mm-dd", value)
	}
	return fecha.UTC(), nil
}

// ParseDateTime acepta un instante RFC3339 y lo devuelve en UTC.
func ParseDateTime(value string) (time.Time, error) {
	fecha, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return time.Time{}, fmt.Errorf("fecha inválida %q: usa RFC3339 (2026-10-27T09:30:00Z)", value)
	}
	return fecha.UTC(), nil
}
