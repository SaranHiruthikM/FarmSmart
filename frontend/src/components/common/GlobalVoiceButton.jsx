import React from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useVoiceNavigation from '../../hooks/useVoiceNavigation';

const GlobalVoiceButton = () => {
    const { isListening, transcript, error, startListening, stopListening } = useVoiceNavigation();
    const { t } = useTranslation();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {(isListening || transcript || error) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`mb-3 w-64 p-3 rounded-2xl shadow-xl border text-sm ${error
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-white border-primary/20 text-[#2D362E]"
                            }`}
                    >
                        {error ? (
                            <div className="flex gap-2 items-start">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                                <p className="font-medium text-sm leading-snug">
                                    {error.includes("access denied") ? t("voice.error") : error}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex h-2.5 w-2.5">
                                        {isListening && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        )}
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                        {isListening ? t("voice.listening") : t("voice.recognized")}
                                    </span>
                                </div>
                                <p className="font-semibold text-base truncate capitalize text-text-dark">
                                    {transcript || t("voice.prompt")}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={isListening ? stopListening : startListening}
                className={`relative p-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${isListening
                    ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
                    : "bg-primary text-white hover:bg-primary-dark shadow-primary/30"
                    }`}
                title={isListening ? "Stop Listening" : "Start Voice Navigation"}
            >
                <Mic className="w-6 h-6" />
                {isListening && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping"></div>
                )}
            </button>
        </div>
    );
};

export default GlobalVoiceButton;
