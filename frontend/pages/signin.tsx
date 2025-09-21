import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../lib/store'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const dispatch = useDispatch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(login(username))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Sign In</h2>
        <input
          className="border p-2 w-full mb-4"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full" type="submit">
          Sign In
        </button>
      </form>
    </div>
  )
}