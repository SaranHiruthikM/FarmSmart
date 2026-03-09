import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Award,
    BadgeIndianRupee,
    TrendingUp,
    CheckCircle2,
    CircleAlert,
    ArrowRight,
    Search,
    Info,
    ShieldCheck
} from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import { useNavigate } from "react-router-dom";

const QualityPricing = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [basePrice, setBasePrice] = useState(100);

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

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-neutral-light overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Award className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-text-dark tracking-tight">{t('qualityPricing.title')}</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">{t('qualityPricing.subtitle')}</p>
                </div>
                <PrimaryButton
                    className="relative z-10 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-2xl"
                    onClick={() => navigate("/dashboard/add-crop")}
                >
                    {t('qualityPricing.gradeListBtn')} <ArrowRight className="w-4 h-4 ml-2" />
                </PrimaryButton>
            </div>

            {/* Interactive Calculator */}
            <div className="bg-linear-to-br from-text-dark to-neutral-900 p-8 rounded-4xl text-white shadow-xl shadow-black/10">
                <div className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight">{t('qualityPricing.calcTitle')}</h2>
                        <p className="text-xs opacity-60 font-medium uppercase tracking-[0.2em]">{t('qualityPricing.calcSub')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('qualityPricing.enterBase')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</span>
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    className="w-full bg-white/5 border-2 border-white/10 focus:border-primary px-10 py-4 rounded-2xl outline-none text-2xl font-black transition-all"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {grades.map((grade) => (
                                <div key={grade.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-3xl font-black ${grade.color === 'green' ? 'text-green-400' : grade.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {grade.id}
                                        </span>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${grade.color === 'green' ? 'bg-green-400/20 text-green-400' : grade.color === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'}`}>
                                            {grade.impact}
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1">{t(`qualityPricing.grades.${grade.id}.name`, { defaultValue: grade.name })}</h4>
                                    <p className="text-2xl font-black text-white">₹{(basePrice * grade.multiplier).toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Standards Guide */}
            <div className="space-y-6">
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
                    <ShieldCheck className="w-12 h-12 text-primary" />
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
