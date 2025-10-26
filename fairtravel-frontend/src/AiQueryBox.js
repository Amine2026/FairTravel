import React, { useState } from 'react';

function AiQueryBox() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError('Failed to fetch results.');
    }
    setLoading(false);
  };

  return (
    <div style={{marginBottom:'2rem', padding:'1rem', border:'1px solid #eee', borderRadius:8}}>
      <h2>Ask a question (AI-powered)</h2>
      <form onSubmit={handleSubmit} style={{display:'flex', gap:'1rem'}}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. Show me all activities in AlpinePark"
          style={{flex:1, padding:'0.5rem'}}
        />
        <button type="submit" disabled={loading || !question.trim()} style={{padding:'0.5rem 1rem'}}>
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>
      {error && <div style={{color:'red', marginTop:'1rem'}}>{error}</div>}
      {result && (
        <div style={{marginTop:'1rem'}}>
          <div><strong>SPARQL Query:</strong></div>
          <pre style={{background:'#f6f8fa', padding:'0.5rem', borderRadius:4}}>{result.sparql_query}</pre>
          <div><strong>Results:</strong></div>
          <pre style={{background:'#f6f8fa', padding:'0.5rem', borderRadius:4}}>{JSON.stringify(result.results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default AiQueryBox;
