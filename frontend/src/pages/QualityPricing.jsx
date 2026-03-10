import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Award,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    X,
    Camera,
    Sparkles,
    ScanLine,
    Info
} from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import { useNavigate } from "react-router-dom";
import qualityService from "../services/quality.service";

const QualityPricing = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    // State
    const [basePrice, setBasePrice] = useState(100);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);

    const grades = [
        {
            id: 'A',
            name: 'Premium',
            impact: '+15%',
            multiplier: 1.15,
            color: 'green',
            description: 'Fresh, uniform size, no visible defects or bruising.',
            suitability: 'High-end retail & export'
        },
        {
            id: 'B',
            name: 'Standard',
            impact: '0%',
            multiplier: 1.0,
            color: 'yellow',
            description: 'Good quality, minor size variations or surface defects.',
            suitability: 'Local markets & general retail'
        },
        {
            id: 'C',
            name: 'Processing',
            impact: '-10%',
            multiplier: 0.9,
            color: 'red',
            description: 'Visible defects, uneven size, still safe for consumption.',
            suitability: 'Food processing & industrial use'
        }
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysisResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await qualityService.analyzeImage(image);
            setAnalysisResult(result);
        } catch (err) {
            setError("Failed to analyze image. Please try again.");
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setImage(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-neutral-light overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Award className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-text-dark tracking-tight">{t('qualityPricing.title')}</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">
                        {t('qualityPricing.subtitle')}
                    </p>
                </div>
                <PrimaryButton
                    className="relative z-10 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-2xl"
                    onClick={() => navigate("/dashboard/add-crop")}
                >
                    {t('qualityPricing.gradeListBtn')} <ArrowRight className="w-4 h-4 ml-2" />
                </PrimaryButton>
            </div>

            {/* AI Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Upload & Preview */}
                <div className="bg-white p-8 rounded-4xl border border-neutral-light shadow-sm h-full flex flex-col">
                    {!previewUrl ? (
                        <div
                            className="flex-1 border-3 border-dashed border-neutral-light rounded-3xl flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                <Camera className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-text-dark mb-2">{t('qualityPricing.uploadPhoto')}</h3>
                            <p className="text-secondary font-medium">{t('qualityPricing.clickOrDrag')}</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    ) : (
                        <div className="relative flex-1 rounded-3xl overflow-hidden bg-black/5 flex items-center justify-center group">
                            <img
                                src={previewUrl}
                                alt="Crop Preview"
                                className="max-h-[400px] w-full object-contain"
                            />

                            {/* Overlay Controls */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={resetAnalysis}
                                    className="bg-white/90 backdrop-blur p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {!analysisResult && !isAnalyzing && (
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                                    <PrimaryButton
                                        onClick={handleAnalyze}
                                        className="px-8 py-3 rounded-full shadow-xl"
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        {t('qualityPricing.analyzeQuality')}
                                    </PrimaryButton>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                                    <p className="font-bold text-lg animate-pulse">{t('qualityPricing.analyzing')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Results or Instructions */}
                <div className="flex flex-col h-full">
                    {analysisResult ? (
                        <div className="bg-gradient-to-br from-text-dark to-neutral-900 text-white p-8 rounded-4xl shadow-xl h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Result Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">{t('qualityPricing.detectedCrop')}</p>
                                    <h2 className="text-3xl font-black">{analysisResult.cropName}</h2>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-center backdrop-blur-md bg-white/10 border border-white/10`}>
                                    <p className="text-[10px] uppercase font-bold text-white/60">{t('qualityPricing.confidence')}</p>
                                    <p className="text-xl font-black text-primary">{(analysisResult.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>

                            {/* Grade Badge */}
                            <div className="flex items-center gap-6 mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shrink-0 ${analysisResult.grade === 'A' ? 'bg-green-500 text-white' :
                                    analysisResult.grade === 'B' ? 'bg-yellow-500 text-black' :
                                        'bg-red-500 text-white'
                                    }`}>
                                    {analysisResult.grade}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">
                                        {analysisResult.grade === 'A' ? t('qualityPricing.grades.A.name', { defaultValue: 'Premium Quality' }) :
                                            analysisResult.grade === 'B' ? t('qualityPricing.grades.B.name', { defaultValue: 'Standard Quality' }) :
                                                t('qualityPricing.grades.C.name', { defaultValue: 'Fair Quality' })}
                                    </h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{analysisResult.analysis}</p>
                                </div>
                            </div>

                            {/* Defects List */}
                            {analysisResult.defects && analysisResult.defects.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {t('qualityPricing.detectedIssues')}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.defects.map((defect, idx) => (
                                            <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                                {defect}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-8 border-t border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('qualityPricing.marketPrice')} (₹/kg)</label>
                                    <input
                                        type="number"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        className="bg-transparent border-b border-white/20 w-24 text-right text-xl font-black focus:outline-none focus:border-primary text-white"
                                    />
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                    <span className="font-bold text-primary">{t('qualityPricing.estSellingPrice')}</span>
                                    <span className="text-2xl font-black text-white">
                                        ₹{analysisResult.impact
                                            ? (basePrice * analysisResult.impact.multiplier).toFixed(2)
                                            : basePrice}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-neutral-50 p-8 rounded-4xl border border-neutral-light h-full flex flex-col justify-center items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <ScanLine className="w-10 h-10 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-dark mb-2">{t('qualityPricing.aiGrading')}</h3>
                                <p className="text-secondary max-w-xs mx-auto text-sm leading-relaxed">
                                    {t('qualityPricing.aiGradingDesc')}
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quality Standards Guide */}
            <div className="space-y-6 mt-12">
                <div>
                    <h2 className="text-2xl font-black text-text-dark tracking-tight uppercase">{t('qualityPricing.guideTitle')}</h2>
                    <p className="text-accent font-bold uppercase tracking-widest text-[10px] mt-1">{t('qualityPricing.guideSub')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {grades.map((grade) => (
                        <div key={grade.id} className="bg-white p-8 rounded-4xl border border-neutral-light shadow-sm flex flex-col group hover:shadow-xl transition-all h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${grade.color === 'green' ? 'bg-green-50 text-green-600' : grade.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                    {grade.id}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-text-dark text-lg">{t(`qualityPricing.grades.${grade.id}.name`, { defaultValue: grade.name })}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${grade.color === 'green' ? 'text-green-600' : grade.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>{grade.impact} {t('qualityPricing.marketPrice')}</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="p-4 bg-neutral-light/30 rounded-2xl space-y-2 border border-neutral-light/50">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-3 h-3" /> {t('qualityPricing.appearance')}
                                    </h4>
                                    <p className="text-sm font-bold text-text-dark leading-relaxed">
                                        {t(`qualityPricing.grades.${grade.id}.desc`, { defaultValue: grade.description })}
                                    </p>
                                </div>

                                <div className="p-4 border border-neutral-light rounded-2xl">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">{t('qualityPricing.bestSuitedFor')}</h4>
                                    <p className="text-sm font-black text-text-dark">{t(`qualityPricing.grades.${grade.id}.suited`, { defaultValue: grade.suitability })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Verification Tip */}
            <div className="bg-green-50 border border-green-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h4 className="font-black text-green-900 uppercase tracking-[0.2em] text-sm">{t('qualityPricing.whyGrade')}</h4>
                    <p className="text-xs text-green-700 font-bold leading-relaxed max-w-2xl whitespace-pre-wrap">{t('qualityPricing.whyGradeDesc')}</p>
                </div>
                <PrimaryButton
                    className="md:ml-auto px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl whitespace-nowrap"
                    onClick={() => navigate("/dashboard/marketplace")}
                >
                    {t('qualityPricing.viewPremium')}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default QualityPricing;
