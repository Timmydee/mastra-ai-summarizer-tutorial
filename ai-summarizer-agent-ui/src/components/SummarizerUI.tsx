'use client';

import { useState } from 'react';

type InputMode = 'url' | 'text';

export default function SummarizerUI() {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<InputMode>('url');

  const handleSummarize = async () => {
    if (!input.trim()) {
      setError('Please enter a URL or text to summarize');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();

      if (data.success) {
        setSummary(data.text);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && mode === 'url') {
      e.preventDefault();
      handleSummarize();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">AI Summarizer</h1>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMode('url')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📄 URL
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ✍️ Text
        </button>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {mode === 'url' ? 'Enter URL' : 'Enter Text'}
        </label>
        {mode === 'url' ? (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/article"
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        ) : (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your text here..."
            rows={6}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSummarize}
        disabled={loading || !input.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating Summary...
          </span>
        ) : (
          '✨ Summarize'
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            <span className="font-medium">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Summary Output */}
      {summary && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">📝 Summary</h2>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: summary.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong>$1</strong>'
                ),
              }}
            />
          </div>
        </div>
      )}

      {summary && (
        <button
          onClick={() => {
            setSummary('');
            setInput('');
            setError('');
          }}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Clear and start over
        </button>
      )}

    </div>
  );
}
