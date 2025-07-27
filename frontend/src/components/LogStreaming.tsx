import React, { useState, useEffect, useRef } from 'react';

interface LogStreamingProps {
  apiUrl: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  request_id: string;
}

const LogStreaming: React.FC<LogStreamingProps> = ({ apiUrl }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = async () => {
    setIsStreaming(true);
    setError(null);
    setLogs([]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${apiUrl}/api/logs/stream`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.body) {
        throw new Error('응답 스트림을 사용할 수 없습니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const logData = JSON.parse(line.slice(6));
              setLogs(prev => [...prev, logData]);
            } catch (e) {
              console.error('로그 파싱 오류:', e);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR': return '#dc3545';
      case 'WARNING': return '#ffc107';
      case 'INFO': return '#17a2b8';
      case 'DEBUG': return '#6c757d';
      default: return '#000';
    }
  };

  return (
    <div className="test-container">
      <h2>실시간 로그 스트리밍</h2>
      <p>서버에서 실시간으로 생성되는 로그를 스트리밍으로 확인합니다.</p>
      
      <div>
        <button 
          className="button" 
          onClick={startStreaming} 
          disabled={isStreaming}
        >
          로그 스트리밍 시작
        </button>
        
        <button 
          className="button" 
          onClick={stopStreaming} 
          disabled={!isStreaming}
          style={{ background: '#dc3545' }}
        >
          스트리밍 중지
        </button>
        
        <button 
          className="button" 
          onClick={clearLogs}
          style={{ background: '#6c757d' }}
        >
          로그 지우기
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="results" style={{ height: '400px' }}>
        <h3>실시간 로그 ({logs.length}개)</h3>
        {logs.length === 0 && !isStreaming && (
          <div>로그가 없습니다. 스트리밍을 시작해주세요.</div>
        )}
        
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <span style={{ color: getLogColor(log.level), fontWeight: 'bold' }}>
              [{log.level}]
            </span>
            {' '}
            <span style={{ color: '#666' }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {' '}
            <span style={{ color: '#007bff' }}>
              {log.service}
            </span>
            {' '}
            <span>
              {log.message}
            </span>
            {' '}
            <span style={{ color: '#999', fontSize: '10px' }}>
              ({log.request_id})
            </span>
          </div>
        ))}
        
        {isStreaming && (
          <div className="loading">
            로그 스트리밍 중... ({logs.length}개 로그 수신됨)
          </div>
        )}
      </div>
    </div>
  );
};

export default LogStreaming;