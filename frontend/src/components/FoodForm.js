import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import HealthIndicators from './HealthIndicators';

const FoodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    serving_size: 100,
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    price: 0,
    store: '',
  });

  useEffect(() => {
    if (isEditing) {
      fetchFoodItem();
    }
  }, [id]);

  const fetchFoodItem = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/food-items/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching food item',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:8000/food-items/${id}`, formData);
        toast({
          title: 'Food item updated',
          status: 'success',
          duration: 2000,
        });
      } else {
        await axios.post('http://localhost:8000/food-items', formData);
        toast({
          title: 'Food item added',
          status: 'success',
          duration: 2000,
        });
      }
      navigate('/');
    } catch (error) {
      toast({
        title: `Error ${isEditing ? 'updating' : 'adding'} food item`,
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const FormNumberInput = ({ label, name, value, required = false }) => (
    <FormControl isRequired={required}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <NumberInput
        size="sm"
        value={value}
        onChange={(value) => handleNumberChange(name, value)}
        min={0}
        precision={name === 'price' ? 2 : 1}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );

  const FormTextInput = ({ label, name, value, placeholder, required = false }) => (
    <FormControl isRequired={required}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <Input
        size="sm"
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </FormControl>
  );

  return (
    <Box maxW="900px" mx="auto">
      <Heading size="md" mb={4}>{isEditing ? 'Edit Food Item' : 'Add New Food Item'}</Heading>
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={2} spacing={6}>
          <Box>
            <FormTextInput
              label="Name"
              name="name"
              value={formData.name}
              placeholder="e.g., Chicken Breast"
              required
            />
            <FormTextInput
              label="Brand"
              name="brand"
              value={formData.brand}
              placeholder="e.g., Tyson"
            />
            <FormNumberInput
              label="Serving Size (g)"
              name="serving_size"
              value={formData.serving_size}
              required
            />
            <FormNumberInput
              label="Calories"
              name="calories"
              value={formData.calories}
              required
            />
            <FormNumberInput
              label="Price ($)"
              name="price"
              value={formData.price}
              required
            />
          </Box>
          <Box>
            <FormNumberInput
              label="Protein (g)"
              name="protein"
              value={formData.protein}
              required
            />
            <FormNumberInput
              label="Carbohydrates (g)"
              name="carbohydrates"
              value={formData.carbohydrates}
              required
            />
            <FormNumberInput
              label="Fats (g)"
              name="fats"
              value={formData.fats}
              required
            />
            <FormNumberInput
              label="Fiber (g)"
              name="fiber"
              value={formData.fiber}
            />
            <FormNumberInput
              label="Sugar (g)"
              name="sugar"
              value={formData.sugar}
            />
            <FormTextInput
              label="Store"
              name="store"
              value={formData.store}
              placeholder="e.g., Walmart"
            />
          </Box>
        </SimpleGrid>

        <Button
          mt={6}
          colorScheme="blue"
          type="submit"
          isLoading={isSubmitting}
        >
          {isEditing ? 'Update Food Item' : 'Add Food Item'}
        </Button>
      </form>

      {/* Show health indicators when editing or when form has data */}
      {(isEditing || formData.name) && (
        <Box mt={8}>
          <HealthIndicators food={formData} />
        </Box>
      )}
    </Box>
  );
};

export default FoodForm; 