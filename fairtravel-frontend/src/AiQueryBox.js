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
                  // Handle Reviews
                  if (row.review && row.review.type === 'uri') {
                    const uri = row.review.value;
                    const id = encodeURIComponent(uri);
                    const label = uri.split('#')[1] || uri;
                    const title = row.title ? row.title.value : '';
                    const author = row.author ? row.author.value : '';
                    return (
                      <li key={idx} style={{marginBottom:'0.8rem', padding:'0.6rem', background:'#fff', borderRadius:6, border:'1px solid #e0e0e0'}}>
                        <div style={{fontWeight:600, color:'#1976d2', fontSize:'1.05rem'}}>
                          📝 {title || label}
                        </div>
                        {author && <div style={{color:'#666', fontSize:'0.9rem', marginTop:'0.3rem'}}>👤 {author}</div>}
                        <a
                          href={`/reviews/${id}`}
                          style={{color:'#1976d2', textDecoration:'none', fontSize:'0.85rem', marginTop:'0.3rem', display:'inline-block'}}
                        >→ View details</a>
                      </li>
                    );
                  }
                  // Handle Activities
                  if (row.activity && row.activity.type === 'uri') {
                    const uri = row.activity.value;
                    const id = encodeURIComponent(uri);
                    const label = uri.split('#')[1] || uri;
                    return (
                      <li key={idx} style={{marginBottom:'0.5rem'}}>
                        <a
                          href={`/activities/${id}`}
                          style={{color:'#1976d2',textDecoration:'underline',cursor:'pointer',fontWeight:600}}
                        >{label}</a>
                        <span style={{color:'#888',marginLeft:8,fontSize:'0.95em'}}>{uri}</span>
                      </li>
                    );
                  }
                  // Handle Awards
                  if (row.award && row.award.type === 'uri') {
                    const uri = row.award.value;
                    const id = encodeURIComponent(uri);
                    const label = uri.split('#')[1] || uri;
                    const name = row.name ? row.name.value : '';
                    const category = row.category ? row.category.value : '';
                    return (
                      <li key={idx} style={{marginBottom:'0.8rem', padding:'0.6rem', background:'#fff', borderRadius:6, border:'1px solid #e0e0e0'}}>
                        <div style={{fontWeight:600, color:'#ffa726', fontSize:'1.05rem'}}>
                          🏆 {name || label}
                        </div>
                        {category && <div style={{color:'#666', fontSize:'0.9rem', marginTop:'0.3rem'}}>📂 {category}</div>}
                        <a
                          href={`/awards/${id}`}
                          style={{color:'#ffa726', textDecoration:'none', fontSize:'0.85rem', marginTop:'0.3rem', display:'inline-block'}}
                        >→ View details</a>
                      </li>
                    );
                  }
                  // Handle Services
                  if (row.service && row.service.type === 'uri') {
                    const uri = row.service.value;
                    const id = encodeURIComponent(uri);
                    const label = uri.split('#')[1] || uri;
                    const serviceName = row.name ? row.name.value : '';
                    const serviceType = row.type ? row.type.value : '';
                    return (
                      <li key={idx} style={{marginBottom:'0.8rem', padding:'0.6rem', background:'#fff', borderRadius:6, border:'1px solid #e0e0e0'}}>
                        <div style={{fontWeight:600, color:'#66bb6a', fontSize:'1.05rem'}}>
                          🛠️ {serviceName || label}
                        </div>
                        {serviceType && <div style={{color:'#666', fontSize:'0.9rem', marginTop:'0.3rem'}}>🔧 {serviceType}</div>}
                        <a
                          href={`/services/${id}`}
                          style={{color:'#66bb6a', textDecoration:'none', fontSize:'0.85rem', marginTop:'0.3rem', display:'inline-block'}}
                        >→ View details</a>
                      </li>
                    );
                  }
                  // Fallback: show JSON for any other data
                  return <li key={idx}><pre style={{fontSize:'0.85rem', background:'#fff', padding:'0.5rem', borderRadius:4}}>{JSON.stringify(row, null, 2)}</pre></li>;
                })}
              </ul>
            ) : (
              <div style={{color:'#999', fontStyle:'italic', padding:'1rem'}}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiQueryBox;
