import React from 'react';
import { 
  Typography as MuiTypography, 
  TypographyProps as MuiTypographyProps 
} from '@mui/material';

export interface TypographyProps extends MuiTypographyProps {
  truncate?: boolean;
  maxLines?: number;
}

/**
 * Enhanced Typography component with truncation support
 */
export const Typography: React.FC<TypographyProps> = ({
  children,
  truncate = false,
  maxLines,
  sx,
  ...props
}) => {
  const truncateStyles = truncate ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } : {};

  const maxLinesStyles = maxLines ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
  } : {};

  return (
    <MuiTypography
      sx={{
        ...truncateStyles,
        ...maxLinesStyles,
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography;