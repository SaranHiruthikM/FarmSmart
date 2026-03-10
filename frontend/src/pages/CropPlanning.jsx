import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  Calendar, 
  MapPin, 
  Loader2, 
  ArrowRight, 
  Droplet, 
  BarChart4, 
  TrendingUp 
} from 'lucide-react';
import { getSeasonPlan } from '../services/planning.service';

const CropPlanning = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setPlan(null);
    
    try {
      const response = await getSeasonPlan(data);
      if (response && response.data) {
        setPlan(response.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || t('planning.errors.general'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sprout className="h-8 w-8 text-green-600" />
          {t('planning.pageTitle')}
        </h1>
        <p className="text-gray-500 mt-2">
          {t('planning.pageSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            {t('planning.sections.planMySeason')}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.form.landSize')}</label>
              <input
                type="number"
                step="0.1"
                {...register('landSize', { required: t('planning.errors.landSize'), min: 0.1 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder={t('planning.form.landSizePlaceholder')}
              />
              {errors.landSize && <span className="text-red-500 text-xs">{errors.landSize.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.form.soilType')}</label>
              <select
                {...register('soilType', { required: t('planning.errors.soilType') })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">{t('planning.form.selectSoilType')}</option>
                <option value="Loamy">Loamy</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay">Clay</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Black">Black Soil</option>
                <option value="Red">Red Soil</option>
              </select>
              {errors.soilType && <span className="text-red-500 text-xs">{errors.soilType.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.form.district')}</label>
              <input
                type="text"
                {...register('district', { required: t('planning.errors.district') })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder={t('planning.form.districtPlaceholder')}
              />
              {errors.district && <span className="text-red-500 text-xs">{errors.district.message}</span>}
            </div>
            
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t('planning.form.sowingDate')}</label>
                 <input 
                    type="date"
                    {...register('date')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                 />
                 <span className="text-xs text-gray-400">{t('planning.form.sowingDateDesc')}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('planning.form.loadingBtn')}
                </>
              ) : (
                <>
                  {t('planning.form.submitBtn')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!plan && !loading && !error && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <Sprout className="h-12 w-12 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">{t('planning.sections.noPlan')}</h3>
              <p>{t('planning.sections.noPlanDesc')}</p>
            </div>
          )}

          {plan && plan.length === 0 && (
             <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center">
                 <h3 className="font-semibold">{t('planning.sections.noCrops')}</h3>
                 <p className="mt-2 text-sm">{t('planning.sections.noCropsDesc')}</p>
             </div>
          )}

          {plan && plan.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{t('planning.sections.results')}</h3>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">{t('planning.card.topMatch', { crop: plan[0].crop })}</span>
              </div>
              
              <div className="grid gap-6">
                {plan.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`bg-white rounded-xl shadow-sm border ${index === 0 ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-200'} overflow-hidden transition-all hover:shadow-md`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {rec.crop}
                            {index === 0 && <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">{t('planning.card.bestChoice')}</span>}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {t('planning.card.duration', { days: rec.durationDays })} • {t('planning.card.harvest', { date: rec.harvestDate })}
                          </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">{t('planning.card.predictedProfit')}</p>
                            <p className="text-2xl font-bold text-green-600">₹{Math.round(rec.estimatedProfit).toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-50 my-4">
                         <div>
                             <p className="text-xs text-gray-500 mb-1">{t('planning.card.estimatedYield')}</p>
                             <p className="font-medium">{rec.estimatedYield.toLocaleString()} kg</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 mb-1">{t('planning.card.predictedPrice')}</p>
                             <p className="font-medium">₹{rec.predictedPrice} / kg</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 mb-1">{t('planning.card.totalCost')}</p>
                             <p className="font-medium text-red-500">₹{rec.totalCost.toLocaleString()}</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 mb-1">{t('planning.card.expectedRevenue')}</p>
                             <p className="font-medium text-blue-600">₹{rec.expectedRevenue.toLocaleString()}</p>
                         </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                         <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                         <div>
                             <h5 className="text-sm font-semibold text-blue-800">{t('planning.sections.aiInsight')}</h5>
                             <p className="text-sm text-blue-700 mt-1">{rec.message}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropPlanning;
