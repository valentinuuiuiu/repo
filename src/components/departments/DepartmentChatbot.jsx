import React from 'react';
import Chatbot from '../chatbot/Chatbot';
import { useDepartment } from './DepartmentContext';

const DepartmentChatbot = () => {
  const { currentDepartment, currentAgent, getAssistantContext } = useDepartment();
  
  // Generate a welcome message based on the current department and agent
  const generateWelcomeMessage = () => {
    if (!currentDepartment || !currentAgent) {
      return "Hello! I'm DropConnect's AI assistant. Please select a department and agent to get specialized help.";
    }
    
    return `Hello! I'm ${currentAgent.name} from the ${currentDepartment.name} department. I specialize in ${currentAgent.expertise.join(', ')}. How can I assist you today?`;
  };
  
  return (
    <Chatbot 
      initialMessage={generateWelcomeMessage()}
      contextData={getAssistantContext()}
    />
  );
};

export default DepartmentChatbot;