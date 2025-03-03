import React, { ReactNode } from 'react';
import { Container, Box, Paper, BoxProps, ContainerProps } from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: ContainerProps['maxWidth'];
  disablePadding?: boolean;
  disablePaper?: boolean;
  paperProps?: BoxProps;
  containerProps?: ContainerProps;
}

/**
 * A container component for page content with consistent styling
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg',
  disablePadding = false,
  disablePaper = false,
  paperProps,
  containerProps,
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      {...containerProps}
    >
      {disablePaper ? (
        <Box sx={{ my: disablePadding ? 0 : 3 }}>
          {children}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: disablePadding ? 0 : 3,
            my: disablePadding ? 0 : 3,
            borderRadius: 2,
            ...paperProps?.sx,
          }}
          {...paperProps}
        >
          {children}
        </Paper>
      )}
    </Container>
  );
};

export default PageContainer;