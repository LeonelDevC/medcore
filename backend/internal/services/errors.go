package services

import (
	"errors"
	"fmt"
	"strings"
)

// ErrTransicionInvalida indica un cambio de estado no permitido (M4/M7).
var ErrTransicionInvalida = errors.New("transición de estado no permitida")

// ValidationError describe un campo de entrada mal formado. Los handlers lo
// traducen a 400 y devuelven el nombre del campo al cliente.
type ValidationError struct {
	Campo   string
	Detalle string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Campo, e.Detalle)
}

func required(campo, valor string) error {
	if strings.TrimSpace(valor) == "" {
		return ValidationError{Campo: campo, Detalle: "es obligatorio"}
	}
	return nil
}
