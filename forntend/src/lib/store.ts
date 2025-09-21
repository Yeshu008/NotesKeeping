import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export interface User {
  user_id: string
  user_name: string
  user_email: string
}

export interface Note {
  note_id: string
  note_title: string
  note_content: string
  last_update: string
  created_on: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

interface NotesState {
  notes: Note[]
  loading: boolean
  error: string | null
}


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
})


const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    loading: false,
    error: null,
  } as NotesState,
  reducers: {
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload)
    },
    updateNote: (state, action: PayloadAction<{ noteId: string; updatedNote: Partial<Note> }>) => {
      const { noteId, updatedNote } = action.payload
      const index = state.notes.findIndex(note => note.note_id === noteId)
      if (index !== -1) {
        state.notes[index] = { ...state.notes[index], ...updatedNote }
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(note => note.note_id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearNotes: (state) => {
      state.notes = []
      state.error = null
    },
  },
})

// Persist configuration for auth
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
}

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer)

// Configure store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notes: notesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Export actions
export const authActions = authSlice.actions
export const notesActions = notesSlice.actions

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch