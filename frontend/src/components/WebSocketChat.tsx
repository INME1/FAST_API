import React, { useState, useEffect, useRef } from 'react';

interface WebSocketChatProps {
  apiUrl: string;
}

interface ChatMessage {
  message: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

const WebSocketChat: React.FC<WebSocketChatProps> = ({ apiUrl }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [clientId] = useState(() => Math.floor(Math.random() * 1000));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const connectWebSocket = () => {
    setError(null);
    
    // WebSocket URL 생성 (http를 ws로 변경)
    const wsUrl = apiUrl.replace('http', 'ws') + `/ws/chat/${clientId}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        addSystemMessage(`클라이언트 #${clientId}로 채팅방에 입장했습니다.`);
      };
      
      wsRef.current.onmessage = (event) => {
        const receivedMessage = event.data;
        const isOwnMessage = receivedMessage.includes(`Client #${clientId}:`);
        
        setMessages(prev => [...prev, {
          message: receivedMessage,
          timestamp: new Date(),
          isOwnMessage
        }]);
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        addSystemMessage('채팅방 연결이 종료되었습니다.');
      };
      
      wsRef.current.onerror = (error) => {
        setError('WebSocket 연결 오류가 발생했습니다.');
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      setError('WebSocket 연결을 시작할 수 없습니다.');
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const sendMessage = () => {
    if (wsRef.current && newMessage.trim() && isConnected) {
      wsRef.current.send(newMessage);
      setNewMessage('');
    }
  };

  const addSystemMessage = (message: string) => {
    setMessages(prev => [...prev, {
      message: `시스템: ${message}`,
      timestamp: new Date(),
      isOwnMessage: false
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 아래로
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="test-container">
      <h2>웹소켓 실시간 채팅</h2>
      <p>WebSocket을 사용한 실시간 채팅방입니다. (클라이언트 ID: #{clientId})</p>
      
      <div>
        <button 
          className="button" 
          onClick={connectWebSocket} 
          disabled={isConnected}
        >
          채팅방 입장
        </button>
        
        <button 
          className="button" 
          onClick={disconnectWebSocket} 
          disabled={!isConnected}
          style={{ background: '#dc3545' }}
        >
          연결 해제
        </button>
        
        <button 
          className="button" 
          onClick={clearMessages}
          style={{ background: '#6c757d' }}
        >
          메시지 지우기
        </button>
        
        <span style={{ 
          marginLeft: '10px', 
          color: isConnected ? '#28a745' : '#dc3545',
          fontWeight: 'bold'
        }}>
          {isConnected ? '● 연결됨' : '● 연결 해제됨'}
        </span>
      </div>

      {error && <div className="error">{error}</div>}

      {/* 채팅 메시지 영역 */}
      <div className="results" style={{ height: '400px', marginBottom: '15px' }}>
        <h3>채팅 메시지 ({messages.length}개)</h3>
        
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            아직 메시지가 없습니다. 채팅방에 입장하여 대화를 시작해보세요!
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              color: msg.isOwnMessage ? 'white' : 'black',
              marginLeft: msg.isOwnMessage ? '20%' : '0',
              marginRight: msg.isOwnMessage ? '0' : '20%',
              border: msg.message.startsWith('시스템:') ? '1px solid #ffc107' : 'none',
              backgroundColor: msg.message.startsWith('시스템:') ? '#fff3cd' : 
                              msg.isOwnMessage ? '#007bff' : '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {msg.message}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 영역 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <button 
          className="button" 
          onClick={sendMessage}
          disabled={!isConnected || !newMessage.trim()}
        >
          전송
        </button>
      </div>
      
      {!isConnected && (
        <div style={{ marginTop: '10px', color: '#666', fontSize: '12px' }}>
          메시지를 보내려면 먼저 채팅방에 입장해주세요.
        </div>
      )}
    </div>
  );
};

export default WebSocketChat;