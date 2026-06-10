package com.quevaber.quiniela.controller;

import com.quevaber.quiniela.dto.Dtos.*;
import com.quevaber.quiniela.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Admin login con contraseña
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest req) {
        try {
            return ResponseEntity.ok(authService.loginAdmin(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MensajeResponse(e.getMessage(), false));
        }
    }

    // Acceso usuario normal — solo nombre
    @PostMapping("/acceso")
    public ResponseEntity<?> acceso(@RequestBody RegistroRequest req) {
        try {
            return ResponseEntity.ok(authService.accesoPorNombre(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MensajeResponse(e.getMessage(), false));
        }
    }
}
