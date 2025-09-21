import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../lib/store'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>Keep Notes</title>
        <meta name="description" content="Keep Notes - Your personal note-taking app" />
      </Head>
      <Provider store={store}>
        <PersistGate 
          loading={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f2e8' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          } 
          persistor={persistor}
        >
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    </>
  )
}

export default MyApp