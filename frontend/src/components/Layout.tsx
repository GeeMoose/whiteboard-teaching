import React from 'react';
import styled from 'styled-components';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Settings } from 'lucide-react';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Sidebar = styled.nav`
  width: 250px;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  
  p {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0.25rem 0 0 0;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0.25rem 0;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  text-decoration: none;
  font-weight: ${props => props.$active ? '600' : '500'};
  background-color: ${props => props.$active ? '#eff6ff' : 'transparent'};
  border-right: ${props => props.$active ? '3px solid #3b82f6' : '3px solid transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f1f5f9;
    color: #3b82f6;
  }
  
  svg {
    margin-right: 0.75rem;
    width: 20px;
    height: 20px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  
  h2 {
    margin: 0;
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
`;

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/sessions', label: 'Sessions', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <LayoutContainer>
      <Sidebar>
        <Logo>
          <h1>WhiteboardAI</h1>
          <p>Teaching made visual</p>
        </Logo>
        
        <NavList>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem key={item.path}>
                <NavLink to={item.path} $active={isActive}>
                  <Icon />
                  {item.label}
                </NavLink>
              </NavItem>
            );
          })}
        </NavList>
      </Sidebar>
      
      <MainContent>
        <Header>
          <h2>
            {navItems.find(item => item.path === location.pathname)?.label || 'Whiteboard Teaching AI'}
          </h2>
        </Header>
        
        <Content>
          <Outlet />
        </Content>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;