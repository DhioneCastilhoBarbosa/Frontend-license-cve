import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api-licenca.intelbras-cve-pro.com.br', // Substitua pela URL da sua API
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api