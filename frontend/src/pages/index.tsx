import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RootState, AppDispatch, authActions, notesActions, Note } from '../lib/store'
import { notesAPI, authAPI } from '../lib/api'
import NoteCard from '../components/NoteCard'
import NoteModal from '../components/NoteModal'
import Header from '../components/Header'

const Home = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { notes, loading, error } = useSelector((state: RootState) => state.notes)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin')
      return
    }

    fetchNotes()
  }, [isAuthenticated, router])

  const fetchNotes = async () => {
    dispatch(notesActions.setLoading(true))
    dispatch(notesActions.setError(null))

    try {
      const response = await notesAPI.getNotes()
      dispatch(notesActions.setNotes(response.data.notes))
    } catch (err: any) {
      if (err.response?.status === 401) {
        dispatch(authActions.clearAuth())
        router.push('/signin')
      } else {
        dispatch(notesActions.setError('Failed to fetch notes'))
      }
    } finally {
      dispatch(notesActions.setLoading(false))
    }
  }

  const handleCreateNote = () => {
    setSelectedNote(null)
    setIsModalOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedNote(null)
  }

  const handleNoteCreated = () => {
    fetchNotes()
    handleCloseModal()
  }

  const handleNoteUpdated = () => {
    fetchNotes()
    handleCloseModal()
  }

  const handleNoteDeleted = () => {
    fetchNotes()
  }

  const filteredNotes = notes.filter(note =>
    note.note_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.note_content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <title>My Notes - Keep Notes</title>
        <meta name="description" content="Manage and organize your personal notes" />
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: '#f5f2e8' }}>
        <Header />
        
        <div className="px-4 py-8">
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto">
            <div className="breadcrumb mb-8">
              <Link href="/">Homepage</Link> / Your Notes
            </div>
          </div>

          {/* Welcome Message */}
          <div className="max-w-7xl mx-auto mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Good Morning {user?.user_name}!
            </h1>

            {/* Add Note Button */}
            <button
              onClick={handleCreateNote}
              className="fixed bottom-6 right-6 w-12 h-12 bg-orange-400 hover:bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
              title="Add Note"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto">
            {/* Search Bar */}
            {notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-12"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                <span className="ml-3 text-gray-600">Loading notes...</span>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
              >
                <div className="text-red-700">{error}</div>
              </motion.div>
            )}

            {/* Notes Grid */}
            {!loading && (
              <>
                {filteredNotes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-12"
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating a new note.'}
                    </p>
                    {!searchQuery && (
                      <div className="mt-6">
                        <button
                          onClick={handleCreateNote}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create your first note
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    <AnimatePresence>
                      {filteredNotes.map((note, index) => (
                        <motion.div
                          key={note.note_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <NoteCard
                            note={note}
                            onEdit={handleEditNote}
                            onDelete={handleNoteDeleted}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </>
            )}
          </main>

          {/* Note Modal */}
          <NoteModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            note={selectedNote}
            onNoteCreated={handleNoteCreated}
            onNoteUpdated={handleNoteUpdated}
          />
        </div>
      </div>
    </>
  )
}

export default Home