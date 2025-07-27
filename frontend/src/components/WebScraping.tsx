import React, { useState } from 'react';
import axios from 'axios';

interface WebScrapingProps {
  apiUrl: string;
}

interface ScrapingResult {
  url: string;
  status?: number;
  size?: number;
  error?: string;
}

interface ScrapingResponse {
  results: ScrapingResult[];
  total_sites: number;
}

const WebScraping: React.FC<WebScrapingProps> = ({ apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScraping = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.get(`${apiUrl}/api/scrape-multiple`);
      setResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '스크래핑 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-container">
      <h2>웹 스크래핑 - 여러 사이트 동시 크롤링</h2>
      <p>여러 웹사이트를 동시에 크롤링하여 응답 시간과 데이터 크기를 확인합니다.</p>
      
      <button 
        className="button" 
        onClick={startScraping} 
        disabled={loading}
      >
        {loading ? '스크래핑 중...' : '스크래핑 시작'}
      </button>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="results">
          <h3>스크래핑 결과 ({results.total_sites}개 사이트)</h3>
          {results.results.map((result, index) => (
            <div key={index} className="log-entry">
              <div><strong>URL:</strong> {result.url}</div>
              {result.status && (
                <>
                  <div><strong>상태 코드:</strong> {result.status}</div>
                  <div><strong>응답 크기:</strong> {result.size} bytes</div>
                </>
              )}
              {result.error && (
                <div style={{ color: '#dc3545' }}><strong>오류:</strong> {result.error}</div>
              )}
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebScraping;