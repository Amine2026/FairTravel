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
    <div style={{
      marginBottom:'2rem',
      padding:'2rem 1.5rem',
      border:'1px solid #e3eaf5',
      borderRadius:14,
      boxShadow:'0 4px 16px #1976d222',
      background:'#f9fbff',
      maxWidth:420,
      margin:'0 auto',
      textAlign:'center',
      transition:'box-shadow 0.2s'
    }}>
      <h2 style={{
        fontSize:'1.5rem',
        fontWeight:700,
        marginBottom:'1.2rem',
        color:'#222'
      }}>Ask a question <span style={{color:'#1976d2'}}>(AI-powered)</span></h2>
      <form onSubmit={handleSubmit} style={{display:'flex', gap:'1rem', justifyContent:'center'}}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. Show me all activities in AlpinePark"
          style={{
            flex:1,
            padding:'0.5rem 1rem',
            borderRadius:8,
            border:'1px solid #cfd8dc',
            fontSize:'1rem',
            outline:'none',
            transition:'border 0.2s'
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding:'0.5rem 1.2rem',
            borderRadius:8,
            border:'none',
            background:'#1976d2',
            color:'white',
            fontWeight:600,
            cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
            boxShadow:'0 2px 8px #1976d222',
            transition:'background 0.2s'
          }}
          onMouseOver={e => { if (!loading && question.trim()) e.currentTarget.style.background = '#1565c0'; }}
          onMouseOut={e => { if (!loading && question.trim()) e.currentTarget.style.background = '#1976d2'; }}
        >
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>
      {error && <div style={{color:'red', marginTop:'1rem'}}>{error}</div>}
      {result && (
        <div style={{marginTop:'1rem', textAlign:'left'}}>
          <div><strong>SPARQL Query:</strong></div>
          <pre style={{
            background:'#f6f8fa',
            padding:'0.5rem',
            borderRadius:4,
            fontSize:'0.95rem',
            maxHeight:'180px',
            overflow:'auto',
            wordBreak:'break-all',
            whiteSpace:'pre-wrap'
          }}>{result.sparql_query}</pre>
          <div><strong>Results:</strong></div>
          <div style={{
            background:'#f6f8fa',
            padding:'0.5rem',
            borderRadius:4,
            fontSize:'0.95rem',
            maxHeight:'260px',
            overflow:'auto',
            wordBreak:'break-all',
            whiteSpace:'pre-wrap'
          }}>
            {Array.isArray(result.results) && result.results.length > 0 ? (
              <ul style={{paddingLeft:0, listStyle:'none'}}>
                {result.results.map((row, idx) => {
                  // If activity URI exists, render as clickable link
                  if (row.activity && row.activity.type === 'uri') {
                    const uri = row.activity.value;
                    const id = encodeURIComponent(uri);
                    const label = uri.split('#')[1] || uri;
                    return (
                      <li key={idx}>
                        <a
                          href={`/activities/${id}`}
                          style={{color:'#1976d2',textDecoration:'underline',cursor:'pointer',fontWeight:600}}
                        >{label}</a>
                        <span style={{color:'#888',marginLeft:8,fontSize:'0.95em'}}>{uri}</span>
                      </li>
                    );
                  }
                  // Fallback: show JSON
                  return <li key={idx}><pre>{JSON.stringify(row, null, 2)}</pre></li>;
                })}
              </ul>
            ) : (
              <pre>{JSON.stringify(result.results, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiQueryBox;
