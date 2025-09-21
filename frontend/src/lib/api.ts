import axios, { AxiosResponse } from 'axios'
import { store } from './store'
import { authActions } from './store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const state = store.getState()
        const refreshToken = state.auth.refreshToken
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          )

          const { access_token } = response.data
          store.dispatch(authActions.updateAccessToken(access_token))

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh token is invalid, clear auth
        store.dispatch(authActions.clearAuth())
        window.location.href = '/signin'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  signUp: async (userData: {
    user_name: string
    user_email: string
    password: string
  }): Promise<AxiosResponse> => {
    return api.post('/auth/signup', userData)
  },

  signIn: async (credentials: {
    user_email: string
    password: string
  }): Promise<AxiosResponse> => {
    return api.post('/auth/signin', credentials)
  },

  updateMe: async (userData: {
    user_name?: string
    user_email?: string
  }): Promise<AxiosResponse> => {
    return api.put('/auth/me', userData)
  },


  refreshToken: async (): Promise<AxiosResponse> => {
    const state = store.getState()
    const refreshToken = state.auth.refreshToken
    return axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    )
  },

  logout: async (): Promise<AxiosResponse> => {
    return api.post('/auth/logout')
  },
}

export const notesAPI = {
  getNotes: async (): Promise<AxiosResponse> => {
    return api.get('/notes')
  },

  getNote: async (noteId: string): Promise<AxiosResponse> => {
    return api.get(`/notes/${noteId}`)
  },

  createNote: async (noteData: {
    note_title: string
    note_content: string
  }): Promise<AxiosResponse> => {
    return api.post('/notes', noteData)
  },

  updateNote: async (
    noteId: string,
    noteData: {
      note_title?: string
      note_content?: string
    }
  ): Promise<AxiosResponse> => {
    return api.put(`/notes/${noteId}`, noteData)
  },

  deleteNote: async (noteId: string): Promise<AxiosResponse> => {
    return api.delete(`/notes/${noteId}`)
  },
}

export default api