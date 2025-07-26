import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, Loader } from 'lucide-react';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CharCount = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.disabled ? '#94a3b8' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = "Ask a question or describe what you'd like to learn about..."
}) => {
  const [question, setQuestion] = useState('');
  const maxLength = 1000;

  const handleSubmit = () => {
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <InputContainer>
      <TextArea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isLoading}
      />
      
      <ButtonContainer>
        <CharCount>
          {question.length}/{maxLength}
        </CharCount>
        
        <SubmitButton
          onClick={handleSubmit}
          disabled={!question.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send />
              Ask Question
            </>
          )}
        </SubmitButton>
      </ButtonContainer>
    </InputContainer>
  );
};

export default QuestionInput;