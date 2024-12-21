module.exports = {
  getUserRestaurantId: async (user) => {
    if (!user) {
      return null;
    }

    if (user.role === 'ADMIN') {
      return null;
    }

    if (user.role === 'GERANT') {
      const restaurantGere = await user.getRestaurantGere();
      return restaurantGere ? restaurantGere.id : null;
    }

    if (user.role === 'EMPLOYE') {
      return user.idRestaurant || null;
    }
    return null;
  }
};
