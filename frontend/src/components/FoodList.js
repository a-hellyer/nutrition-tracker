import React, { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  HStack,
  Text,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('calories_per_dollar');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:8000/food-items');
      setFoods(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error fetching foods',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/food-items/${id}`);
      toast({
        title: 'Food item deleted',
        status: 'success',
        duration: 2000,
      });
      fetchFoods();
    } catch (error) {
      toast({
        title: 'Error deleting food item',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const sortedFoods = [...foods].sort((a, b) => {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

  if (loading) {
    return (
      <Center h="200px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <HStack spacing={4} mb={6}>
        <Select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          w="200px"
        >
          <option value="calories_per_dollar">Calories per Dollar</option>
          <option value="protein_per_dollar">Protein per Dollar</option>
          <option value="price">Price</option>
          <option value="calories">Calories</option>
          <option value="protein">Protein</option>
          <option value="sugar">Sugar</option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          w="150px"
        >
          <option value="desc">Highest First</option>
          <option value="asc">Lowest First</option>
        </Select>
      </HStack>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th fontSize="xs">Name</Th>
            <Th fontSize="xs">Brand</Th>
            <Th isNumeric fontSize="xs">Serving (g)</Th>
            <Th isNumeric fontSize="xs">Calories</Th>
            <Th isNumeric fontSize="xs">Protein (g)</Th>
            <Th isNumeric fontSize="xs">Sugar (g)</Th>
            <Th isNumeric fontSize="xs">Price ($)</Th>
            <Th isNumeric fontSize="xs">Cal/$</Th>
            <Th isNumeric fontSize="xs">Protein/$</Th>
            <Th fontSize="xs">Actions</Th>
          </Tr>
        </Thead>
        <Tbody fontSize="sm">
          {sortedFoods.map((food) => (
            <Tr key={food.id}>
              <Td fontSize="xs">{food.name}</Td>
              <Td fontSize="xs">{food.brand || '-'}</Td>
              <Td isNumeric fontSize="xs">{food.serving_size}</Td>
              <Td isNumeric fontSize="xs">{food.calories.toFixed(1)}</Td>
              <Td isNumeric fontSize="xs">{food.protein.toFixed(1)}</Td>
              <Td isNumeric fontSize="xs">{food.sugar ? food.sugar.toFixed(1) : '-'}</Td>
              <Td isNumeric fontSize="xs">${food.price.toFixed(2)}</Td>
              <Td isNumeric fontSize="xs">{food.calories_per_dollar.toFixed(1)}</Td>
              <Td isNumeric fontSize="xs">{food.protein_per_dollar.toFixed(1)}</Td>
              <Td>
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    onClick={() => {
                      navigate(`/edit/${food.id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <EditIcon boxSize={3} />
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => handleDelete(food.id)}
                  >
                    <DeleteIcon boxSize={3} />
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      
      {foods.length === 0 && (
        <Text mt={4} textAlign="center" color="gray.500">
          No food items found. Add some to get started!
        </Text>
      )}
    </>
  );
};

export default FoodList; 