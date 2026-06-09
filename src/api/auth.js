import request from './request'
import { mockLogin } from './mock/user'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

export const login = (username, password) => {
  return request.post('/auth/login', { username, password })
}

export const register = (username, password, department) => {
  return request.post('/auth/register', { username, password, department })
}