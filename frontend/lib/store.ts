import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  user: string | null
  isAuthenticated: boolean
}
const initialUserState: UserState = { user: null, isAuthenticated: false }

const authSlice = createSlice({
  name: 'auth',
  initialState: initialUserState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

interface Note {
  id: string
  title: string
  content: string
}
const notesSlice = createSlice({
  name: 'notes',
  initialState: [] as Note[],
  reducers: {
    setNotes(state, action: PayloadAction<Note[]>) {
      return action.payload
    },
    addNote(state, action: PayloadAction<Note>) {
      state.push(action.payload)
    },
  },
})

export const { login, logout } = authSlice.actions
export const { setNotes, addNote } = notesSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    notes: notesSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch