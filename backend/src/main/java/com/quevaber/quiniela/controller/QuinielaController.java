package com.quevaber.quiniela.controller;

import com.quevaber.quiniela.dto.Dtos.*;
import com.quevaber.quiniela.service.PronosticoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class QuinielaController {

    private final PronosticoService pronosticoService;

    public QuinielaController(PronosticoService pronosticoService) {
        this.pronosticoService = pronosticoService;
    }

    // GET /api/partidos — lista todos los partidos con mi pronóstico actual
    @GetMapping("/partidos")
    public ResponseEntity<?> getPartidos(Authentication auth) {
        return ResponseEntity.ok(pronosticoService.getPartidosConPronosticos(auth.getName()));
    }

    // GET /api/pronosticos/mios — mis pronósticos guardados
    @GetMapping("/pronosticos/mios")
    public ResponseEntity<?> getMisPronosticos(Authentication auth) {
        return ResponseEntity.ok(pronosticoService.getMisPronosticos(auth.getName()));
    }

    // POST /api/pronosticos/guardar — guardar/actualizar pronósticos
    @PostMapping("/pronosticos/guardar")
    public ResponseEntity<?> guardarPronosticos(@RequestBody GuardarPronosticosRequest req,
                                                 Authentication auth) {
        return ResponseEntity.ok(pronosticoService.guardarPronosticos(auth.getName(), req));
    }

    // GET /api/pronosticos/estado-cierre — saber si la quiniela está cerrada
    @GetMapping("/pronosticos/estado-cierre")
    public ResponseEntity<?> estadoCierre() {
        boolean cerrada = pronosticoService.isQuinielaCerrada();
        return ResponseEntity.ok(Map.of(
            "cerrada", cerrada,
            "mensaje", cerrada
                ? "La quiniela cerró el 11 de junio a las 10:00 AM"
                : "La quiniela está abierta hasta el 11 de junio a las 10:00 AM (hora México)"
        ));
    }

    // GET /api/pronosticos/admin/todos — SOLO ADMIN
    @GetMapping("/pronosticos/admin/todos")
    public ResponseEntity<?> getAdminPronosticos() {
        return ResponseEntity.ok(pronosticoService.getAdminPronosticos());
    }
}
