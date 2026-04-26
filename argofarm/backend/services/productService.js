import Product from "../models/Product.js";
import Review from "../models/Review.js";

export const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const rating = stats[0];
  await Product.findByIdAndUpdate(productId, {
    averageRating: rating ? Number(rating.averageRating.toFixed(1)) : 0,
    numReviews: rating ? rating.numReviews : 0,
  });
};

export const ensureProductStock = (product, quantity) => {
  if (!product || !product.isActive) throw new Error("Product is not available");
  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} item(s) left for ${product.name}`);
  }
};
