package com.quevaber.quiniela.service;

import com.quevaber.quiniela.dto.Dtos.*;
import com.quevaber.quiniela.model.Usuario;
import com.quevaber.quiniela.repository.UsuarioRepository;
import com.quevaber.quiniela.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.usuarioRepo = usuarioRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    // Login admin con contraseña
    public AuthResponse loginAdmin(LoginRequest req) {
        Usuario usuario = usuarioRepo.findByNombreIgnoreCase(req.getNombre())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.isEsAdmin()) {
            throw new RuntimeException("No tienes permisos de administrador");
        }

        if (!encoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(usuario.getNombre(), true);
        return new AuthResponse(token, usuario.getNombre(), true, true);
    }

    // Acceso usuario normal — solo por nombre
    public AuthResponse accesoPorNombre(RegistroRequest req) {
        String nombre = req.getNombre().trim();

        if (nombre.isBlank()) {
            throw new RuntimeException("El nombre no puede estar vacío");
        }
        if (nombre.equalsIgnoreCase("admin")) {
            throw new RuntimeException("Nombre reservado");
        }

        boolean yaExiste = usuarioRepo.existsByNombreIgnoreCase(nombre);

        Usuario usuario;
        if (yaExiste) {
            usuario = usuarioRepo.findByNombreIgnoreCase(nombre).get();
        } else {
            usuario = new Usuario();
            usuario.setNombre(nombre);
            usuario.setEsAdmin(false);
            usuarioRepo.save(usuario);
        }

        String token = jwtUtil.generateToken(usuario.getNombre(), false);
        return new AuthResponse(token, usuario.getNombre(), false, yaExiste);
    }
}
