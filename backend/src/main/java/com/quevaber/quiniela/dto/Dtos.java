package com.quevaber.quiniela.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Dtos {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String nombre;
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegistroRequest {
        private String nombre;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String nombre;
        private boolean esAdmin;
        private boolean yaRegistrado;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PartidoDto {
        private Long id;
        private String grupo;
        private String equipoLocal;
        private String equipoVisitante;
        private String banderaLocal;
        private String banderaVisitante;
        private LocalDateTime fechaPartido;
        private String sede;
        private Integer ordenGrupo;
        private String pronostico; // L, E, V — null si no ha pronosticado
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PronosticoRequest {
        private Long partidoId;
        private String resultado; // L, E, V
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class GuardarPronosticosRequest {
        private List<PronosticoRequest> pronosticos;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class PronosticoDto {
        private Long partidoId;
        private String grupo;
        private String equipoLocal;
        private String equipoVisitante;
        private String banderaLocal;
        private String banderaVisitante;
        private String resultado;
        private LocalDateTime fechaModificacion;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AdminPronosticosDto {
        private String usuario;
        private List<PronosticoDto> pronosticos;
        private int total;
        private int completados;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class MensajeResponse {
        private String mensaje;
        private boolean exito;
    }
}
