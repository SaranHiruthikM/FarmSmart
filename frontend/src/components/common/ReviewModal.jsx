import React, { useState } from 'react';
import { X, Star, Loader2, MessageSquarePlus } from 'lucide-react';
import reviewService from '../../services/review.service';
import PrimaryButton from './PrimaryButton';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/40 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-nature-50 to-nature-100/50 p-6 border-b border-nature-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-nature-100 text-nature-600">
                            <MessageSquarePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-nature-900">Write a Review</h3>
                            <p className="text-xs text-nature-500 font-medium">Share your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/60 rounded-full text-nature-400 hover:text-nature-600 transition-colors backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 text-center">
                        <label className="block text-xs font-bold text-nature-500 uppercase tracking-widest">
                            Tap to Rate
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
                                                ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                                                : 'text-nature-200 fill-nature-50'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="h-6">
                            {(hoverRating || rating) > 0 && (
                                <span className="px-3 py-1 rounded-full bg-nature-100 text-nature-700 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2">
                                    {((hoverRating || rating) === 1) && "Poor"}
                                    {((hoverRating || rating) === 2) && "Fair"}
                                    {((hoverRating || rating) === 3) && "Good"}
                                    {((hoverRating || rating) === 4) && "Very Good"}
                                    {((hoverRating || rating) === 5) && "Excellent!"}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-nature-600 uppercase tracking-widest pl-1">
                            Your Feedback (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us more about the product quality and seller communication..."
                            className="w-full h-32 p-4 bg-nature-50/50 border border-nature-200 rounded-xl focus:border-nature-400 focus:ring-2 focus:ring-nature-400/20 outline-none resize-none transition-all font-medium text-nature-800 placeholder:text-nature-300"
                        />
                    </div>

                    <PrimaryButton
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 text-lg shadow-xl shadow-nature-600/20"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Publishing...
                            </span>
                        ) : (
                            'Submit Review'
                        )}
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
