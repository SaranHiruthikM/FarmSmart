import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, Award, MessageSquare, TrendingUp, User, Calendar, CheckCircle } from "lucide-react";
import authService from "../services/auth.service";
import mockReviewService from "../services/review.mock";

const ReviewsAndTrust = () => {
    const user = authService.getCurrentUser();
    const isFarmer = user?.role?.toLowerCase() === "farmer";
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        // In this mock, we assume the user's ID is "1" if they are a farmer for display purposes
        // or we just show all reviews relative to the role.
        const userId = isFarmer ? "1" : user?.id;
        const userReviews = mockReviewService.getReviewsByUserId(userId || "1");
        setReviews(userReviews);
        setAvgRating(mockReviewService.getAverageRating(userId || "1"));
    }, [isFarmer, user?.id]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-text-dark tracking-tight leading-none mb-2">Ratings, Reviews & Trust</h1>
                <p className="text-secondary font-bold uppercase tracking-widest text-xs">
                    {isFarmer ? "Manage your reputation and seller credentials" : "Track the feedback you've shared with the community"}
                </p>
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white rounded-[2.5rem] border-2 border-neutral-light shadow-sm overflow-hidden">
                <div className="md:flex">
                    <div className="p-8 md:p-12 flex-1 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                                {user?.fullName?.[0] || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-dark">{user?.fullName || "Mock User"}</h2>
                                <p className="text-accent font-medium uppercase tracking-widest text-xs">{user?.role || "FARMER"}</p>
                                <div className="flex gap-2 mt-2">
                                    <div className="flex items-center bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                                        <CheckCircle className="w-3 h-3 mr-1.5" /> ID Verified
                                    </div>
                                    {isFarmer && avgRating >= 4.0 && (
                                        <div className="flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                            <Award className="w-3 h-3 mr-1.5" /> Top Rated
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-light">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest">Global Rating</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-text-dark">{avgRating}</span>
                                    <div className="flex text-primary">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-primary" : "text-neutral-light"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest">Total Reviews</p>
                                <p className="text-3xl font-black text-text-dark">{reviews.length}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest">Trust Score</p>
                                <p className="text-3xl font-black text-primary">98%</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-neutral-light/30 p-8 md:p-12 w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-light flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="font-black text-text-dark uppercase tracking-tight italic">Verified Seller Status</h3>
                        <p className="text-xs text-accent font-medium leading-relaxed">Your profile meets all FarmSmart security standards for transparent trading.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-text-dark tracking-tight italic flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-accent" /> Recent Feedback
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-white p-6 rounded-3xl border-2 border-neutral-light shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-neutral-light rounded-2xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-colors">
                                                {review.reviewerName[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-dark flex items-center gap-2">
                                                    {review.reviewerName}
                                                    <span className="text-[9px] bg-neutral-light text-accent px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">{review.reviewerRole}</span>
                                                </h4>
                                                <p className="text-xs text-accent font-medium">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-primary">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary" : "text-neutral-light"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-text-dark font-medium leading-relaxed italic text-sm">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-neutral-light/20 p-12 rounded-[2.5rem] border-2 border-dashed border-neutral-light text-center">
                                <p className="text-accent font-bold italic">No feedback received yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Stats & Insights */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-xl shadow-primary/20">
                        <TrendingUp className="absolute top-0 right-0 w-32 h-32 text-white/10 -mr-12 -mt-12" />
                        <h3 className="text-xl font-black tracking-tight leading-snug">Review Insights</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/60 text-xs font-black uppercase tracking-widest">Quality score</span>
                                <span className="font-bold">4.9 / 5</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/60 text-xs font-black uppercase tracking-widest">Delivery time</span>
                                <span className="font-bold">Fast</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-white/60 text-xs font-black uppercase tracking-widest">Recommended</span>
                                <span className="text-2xl font-black font-sans">100%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-neutral-light shadow-sm space-y-6">
                        <h3 className="font-black text-text-dark uppercase tracking-widest text-xs flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" /> Profile Maturity
                        </h3>
                        <div className="space-y-4">
                            <div className="w-full bg-neutral-light h-3 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[85%] rounded-full shadow-lg shadow-primary/30" />
                            </div>
                            <p className="text-xs text-accent font-medium leading-relaxed">
                                You are <span className="text-primary font-black uppercase">Gold Tier</span>. Continue maintaining high ratings to unlock faster payment settlements!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsAndTrust;
