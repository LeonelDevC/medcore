// Command api arranca el API REST del MVP hospitalario.
//
//	go run ./cmd/api
//
// Las dependencias se inyectan a mano: configuración -> caché de repositorios
// -> servicios -> handlers -> router. Sin frameworks, solo biblioteca estándar.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hospital/api/internal/config"
	"github.com/hospital/api/internal/handlers"
	"github.com/hospital/api/internal/repository/memory"
	"github.com/hospital/api/internal/routes"
	"github.com/hospital/api/internal/services"
	"github.com/hospital/api/pkg/database"
)

func main() {
	log := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	cfg, err := config.Load()
	if err != nil {
		log.Error("configuración inválida", "error", err)
		os.Exit(1)
	}

	backend, err := database.Select(database.Config{DSN: cfg.DatabaseDSN})
	if err != nil {
		log.Error("no se pudo configurar la persistencia", "error", err)
		os.Exit(1)
	}

	repos := memory.New()

	api := &handlers.API{
		Log:       log,
		Pacientes: services.NewPacientes(repos.Pacientes),
		Citas:     services.NewCitas(repos.Citas, repos.Pacientes),
		Personal:  services.NewPersonal(repos.Personal),
		Estudios:  services.NewEstudios(repos.Estudios, repos.Pacientes),
		Informes:  services.NewInformes(repos.Informes, repos.Pacientes, repos.Estudios),
	}

	server := &http.Server{
		Addr:              cfg.Address,
		Handler:           routes.New(api, cfg, log),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info("API escuchando",
			"addr", cfg.Address,
			"entorno", cfg.Env,
			"persistencia", string(backend),
			"origen_permitido", cfg.AllowedOrigin,
			"tokens", len(cfg.Tokens),
		)

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("el servidor se detuvo", "error", err)
			stop()
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error("apagado forzado", "error", err)
	} else {
		log.Info("API detenida")
	}
}
