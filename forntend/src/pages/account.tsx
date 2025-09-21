import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import Head from 'next/head'
import Link from 'next/link'
import { authAPI } from '../lib/api'
import { RootState, AppDispatch, authActions } from '../lib/store'
import Header from '../components/Header'

const Account = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }

    if (user) {
      setFormData({
        user_name: user.user_name,
        user_email: user.user_email,
      })
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
  try {
    await authAPI.updateMe({
      user_name: formData.user_name,
      user_email: formData.user_email,
    })
    setIsEditing(false)
  } catch (error: any) {
    alert(error.response?.data?.error || 'Update failed')
  }
}

  const handleCancel = () => {
    if (user) {
      setFormData({
        user_name: user.user_name,
        user_email: user.user_email,
      })
    }
    setIsEditing(false)
  }

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>Account - Keep Notes</title>
        <meta name="description" content="Manage your Keep Notes account" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#f5f2e8' }}>
        <Header />
        
        <div className="px-4 py-8">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto">
            <div className="breadcrumb mb-8">
              <Link href="/">Homepage</Link> / Account
            </div>
          </div>

          {/* Account Content */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
                  
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                          {user.user_name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="user_email"
                          value={formData.user_email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                          {user.user_email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
                        {user.user_id}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Statistics */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Statistics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500">Total Notes</div>
                      <div className="text-2xl font-bold text-gray-900">--</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-500">Account Created</div>
                      <div className="text-2xl font-bold text-gray-900">--</div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Account