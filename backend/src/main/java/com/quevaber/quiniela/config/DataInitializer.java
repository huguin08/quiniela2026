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

                    // ===== 11 de Junio =====
                    p("A", "México",        "Sudáfrica",          "🇲🇽","🇿🇦", LocalDateTime.of(2026,6,11,14,0),  "Ciudad de México", 1),
                    p("A", "Corea del Sur", "Chequia",            "🇰🇷","🇨🇿", LocalDateTime.of(2026,6,11,21,0),  "Guadalajara",      2),

                    // ===== 12 de Junio =====
                    p("B", "Canadá",        "Bosnia y Herz.",     "🇨🇦","🇧🇦", LocalDateTime.of(2026,6,12,14,0),  "Toronto",          1),
                    p("D", "Estados Unidos","Paraguay",           "🇺🇸","🇵🇾", LocalDateTime.of(2026,6,12,20,0),  "Los Ángeles",      1),

                    // ===== 13 de Junio =====
                    p("B", "Qatar",         "Suiza",              "🇶🇦","🇨🇭", LocalDateTime.of(2026,6,13,14,0),  "San Francisco",    2),
                    p("C", "Brasil",        "Marruecos",          "🇧🇷","🇲🇦", LocalDateTime.of(2026,6,13,17,0),  "Nueva York/NJ",    1),
                    p("C", "Haití",         "Escocia",            "🇭🇹","🏴󠁧󠁢󠁳󠁣󠁴󠁿", LocalDateTime.of(2026,6,13,20,0),  "Boston",           2),
                    p("D", "Australia",     "Turquía",            "🇦🇺","🇹🇷", LocalDateTime.of(2026,6,13,23,0),  "Vancouver",        2),

                    // ===== 14 de Junio =====
                    p("E", "Alemania",      "Curazao",            "🇩🇪","🇨🇼", LocalDateTime.of(2026,6,14,12,0),  "Houston",          1),
                    p("F", "Países Bajos",  "Japón",              "🇳🇱","🇯🇵", LocalDateTime.of(2026,6,14,15,0),  "Dallas",           1),
                    p("E", "Costa de Marfil","Ecuador",           "🇨🇮","🇪🇨", LocalDateTime.of(2026,6,14,18,0),  "Filadelfia",       2),
                    p("F", "Túnez",         "Suecia",             "🇹🇳","🇸🇪", LocalDateTime.of(2026,6,14,21,0),  "Monterrey",        2),

                    // ===== 15 de Junio =====
                    p("H", "España",        "Cabo Verde",         "🇪🇸","🇨🇻", LocalDateTime.of(2026,6,15,11,0),  "Atlanta",          1),
                    p("G", "Bélgica",       "Egipto",             "🇧🇪","🇪🇬", LocalDateTime.of(2026,6,15,14,0),  "Seattle",          1),
                    p("H", "Arabia Saudí",  "Uruguay",            "🇸🇦","🇺🇾", LocalDateTime.of(2026,6,15,17,0),  "Miami",            2),
                    p("G", "Irán",          "Nueva Zelanda",      "🇮🇷","🇳🇿", LocalDateTime.of(2026,6,15,20,0),  "Los Ángeles",      2),

                    // ===== 16 de Junio =====
                    p("I", "Francia",       "Senegal",            "🇫🇷","🇸🇳", LocalDateTime.of(2026,6,16,14,0),  "Nueva York/NJ",    1),
                    p("I", "Irak",          "Noruega",            "🇮🇶","🇳🇴", LocalDateTime.of(2026,6,16,17,0),  "Boston",           2),
                    p("J", "Argentina",     "Argelia",            "🇦🇷","🇩🇿", LocalDateTime.of(2026,6,16,20,0),  "Kansas City",      1),
                    p("J", "Austria",       "Jordania",           "🇦🇹","🇯🇴", LocalDateTime.of(2026,6,16,23,0),  "San Francisco",    2),

                    // ===== 17 de Junio =====
                    p("K", "Portugal",      "Congo DR",           "🇵🇹","🇨🇩", LocalDateTime.of(2026,6,17,12,0),  "Houston",          1),
                    p("L", "Inglaterra",    "Croacia",            "🏴󠁧󠁢󠁥󠁮󠁧󠁿","🇭🇷", LocalDateTime.of(2026,6,17,15,0),  "Dallas",           1),
                    p("L", "Ghana",         "Panamá",             "🇬🇭","🇵🇦", LocalDateTime.of(2026,6,17,18,0),  "Toronto",          2),
                    p("K", "Uzbekistán",    "Colombia",           "🇺🇿","🇨🇴", LocalDateTime.of(2026,6,17,21,0),  "Ciudad de México", 2),

                    // ===== 18 de Junio =====
                    p("A", "Chequia",       "Sudáfrica",          "🇨🇿","🇿🇦", LocalDateTime.of(2026,6,18,11,0),  "Atlanta",          3),
                    p("B", "Suiza",         "Bosnia y Herz.",     "🇨🇭","🇧🇦", LocalDateTime.of(2026,6,18,14,0),  "Los Ángeles",      3),
                    p("B", "Canadá",        "Qatar",              "🇨🇦","🇶🇦", LocalDateTime.of(2026,6,18,17,0),  "Vancouver",        4),
                    p("A", "México",        "Corea del Sur",      "🇲🇽","🇰🇷", LocalDateTime.of(2026,6,18,20,0),  "Guadalajara",      4),

                    // ===== 19 de Junio =====
                    p("D", "Estados Unidos","Australia",          "🇺🇸","🇦🇺", LocalDateTime.of(2026,6,19,14,0),  "Seattle",          3),
                    p("C", "Escocia",       "Marruecos",          "🏴󠁧󠁢󠁳󠁣󠁴󠁿","🇲🇦", LocalDateTime.of(2026,6,19,14,0),  "Boston",           3),
                    p("C", "Brasil",        "Haití",              "🇧🇷","🇭🇹", LocalDateTime.of(2026,6,19,17,0),  "Houston",          4),
                    p("D", "Turquía",       "Paraguay",           "🇹🇷","🇵🇾", LocalDateTime.of(2026,6,19,20,0),  "Kansas City",      4),

                    // ===== 20 de Junio =====
                    p("E", "Ecuador",       "Alemania",           "🇪🇨","🇩🇪", LocalDateTime.of(2026,6,20,14,0),  "Miami",            3),
                    p("F", "Japón",         "Suecia",             "🇯🇵","🇸🇪", LocalDateTime.of(2026,6,20,14,0),  "Seattle",          3),
                    p("E", "Curazao",       "Costa de Marfil",    "🇨🇼","🇨🇮", LocalDateTime.of(2026,6,20,17,0),  "Dallas",           4),
                    p("F", "Países Bajos",  "Túnez",              "🇳🇱","🇹🇳", LocalDateTime.of(2026,6,20,20,0),  "Boston",           4),

                    // ===== 21 de Junio =====
                    p("H", "España",        "Arabia Saudí",       "🇪🇸","🇸🇦", LocalDateTime.of(2026,6,21,11,0),  "Atlanta",          3),
                    p("G", "Bélgica",       "Irán",               "🇧🇪","🇮🇷", LocalDateTime.of(2026,6,21,14,0),  "Los Ángeles",      3),
                    p("H", "Cabo Verde",    "Uruguay",            "🇨🇻","🇺🇾", LocalDateTime.of(2026,6,21,17,0),  "Guadalajara",      4),
                    p("G", "Egipto",        "Nueva Zelanda",      "🇪🇬","🇳🇿", LocalDateTime.of(2026,6,21,20,0),  "Toronto",          4),

                    // ===== 22 de Junio =====
                    p("I", "Senegal",       "Irak",               "🇸🇳","🇮🇶", LocalDateTime.of(2026,6,22,14,0),  "Houston",          3),
                    p("J", "Argentina",     "Austria",            "🇦🇷","🇦🇹", LocalDateTime.of(2026,6,22,14,0),  "Los Ángeles",      3),
                    p("I", "Francia",       "Noruega",            "🇫🇷","🇳🇴", LocalDateTime.of(2026,6,22,17,0),  "San Francisco",    4),
                    p("J", "Argelia",       "Jordania",           "🇩🇿","🇯🇴", LocalDateTime.of(2026,6,22,20,0),  "Filadelfia",       4),

                    // ===== 23 de Junio =====
                    p("K", "Congo DR",      "Uzbekistán",         "🇨🇩","🇺🇿", LocalDateTime.of(2026,6,23,14,0),  "Vancouver",        3),
                    p("L", "Croacia",       "Ghana",              "🇭🇷","🇬🇭", LocalDateTime.of(2026,6,23,14,0),  "Miami",            3),
                    p("K", "Portugal",      "Colombia",           "🇵🇹","🇨🇴", LocalDateTime.of(2026,6,23,17,0),  "Houston",          4),
                    p("L", "Panamá",        "Inglaterra",         "🇵🇦","🏴󠁧󠁢󠁥󠁮󠁧󠁿", LocalDateTime.of(2026,6,23,20,0),  "Boston",           4),

                    // ===== 24 de Junio =====
                    p("A", "México",        "Chequia",            "🇲🇽","🇨🇿", LocalDateTime.of(2026,6,24,16,0),  "Ciudad de México", 5),
                    p("A", "Sudáfrica",     "Corea del Sur",      "🇿🇦","🇰🇷", LocalDateTime.of(2026,6,24,16,0),  "Monterrey",        6),

                    // ===== 25 de Junio =====
                    p("B", "Bosnia y Herz.","Suiza",              "🇧🇦","🇨🇭", LocalDateTime.of(2026,6,25,16,0),  "Kansas City",      5),
                    p("B", "Qatar",         "Canadá",             "🇶🇦","🇨🇦", LocalDateTime.of(2026,6,25,16,0),  "Houston",          6),

                    // ===== 26 de Junio =====
                    p("C", "Marruecos",     "Escocia",            "🇲🇦","🏴󠁧󠁢󠁳󠁣󠁴󠁿", LocalDateTime.of(2026,6,26,16,0),  "Atlanta",          5),
                    p("C", "Haití",         "Brasil",             "🇭🇹","🇧🇷", LocalDateTime.of(2026,6,26,16,0),  "Boston",           6),

                    // ===== 27 de Junio =====
                    p("D", "Turquía",       "Estados Unidos",     "🇹🇷","🇺🇸", LocalDateTime.of(2026,6,27,16,0),  "Los Ángeles",      5),
                    p("D", "Paraguay",      "Australia",          "🇵🇾","🇦🇺", LocalDateTime.of(2026,6,27,16,0),  "Dallas",           6),
                    p("E", "Ecuador",       "Curazao",            "🇪🇨","🇨🇼", LocalDateTime.of(2026,6,27,19,30), "Houston",          5),
                    p("E", "Costa de Marfil","Alemania",          "🇨🇮","🇩🇪", LocalDateTime.of(2026,6,27,19,30), "Kansas City",      6),
                    p("F", "Japón",         "Túnez",              "🇯🇵","🇹🇳", LocalDateTime.of(2026,6,27,22,0),  "San Francisco",    5),
                    p("F", "Suecia",        "Países Bajos",       "🇸🇪","🇳🇱", LocalDateTime.of(2026,6,27,22,0),  "Seattle",          6),
                    p("G", "Irán",          "Nueva Zelanda",      "🇮🇷","🇳🇿", LocalDateTime.of(2026,6,27,16,0),  "Los Ángeles",      5),
                    p("G", "Egipto",        "Bélgica",            "🇪🇬","🇧🇪", LocalDateTime.of(2026,6,27,16,0),  "Filadelfia",       6),
                    p("H", "Cabo Verde",    "Uruguay",            "🇨🇻","🇺🇾", LocalDateTime.of(2026,6,28,16,0),  "Miami",            5),
                    p("H", "Arabia Saudí",  "España",             "🇸🇦","🇪🇸", LocalDateTime.of(2026,6,28,16,0),  "Nueva York/NJ",    6),
                    p("I", "Senegal",       "Noruega",            "🇸🇳","🇳🇴", LocalDateTime.of(2026,6,28,19,30), "Atlanta",          5),
                    p("I", "Irak",          "Francia",            "🇮🇶","🇫🇷", LocalDateTime.of(2026,6,28,19,30), "San Francisco",    6),
                    p("J", "Austria",       "Jordania",           "🇦🇹","🇯🇴", LocalDateTime.of(2026,6,29,16,0),  "Toronto",          5),
                    p("J", "Argelia",       "Argentina",          "🇩🇿","🇦🇷", LocalDateTime.of(2026,6,29,16,0),  "Dallas",           6),
                    p("K", "Congo DR",      "Colombia",           "🇨🇩","🇨🇴", LocalDateTime.of(2026,6,29,19,30), "Monterrey",        5),
                    p("K", "Uzbekistán",    "Portugal",           "🇺🇿","🇵🇹", LocalDateTime.of(2026,6,29,19,30), "San Francisco",    6),
                    p("L", "Croacia",       "Panamá",             "🇭🇷","🇵🇦", LocalDateTime.of(2026,6,30,16,0),  "Kansas City",      5),
                    p("L", "Ghana",         "Inglaterra",         "🇬🇭","🏴󠁧󠁢󠁥󠁮󠁧󠁿", LocalDateTime.of(2026,6,30,16,0),  "Vancouver",        6)
                );

                partidoRepo.saveAll(partidos);
                System.out.println("✅ " + partidos.size() + " partidos cargados correctamente");
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
