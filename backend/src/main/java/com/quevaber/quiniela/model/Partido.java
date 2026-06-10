package com.quevaber.quiniela.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "partidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String grupo;

    @Column(name = "equipo_local", nullable = false, length = 60)
    private String equipoLocal;

    @Column(name = "equipo_visitante", nullable = false, length = 60)
    private String equipoVisitante;

    @Column(name = "bandera_local", length = 10)
    private String banderaLocal;

    @Column(name = "bandera_visitante", length = 10)
    private String banderaVisitante;

    @Column(name = "fecha_partido")
    private LocalDateTime fechaPartido;

    @Column(length = 80)
    private String sede;

    @Column(name = "orden_grupo")
    private Integer ordenGrupo;
}
