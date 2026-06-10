import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL })

// Inyectar token JWT en cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expiró, limpiar sesión
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  adminLogin: (nombre, password) =>
    api.post('/auth/admin/login', { nombre, password }),
  acceso: (nombre) =>
    api.post('/auth/acceso', { nombre }),
}

export const quinielaApi = {
  getPartidos: () => api.get('/partidos'),
  getMisPronosticos: () => api.get('/pronosticos/mios'),
  guardar: (pronosticos) => api.post('/pronosticos/guardar', { pronosticos }),
  estadoCierre: () => api.get('/pronosticos/estado-cierre'),
  adminTodos: () => api.get('/pronosticos/admin/todos'),
}

export default api
