package com.quevaber.quiniela.service;

import com.quevaber.quiniela.dto.Dtos.*;
import com.quevaber.quiniela.model.Partido;
import com.quevaber.quiniela.model.Pronostico;
import com.quevaber.quiniela.model.Usuario;
import com.quevaber.quiniela.repository.PartidoRepository;
import com.quevaber.quiniela.repository.PronosticoRepository;
import com.quevaber.quiniela.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PronosticoService {

    private final PronosticoRepository pronosticoRepo;
    private final PartidoRepository partidoRepo;
    private final UsuarioRepository usuarioRepo;

    @Value("${app.quiniela.cierre}")
    private String cierreIso;

    public PronosticoService(PronosticoRepository pronosticoRepo,
                             PartidoRepository partidoRepo,
                             UsuarioRepository usuarioRepo) {
        this.pronosticoRepo = pronosticoRepo;
        this.partidoRepo = partidoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public boolean isQuinielaCerrada() {
        return Instant.now().isAfter(Instant.parse(cierreIso));
    }

    // Obtener partidos con el pronóstico actual del usuario
    public List<PartidoDto> getPartidosConPronosticos(String nombreUsuario) {
        Usuario usuario = getUsuario(nombreUsuario);
        List<Partido> partidos = partidoRepo.findAllByOrderByGrupoAscOrdenGrupoAsc();
        List<Pronostico> misPronosticos = pronosticoRepo.findByUsuario(usuario);

        Map<Long, String> mapaPronosticos = misPronosticos.stream()
                .collect(Collectors.toMap(p -> p.getPartido().getId(), Pronostico::getResultado));

        return partidos.stream().map(partido -> {
            PartidoDto dto = new PartidoDto();
            dto.setId(partido.getId());
            dto.setGrupo(partido.getGrupo());
            dto.setEquipoLocal(partido.getEquipoLocal());
            dto.setEquipoVisitante(partido.getEquipoVisitante());
            dto.setBanderaLocal(partido.getBanderaLocal());
            dto.setBanderaVisitante(partido.getBanderaVisitante());
            dto.setFechaPartido(partido.getFechaPartido());
            dto.setSede(partido.getSede());
            dto.setOrdenGrupo(partido.getOrdenGrupo());
            dto.setPronostico(mapaPronosticos.get(partido.getId()));
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public MensajeResponse guardarPronosticos(String nombreUsuario, GuardarPronosticosRequest req) {
        if (isQuinielaCerrada()) {
            return new MensajeResponse("La quiniela ya cerró el 11 de junio a las 10:00 AM. No se pueden modificar pronósticos.", false);
        }

        Usuario usuario = getUsuario(nombreUsuario);
        int guardados = 0;

        for (PronosticoRequest pr : req.getPronosticos()) {
            if (!List.of("L", "E", "V").contains(pr.getResultado())) continue;

            Partido partido = partidoRepo.findById(pr.getPartidoId()).orElse(null);
            if (partido == null) continue;

            Pronostico pronostico = pronosticoRepo
                    .findByUsuarioAndPartido(usuario, partido)
                    .orElse(new Pronostico());

            pronostico.setUsuario(usuario);
            pronostico.setPartido(partido);
            pronostico.setResultado(pr.getResultado());
            pronosticoRepo.save(pronostico);
            guardados++;
        }

        return new MensajeResponse("✅ " + guardados + " pronósticos guardados correctamente.", true);
    }

    public List<PronosticoDto> getMisPronosticos(String nombreUsuario) {
        Usuario usuario = getUsuario(nombreUsuario);
        return pronosticoRepo.findByUsuario(usuario).stream().map(p -> {
            PronosticoDto dto = new PronosticoDto();
            dto.setPartidoId(p.getPartido().getId());
            dto.setGrupo(p.getPartido().getGrupo());
            dto.setEquipoLocal(p.getPartido().getEquipoLocal());
            dto.setEquipoVisitante(p.getPartido().getEquipoVisitante());
            dto.setBanderaLocal(p.getPartido().getBanderaLocal());
            dto.setBanderaVisitante(p.getPartido().getBanderaVisitante());
            dto.setResultado(p.getResultado());
            dto.setFechaModificacion(p.getFechaModificacion());
            return dto;
        }).sorted(Comparator.comparing(PronosticoDto::getGrupo)
                .thenComparing(PronosticoDto::getPartidoId))
         .collect(Collectors.toList());
    }

    // Admin: todos los pronósticos de todos los usuarios agrupados
    public List<AdminPronosticosDto> getAdminPronosticos() {
        List<Pronostico> todos = pronosticoRepo.findAllWithDetails();
        int totalPartidos = (int) partidoRepo.count();

        Map<String, List<Pronostico>> porUsuario = todos.stream()
                .collect(Collectors.groupingBy(p -> p.getUsuario().getNombre()));

        return porUsuario.entrySet().stream().map(entry -> {
            List<PronosticoDto> dtos = entry.getValue().stream().map(p -> {
                PronosticoDto dto = new PronosticoDto();
                dto.setPartidoId(p.getPartido().getId());
                dto.setGrupo(p.getPartido().getGrupo());
                dto.setEquipoLocal(p.getPartido().getEquipoLocal());
                dto.setEquipoVisitante(p.getPartido().getEquipoVisitante());
                dto.setBanderaLocal(p.getPartido().getBanderaLocal());
                dto.setBanderaVisitante(p.getPartido().getBanderaVisitante());
                dto.setResultado(p.getResultado());
                dto.setFechaModificacion(p.getFechaModificacion());
                return dto;
            }).collect(Collectors.toList());

            return new AdminPronosticosDto(entry.getKey(), dtos, totalPartidos, dtos.size());
        }).sorted(Comparator.comparing(AdminPronosticosDto::getUsuario))
         .collect(Collectors.toList());
    }

    private Usuario getUsuario(String nombre) {
        return usuarioRepo.findByNombreIgnoreCase(nombre)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + nombre));
    }
}
