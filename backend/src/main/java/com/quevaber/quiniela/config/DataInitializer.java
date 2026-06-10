package com.quevaber.quiniela.config;

import com.quevaber.quiniela.model.Partido;
import com.quevaber.quiniela.model.Usuario;
import com.quevaber.quiniela.repository.PartidoRepository;
import com.quevaber.quiniela.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepo,
                                      PartidoRepository partidoRepo,
                                      PasswordEncoder encoder) {
        return args -> {
            // Crear admin si no existe
            if (!usuarioRepo.existsByNombreIgnoreCase("admin")) {
                Usuario admin = new Usuario();
                admin.setNombre("admin");
                admin.setPasswordHash(encoder.encode("l33tsupah4x0r"));
                admin.setEsAdmin(true);
                usuarioRepo.save(admin);
                System.out.println("✅ Admin creado correctamente");
            }

            // Sembrar partidos si la tabla está vacía
            if (partidoRepo.count() == 0) {
                List<Partido> partidos = List.of(
                    // ===== GRUPO A =====
                    p("A", "México", "Sudáfrica", "🇲🇽", "🇿🇦", LocalDateTime.of(2026, 6, 11, 13, 0), "Ciudad de México", 1),
                    p("A", "Corea del Sur", "Chequia", "🇰🇷", "🇨🇿", LocalDateTime.of(2026, 6, 11, 20, 0), "Guadalajara", 2),
                    p("A", "Chequia", "Sudáfrica", "🇨🇿", "🇿🇦", LocalDateTime.of(2026, 6, 18, 10, 0), "Atlanta", 3),
                    p("A", "México", "Corea del Sur", "🇲🇽", "🇰🇷", LocalDateTime.of(2026, 6, 18, 19, 0), "Guadalajara", 4),
                    p("A", "Chequia", "México", "🇨🇿", "🇲🇽", LocalDateTime.of(2026, 6, 24, 19, 0), "Ciudad de México", 5),
                    p("A", "Sudáfrica", "Corea del Sur", "🇿🇦", "🇰🇷", LocalDateTime.of(2026, 6, 24, 19, 0), "Monterrey", 6),

                    // ===== GRUPO B =====
                    p("B", "Canadá", "Bosnia y Herz.", "🇨🇦", "🇧🇦", LocalDateTime.of(2026, 6, 12, 15, 0), "Toronto", 1),
                    p("B", "Qatar", "Suiza", "🇶🇦", "🇨🇭", LocalDateTime.of(2026, 6, 13, 12, 0), "San Francisco", 2),
                    p("B", "Bosnia y Herz.", "Qatar", "🇧🇦", "🇶🇦", LocalDateTime.of(2026, 6, 19, 12, 0), "Seattle", 3),
                    p("B", "Suiza", "Canadá", "🇨🇭", "🇨🇦", LocalDateTime.of(2026, 6, 19, 18, 0), "Vancouver", 4),
                    p("B", "Bosnia y Herz.", "Suiza", "🇧🇦", "🇨🇭", LocalDateTime.of(2026, 6, 25, 19, 0), "Kansas City", 5),
                    p("B", "Qatar", "Canadá", "🇶🇦", "🇨🇦", LocalDateTime.of(2026, 6, 25, 19, 0), "Houston", 6),

                    // ===== GRUPO C =====
                    p("C", "Brasil", "Marruecos", "🇧🇷", "🇲🇦", LocalDateTime.of(2026, 6, 13, 18, 0), "Nueva York/NJ", 1),
                    p("C", "Haití", "Escocia", "🇭🇹", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", LocalDateTime.of(2026, 6, 13, 21, 0), "Boston", 2),
                    p("C", "Marruecos", "Haití", "🇲🇦", "🇭🇹", LocalDateTime.of(2026, 6, 19, 15, 0), "Miami", 3),
                    p("C", "Escocia", "Brasil", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🇧🇷", LocalDateTime.of(2026, 6, 20, 18, 0), "Filadelfia", 4),
                    p("C", "Marruecos", "Escocia", "🇲🇦", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", LocalDateTime.of(2026, 6, 26, 19, 0), "Atlanta", 5),
                    p("C", "Haití", "Brasil", "🇭🇹", "🇧🇷", LocalDateTime.of(2026, 6, 26, 19, 0), "Boston", 6),

                    // ===== GRUPO D =====
                    p("D", "Estados Unidos", "Paraguay", "🇺🇸", "🇵🇾", LocalDateTime.of(2026, 6, 12, 18, 0), "Los Ángeles", 1),
                    p("D", "Australia", "Turquía", "🇦🇺", "🇹🇷", LocalDateTime.of(2026, 6, 13, 15, 0), "Dallas", 2),
                    p("D", "Turquía", "Paraguay", "🇹🇷", "🇵🇾", LocalDateTime.of(2026, 6, 19, 21, 0), "Kansas City", 3),
                    p("D", "Estados Unidos", "Australia", "🇺🇸", "🇦🇺", LocalDateTime.of(2026, 6, 20, 15, 0), "Seattle", 4),
                    p("D", "Turquía", "Estados Unidos", "🇹🇷", "🇺🇸", LocalDateTime.of(2026, 6, 25, 19, 0), "Los Ángeles", 5),
                    p("D", "Paraguay", "Australia", "🇵🇾", "🇦🇺", LocalDateTime.of(2026, 6, 25, 19, 0), "Dallas", 6),

                    // ===== GRUPO E =====
                    p("E", "Alemania", "Curazao", "🇩🇪", "🇨🇼", LocalDateTime.of(2026, 6, 14, 18, 0), "San Francisco", 1),
                    p("E", "Costa de Marfil", "Ecuador", "🇨🇮", "🇪🇨", LocalDateTime.of(2026, 6, 14, 21, 0), "Houston", 2),
                    p("E", "Ecuador", "Alemania", "🇪🇨", "🇩🇪", LocalDateTime.of(2026, 6, 20, 18, 0), "Miami", 3),
                    p("E", "Curazao", "Costa de Marfil", "🇨🇼", "🇨🇮", LocalDateTime.of(2026, 6, 21, 15, 0), "Dallas", 4),
                    p("E", "Ecuador", "Curazao", "🇪🇨", "🇨🇼", LocalDateTime.of(2026, 6, 26, 19, 0), "Houston", 5),
                    p("E", "Costa de Marfil", "Alemania", "🇨🇮", "🇩🇪", LocalDateTime.of(2026, 6, 26, 19, 0), "Kansas City", 6),

                    // ===== GRUPO F =====
                    p("F", "Países Bajos", "Japón", "🇳🇱", "🇯🇵", LocalDateTime.of(2026, 6, 14, 15, 0), "Nueva York/NJ", 1),
                    p("F", "Suecia", "Túnez", "🇸🇪", "🇹🇳", LocalDateTime.of(2026, 6, 15, 12, 0), "Filadelfia", 2),
                    p("F", "Japón", "Suecia", "🇯🇵", "🇸🇪", LocalDateTime.of(2026, 6, 21, 18, 0), "Seattle", 3),
                    p("F", "Túnez", "Países Bajos", "🇹🇳", "🇳🇱", LocalDateTime.of(2026, 6, 21, 21, 0), "Boston", 4),
                    p("F", "Japón", "Túnez", "🇯🇵", "🇹🇳", LocalDateTime.of(2026, 6, 27, 19, 0), "San Francisco", 5),
                    p("F", "Suecia", "Países Bajos", "🇸🇪", "🇳🇱", LocalDateTime.of(2026, 6, 27, 19, 0), "Seattle", 6),

                    // ===== GRUPO G =====
                    p("G", "Bélgica", "Irán", "🇧🇪", "🇮🇷", LocalDateTime.of(2026, 6, 15, 18, 0), "Los Ángeles", 1),
                    p("G", "Egipto", "Nueva Zelanda", "🇪🇬", "🇳🇿", LocalDateTime.of(2026, 6, 15, 15, 0), "Miami", 2),
                    p("G", "Irán", "Egipto", "🇮🇷", "🇪🇬", LocalDateTime.of(2026, 6, 22, 12, 0), "Toronto", 3),
                    p("G", "Nueva Zelanda", "Bélgica", "🇳🇿", "🇧🇪", LocalDateTime.of(2026, 6, 22, 15, 0), "Atlanta", 4),
                    p("G", "Irán", "Nueva Zelanda", "🇮🇷", "🇳🇿", LocalDateTime.of(2026, 6, 27, 19, 0), "Los Ángeles", 5),
                    p("G", "Egipto", "Bélgica", "🇪🇬", "🇧🇪", LocalDateTime.of(2026, 6, 27, 19, 0), "Filadelfia", 6),

                    // ===== GRUPO H =====
                    p("H", "España", "Cabo Verde", "🇪🇸", "🇨🇻", LocalDateTime.of(2026, 6, 15, 12, 0), "Atlanta", 1),
                    p("H", "Arabia Saudí", "Uruguay", "🇸🇦", "🇺🇾", LocalDateTime.of(2026, 6, 15, 21, 0), "Houston", 2),
                    p("H", "Cabo Verde", "Arabia Saudí", "🇨🇻", "🇸🇦", LocalDateTime.of(2026, 6, 21, 12, 0), "Guadalajara", 3),
                    p("H", "Uruguay", "España", "🇺🇾", "🇪🇸", LocalDateTime.of(2026, 6, 22, 18, 0), "Dallas", 4),
                    p("H", "Cabo Verde", "Uruguay", "🇨🇻", "🇺🇾", LocalDateTime.of(2026, 6, 28, 19, 0), "Miami", 5),
                    p("H", "Arabia Saudí", "España", "🇸🇦", "🇪🇸", LocalDateTime.of(2026, 6, 28, 19, 0), "Nueva York/NJ", 6),

                    // ===== GRUPO I =====
                    p("I", "Francia", "Senegal", "🇫🇷", "🇸🇳", LocalDateTime.of(2026, 6, 16, 15, 0), "Nueva York/NJ", 1),
                    p("I", "Irak", "Noruega", "🇮🇶", "🇳🇴", LocalDateTime.of(2026, 6, 16, 18, 0), "Dallas", 2),
                    p("I", "Senegal", "Irak", "🇸🇳", "🇮🇶", LocalDateTime.of(2026, 6, 22, 21, 0), "Houston", 3),
                    p("I", "Noruega", "Francia", "🇳🇴", "🇫🇷", LocalDateTime.of(2026, 6, 23, 18, 0), "Los Ángeles", 4),
                    p("I", "Senegal", "Noruega", "🇸🇳", "🇳🇴", LocalDateTime.of(2026, 6, 28, 19, 0), "Atlanta", 5),
                    p("I", "Irak", "Francia", "🇮🇶", "🇫🇷", LocalDateTime.of(2026, 6, 28, 19, 0), "San Francisco", 6),

                    // ===== GRUPO J =====
                    p("J", "Argentina", "Austria", "🇦🇷", "🇦🇹", LocalDateTime.of(2026, 6, 16, 21, 0), "Los Ángeles", 1),
                    p("J", "Argelia", "Jordania", "🇩🇿", "🇯🇴", LocalDateTime.of(2026, 6, 17, 12, 0), "Boston", 2),
                    p("J", "Austria", "Argelia", "🇦🇹", "🇩🇿", LocalDateTime.of(2026, 6, 23, 12, 0), "Filadelfia", 3),
                    p("J", "Jordania", "Argentina", "🇯🇴", "🇦🇷", LocalDateTime.of(2026, 6, 23, 15, 0), "Miami", 4),
                    p("J", "Austria", "Jordania", "🇦🇹", "🇯🇴", LocalDateTime.of(2026, 6, 29, 19, 0), "Toronto", 5),
                    p("J", "Argelia", "Argentina", "🇩🇿", "🇦🇷", LocalDateTime.of(2026, 6, 29, 19, 0), "Dallas", 6),

                    // ===== GRUPO K =====
                    p("K", "Portugal", "Congo DR", "🇵🇹", "🇨🇩", LocalDateTime.of(2026, 6, 17, 18, 0), "Kansas City", 1),
                    p("K", "Uzbekistán", "Colombia", "🇺🇿", "🇨🇴", LocalDateTime.of(2026, 6, 17, 21, 0), "Seattle", 2),
                    p("K", "Congo DR", "Uzbekistán", "🇨🇩", "🇺🇿", LocalDateTime.of(2026, 6, 23, 21, 0), "Vancouver", 3),
                    p("K", "Colombia", "Portugal", "🇨🇴", "🇵🇹", LocalDateTime.of(2026, 6, 24, 15, 0), "Houston", 4),
                    p("K", "Congo DR", "Colombia", "🇨🇩", "🇨🇴", LocalDateTime.of(2026, 6, 29, 19, 0), "Monterrey", 5),
                    p("K", "Uzbekistán", "Portugal", "🇺🇿", "🇵🇹", LocalDateTime.of(2026, 6, 29, 19, 0), "San Francisco", 6),

                    // ===== GRUPO L =====
                    p("L", "Inglaterra", "Croacia", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🇭🇷", LocalDateTime.of(2026, 6, 17, 15, 0), "Nueva York/NJ", 1),
                    p("L", "Ghana", "Panamá", "🇬🇭", "🇵🇦", LocalDateTime.of(2026, 6, 18, 12, 0), "Los Ángeles", 2),
                    p("L", "Croacia", "Ghana", "🇭🇷", "🇬🇭", LocalDateTime.of(2026, 6, 24, 12, 0), "Miami", 3),
                    p("L", "Panamá", "Inglaterra", "🇵🇦", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", LocalDateTime.of(2026, 6, 24, 21, 0), "Boston", 4),
                    p("L", "Croacia", "Panamá", "🇭🇷", "🇵🇦", LocalDateTime.of(2026, 6, 30, 19, 0), "Kansas City", 5),
                    p("L", "Ghana", "Inglaterra", "🇬🇭", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", LocalDateTime.of(2026, 6, 30, 19, 0), "Vancouver", 6)
                );

                partidoRepo.saveAll(partidos);
                System.out.println("✅ " + partidos.size() + " partidos de fase de grupos cargados");
            }
        };
    }

    private Partido p(String grupo, String local, String visitante,
                      String flagLocal, String flagVisitante,
                      LocalDateTime fecha, String sede, int orden) {
        Partido p = new Partido();
        p.setGrupo(grupo);
        p.setEquipoLocal(local);
        p.setEquipoVisitante(visitante);
        p.setBanderaLocal(flagLocal);
        p.setBanderaVisitante(flagVisitante);
        p.setFechaPartido(fecha);
        p.setSede(sede);
        p.setOrdenGrupo(orden);
        return p;
    }
}
