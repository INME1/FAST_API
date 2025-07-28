import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface BackgroundTasksProps {
  apiUrl: string;
}

interface TaskStatus {
  status: string;
  progress: number;
  message?: string;
  result?: string;
}

interface Task {
  job_id: string;
  status: TaskStatus;
}

const BackgroundTasks: React.FC<BackgroundTasksProps> = ({ apiUrl }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<{[key: string]: TaskStatus}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewTask = async () => {
    setLoading(true);
    setError(null);

    try {
      const taskData = {
        items: ['item1', 'item2', 'item3', 'item4', 'item5']
      };

      const response = await axios.post(`${apiUrl}/api/tasks/start`, taskData);
      const jobId = response.data.job_id;

      // 새 작업을 목록에 추가
      const newTask: Task = {
        job_id: jobId,
        status: { status: 'started', progress: 0 }
      };
      setTasks(prev => [...prev, newTask]);

      // 진행 상황 모니터링 시작
      monitorTask(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '작업 시작 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const monitorTask = (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/tasks/${jobId}/status`);
        const status = response.data;

        setTasks(prev => 
          prev.map(task => 
            task.job_id === jobId 
              ? { ...task, status } 
              : task
          )
        );

        // 작업이 완료되지 않았으면 계속 모니터링
        if (status.status === 'processing') {
          setTimeout(checkStatus, 1000);
        }
      } catch (err) {
        console.error('작업 상태 확인 오류:', err);
      }
    };

    checkStatus();
  };

  const loadAllTasks = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/tasks`);
      setAllTasks(response.data.tasks);
    } catch (err) {
      console.error('전체 작업 목록 로드 오류:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'started': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="test-container">
      <h2>백그라운드 작업 처리</h2>
      <p>무거운 작업을 백그라운드에서 처리하고 실시간으로 진행 상황을 확인합니다.</p>
      
      <div>
        <button 
          className="button" 
          onClick={startNewTask} 
          disabled={loading}
        >
          {loading ? '작업 시작 중...' : '새 작업 시작'}
        </button>
        
        <button 
          className="button" 
          onClick={loadAllTasks}
          style={{ background: '#6c757d' }}
        >
          전체 작업 목록 새로고침
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* 진행 중인 작업들 */}
      {tasks.length > 0 && (
        <div className="results">
          <h3>진행 중인 작업들</h3>
          {tasks.map((task) => (
            <div key={task.job_id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div><strong>작업 ID:</strong> {task.job_id}</div>
              <div>
                <strong>상태:</strong> 
                <span style={{ color: getStatusColor(task.status.status), marginLeft: '5px' }}>
                  {task.status.status}
                </span>
              </div>
              
              <div><strong>진행률:</strong> {task.status.progress}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${task.status.progress}%`,
                    background: getStatusColor(task.status.status)
                  }}
                ></div>
              </div>
              
              {task.status.message && (
                <div><strong>메시지:</strong> {task.status.message}</div>
              )}
              
              {task.status.result && (
                <div className="success">
                  <strong>결과:</strong> {task.status.result}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 전체 작업 목록 */}
      {Object.keys(allTasks).length > 0 && (
        <div className="results">
          <h3>전체 작업 히스토리</h3>
          {Object.entries(allTasks).map(([jobId, status]) => (
            <div key={jobId} className="log-entry">
              <div><strong>ID:</strong> {jobId}</div>
              <div>
                <strong>상태:</strong> 
                <span style={{ color: getStatusColor(status.status) }}>
                  {status.status}
                </span>
                {' '}({status.progress}%)
              </div>
              {status.result && <div><strong>결과:</strong> {status.result}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundTasks;