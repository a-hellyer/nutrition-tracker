import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Progress,
  Tooltip,
  HStack,
  Badge,
  Heading,
} from '@chakra-ui/react';
import { InfoIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const ProcessingLevels = {
  WHOLE: { label: 'Whole Food', color: 'green', score: 1 },
  MINIMAL: { label: 'Minimally Processed', color: 'blue', score: 2 },
  MODERATE: { label: 'Moderately Processed', color: 'yellow', score: 3 },
  HIGHLY: { label: 'Highly Processed', color: 'orange', score: 4 },
  ULTRA: { label: 'Ultra-Processed', color: 'red', score: 5 }
};

// Estimated glycemic index ranges for common food categories
const GlycemicRanges = {
  // Grains and Starches
  'White rice': { min: 65, max: 75 },
  'Brown rice': { min: 50, max: 60 },
  'Bread': { min: 70, max: 90 },
  'Oatmeal': { min: 45, max: 55 },
  'Sweet potato': { min: 50, max: 60 },
  'Pasta': { min: 45, max: 65 },
  'Quinoa': { min: 50, max: 60 },
  'Corn': { min: 55, max: 65 },
  
  // Proteins
  'Chicken': { min: 0, max: 0 },
  'Salmon': { min: 0, max: 0 },
  'Beef': { min: 0, max: 0 },
  'Tofu': { min: 15, max: 20 },
  'Pork': { min: 0, max: 0 },
  'Tuna': { min: 0, max: 0 },
  'Turkey': { min: 0, max: 0 },
  'Eggs': { min: 0, max: 0 },
  
  // Dairy
  'Milk': { min: 30, max: 40 },
  'Yogurt': { min: 35, max: 45 },
  'Cheese': { min: 0, max: 10 },
  'Ice cream': { min: 60, max: 80 },
  
  // Fruits
  'Apple': { min: 35, max: 45 },
  'Banana': { min: 50, max: 60 },
  'Orange': { min: 40, max: 50 },
  'Blueberries': { min: 40, max: 50 },
  'Strawberries': { min: 25, max: 40 },
  'Mango': { min: 50, max: 60 },
  'Grapes': { min: 45, max: 60 },
  'Pineapple': { min: 55, max: 65 },
  'Watermelon': { min: 70, max: 80 },
  
  // Vegetables
  'Broccoli': { min: 15, max: 25 },
  'Carrots': { min: 35, max: 45 },
  'Spinach': { min: 0, max: 10 },
  'Cauliflower': { min: 15, max: 25 },
  'Kale': { min: 0, max: 10 },
  'Bell pepper': { min: 15, max: 25 },
  
  // Legumes
  'Lentils': { min: 25, max: 35 },
  'Black beans': { min: 30, max: 40 },
  'Chickpeas': { min: 35, max: 45 },
  
  // Nuts and Seeds
  'Almonds': { min: 0, max: 10 },
  'Peanut butter': { min: 15, max: 25 },
  'Chia seeds': { min: 1, max: 5 },
  
  // Other
  'Honey': { min: 55, max: 65 },
  'Maple syrup': { min: 54, max: 65 },
  'Dark chocolate': { min: 20, max: 30 },
  'Olive oil': { min: 0, max: 0 }
};

const HealthIndicators = ({ foods }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  // Keep existing estimation functions but move them outside the component or memoize them
  const estimateGlycemicIndex = (foodName, food) => {
    // First try exact matches
    const matchingFood = Object.entries(GlycemicRanges).find(([key]) => 
      foodName.toLowerCase().includes(key.toLowerCase())
    );
    
    if (matchingFood) {
      const [_, range] = matchingFood;
      return (range.min + range.max) / 2;
    }
    
    // If no exact match, estimate based on macronutrients
    if (food) {
      // High protein/fat foods typically have low GI
      if (food.protein > 20 || food.fats > 20) {
        return 15;
      }
      
      // High fiber foods typically have lower GI
      if (food.fiber > 5) {
        return Math.min(40, 60 - food.fiber);
      }
      
      // High sugar foods typically have higher GI
      if (food.sugar > 10) {
        return Math.min(70, 50 + food.sugar * 0.5);
      }
      
      // Default to moderate GI for unknown foods
      return 50;
    }
    
    return null;
  };

  const calculateFiberSugarRatio = (food) => {
    if (!food.fiber || !food.sugar) return null;
    return food.fiber / (food.sugar || 1);
  };

  const estimateProcessingLevel = (food) => {
    const name = food.name.toLowerCase();
    if (name.includes('raw') || name.includes('fresh') || 
        name.includes('whole') || name.includes('natural')) {
      return ProcessingLevels.WHOLE;
    }
    if (name.includes('frozen') || name.includes('dried') || 
        name.includes('canned')) {
      return ProcessingLevels.MINIMAL;
    }
    if (name.includes('cooked') || name.includes('baked')) {
      return ProcessingLevels.MODERATE;
    }
    if (name.includes('processed') || name.includes('refined')) {
      return ProcessingLevels.HIGHLY;
    }
    return ProcessingLevels.MODERATE;
  };

  const ProgressCell = ({ value, max, color }) => (
    <Box w="100%">
      <Progress
        value={value}
        max={max}
        colorScheme={color}
        size="xs"
        borderRadius="full"
      />
      <Text fontSize="xs" color="gray.600" mt={1}>
        {value ? value.toFixed(0) : 'N/A'}
      </Text>
    </Box>
  );

  const sortedFoods = React.useMemo(() => {
    const sortedItems = [...foods];
    
    sortedItems.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'glycemic':
          aValue = estimateGlycemicIndex(a.name, a) || 0;
          bValue = estimateGlycemicIndex(b.name, b) || 0;
          break;
        case 'fiberSugar':
          aValue = calculateFiberSugarRatio(a) || 0;
          bValue = calculateFiberSugarRatio(b) || 0;
          break;
        case 'processing':
          aValue = estimateProcessingLevel(a).score;
          bValue = estimateProcessingLevel(b).score;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortedItems;
  }, [foods, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortableHeader = ({ label, tooltip, sortKey }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <Th 
        cursor="pointer" 
        onClick={() => requestSort(sortKey)}
        userSelect="none"
      >
        <Tooltip label={tooltip}>
          <HStack spacing={1}>
            <Text>{label}</Text>
            {isActive && (sortConfig.direction === 'asc' ? 
              <TriangleUpIcon boxSize={2} /> : 
              <TriangleDownIcon boxSize={2} />
            )}
            <InfoIcon boxSize={2.5} color="gray.500" />
          </HStack>
        </Tooltip>
      </Th>
    );
  };

  return (
    <Box>
      <HStack spacing={2} mb={2}>
        <Heading size="sm">Health Impact Indicators</Heading>
        <Tooltip label="These indicators help assess the nutritional quality and health impact of food items.">
          <InfoIcon boxSize={3} color="gray.500" />
        </Tooltip>
      </HStack>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <SortableHeader
              label="Food Name"
              tooltip="Sort by food name"
              sortKey="name"
            />
            <SortableHeader
              label="Glycemic Index"
              tooltip="Estimated glycemic index. Lower values (0-55) indicate less impact on blood sugar."
              sortKey="glycemic"
            />
            <SortableHeader
              label="Fiber/Sugar"
              tooltip="Ratio of fiber to sugar content. Higher values are better for blood sugar control."
              sortKey="fiberSugar"
            />
            <SortableHeader
              label="Processing"
              tooltip="Estimated level of food processing. Less processed foods are generally healthier."
              sortKey="processing"
            />
          </Tr>
        </Thead>
        <Tbody>
          {sortedFoods.map(food => {
            const glycemicIndex = estimateGlycemicIndex(food.name, food);
            const fiberSugarRatio = calculateFiberSugarRatio(food);
            const processingLevel = estimateProcessingLevel(food);
            
            return (
              <Tr key={food.id}>
                <Td fontWeight="medium">{food.name}</Td>
                <Td>
                  <ProgressCell
                    value={glycemicIndex}
                    max={100}
                    color={glycemicIndex <= 55 ? "green" : glycemicIndex <= 70 ? "yellow" : "red"}
                  />
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={fiberSugarRatio >= 1 ? "green.500" : fiberSugarRatio >= 0.5 ? "yellow.500" : "red.500"}
                    >
                      {fiberSugarRatio ? fiberSugarRatio.toFixed(2) : 'N/A'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      ({food.fiber || 0}g/{food.sugar || 0}g)
                    </Text>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={processingLevel.color} fontSize="xs">
                    {processingLevel.label}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default HealthIndicators; 