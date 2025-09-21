import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'

const About = () => {
  return (
    <>
      <Head>
        <title>About - Keep Notes</title>
        <meta name="description" content="About Keep Notes application" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#f5f2e8' }}>
        <Header />
        
        <div className="px-4 py-8">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto">
            <div className="breadcrumb mb-8">
              <Link href="/">Homepage</Link> / About
            </div>
          </div>

          {/* About Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">About Keep Notes</h1>
              
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-600 mb-6">
                  Keep Notes is a simple and elegant note-taking application designed to help you organize your thoughts, ideas, and important information in one secure place.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
                <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
                  <li>Create and edit notes with rich text formatting</li>
                  <li>Search through your notes quickly and efficiently</li>
                  <li>Secure user authentication and data protection</li>
                  <li>Clean, intuitive user interface</li>
                  <li>Responsive design that works on all devices</li>
                  <li>Real-time preview for markdown content</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-4">
                  To get started with Keep Notes:
                </p>
                <ol className="list-decimal pl-6 mb-6 text-gray-600 space-y-2">
                  <li>Create an account or sign in if you already have one</li>
                  <li>Click the "New Note" button or the floating add button</li>
                  <li>Give your note a title and start writing</li>
                  <li>Use the preview feature to see how your markdown will look</li>
                  <li>Save your note and access it anytime from your dashboard</li>
                </ol>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Privacy & Security</h2>
                <p className="text-gray-600 mb-6">
                  Your privacy is important to us. All your notes are securely stored and encrypted. 
                  We never share your personal information or note content with third parties. 
                  Your data belongs to you, and you have full control over it.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
                  <p className="text-gray-600">
                    If you have any questions or need assistance, feel free to reach out to our support team. 
                    We're here to help you make the most of Keep Notes!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About