import React, { useState } from 'react';

function NetworkDemo() {
  const [apiCalls, setApiCalls] = useState([]);
  const [testing, setTesting] = useState(false);

  const testAllEndpoints = async () => {
    setTesting(true);
    const endpoints = [
      { name: 'GET Tourists', url: '/tourists', method: 'GET' },
      { name: 'GET Guides', url: '/guides', method: 'GET' },
      { name: 'GET Restaurants', url: '/restaurants', method: 'GET' },
      { name: 'Multi-class Search', url: '/search/multi-class', method: 'GET' },
      { name: 'Data Statistics', url: '/api/data-stats', method: 'GET' },
      { name: 'Demo Queries', url: '/api/demo-queries', method: 'GET' }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://localhost:5000${endpoint.url}`);
        const endTime = Date.now();
        
        const data = await response.json();
        
        results.push({
          name: endpoint.name,
          status: response.status,
          duration: `${endTime - startTime}ms`,
          success: response.ok,
          dataSize: Array.isArray(data) ? `${data.length} items` : 'Object data'
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: 'Error',
          duration: 'N/A',
          success: false,
          dataSize: error.message
        });
      }
    }
    
    setApiCalls(results);
    setTesting(false);
  };

  return (
    <div className="container mt-4">
      <h2>🌐 Network Communication Demo</h2>
      <p className="text-muted">
        Test all API endpoints to demonstrate React ↔ Flask ↔ Fuseki communication
      </p>
      
      <button 
        className={`btn btn-primary mb-3 ${testing ? 'disabled' : ''}`}
        onClick={testAllEndpoints}
        disabled={testing}
      >
        {testing ? '🔄 Testing...' : '🧪 Test All API Endpoints'}
      </button>

      {apiCalls.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">API Test Results</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Response Time</th>
                    <th>Data Received</th>
                  </tr>
                </thead>
                <tbody>
                  {apiCalls.map((call, index) => (
                    <tr key={index} className={call.success ? 'table-success' : 'table-danger'}>
                      <td>
                        <strong>{call.name}</strong>
                        <br />
                        <small className="text-muted">GET http://localhost:5000{call.url}</small>
                      </td>
                      <td>
                        <span className={`badge ${call.success ? 'bg-success' : 'bg-danger'}`}>
                          {call.status}
                        </span>
                      </td>
                      <td>
                        <code>{call.duration}</code>
                      </td>
                      <td>
                        <small>{call.dataSize}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="alert alert-info mt-3">
              <strong>Architecture Proof:</strong> All successful calls demonstrate the 3-layer architecture:<br />
              <strong>React Frontend</strong> → <strong>Flask Backend</strong> → <strong>Fuseki RDF Store</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NetworkDemo;