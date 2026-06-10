# ⚽ Quiniela Quevaber Mundial 2026

## Stack
- **Backend:** Spring Boot 3 + Java 17 + MySQL
- **Frontend:** React + Vite
- **Despliegue:** Render.com (gratis) + ngrok para MySQL local

---

## 🚀 Paso 1 — Preparar MySQL local

1. Asegúrate de que MySQL esté corriendo en tu máquina local
2. Crea la base de datos (el app la crea automáticamente, pero por si acaso):
```sql
CREATE DATABASE IF NOT EXISTS quiniela_db;
```
3. Actualiza las credenciales en `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_MYSQL_AQUI
```

---

## 🌐 Paso 2 — Exponer MySQL con ngrok

ngrok permite que Render.com se conecte a tu MySQL local.

1. Descarga ngrok gratis: https://ngrok.com/download
2. Crea cuenta gratuita y obtén tu authtoken
3. Configura:
```bash
ngrok config add-authtoken TU_TOKEN_AQUI
```
4. Expón el puerto de MySQL:
```bash
ngrok tcp 3306
```
5. Ngrok te dará una URL como: `tcp://0.tcp.ngrok.io:12345`
   - Host: `0.tcp.ngrok.io`
   - Puerto: `12345`

6. Actualiza `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://0.tcp.ngrok.io:12345/quiniela_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=America/Mexico_City&allowPublicKeyRetrieval=true
```

⚠️ **Importante:** El URL de ngrok cambia cada vez que lo reinicias.
En la cuenta gratuita, considera usar un dominio TCP reservado (plan gratis lo permite).

---

## ☁️ Paso 3 — Desplegar Backend en Render.com

1. Sube el proyecto a GitHub (solo la carpeta `backend/`)
2. Ve a https://render.com → New → Web Service
3. Conecta tu repositorio
4. Configura:
   - **Name:** quiniela-quevaber-backend
   - **Runtime:** Java
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/quiniela-1.0.0.jar`
5. En **Environment Variables**, agrega:
   ```
   SPRING_DATASOURCE_URL = jdbc:mysql://0.tcp.ngrok.io:TU_PUERTO/quiniela_db?...
   SPRING_DATASOURCE_USERNAME = root
   SPRING_DATASOURCE_PASSWORD = TU_PASSWORD
   APP_CORS_ALLOWED_ORIGINS = https://quiniela-quevaber.onrender.com
   ```
6. Click **Create Web Service**
7. Render te dará una URL como: `https://quiniela-quevaber-backend.onrender.com`

---

## 🎨 Paso 4 — Desplegar Frontend en Render.com

1. Sube la carpeta `frontend/` a GitHub (puede ser el mismo repo)
2. Ve a Render → New → **Static Site**
3. Configura:
   - **Name:** quiniela-quevaber
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. En **Environment Variables**:
   ```
   VITE_API_URL = https://quiniela-quevaber-backend.onrender.com/api
   ```
5. Render te dará la URL final: `https://quiniela-quevaber.onrender.com`

---

## 💻 Paso 5 — Desarrollo local (opcional)

### Backend
```bash
cd backend
mvn spring-boot:run
# Corre en http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
# El proxy de Vite redirige /api → localhost:8080
```

---

## 🔑 Credenciales por defecto

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin | admin | l33tsupah4x0r |
| Participantes | Su nombre | (sin contraseña) |

**Importante:** Cambia la contraseña del admin antes de compartir la URL.
En `DataInitializer.java`, línea: `admin.setPasswordHash(encoder.encode("TU_NUEVA_PASSWORD"));`

---

## 📋 Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/acceso` | Acceso usuario normal |
| POST | `/api/auth/admin/login` | Login administrador |
| GET | `/api/partidos` | Lista partidos + pronósticos del usuario |
| POST | `/api/pronosticos/guardar` | Guardar pronósticos |
| GET | `/api/pronosticos/mios` | Ver mis pronósticos |
| GET | `/api/pronosticos/estado-cierre` | ¿Está cerrada la quiniela? |
| GET | `/api/pronosticos/admin/todos` | Panel admin (solo admin) |

---

## ⏰ Cierre automático

La quiniela cierra automáticamente el **11 de junio de 2026 a las 10:00 AM hora México**.
Configurado en `application.properties`:
```properties
app.quiniela.cierre=2026-06-11T16:00:00Z
```
(16:00 UTC = 10:00 AM CDT México)

---

## 🆓 Costos

| Servicio | Plan | Costo |
|----------|------|-------|
| Render Backend | Free | $0 |
| Render Frontend | Free | $0 |
| ngrok TCP | Free | $0 |
| MySQL | Tu máquina local | $0 |
| **Total** | | **$0** |

⚠️ El plan gratuito de Render "duerme" el backend después de 15 min de inactividad.
El primer request tarda ~30 segundos en despertar. Es normal.

---

## 📱 Compartir con amigos

Una vez desplegado, comparte simplemente:
```
https://quiniela-quevaber.onrender.com
```
¡Pueden acceder desde cualquier dispositivo con su nombre!
