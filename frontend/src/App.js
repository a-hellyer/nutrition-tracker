import React, { useState, useEffect } from 'react';
import { 
  ChakraProvider, 
  Container, 
  Box, 
  Heading, 
  Text, 
  HStack, 
  Icon,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import axios from 'axios';
import FoodList from './components/FoodList';
import FoodForm from './components/FoodForm';
import CalorieEfficiencyChart from './components/CalorieEfficiencyChart';
import Analytics from './components/Analytics';
import HealthIndicators from './components/HealthIndicators';
import MealPlanner from './components/MealPlanner';

const FoodHealthMetrics = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:8000/food-items');
        setFoods(response.data);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    fetchFoods();
  }, []);

  return (
    <Box>
      <Heading size="md" mb={6}>Health Metrics by Food Item</Heading>
      <HealthIndicators foods={foods} />
    </Box>
  );
};

const Banner = () => (
  <Box 
    bg="teal.500" 
    color="white" 
    py={4} 
    mb={6}
    boxShadow="md"
  >
    <Container maxW="container.xl">
      <HStack spacing={4}>
        <Icon as={FaUtensils} w={8} h={8} />
        <Box>
          <Heading size="lg">Nutrition Tracker</Heading>
          <Text fontSize="sm" mt={1}>Track your food's nutritional value and cost efficiency</Text>
        </Box>
      </HStack>
    </Container>
  </Box>
);

const TabsWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTabIndex = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/add') return 1;
    if (location.pathname === '/chart') return 2;
    if (location.pathname === '/analytics') return 3;
    if (location.pathname === '/health') return 4;
    if (location.pathname === '/meal-planner') return 5;
    return 0;
  };

  const handleTabChange = (index) => {
    switch (index) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/add');
        break;
      case 2:
        navigate('/chart');
        break;
      case 3:
        navigate('/analytics');
        break;
      case 4:
        navigate('/health');
        break;
      case 5:
        navigate('/meal-planner');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Tabs index={getTabIndex()} onChange={handleTabChange} isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>Food List</Tab>
        <Tab>Add Food</Tab>
        <Tab>Calorie Efficiency</Tab>
        <Tab>Analytics</Tab>
        <Tab>Health Metrics</Tab>
        <Tab>Meal Planner</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Routes>
            <Route path="/" element={<FoodList />} />
            <Route path="/edit/:id" element={<FoodForm />} />
          </Routes>
        </TabPanel>
        <TabPanel>
          <Routes>
            <Route path="/add" element={<FoodForm />} />
          </Routes>
        </TabPanel>
        <TabPanel>
          <Routes>
            <Route path="/chart" element={<CalorieEfficiencyChart />} />
          </Routes>
        </TabPanel>
        <TabPanel>
          <Routes>
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </TabPanel>
        <TabPanel>
          <Routes>
            <Route path="/health" element={<FoodHealthMetrics />} />
          </Routes>
        </TabPanel>
        <TabPanel>
          <Routes>
            <Route path="/meal-planner" element={<MealPlanner />} />
          </Routes>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box>
          <Banner />
          <Container maxW="container.xl" py={5}>
            <Routes>
              <Route path="/*" element={<TabsWrapper />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 