import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, SimpleGrid, HStack, Wrap, WrapItem } from '@chakra-ui/react';
import { Bubble } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register ChartJS components
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  zoomPlugin
);

const FOOD_GROUPS = {
  proteins: {
    name: 'Proteins',
    foods: ['Chicken breast', 'Salmon', 'Ground beef', 'Tofu', 'Pork chop', 'Tuna', 'Ribeye steak', 'Turkey breast', 'Lamb chop', 'Duck breast', 'Bison', 'Chicken thigh', 'Pork tenderloin', 'Egg'],
    color: '#F56565'
  },
  dairy: {
    name: 'Dairy',
    foods: ['Greek yogurt', 'Milk', 'Cheese', 'Cottage cheese'],
    color: '#4299E1'
  },
  grains: {
    name: 'Grains',
    foods: ['White rice', 'Oatmeal', 'Bread', 'Quinoa', 'Pasta'],
    color: '#ECC94B'
  },
  vegetables: {
    name: 'Vegetables',
    foods: ['Broccoli', 'Sweet potato', 'Carrots', 'Bell pepper', 'Avocado', 'Cauliflower', 'Kale'],
    color: '#48BB78'
  },
  fruits: {
    name: 'Fruits',
    foods: ['Banana', 'Apple', 'Orange', 'Blueberries', 'Strawberries'],
    color: '#9F7AEA'
  },
  legumes: {
    name: 'Legumes',
    foods: ['Black beans', 'Chickpeas', 'Lentils'],
    color: '#ED8936'
  },
  nuts: {
    name: 'Nuts & Seeds',
    foods: ['Almonds', 'Peanut butter', 'Chia seeds'],
    color: '#A0522D'
  },
  other: {
    name: 'Other',
    foods: ['Olive oil', 'Honey'],
    color: '#A0AEC0'
  }
};

const CalorieEfficiencyChart = () => {
  const [foodData, setFoodData] = useState([]);
  const [activeGroups, setActiveGroups] = useState(Object.keys(FOOD_GROUPS));
  const chartRef = React.useRef(null);

  const resetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/food-items');
        setFoodData(response.data);
      } catch (error) {
        console.error('Error fetching food data:', error);
      }
    };
    fetchData();
  }, []);

  const toggleFoodGroup = (group) => {
    setActiveGroups(prev => {
      if (prev.includes(group)) {
        return prev.filter(g => g !== group);
      }
      return [...prev, group];
    });
  };

  const getFoodGroup = (foodName) => {
    return Object.entries(FOOD_GROUPS).find(([_, group]) => 
      group.foods.some(food => foodName.toLowerCase().includes(food.toLowerCase()))
    )?.[0] || 'other';
  };

  const filteredFoodData = foodData.filter(food => 
    activeGroups.includes(getFoodGroup(food.name))
  );

  // Prepare data for the bubble plot
  const data = {
    datasets: [
      {
        label: 'Foods',
        data: filteredFoodData.map(food => ({
          x: food.calories, // Calories per 100g
          y: food.price, // Price per 100g
          r: Math.max(8, food.protein * 0.7), // Minimum bubble size of 8, then scales with protein
          label: food.name, // For tooltip
          protein: food.protein,
          carbs: food.carbohydrates,
          fats: food.fats,
          price: food.price,
          calories: food.calories
        })),
        backgroundColor: filteredFoodData.map(food => {
          const group = FOOD_GROUPS[getFoodGroup(food.name)];
          return group ? group.color : '#A0AEC0';
        }),
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Calories per 100g',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: 0,
      },
      y: {
        title: {
          display: true,
          text: 'Price per 100g ($)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        min: 0,
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
      },
      datalabels: {
        color: '#333',
        anchor: 'center',
        align: 'right',
        offset: 8,
        font: {
          size: 11,
          weight: 'bold'
        },
        formatter: (value) => {
          return value.label;
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw;
            return [
              `${point.label}`,
              `Calories/100g: ${point.x.toFixed(1)}`,
              `$/100g: $${point.y.toFixed(2)}`,
              `Protein: ${point.protein}g/100g`,
              `Carbs: ${point.carbs}g/100g`,
              `Fats: ${point.fats}g/100g`
            ];
          }
        }
      },
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Box p={2}>
      <Heading size="md" mb={2}>Food Cost vs. Energy Density Chart</Heading>
      <HStack spacing={2} mb={2}>
        <Button onClick={resetZoom} size="sm" colorScheme="blue">Reset Zoom</Button>
        <Button 
          size="sm" 
          colorScheme={activeGroups.length === Object.keys(FOOD_GROUPS).length ? "green" : "gray"}
          onClick={() => setActiveGroups(Object.keys(FOOD_GROUPS))}
        >
          Show All
        </Button>
        <Button 
          size="sm" 
          colorScheme={activeGroups.length === 0 ? "red" : "gray"}
          onClick={() => setActiveGroups([])}
        >
          Hide All
        </Button>
      </HStack>
      <Wrap spacing={2} mb={2}>
        {Object.entries(FOOD_GROUPS).map(([key, group]) => (
          <WrapItem key={key}>
            <Button
              size="sm"
              variant={activeGroups.includes(key) ? "solid" : "outline"}
              bg={activeGroups.includes(key) ? group.color : 'transparent'}
              color={activeGroups.includes(key) ? 'white' : group.color}
              borderColor={group.color}
              _hover={{
                bg: activeGroups.includes(key) ? group.color : `${group.color}20`
              }}
              onClick={() => toggleFoodGroup(key)}
            >
              {group.name}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
      <Box height="calc(100vh - 280px)" minH="400px">
        <Bubble ref={chartRef} data={data} options={options} />
      </Box>
      <Box mt={2} fontSize="xs" color="gray.600">
        <strong>How to read this chart:</strong>
        <SimpleGrid columns={2} spacing={2}>
          <Box>
            <ul>
              <li>X-axis: Calories per 100g (energy density)</li>
              <li>Y-axis: Price per 100g (lower is more cost-efficient)</li>
              <li>Bubble size: Protein content (larger = more protein)</li>
              <li>Bottom-left: Low calorie, low cost foods</li>
              <li>Top-right: High calorie, high cost foods</li>
            </ul>
          </Box>
          <Box>
            <ul>
              <li>Colors indicate food groups (use filters above)</li>
              <li>Larger bubbles = higher protein content</li>
              <li>Use mouse wheel or pinch to zoom</li>
              <li>Click and drag to pan</li>
              <li>Hover over bubbles to see detailed information</li>
            </ul>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default CalorieEfficiencyChart; 