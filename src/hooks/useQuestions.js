import { useState, useEffect } from 'react';
import { storage, KEYS } from '../lib/storage';

export function useQuestions() {
  const [questions, setQuestions] = useState([]);

  // Load questions from localStorage on mount
  useEffect(() => {
    const savedQuestions = storage.get(KEYS.QUESTIONS, []);
    setQuestions(savedQuestions);
  }, []);

  // Save questions to localStorage whenever they change
  const saveQuestions = (updatedQuestions) => {
    setQuestions(updatedQuestions);
    storage.set(KEYS.QUESTIONS, updatedQuestions);
  };

  const addQuestion = (questionData) => {
    const newQuestion = {
      id: Date.now().toString(),
      text: questionData.text || '',
      phase: questionData.phase || 'connection',
      problemLevel: questionData.problemLevel || null, // 1-4 or null
      category: questionData.category || 'discovery', // opening, discovery, follow-up, closing
      avatarIds: questionData.avatarIds || [], // Array of avatar IDs this question applies to
      tags: questionData.tags || [],
      notes: questionData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: null
    };

    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
    return newQuestion;
  };

  const updateQuestion = (questionId, updates) => {
    const updatedQuestions = questions.map(question =>
      question.id === questionId
        ? {
            ...question,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : question
    );
    saveQuestions(updatedQuestions);
  };

  const deleteQuestion = (questionId) => {
    const updatedQuestions = questions.filter(question => question.id !== questionId);
    saveQuestions(updatedQuestions);
  };

  const markQuestionUsed = (questionId) => {
    const updatedQuestions = questions.map(question =>
      question.id === questionId
        ? {
            ...question,
            usageCount: (question.usageCount || 0) + 1,
            lastUsed: new Date().toISOString()
          }
        : question
    );
    saveQuestions(updatedQuestions);
  };

  const getQuestionsByPhase = (phase) => {
    return questions.filter(question => question.phase === phase);
  };

  const getQuestionsByProblemLevel = (level) => {
    return questions.filter(question => question.problemLevel === level);
  };

  const getQuestionsByAvatar = (avatarId) => {
    return questions.filter(question =>
      question.avatarIds.length === 0 || question.avatarIds.includes(avatarId)
    );
  };

  const getContextualQuestions = (phase, avatarId = null, problemLevel = null) => {
    let filteredQuestions = questions.filter(q => q.phase === phase);

    // Filter by avatar if provided
    if (avatarId) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.avatarIds.length === 0 || q.avatarIds.includes(avatarId)
      );
    }

    // Filter by problem level if provided
    if (problemLevel) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.problemLevel === null || q.problemLevel === problemLevel
      );
    }

    return filteredQuestions;
  };

  const bulkImportQuestions = (questionsArray) => {
    const newQuestions = questionsArray.map(q => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: q.text || '',
      phase: q.phase || 'connection',
      problemLevel: q.problemLevel || null,
      category: q.category || 'discovery',
      avatarIds: q.avatarIds || [],
      tags: q.tags || [],
      notes: q.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: null
    }));

    const updatedQuestions = [...questions, ...newQuestions];
    saveQuestions(updatedQuestions);
    return newQuestions;
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    markQuestionUsed,
    getQuestionsByPhase,
    getQuestionsByProblemLevel,
    getQuestionsByAvatar,
    getContextualQuestions,
    bulkImportQuestions
  };
}
