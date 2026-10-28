// Package routes declara el árbol de rutas y los permisos por rol.
//
// La autorización vive aquí (no en la UI): cada ruta declara qué roles puede
// usarla, según la matriz de permisos de las especificaciones (§6).
package routes

import (
	"log/slog"
	"net/http"

	"github.com/hospital/api/internal/config"
	"github.com/hospital/api/internal/handlers"
	"github.com/hospital/api/internal/middleware"
	"github.com/hospital/api/internal/models"
)

// New construye el handler HTTP completo del API.
func New(api *handlers.API, cfg config.Config, log *slog.Logger) http.Handler {
	apiMux := http.NewServeMux()

	// M3 Pacientes: admin y médico gestionan pacientes (matriz §6).
	apiMux.Handle("GET /api/v1/pacientes", allow(api.ListPacientes, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("POST /api/v1/pacientes", allow(api.CreatePaciente, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("GET /api/v1/pacientes/{id}", allow(api.GetPaciente, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("PUT /api/v1/pacientes/{id}", allow(api.UpdatePaciente, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("DELETE /api/v1/pacientes/{id}", allow(api.DeletePaciente, models.RoleAdmin, models.RoleMedico))

	// M4 Citas: agenda de ambos roles.
	apiMux.Handle("GET /api/v1/citas", allow(api.ListCitas, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("POST /api/v1/citas", allow(api.CreateCita, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("GET /api/v1/citas/{id}", allow(api.GetCita, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("PATCH /api/v1/citas/{id}", allow(api.UpdateEstadoCita, models.RoleAdmin, models.RoleMedico))

	// M5 Personal médico: solo admin.
	apiMux.Handle("GET /api/v1/personal", allow(api.ListPersonal, models.RoleAdmin))
	apiMux.Handle("POST /api/v1/personal", allow(api.CreatePersonal, models.RoleAdmin))
	apiMux.Handle("GET /api/v1/personal/{id}", allow(api.GetPersonal, models.RoleAdmin))
	apiMux.Handle("PUT /api/v1/personal/{id}", allow(api.UpdatePersonal, models.RoleAdmin))

	// M6 Estudios DICOM: admin solo consulta; médico carga y mide.
	apiMux.Handle("GET /api/v1/estudios", allow(api.ListEstudios, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("GET /api/v1/estudios/{id}", allow(api.GetEstudio, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("GET /api/v1/pacientes/{id}/estudios", allow(api.ListEstudiosPaciente, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("POST /api/v1/pacientes/{id}/estudios", allow(api.CreateEstudioPaciente, models.RoleMedico))
	apiMux.Handle("POST /api/v1/estudios/{id}/mediciones", allow(api.CreateMedicion, models.RoleMedico))

	// M7 Informes: el médico crea, edita y firma; el admin consulta.
	apiMux.Handle("GET /api/v1/informes", allow(api.ListInformes, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("POST /api/v1/informes", allow(api.CreateInforme, models.RoleMedico))
	apiMux.Handle("GET /api/v1/informes/{id}", allow(api.GetInforme, models.RoleAdmin, models.RoleMedico))
	apiMux.Handle("PUT /api/v1/informes/{id}", allow(api.UpdateInforme, models.RoleMedico))
	apiMux.Handle("POST /api/v1/informes/{id}/firma", allow(api.FirmarInforme, models.RoleMedico))
	apiMux.Handle("POST /api/v1/informes/{id}/adendas", allow(api.CreateAdenda, models.RoleMedico))

	// Todo /api exige token; /healthz queda público para el healthcheck.
	protected := middleware.Chain(apiMux, middleware.Auth(cfg.Tokens))

	root := http.NewServeMux()
	root.HandleFunc("GET /healthz", api.Health)
	root.Handle("/api/", protected)

	return middleware.Chain(root,
		middleware.Recoverer(log),
		middleware.Logger(log),
		middleware.CORS(cfg.AllowedOrigin),
	)
}

// allow exige que el rol autenticado esté entre los indicados.
func allow(handler http.HandlerFunc, roles ...models.Role) http.Handler {
	return middleware.Chain(handler, middleware.RequireRole(roles...))
}
