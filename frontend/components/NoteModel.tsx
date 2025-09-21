import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { marked } from "marked";
import { Note } from '../lib/store'
import { notesAPI } from '../lib/api'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  note?: Note | null
  onNoteCreated: () => void
  onNoteUpdated: () => void
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  note,
  onNoteCreated,
  onNoteUpdated,
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = Boolean(note)

  useEffect(() => {
    if (note) {
      setTitle(note.note_title)
      setContent(note.note_content)
    } else {
      setTitle('')
      setContent('')
    }
    setError('')
  }, [note, isOpen])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your note')
      return
    }

    setSaving(true)
    setError('')

    try {
      const noteData = {
        note_title: title.trim(),
        note_content: content,
      }

      if (isEditing && note) {
        await notesAPI.updateNote(note.note_id, noteData)
        onNoteUpdated()
      } else {
        await notesAPI.createNote(noteData)
        onNoteCreated()
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to save note'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black bg-opacity-30 transition-opacity z-40"
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="inline-block align-bottom text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50 relative"
            >
              <div className="form-window">
                {/* Window Header */}
                <div className="form-window-header">
                  <span className="text-sm font-medium text-gray-700">
                    {isEditing ? 'Edit Note' : 'Add Notes'}
                  </span>
                  <div className="flex items-center space-x-4">
                    <div className="form-window-buttons">
                      <div className="form-window-button btn-close"></div>
                      <div className="form-window-button btn-minimize"></div>
                      <div className="form-window-button btn-maximize"></div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      disabled={loading}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors ml-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Title Input */}
                    <div>
                      <input
                        id="note-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <div className="border border-gray-300 rounded-md">
                        <div className="border-b border-gray-200 p-2 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            {showPreview ? 'Edit' : 'Preview'}
                          </button>
                        </div>
                        {showPreview ? (
                          <div className="p-3 h-[300px] overflow-y-auto prose prose-sm max-w-none bg-white">
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                          </div>
                        ) : (
                          <textarea
                            id="note-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-[300px] p-3 border-0 resize-none focus:outline-none rounded-b-md"
                            placeholder="Hello World"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 rounded-md bg-red-50 p-4"
                    >
                      <div className="text-sm text-red-700">{error}</div>
                    </motion.div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end space-x-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Add'
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NoteModal