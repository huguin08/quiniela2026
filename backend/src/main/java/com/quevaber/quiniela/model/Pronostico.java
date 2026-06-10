package com.quevaber.quiniela.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pronosticos",
       uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "partido_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pronostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    // L = Local gana, E = Empate, V = Visitante gana
    @Column(nullable = false, length = 1)
    private String resultado;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @PrePersist
    @PreUpdate
    public void actualizarFecha() {
        this.fechaModificacion = LocalDateTime.now();
    }
}
