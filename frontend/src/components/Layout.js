import React from 'react';
import { Box, Container, Flex, Heading, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <Box minH="100vh">
      <Box bg="teal.500" color="white" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">
              <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                Nutrition Tracker
              </ChakraLink>
            </Heading>
            <Flex gap={4}>
              <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'underline' }}>
                Home
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/add" _hover={{ textDecoration: 'underline' }}>
                Add Food
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/compare" _hover={{ textDecoration: 'underline' }}>
                Compare
              </ChakraLink>
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 