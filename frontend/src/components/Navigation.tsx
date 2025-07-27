import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/performance', label: '성능 테스트' },
    { path: '/scraping', label: '웹 스크래핑' },
    { path: '/logs', label: '로그 스트리밍' },
    { path: '/tasks', label: '백그라운드 작업' },
    { path: '/external', label: '외부 API' },
    { path: '/chat', label: '웹소켓 채팅' },
  ];

  return (
    <nav className="nav">
      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;