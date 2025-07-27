import React, { useState } from 'react';
import axios from 'axios';

interface PerformanceTestProps {
  apiUrl: string;
}

interface PerformanceResult {
  sequential_time: number;
  concurrent_time: number;
  speed_improvement: number;
  urls_count: number;
}

const PerformanceTest: React.FC<PerformanceTestProps> = ({ apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerformanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPerformanceTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`${apiUrl}/api/performance-test`);
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '테스트 실행 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-container">
      <h2>성능 테스트 - 동기 vs 비동기</h2>
      <p>5개의 API를 순차적으로 호출하는 것과 동시에 호출하는 것의 성능을 비교합니다.</p>
      
      <button 
        className="button" 
        onClick={runPerformanceTest} 
        disabled={loading}
      >
        {loading ? '테스트 실행 중...' : '성능 테스트 시작'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <h3>테스트 결과</h3>
          <div>
            <strong>순차 처리 시간:</strong> {result.sequential_time}초
          </div>
          <div>
            <strong>동시 처리 시간:</strong> {result.concurrent_time}초
          </div>
          <div>
            <strong>성능 향상:</strong> {result.speed_improvement}배 빠름
          </div>
          <div>
            <strong>처리한 URL 수:</strong> {result.urls_count}개
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div>순차 처리: {result.sequential_time}초</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: '100%', background: '#dc3545' }}
              ></div>
            </div>
            
            <div>동시 처리: {result.concurrent_time}초</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(result.concurrent_time / result.sequential_time) * 100}%`,
                  background: '#28a745'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTest;