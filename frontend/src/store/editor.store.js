import { create } from 'zustand';
import { humanizeText } from '../api/humanize.js';

export const useEditorStore = create((set, get) => ({
  inputText: '',
  outputText: '',
  tone: 'casual',
  loading: false,
  error: null,
  aiScoreBefore: null,
  aiScoreAfter: null,
  wordCountIn: 0,
  wordCountOut: 0,

  setInput: (text) => {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    set({ inputText: text, wordCountIn: wordCount });
  },

  setTone: (tone) => set({ tone }),

  setOutput: (text) => {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    set({ outputText: text, wordCountOut: wordCount });
  },

  humanize: async () => {
    const { inputText, tone } = get();
    if (!inputText.trim()) return;

    set({ loading: true, error: null });
    try {
      const result = await humanizeText({ text: inputText, tone });
      
      set({
        outputText: result.outputText,
        wordCountOut: result.outputText.trim() ? result.outputText.trim().split(/\s+/).length : 0,
        aiScoreBefore: result.aiScoreBefore,
        aiScoreAfter: result.aiScoreAfter,
        loading: false,
      });

      return result;
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
      set({ error: errMsg, loading: false });
      throw error; // Let the component handle it for toasts (e.g. 402, 429)
    }
  },

  reset: () => set({
    inputText: '',
    outputText: '',
    aiScoreBefore: null,
    aiScoreAfter: null,
    wordCountIn: 0,
    wordCountOut: 0,
    error: null,
  }),
}));
