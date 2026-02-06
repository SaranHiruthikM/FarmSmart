// 🚧 MOCK REVIEW SERVICE — TEMPORARY FOR UI persistence
const MOCK_REVIEWS_KEY = "farmsmart_mock_reviews";

const initialReviews = [
    {
        id: "REV001",
        userId: "1", // Suresh Kumar (Farmer)
        reviewerName: "Ankit Singh",
        reviewerRole: "BUYER",
        rating: 5,
        comment: "Excellent quality basmati rice. The aroma is amazing and the delivery was prompt.",
        date: "2024-02-01"
    },
    {
        id: "REV002",
        userId: "1",
        reviewerName: "Priya Sharma",
        reviewerRole: "BUYER",
        rating: 4,
        comment: "Very good produce, but the packaging could be slightly improved.",
        date: "2024-01-25"
    }
];

const mockReviewService = {
    getReviewsByUserId: (userId) => {
        const stored = localStorage.getItem(MOCK_REVIEWS_KEY);
        let reviews = stored ? JSON.parse(stored) : initialReviews;

        // Ensure initial reviews are stored if none exist
        if (!stored) {
            localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(initialReviews));
        }

        // In this mock, we assume reviews are linked to the farmer (userId)
        return reviews.filter(r => r.userId === userId.toString());
    },

    addReview: (reviewData) => {
        const stored = localStorage.getItem(MOCK_REVIEWS_KEY);
        const reviews = stored ? JSON.parse(stored) : initialReviews;

        const newReview = {
            id: `REV${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString().split('T')[0],
            ...reviewData
        };

        const updatedReviews = [newReview, ...reviews];
        localStorage.setItem(MOCK_REVIEWS_KEY, JSON.stringify(updatedReviews));
        return newReview;
    },

    getAverageRating: (userId) => {
        const reviews = mockReviewService.getReviewsByUserId(userId);
        if (reviews.length === 0) return 0;

        const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }
};

export default mockReviewService;
