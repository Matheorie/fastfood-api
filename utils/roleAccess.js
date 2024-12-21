module.exports = {
  getUserRestaurantId: async (user) => {
    // Si pas d'utilisateur (public) : on retourne null pour signifier "pas de restriction user"
    if (!user) {
      return null;
    }

    if (user.role === 'ADMIN') {
      return null;
    }

    if (user.role === 'GERANT') {
      // On suppose que le gérant a un restaurantGere
      const restaurantGere = await user.getRestaurantGere();
      return restaurantGere ? restaurantGere.id : null;
    }

    if (user.role === 'EMPLOYE') {
      return user.idRestaurant || null;
    }

    // CLIENT ou autre
    return null;
  }
};
