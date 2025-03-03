import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Agent } from '../../hooks/agents/useAgentManager';

interface AgentChatProps {
  agent: Agent | null | undefined;
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onBroadcast: () => void;
}

const AgentChat: React.FC<AgentChatProps> = ({
  agent,
  message,
  onMessageChange,
  onSendMessage,
  onBroadcast,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agent?.history]);

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && agent) {
        onSendMessage();
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Agent Chat {agent && `with ${agent.type}`}
      </Typography>
      
      <Paper 
        sx={{ 
          height: 400, 
          mb: 2, 
          overflow: 'auto',
          p: 2,
          backgroundColor: 'grey.100'
        }}
      >
        {agent ? (
          agent.history.length > 0 ? (
            <List>
              {agent.history.map((response, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={response.message}
                      secondary={new Date(response.timestamp).toLocaleString()}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              <div ref={chatEndRef} />
            </List>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          )
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              Select an agent to start chatting
            </Typography>
          </Box>
        )}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!agent}
          multiline
          maxRows={4}
        />
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={!agent || !message.trim()}
        >
          Send
        </Button>
        <Button
          variant="outlined"
          onClick={onBroadcast}
          disabled={!message.trim()}
        >
          Broadcast
        </Button>
      </Box>
    </Box>
  );
};

export default AgentChat;