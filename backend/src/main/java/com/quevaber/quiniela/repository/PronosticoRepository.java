package com.quevaber.quiniela.repository;

import com.quevaber.quiniela.model.Pronostico;
import com.quevaber.quiniela.model.Usuario;
import com.quevaber.quiniela.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PronosticoRepository extends JpaRepository<Pronostico, Long> {
    List<Pronostico> findByUsuario(Usuario usuario);
    Optional<Pronostico> findByUsuarioAndPartido(Usuario usuario, Partido partido);

    @Query("SELECT p FROM Pronostico p JOIN FETCH p.usuario JOIN FETCH p.partido ORDER BY p.usuario.nombre, p.partido.grupo, p.partido.ordenGrupo")
    List<Pronostico> findAllWithDetails();
}
