import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import QuestionInput from '@/components/QuestionInput';
import AnimationPlayer from '@/components/AnimationPlayer';
import ApiService from '@/services/api';
import { Session, Explanation, Animation, ExplanationStatus, AnimationStatus, AnimationType } from '@/types/api';

const SessionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const SessionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  
  h1 {
    flex: 1;
    margin: 0;
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8fafc;
    color: #374151;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 400px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExplanationCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ExplanationHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
  }
`;

const ExplanationContent = styled.div`
  padding: 1.5rem;
  
  .explanation-text {
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
  }
`;

const StatusBadge = styled.div<{ status: ExplanationStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case ExplanationStatus.COMPLETED:
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case ExplanationStatus.PROCESSING:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case ExplanationStatus.FAILED:
        return `
          background: #fecaca;
          color: #991b1b;
        `;
      default:
        return `
          background: #f1f5f9;
          color: #64748b;
        `;
    }
  }}
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const AnimationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
`;

const QuestionHistory = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #1e293b;
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const QuestionItem = styled.div`
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  
  .question-text {
    color: #374151;
    font-size: 0.875rem;
    margin: 0 0 0.5rem 0;
  }
  
  .question-time {
    color: #64748b;
    font-size: 0.75rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
      
      // Set up polling for updates
      const interval = setInterval(loadSessionData, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const [sessionData, explanationsData] = await Promise.all([
        ApiService.getSession(sessionId),
        ApiService.getExplanations(sessionId)
      ]);
      
      setSession(sessionData);
      setExplanations(explanationsData);
      
      // Load animations for all explanations
      const allAnimations: Animation[] = [];
      for (const explanation of explanationsData) {
        const explanationAnimations = await ApiService.getAnimations(explanation.id);
        allAnimations.push(...explanationAnimations);
      }
      setAnimations(allAnimations);
      
    } catch (error) {
      console.error('Failed to load session data:', error);
      toast.error('Failed to load session');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestion = async (question: string) => {
    if (!sessionId) return;
    
    setIsSubmitting(true);
    
    try {
      await ApiService.createExplanation({
        session_id: sessionId,
        question: question
      });
      
      toast.success('Question submitted!');
      loadSessionData(); // Refresh data
      
    } catch (error) {
      console.error('Failed to submit question:', error);
      toast.error('Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: ExplanationStatus) => {
    switch (status) {
      case ExplanationStatus.COMPLETED:
        return <CheckCircle />;
      case ExplanationStatus.FAILED:
        return <AlertCircle />;
      default:
        return <Clock />;
    }
  };

  if (isLoading) {
    return (
      <SessionContainer>
        <LoadingState>
          <div className="spinner" />
          Loading session...
        </LoadingState>
      </SessionContainer>
    );
  }

  if (!session) {
    return (
      <SessionContainer>
        <div>Session not found</div>
      </SessionContainer>
    );
  }

  return (
    <SessionContainer>
      <SessionHeader>
        <BackButton onClick={() => navigate('/')}>
          <ArrowLeft />
          Back
        </BackButton>
        <h1>{session.title}</h1>
      </SessionHeader>
      
      <ContentGrid>
        <MainContent>
          <div>
            <SectionTitle>Ask Another Question</SectionTitle>
            <QuestionInput
              onSubmit={handleNewQuestion}
              isLoading={isSubmitting}
              placeholder="Ask a follow-up question or explore a new topic..."
            />
          </div>
          
          <AnimationSection>
            <SectionTitle>Animations</SectionTitle>
            {animations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {animations.map((animation) => (
                  <AnimationPlayer key={animation.id} animation={animation} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No animations generated yet. Animations will appear here once explanations are processed.
              </div>
            )}
          </AnimationSection>
        </MainContent>
        
        <Sidebar>
          <QuestionHistory>
            <h3>
              <MessageSquare />
              Questions & Explanations
            </h3>
            
            <QuestionList>
              {explanations.map((explanation, index) => (
                <ExplanationCard
                  key={explanation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ExplanationHeader>
                    <h3>
                      Question {index + 1}
                      <StatusBadge status={explanation.status}>
                        {getStatusIcon(explanation.status)}
                        {explanation.status}
                      </StatusBadge>
                    </h3>
                    <p>{explanation.question}</p>
                  </ExplanationHeader>
                  
                  {explanation.explanation_text && (
                    <ExplanationContent>
                      <div className="explanation-text">
                        {explanation.explanation_text}
                      </div>
                    </ExplanationContent>
                  )}
                </ExplanationCard>
              ))}
            </QuestionList>
          </QuestionHistory>
        </Sidebar>
      </ContentGrid>
    </SessionContainer>
  );
};

export default SessionPage;