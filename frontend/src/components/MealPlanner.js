import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  useToast,
  Badge,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
} from '@chakra-ui/react';
import { Select } from 'chakra-react-select';
import axios from 'axios';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

// Recommended Daily Values (based on 2000 calorie diet)
const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,  // g
  carbs: 275,   // g
  fats: 78,     // g
};

const MacroDonut = ({ value, target, label, color }) => {
  const percentage = Math.min(Math.round((value / target) * 100), 100);
  
  return (
    <Tooltip label={`${value} of ${target} ${label === 'Calories' ? '' : 'g'} (${percentage}%)`}>
      <Box textAlign="center">
        <CircularProgress
          value={percentage}
          color={color}
          size="120px"
          thickness="8px"
        >
          <CircularProgressLabel>
            {percentage}%
          </CircularProgressLabel>
        </CircularProgress>
        <Text mt={2} fontSize="sm" fontWeight="medium">{label}</Text>
      </Box>
    </Tooltip>
  );
};

const MacroSummary = ({ meals }) => {
  const totals = meals.reduce((acc, meal) => {
    acc.calories += meal.calories * meal.quantity;
    acc.protein += meal.protein * meal.quantity;
    acc.carbs += meal.carbohydrates * meal.quantity;
    acc.fats += meal.fats * meal.quantity;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" bg="white">
      <Heading size="sm" mb={6}>Daily Progress</Heading>
      <Grid templateColumns="repeat(4, 1fr)" gap={8}>
        <MacroDonut
          value={Math.round(totals.calories)}
          target={DAILY_TARGETS.calories}
          label="Calories"
          color="blue.400"
        />
        <MacroDonut
          value={Math.round(totals.protein)}
          target={DAILY_TARGETS.protein}
          label="Protein"
          color="red.400"
        />
        <MacroDonut
          value={Math.round(totals.carbs)}
          target={DAILY_TARGETS.carbs}
          label="Carbs"
          color="green.400"
        />
        <MacroDonut
          value={Math.round(totals.fats)}
          target={DAILY_TARGETS.fats}
          label="Fats"
          color="yellow.400"
        />
      </Grid>
      <Box mt={6}>
        <Text fontSize="sm" color="gray.600">
          Based on a 2000 calorie diet with recommended macro distribution:
          {' '}
          <Badge colorScheme="red">25% Protein</Badge>
          {' '}
          <Badge colorScheme="green">55% Carbs</Badge>
          {' '}
          <Badge colorScheme="yellow">20% Fats</Badge>
        </Text>
      </Box>
    </Box>
  );
};

const MealSection = ({ mealType, foods, meals, onAddFood, onRemoveFood }) => {
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);  // Default to 100g

  const mealFoods = meals.filter(meal => meal.meal_type === mealType);
  
  const foodOptions = foods.map(food => ({
    value: food.id,
    label: food.brand && food.brand !== 'Generic' ? `${food.name} (${food.brand})` : food.name,
    food: food
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.375rem',
      minHeight: '40px',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 2,
    }),
    input: (provided) => ({
      ...provided,
      color: 'inherit',
      margin: '0px',
      padding: '0px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--chakra-colors-teal-500)' : 
                      state.isFocused ? 'var(--chakra-colors-gray-100)' : 'transparent',
      color: state.isSelected ? 'white' : 'inherit',
    }),
  };

  const handleAdd = () => {
    if (selectedFood) {
      const servingRatio = quantity / 100;  // since nutritional values are per 100g
      onAddFood({ 
        ...selectedFood.food, 
        meal_type: mealType, 
        quantity: servingRatio,
        display_quantity: quantity  // Store the actual grams for display
      });
      setSelectedFood(null);
      setQuantity(100);
    }
  };

  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="white">
      <Heading size="sm" mb={4}>{mealType}</Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Box flex="1">
            <Select
              placeholder="Search foods..."
              value={selectedFood}
              onChange={setSelectedFood}
              options={foodOptions}
              isClearable
              isSearchable={true}
              openMenuOnFocus={true}
              chakraStyles={customStyles}
              noOptionsMessage={() => "No foods found"}
              filterOption={(option, inputValue) => {
                if (!inputValue) return true;
                const label = option.label.toLowerCase();
                const search = inputValue.toLowerCase();
                return label.includes(search);
              }}
            />
          </Box>
          <NumberInput
            value={quantity}
            onChange={(value) => setQuantity(parseFloat(value))}
            min={1}
            max={1000}
            step={10}
            w="150px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">grams</Text>
          <Button colorScheme="teal" onClick={handleAdd} isDisabled={!selectedFood}>
            Add
          </Button>
        </HStack>
        
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Food</Th>
              <Th>Amount</Th>
              <Th>Calories</Th>
              <Th>Protein</Th>
              <Th>Carbs</Th>
              <Th>Fats</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mealFoods.map((food, index) => (
              <Tr key={index}>
                <Td>{food.name}</Td>
                <Td>{food.display_quantity}g</Td>
                <Td>{Math.round(food.calories * food.quantity)}</Td>
                <Td>{Math.round(food.protein * food.quantity)}g</Td>
                <Td>{Math.round(food.carbohydrates * food.quantity)}g</Td>
                <Td>{Math.round(food.fats * food.quantity)}g</Td>
                <Td>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => onRemoveFood(food)}
                  >
                    Remove
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

const MealPlanner = () => {
  const [foods, setFoods] = useState([]);
  const [meals, setMeals] = useState([]);
  const [planName, setPlanName] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:8000/food-items');
        setFoods(response.data);
      } catch (error) {
        console.error('Error fetching foods:', error);
        toast({
          title: 'Error fetching foods',
          status: 'error',
          duration: 3000,
        });
      }
    };

    fetchFoods();
  }, []);

  const handleAddFood = (food) => {
    setMeals([...meals, food]);
  };

  const handleRemoveFood = (foodToRemove) => {
    setMeals(meals.filter(food => food !== foodToRemove));
  };

  const handleSaveMealPlan = async () => {
    if (!planName) {
      toast({
        title: 'Please enter a meal plan name',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      const mealPlanData = {
        name: planName,
        foods: meals.map(meal => ({
          food_id: meal.id,
          quantity: meal.quantity,
          meal_type: meal.meal_type,
        })),
      };

      await axios.post('http://localhost:8000/meal-plans', mealPlanData);
      
      toast({
        title: 'Meal plan saved successfully',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setPlanName('');
      setMeals([]);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error saving meal plan',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Meal Planner</Heading>
        <HStack spacing={4} mb={4}>
          <Input
            placeholder="Enter meal plan name"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleSaveMealPlan}>
            Save Meal Plan
          </Button>
        </HStack>
      </Box>

      <MacroSummary meals={meals} />

      {MEAL_TYPES.map(mealType => (
        <MealSection
          key={mealType}
          mealType={mealType}
          foods={foods}
          meals={meals}
          onAddFood={handleAddFood}
          onRemoveFood={handleRemoveFood}
        />
      ))}
    </VStack>
  );
};

export default MealPlanner; 