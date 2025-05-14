import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Card,
  CardBody,
  Select,
  HStack,
  Tooltip,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const Analytics = () => {
  const [foods, setFoods] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [metrics, setMetrics] = useState({
    averageProteinCost: 0,
    averageCalorieCost: 0,
    mostEfficientProtein: { name: '', value: 0 },
    mostEfficientCalories: { name: '', value: 0 },
    bestNutrientDensity: { name: '', value: 0 },
    averageCostPer100g: 0,
    topProteinFoods: [],
    topCalorieFoods: [],
    avgMacros: { protein: 0, carbs: 0, fats: 0, fiber: 0 },
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [foods, timeRange]);

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8000/food-items');
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const calculateMetrics = () => {
    if (foods.length === 0) return;

    // Calculate average protein cost
    const avgProteinCost = foods.reduce((sum, food) => 
      sum + (food.protein_per_dollar), 0) / foods.length;

    // Calculate average calorie cost
    const avgCalorieCost = foods.reduce((sum, food) => 
      sum + (food.calories_per_dollar), 0) / foods.length;

    // Find most efficient protein source
    const bestProtein = foods.reduce((best, food) => 
      food.protein_per_dollar > (best?.value || 0) 
        ? { name: food.name, value: food.protein_per_dollar }
        : best
    , { name: '', value: 0 });

    // Find most efficient calorie source
    const bestCalories = foods.reduce((best, food) => 
      food.calories_per_dollar > (best?.value || 0)
        ? { name: food.name, value: food.calories_per_dollar }
        : best
    , { name: '', value: 0 });

    // Calculate nutrient density score (protein + fiber per calorie)
    const nutrientDensity = foods.map(food => ({
      name: food.name,
      value: (food.protein + food.fiber) / (food.calories || 1)
    }));
    const bestDensity = nutrientDensity.reduce((best, food) => 
      food.value > (best?.value || 0) ? food : best
    , { name: '', value: 0 });

    // Calculate average cost per 100g
    const avgCost = foods.reduce((sum, food) => 
      sum + food.price, 0) / foods.length;

    // Get top 5 protein-rich foods
    const topProteinFoods = [...foods]
      .sort((a, b) => b.protein_per_dollar - a.protein_per_dollar)
      .slice(0, 5);

    // Get top 5 calorie-efficient foods
    const topCalorieFoods = [...foods]
      .sort((a, b) => b.calories_per_dollar - a.calories_per_dollar)
      .slice(0, 5);

    // Calculate average macronutrient ratios
    const avgMacros = foods.reduce((acc, food) => {
      acc.protein += food.protein;
      acc.carbs += food.carbohydrates;
      acc.fats += food.fats;
      acc.fiber += food.fiber;
      return acc;
    }, { protein: 0, carbs: 0, fats: 0, fiber: 0 });

    const total = Object.values(avgMacros).reduce((sum, val) => sum + val, 0);
    Object.keys(avgMacros).forEach(key => {
      avgMacros[key] = (avgMacros[key] / total * 100).toFixed(1);
    });

    setMetrics({
      averageProteinCost: avgProteinCost,
      averageCalorieCost: avgCalorieCost,
      mostEfficientProtein: bestProtein,
      mostEfficientCalories: bestCalories,
      bestNutrientDensity: bestDensity,
      averageCostPer100g: avgCost,
      topProteinFoods,
      topCalorieFoods,
      avgMacros,
    });
  };

  // Bar chart data for protein efficiency
  const proteinEfficiencyData = {
    labels: metrics.topProteinFoods?.map(food => food.name) || [],
    datasets: [
      {
        label: 'Protein per Dollar (g/$)',
        data: metrics.topProteinFoods?.map(food => food.protein_per_dollar) || [],
        backgroundColor: 'rgba(49, 130, 206, 0.7)',
        borderColor: 'rgba(49, 130, 206, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Protein-Efficient Foods',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Radar chart data for macronutrient balance
  const macroBalanceData = {
    labels: ['Protein', 'Carbohydrates', 'Fats', 'Fiber'],
    datasets: [
      {
        label: 'Average Macronutrient Distribution (%)',
        data: [
          metrics.avgMacros?.protein || 0,
          metrics.avgMacros?.carbs || 0,
          metrics.avgMacros?.fats || 0,
          metrics.avgMacros?.fiber || 0,
        ],
        backgroundColor: 'rgba(72, 187, 120, 0.2)',
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(72, 187, 120, 1)',
      },
    ],
  };

  // Radar chart options
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Macronutrient Balance',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 50,
      },
    },
  };

  const StatCard = ({ label, value, helpText, tooltip }) => (
    <Card>
      <CardBody>
        <Stat>
          <StatLabel>
            <HStack spacing={2}>
              <Text>{label}</Text>
              <Tooltip label={tooltip}>
                <InfoIcon boxSize={3} color="gray.500" />
              </Tooltip>
            </HStack>
          </StatLabel>
          <StatNumber>{value}</StatNumber>
          <StatHelpText>{helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );

  return (
    <Box p={4}>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Nutrition & Cost Analytics</Heading>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          w="200px"
        >
          <option value="all">All Time</option>
          <option value="month">Past Month</option>
          <option value="week">Past Week</option>
        </Select>
      </HStack>

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={6}
        mb={8}
      >
        <StatCard
          label="Average Protein Cost"
          value={`${metrics.averageProteinCost.toFixed(1)}g/$`}
          helpText="Grams of protein per dollar spent"
          tooltip="Higher is better - shows how much protein you get per dollar"
        />
        
        <StatCard
          label="Average Calorie Cost"
          value={`${metrics.averageCalorieCost.toFixed(1)}cal/$`}
          helpText="Calories per dollar spent"
          tooltip="Higher means more energy per dollar spent"
        />

        <StatCard
          label="Best Protein Value"
          value={metrics.mostEfficientProtein.name}
          helpText={`${metrics.mostEfficientProtein.value.toFixed(1)}g protein/$`}
          tooltip="Food item that provides the most protein per dollar"
        />

        <StatCard
          label="Best Calorie Value"
          value={metrics.mostEfficientCalories.name}
          helpText={`${metrics.mostEfficientCalories.value.toFixed(1)}cal/$`}
          tooltip="Food item that provides the most calories per dollar"
        />

        <StatCard
          label="Most Nutrient Dense"
          value={metrics.bestNutrientDensity.name}
          helpText={`${metrics.bestNutrientDensity.value.toFixed(2)} score`}
          tooltip="Highest ratio of protein and fiber to calories"
        />

        <StatCard
          label="Average Cost"
          value={`$${metrics.averageCostPer100g.toFixed(2)}`}
          helpText="Per 100g serving"
          tooltip="Average cost across all food items"
        />
      </Grid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Card>
          <CardBody>
            <Box height="400px">
              <Bar data={proteinEfficiencyData} options={barOptions} />
            </Box>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Box height="400px">
              <Radar data={macroBalanceData} options={radarOptions} />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Analytics; 