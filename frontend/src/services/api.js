import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject({ message });
  }
);

// Food items related API calls
export const foodService = {
  getAllFoods: () => apiClient.get('/food-items'),
  getFoodById: (id) => apiClient.get(`/food-items/${id}`),
  createFood: (data) => apiClient.post('/food-items', data),
  updateFood: (id, data) => apiClient.put(`/food-items/${id}`, data),
  deleteFood: (id) => apiClient.delete(`/food-items/${id}`),
};

// Meal plans related API calls
export const mealPlanService = {
  getAllMealPlans: () => apiClient.get('/meal-plans'),
  getMealPlanById: (id) => apiClient.get(`/meal-plans/${id}`),
  createMealPlan: (data) => apiClient.post('/meal-plans', data),
  deleteMealPlan: (id) => apiClient.delete(`/meal-plans/${id}`),
};

// Analytics related API calls
export const analyticsService = {
  getFoodMetrics: () => apiClient.get('/food-items/metrics'),
  getNutritionStats: () => apiClient.get('/food-items/stats'),
};

export default {
  food: foodService,
  mealPlan: mealPlanService,
  analytics: analyticsService,
}; 