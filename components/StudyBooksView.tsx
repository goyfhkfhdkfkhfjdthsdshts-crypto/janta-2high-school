'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Book, SchoolClass, UserProfile } from '@/lib/types';
import {
  BookOpen,
  Download,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  FileText,
  X,
  Lock,
} from 'lucide-react';

interface StudyBooksViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function StudyBooksView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: StudyBooksViewProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  // Admin Add Book Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newMedium, setNewMedium] = useState<'Hindi' | 'English'>('Hindi');
  const [newFileUrl, setNewFileUrl] = useState('');

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/data/books?class=${selectedClass}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setBooks(data.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedClass]);

  const uniqueSubjects = ['All', ...Array.from(new Set(books.map((b) => b.subject)))];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || b.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    try {
      await fetch('/api/data/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subject: newSubject,
          class: selectedClass,
          medium: newMedium,
          fileUrl: newFileUrl || 'https://ncert.nic.in/textbook.php',
          fileSize: '4.5 MB',
        }),
      });

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewFileUrl('');
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert('Error saving book.');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this book from the library?')) return;
    try {
      await fetch(`/api/data/books?id=${id}`, { method: 'DELETE' });
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SchoolLogo size={46} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                NCERT / JCERT Study Books
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Official Textbooks, Chapter PDFs & Reading Material
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Book</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Upload</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search textbook title, author, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
          />
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {uniqueSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {book.subject}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {book.medium || 'Hindi / English'} Medium
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                {book.title}
              </h3>
              <p className="text-[11px] text-slate-500">
                Class {book.class} • JCERT / NCERT Curriculum
              </p>
            </div>

            {/* Actions: Read In-App / Open Link / Download */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setReadingBook(book)}
                className="flex-1 py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Online</span>
              </button>

              <a
                href={book.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                title="Download / Open PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              {isAdmin && (
                <button
                  onClick={() => handleDeleteBook(book.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs transition-colors"
                  title="Delete Book"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* In-App Reader Modal */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh]">
            <div className="bg-blue-900 px-5 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm font-bold truncate max-w-sm">{readingBook.title}</h3>
                  <p className="text-[10px] text-blue-200">
                    Class {readingBook.class} • {readingBook.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReadingBook(null)}
                className="p-1 rounded-full text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reader Content Preview */}
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900">{readingBook.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Jharkhand Academic Council (JAC) Textbook Portal
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <p>
                    <strong>Subject Overview:</strong> This standard textbook is designed as per the revised syllabus by NCERT/JCERT for Class {readingBook.class}.
                  </p>
                  <p>
                    Students can study all chapters, solved numericals, exercises, and high-weightage topics directly through this digital portal.
                  </p>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 space-y-2">
                    <p className="font-bold">Official Document Links:</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={readingBook.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Official NCERT/JCERT E-Book
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setReadingBook(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Add Textbook / Study Material
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mathematics - Class 10 NCERT"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medium
                  </label>
                  <select
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Hindi">Hindi Medium</option>
                    <option value="English">English Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document / PDF Link
                </label>
                <input
                  type="url"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  placeholder="https://ncert.nic.in/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
