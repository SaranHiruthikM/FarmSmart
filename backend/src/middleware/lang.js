const MESSAGES = {
  English: {
    'auth.unauthorized': 'Please log in.',
    'auth.forbidden': 'You do not have permission to perform this action.',
    'auth.invalid_credentials': 'Invalid credentials.',
    'auth.not_verified': 'Account not verified. Please verify OTP.',
    'auth.otp_invalid': 'Invalid or expired OTP.',
    'auth.register_success': 'Registration successful. OTP sent to email.',
    'auth.verified': 'Account verified successfully.',
    'validation.bad_request': 'Invalid request.'
  },
  Tamil: {
    'auth.unauthorized': 'தயவுசெய்து உள்நுழையவும்.',
    'auth.forbidden': 'இதை செய்ய உங்களுக்கு அனுமதி இல்லை.',
    'auth.invalid_credentials': 'தவறான விவரங்கள்.',
    'auth.not_verified': 'கணக்கு சரிபார்க்கப்படவில்லை. OTP சரிபார்க்கவும்.',
    'auth.otp_invalid': 'தவறான அல்லது காலாவதியான OTP.',
    'auth.register_success': 'பதிவு வெற்றிகரமாக முடிந்தது. OTP மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.',
    'auth.verified': 'கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது.',
    'validation.bad_request': 'தவறான கோரிக்கை.'
  },
  Hindi: {
    'auth.unauthorized': 'कृपया लॉग इन करें।',
    'auth.forbidden': 'आपको यह करने की अनुमति नहीं है।',
    'auth.invalid_credentials': 'गलत विवरण।',
    'auth.not_verified': 'खाता सत्यापित नहीं है। कृपया OTP सत्यापित करें।',
    'auth.otp_invalid': 'गलत या समाप्त OTP।',
    'auth.register_success': 'रजिस्ट्रेशन सफल। OTP ईमेल पर भेजा गया।',
    'auth.verified': 'खाता सफलतापूर्वक सत्यापित।',
    'validation.bad_request': 'अमान्य अनुरोध।'
  }
};

function normalizeLanguage(headerValue = '') {
  // Accept-Language examples: "ta-IN,ta;q=0.9,en;q=0.8" or custom values
  const raw = headerValue.split(',')[0]?.trim().toLowerCase();
  if (!raw) return 'English';
  if (raw.startsWith('ta')) return 'Tamil';
  if (raw.startsWith('hi')) return 'Hindi';
  if (raw.startsWith('en')) return 'English';
  // Allow frontend to send exact words like "Tamil"
  if (raw.includes('tamil')) return 'Tamil';
  if (raw.includes('hindi')) return 'Hindi';
  return 'English';
}

export function languageMiddleware(req, res, next) {
  const lang = normalizeLanguage(req.header('Accept-Language') || req.header('accept-language') || '');
  req.lang = lang;
  req.t = (key) => MESSAGES[lang]?.[key] || MESSAGES.English[key] || key;
  return next();
}
