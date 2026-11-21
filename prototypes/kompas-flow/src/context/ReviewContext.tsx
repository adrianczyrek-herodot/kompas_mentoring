import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { Comment, ScreenId, ReviewState } from '../utils/types';

const PROTOTYPE_ID = 'kompas-flow';

interface ReviewContextValue extends ReviewState {
  addComment: (screenId: ScreenId, author: string, text: string) => void;
  resolveComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveComment: (id: string | null) => void;
  getCommentsForScreen: (screenId: ScreenId) => Comment[];
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>(() => {
    // Load from localStorage if available
    try {
      const stored = localStorage.getItem(`${PROTOTYPE_ID}-comments`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCommentId, setActiveComment] = useState<string | null>(null);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(`${PROTOTYPE_ID}-comments`, JSON.stringify(comments));
    } catch {}
  }, [comments]);

  const addComment = useCallback((screenId: ScreenId, author: string, text: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      prototypeId: PROTOTYPE_ID,
      screenId,
      author,
      text,
      createdAt: new Date(),
      resolved: false,
    };
    setComments(prev => [...prev, newComment]);
    setSidebarOpen(true);
  }, []);

  const resolveComment = useCallback((commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const getCommentsForScreen = useCallback((screenId: ScreenId) => {
    return comments.filter(c => c.screenId === screenId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [comments]);

  const value = useMemo<ReviewContextValue>(() => ({
    comments,
    sidebarOpen,
    activeCommentId,
    addComment,
    resolveComment,
    deleteComment,
    setSidebarOpen,
    setActiveComment,
    getCommentsForScreen,
  }), [comments, sidebarOpen, activeCommentId, addComment, resolveComment, deleteComment, getCommentsForScreen]);

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReview must be used within ReviewProvider');
  return context;
}