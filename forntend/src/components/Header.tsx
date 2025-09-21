import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import { RootState, AppDispatch, authActions, notesActions } from '../lib/store'
import { authAPI } from '../lib/api'

const Header = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      dispatch(authActions.clearAuth())
      dispatch(notesActions.clearNotes())
      router.push('/signin')
    }
  }

  const isLoginPage = router.pathname === '/signin'
  const isSignupPage = router.pathname === '/signup'
  const showLogin = isLoginPage || isSignupPage || !isAuthenticated

  return (
    <header className="bg-teal-400 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href={isAuthenticated ? "/" : "/signin"} className="text-gray-800 font-medium text-lg">
          Keep Notes
        </Link>
        
        <nav className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/about" className="text-gray-800 hover:text-gray-600 transition-colors">
                About
              </Link>
              <Link href="/" className="text-gray-800 hover:text-gray-600 transition-colors">
                Notes
              </Link>
              <Link href="/account" className="text-gray-800 hover:text-gray-600 transition-colors">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-800 hover:text-gray-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/about" className="text-gray-800 hover:text-gray-600 transition-colors">
                About
              </Link>
              <span className="text-gray-800">Notes</span>
              <span className="text-gray-800">Account</span>
              {showLogin && (
                <Link href="/signin" className="text-gray-800 hover:text-gray-600 transition-colors">
                  Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header