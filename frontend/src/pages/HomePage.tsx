import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import QuestionInput from '../components/QuestionInput';
import ApiService from '../services/api';
import { Session, SessionCreate, Explanation, Animation } from '../types/api';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  
  h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(45deg, #ffffff, #e0e7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 1.25rem;
    margin: 0;
    opacity: 0.9;
  }
`;

const QuickStartSection = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const QuestionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h2 {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
`;

const RecentSessions = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  
  h3 {
    color: #1e293b;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SessionItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const SessionInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.25rem 0;
    color: #1e293b;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 0.75rem;
  }
`;

const SessionStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  font-size: 0.75rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const CreateSessionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    try {
      const sessions = await ApiService.getSessions();
      setRecentSessions(sessions.slice(0, 5)); // Show only the 5 most recent
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    setIsLoading(true);
    
    try {
      // Create a new session
      const sessionData: SessionCreate = {
        title: question.length > 50 ? question.substring(0, 50) + '...' : question,
        description: question,
        metadata: { created_from: 'home_page' }
      };
      
      const session = await ApiService.createSession(sessionData);
      
      // Create an explanation for the question
      await ApiService.createExplanation({
        session_id: session.session_id,
        question: question
      });
      
      toast.success('Question submitted! Generating explanation...');
      navigate(`/sessions/${session.session_id}`);
      
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to submit question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const handleCreateSession = () => {
    navigate('/sessions/new');
  };

  return (
    <HomeContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Whiteboard Teaching AI</h1>
        <p>Transform your questions into engaging visual explanations</p>
      </WelcomeSection>
      
      <QuickStartSection>
        <QuestionSection>
          <h2>Ask a Question</h2>
          <QuestionInput
            onSubmit={handleQuestionSubmit}
            isLoading={isLoading}
            placeholder="What would you like to learn about? For example: 'Explain how photosynthesis works' or 'Show me how to solve quadratic equations'"
          />
        </QuestionSection>
        
        <RecentSessions>
          <h3>
            <BookOpen />
            Recent Sessions
          </h3>
          
          {recentSessions.length > 0 ? (
            <SessionList>
              {recentSessions.map((session, index) => (
                <SessionItem
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleSessionClick(session.session_id)}
                >
                  <SessionInfo>
                    <h4>{session.title}</h4>
                    <p>{new Date(session.created_at).toLocaleDateString()}</p>
                  </SessionInfo>
                  <SessionStats>
                    <StatItem>
                      <Clock />
                      {new Date(session.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </StatItem>
                  </SessionStats>
                </SessionItem>
              ))}
              
              <CreateSessionButton
                onClick={handleCreateSession}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus />
                New Session
              </CreateSessionButton>
            </SessionList>
          ) : (
            <EmptyState>
              <p>No recent sessions. Ask your first question above!</p>
            </EmptyState>
          )}
        </RecentSessions>
      </QuickStartSection>
    </HomeContainer>
  );
};

export default HomePage;