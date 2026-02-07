import api from "./api";

const transformReview = (review) => ({
    id: review._id,
    reviewerName: review.reviewerId?.fullName || "Anonymous",
    reviewerRole: review.reviewerId?.role || "user",
    rating: review.rating,
    comment: review.comment,
    date: review.createdAt
});

const ReviewService = {
  // Add a new review
  addReview: async (reviewData) => {
    // reviewData: { orderId, rating, comment }
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  // Get reviews for current user (My Reputation)
  getMyReputation: async () => {
    const response = await api.get("/reviews/my");
    return response.data.map(transformReview);
  },

  // Get reviews for a specific user (Public Profile)
  getReviewsByUserId: async (userId) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data.map(transformReview);
  },

  // Calculate average locally if backend doesn't provide it (Helper)
  calculateAverage: (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }
};

export default ReviewService;
