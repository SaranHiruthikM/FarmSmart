import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import reviewService from '../../services/review.service';

const ReviewModal = ({ isOpen, onClose, targetId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewService.addReview({
                targetId,
                rating,
                comment,
                // No orderId for direct reviews
            });
            onSuccess();
            onClose();
            setRating(0);
            setComment('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-neutral-light flex justify-between items-center bg-gray-50">
                        <h3 className="text-xl font-black text-text-dark">Write a Review</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-accent" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3 text-center">
                            <label className="block text-sm font-bold text-accent uppercase tracking-widest">
                                Rate your experience
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-10 h-10 ${
                                                star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-primary h-5">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent!"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-text-dark">
                                Review (Optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Reflect on your experience with this farmer..."
                                className="w-full h-32 p-4 bg-neutral-light/30 border border-neutral-light rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
