export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getProductSort = (sort) => {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating":
    case "rating_desc":
      return { averageRating: -1, numReviews: -1 };
    case "popular":
    case "popularity":
      return { sold: -1, views: -1, averageRating: -1 };
    case "oldest":
      return { createdAt: 1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

export const buildProductFilters = (query) => {
  const filters = { isActive: true };

  if (query.keyword || query.search || query.q) {
    const keyword = query.keyword || query.search || query.q;
    filters.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
    ];
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  if (query.minRating) {
    filters.averageRating = { $gte: Number(query.minRating) };
  }

  if (query.inStock === "true") {
    filters.stock = { $gt: 0 };
  }

  return filters;
};
