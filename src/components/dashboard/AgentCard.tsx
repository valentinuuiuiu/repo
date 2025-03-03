import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { AgentType, AgentStatus } from '../../types/agent';

interface AgentCardProps {
  type: AgentType;
  status: AgentStatus;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  type,
  status,
  selected,
  onSelect,
  onRemove,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case AgentStatus.CONNECTED:
        return 'success';
      case AgentStatus.CONNECTING:
      case AgentStatus.PROCESSING:
        return 'warning';
      case AgentStatus.ERROR:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 275,
        border: selected ? '2px solid primary.main' : 'none',
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          {type}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Chip
            label={status}
            color={getStatusColor()}
            size="small"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={onSelect}>
          Select
        </Button>
        <Button size="small" color="error" onClick={onRemove}>
          Remove
        </Button>
      </CardActions>
    </Card>
  );
};

export default AgentCard;