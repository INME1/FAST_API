import React, { useState } from 'react';
import axios from 'axios';

interface ExternalAPIsProps {
  apiUrl: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
}

interface NewsData {
  headlines: string[];
}

interface StockData {
  [symbol: string]: number;
}

interface CryptoData {
  [symbol: string]: number;
}

interface DashboardData {
  weather: WeatherData;
  news: NewsData;
  stocks: StockData;
  crypto: CryptoData;
  timestamp: string;
}

const ExternalAPIs: React.FC<ExternalAPIsProps> = ({ apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await axios.get(`${apiUrl}/api/external/dashboard`);
      setData(response.data);
      setLoadTime(Date.now() - startTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : '대시보드 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  return (
    <div className="test-container">
      <h2>외부 API 통합 대시보드</h2>
      <p>여러 외부 API를 동시에 호출하여 대시보드 데이터를 구성합니다.</p>
      
      <button 
        className="button" 
        onClick={loadDashboard} 
        disabled={loading}
      >
        {loading ? '데이터 로딩 중...' : '대시보드 새로고침'}
      </button>

      {loadTime && (
        <div className="success">
          모든 API 데이터를 {loadTime}ms에 로드완료 (비동기 처리)
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {data && (
        <div className="results">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* 날씨 정보 */}
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <h3>🌤️ 날씨 정보</h3>
              <div style={{ fontSize: '24px', margin: '10px 0' }}>
                {getWeatherIcon(data.weather.condition)} {data.weather.condition}
              </div>
              <div><strong>온도:</strong> {data.weather.temperature}°C</div>
              <div><strong>습도:</strong> {data.weather.humidity}%</div>
            </div>

            {/* 뉴스 헤드라인 */}
            <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px' }}>
              <h3>📰 뉴스 헤드라인</h3>
              {data.news.headlines.map((headline, index) => (
                <div key={index} style={{ marginBottom: '8px', padding: '5px', background: 'white', borderRadius: '4px' }}>
                  • {headline}
                </div>
              ))}
            </div>

            {/* 주식 가격 */}
            <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px' }}>
              <h3>📈 주식 가격</h3>
              {Object.entries(data.stocks).map(([symbol, price]) => (
                <div key={symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{symbol}:</strong>
                  <span>{formatCurrency(price)}</span>
                </div>
              ))}
            </div>

            {/* 암호화폐 가격 */}
            <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
              <h3>₿ 암호화폐 가격</h3>
              {Object.entries(data.crypto).map(([symbol, price]) => (
                <div key={symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{symbol}:</strong>
                  <span>{formatCurrency(price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
            마지막 업데이트: {new Date(data.timestamp).toLocaleString('ko-KR')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalAPIs;