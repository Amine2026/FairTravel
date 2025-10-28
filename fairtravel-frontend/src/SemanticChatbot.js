import React, { useState, useRef, useEffect } from 'react';

function SemanticChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [demoQueries, setDemoQueries] = useState([]);
  const [dataStats, setDataStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Load demo queries and data stats on component mount
  useEffect(() => {
    loadDemoQueries();
    loadDataStats();
  }, []);

  const loadDemoQueries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/demo-queries');
      const data = await response.json();
      setDemoQueries(data.examples);
    } catch (error) {
      console.error('Error loading demos:', error);
    }
  };

  const loadDataStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data-stats');
      const data = await response.json();
      setDataStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message = null) => {
    const question = message || inputMessage;
    if (!question.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!message) setInputMessage('');
    setLoading(true);
    setShowExamples(false);

    try {
      const response = await fetch('http://localhost:5000/api/semantic-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          role: 'bot',
          content: data.results,
          sparql: data.sparql_query,
          resultCount: data.result_count,
          method: data.method || 'AI Generated',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: { type: 'error', message: `❌ Error: ${error.message}` },
        isError: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (question) => {
    handleSend(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
        <div className={`rounded p-3 ${isUser ? 'bg-primary text-white' : 'bg-light'} position-relative`} style={{ maxWidth: '80%' }}>
          {/* Timestamp */}
          <small className={`position-absolute ${isUser ? 'text-white-50 start-0' : 'text-muted end-0'} px-2`} style={{ top: '2px', fontSize: '0.7rem' }}>
            {message.timestamp}
          </small>
          
          {/* Message content */}
          <div className="mt-2">
            {isUser ? (
              <div>{message.content}</div>
            ) : (
              renderBotResponse(message.content, message.sparql, message.resultCount, message.method)
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBotResponse = (content, sparql, resultCount, method) => {
    if (content.type === 'error') {
      return <div className="text-danger">{content.message}</div>;
    }

    // If content is a raw array (SPARQL results), format it
    if (Array.isArray(content)) {
      return renderRawResults(content, sparql, resultCount, method);
    }

    return (
      <div>
        <div className="mb-2">
          <strong>{content.message}</strong>
          {resultCount !== undefined && (
            <span className="badge bg-secondary ms-2">{resultCount} result(s)</span>
          )}
          {method && (
            <small className="text-muted ms-2">({method})</small>
          )}
        </div>

        {/* Detailed results */}
        {content.type === 'list' && content.items && content.items.length > 0 && (
          <div className="mt-2">
            {content.items.slice(0, 5).map((item, index) => (
              <div key={index} className="border-start border-3 border-success ps-2 mb-2 bg-white rounded p-2">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="d-flex">
                    <strong className="me-2" style={{ minWidth: '100px' }}>{key}:</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            ))}
            {content.total_count > 5 && (
              <small className="text-muted">
                ... and {content.total_count - 5} more results
              </small>
            )}
          </div>
        )}

        {/* No results */}
        {content.type === 'no_results' && (
          <div className="alert alert-warning mt-2">
            <strong>{content.message}</strong>
            {content.suggestions && (
              <ul className="mt-2 mb-0">
                {content.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* SPARQL Query */}
        {sparql && (
          <details className="mt-3">
            <summary className="btn btn-sm btn-outline-primary">
              🔍 View SPARQL Query
            </summary>
            <div className="mt-2 p-2 bg-dark text-light rounded">
              <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                {sparql}
              </pre>
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderRawResults = (results, sparql, resultCount, method) => {
    if (!results || results.length === 0) {
      return (
        <div>
          <div className="alert alert-warning">
            <strong>🔍 No results found</strong>
          </div>
          {sparql && renderSparqlQuery(sparql)}
        </div>
      );
    }

    return (
      <div>
        <div className="mb-2">
          <strong>📊 {resultCount || results.length} result(s) found</strong>
          {method && (
            <small className="text-muted ms-2">({method})</small>
          )}
        </div>

        {/* Results display */}
        {results.slice(0, 5).map((item, index) => (
          <div key={index} className="border-start border-3 border-primary ps-2 mb-2 bg-white rounded p-2">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="d-flex align-items-start mb-1">
                <strong className="me-2 text-nowrap" style={{ minWidth: '120px', fontSize: '0.9rem' }}>
                  {key}:
                </strong>
                <span 
                  className="bg-light px-2 py-1 rounded border"
                  style={{ 
                    fontSize: '0.85rem',
                    wordBreak: 'break-word',
                    maxWidth: '300px'
                  }}
                >
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        ))}

        {results.length > 5 && (
          <div className="alert alert-info mt-2">
            <small>
              ... and {results.length - 5} more results. 
              Display limited to 5 results for better readability.
            </small>
          </div>
        )}

        {sparql && renderSparqlQuery(sparql)}
      </div>
    );
  };

  const renderSparqlQuery = (sparql) => (
    <details className="mt-3">
      <summary className="btn btn-sm btn-outline-secondary">
        🔍 View SPARQL Query
      </summary>
      <div className="mt-2 p-2 bg-dark text-light rounded">
        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}>
          {sparql}
        </pre>
      </div>
    </details>
  );

  const formatValue = (value) => {
    if (!value) return 'N/A';
    
    if (typeof value === 'object') {
      if (value.value) {
        // Clean URIs to show only the name after #
        if (value.type === 'uri' && value.value.includes('#')) {
          return value.value.split('#')[1];
        }
        return value.value;
      }
      return JSON.stringify(value);
    }
    
    return value;
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-12 col-lg-10">
          {/* Header */}
          <div className="text-center mb-4">
            <h2>🧠 FairTravel Semantic Chatbot</h2>
            <p className="text-muted">
              Ask questions in natural language about tourists, guides, restaurants...
            </p>
          </div>

          {/* Data Statistics */}
          {dataStats && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info">
                  <strong>📊 Available Data:</strong>
                  <div className="row mt-2 text-center">
                    <div className="col-md-3">
                      <strong>Tourists:</strong> {dataStats.total_tourists || 0}
                    </div>
                    <div className="col-md-3">
                      <strong>Guides:</strong> {dataStats.total_guides || 0}
                    </div>
                    <div className="col-md-3">
                      <strong>Restaurants:</strong> {dataStats.total_restaurants || 0}
                    </div>
                    <div className="col-md-3">
                      <strong>Vegetarian:</strong> {dataStats.vegetarian_restaurants || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="card shadow">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">💬 Semantic Conversation</h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowExamples(!showExamples)}
              >
                {showExamples ? '📋 Hide Examples' : '📋 Show Examples'}
              </button>
            </div>
            
            <div 
              className="card-body" 
              style={{ 
                height: '600px', 
                overflowY: 'auto',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
              }}
            >
              {/* Example Questions */}
              {showExamples && (
                <div className="mb-4">
                  <h6>💡 Try these example questions:</h6>
                  {demoQueries.map((category, catIndex) => (
                    <div key={catIndex} className="mb-3">
                      <strong className="text-primary">{category.category}:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {category.questions.map((question, qIndex) => (
                          <button
                            key={qIndex}
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleExampleClick(question)}
                            style={{ fontSize: '0.8rem' }}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conversation Messages */}
              {messages.length === 0 && !showExamples ? (
                <div className="text-center text-muted mt-5">
                  <h4>🤖 Hello!</h4>
                  <p>I'm the FairTravel semantic assistant.</p>
                  <p>Ask me questions about your data in natural language...</p>
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              
              {/* Loading Indicator */}
              {loading && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="bg-light rounded p-3">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>🔍 Semantic analysis and RDF graph querying...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="card-footer">
              <div className="input-group">
                <textarea
                  className="form-control"
                  placeholder="Ask your question in natural language (e.g., Which vegetarian restaurants in Tunis?)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="2"
                  style={{ resize: 'none' }}
                  disabled={loading}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSend()}
                  disabled={loading || !inputMessage.trim()}
                >
                  {loading ? '⚡...' : '📤 Ask RDF'}
                </button>
              </div>
              
              <small className="text-muted mt-2 d-block">
                💡 The chatbot understands natural language and automatically generates SPARQL queries to query your FairTravel RDF graph.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SemanticChatbot;