import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';


const Home = () => {
  return (
   
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" >
            Welcome to Home Page
          </Typography>
          {/* Add your home page content here */}
        </Box>
      </Container>
    
  );
};

export default Home;
