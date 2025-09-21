import { useState } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import Link from 'next/link'
import Head from 'next/head'
import { authActions, AppDispatch } from '../lib/store'
import { authAPI } from '../lib/api'
import Header from '../components/Header'

const SignUp = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_name || !formData.user_email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { confirmPassword, ...signUpData } = formData
      const response = await authAPI.signUp(signUpData)
      const { access_token, refresh_token, user } = response.data

      dispatch(authActions.setAuth({
        user,
        accessToken: access_token,
        refreshToken: refresh_token
      }))
      router.push('/')
    } catch (err: any) {
      const message = err.response?.data?.error || 'Sign up failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - Keep Notes</title>
        <meta name="description" content="Create your notes application account" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#f5f2e8' }}>
        <Header />
        
        <div className="px-4 py-8">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto">
            <div className="breadcrumb mb-8">
              <Link href="/">Homepage</Link> / Signup Page
            </div>
          </div>

          {/* Signup Form */}
          <div className="flex justify-center">
            <div className="form-window w-full max-w-md">
              {/* Window Header */}
              <div className="form-window-header">
                <span className="text-sm font-medium text-gray-700">Signup</span>
                <div className="form-window-buttons">
                  <div className="form-window-button btn-close"></div>
                  <div className="form-window-button btn-minimize"></div>
                  <div className="form-window-button btn-maximize"></div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Sign up</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Register'}
                    </button>
                    <Link
                      href="/signin"
                      className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded-md font-medium text-center transition-colors"
                    >
                      Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp