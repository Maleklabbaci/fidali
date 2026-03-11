export type Locale = 'fr' | 'ar'

export const translations = {
  fr: {
    // Navbar
    nav_features: 'Fonctionnalités',
    nav_how: 'Fonctionnement',
    nav_pricing: 'Tarifs',
    nav_login: 'Se connecter',
    nav_start: 'Commencer',

    // Hero
    hero_badge: 'Programme de fidélité digital',
    hero_title1: 'Fidélisez vos clients,',
    hero_highlight: 'simplement.',
    hero_desc: 'Remplacez les cartes papier par une solution digitale élégante. Vos clients collectent des points en scannant un QR code.',
    hero_cta1: 'Créer mon programme',
    hero_cta2: 'Je suis client',
    hero_social: 'Utilisé par',
    hero_merchants: 'commerçants',

    // Features
    feat_title: 'Tout ce dont vous avez besoin pour fidéliser',
    feat_subtitle: 'Une plateforme complète, conçue pour les commerçants.',
    feat_card: 'Carte personnalisable',
    feat_card_desc: 'Choisissez vos couleurs, votre récompense et vos règles de points.',
    feat_qr: 'QR Code intelligent',
    feat_qr_desc: 'Un simple scan suffit. Fonctionne sur tous les téléphones.',
    feat_valid: 'Validation sécurisée',
    feat_valid_desc: 'Chaque visite doit être confirmée par vous. Anti-fraude intégré.',
    feat_dash: 'Tableau de bord',
    feat_dash_desc: 'Suivez vos clients, points et récompenses en temps réel.',
    feat_notif: 'Notifications live',
    feat_notif_desc: 'Alerte instantanée quand un client scanne votre QR code.',
    feat_reward: 'Récompenses auto',
    feat_reward_desc: 'Points max atteints = récompense débloquée automatiquement.',

    // Pricing
    price_title: 'Commencez gratuitement',
    price_subtitle: 'Pas d\'engagement. Évoluez quand vous êtes prêt.',
    price_free: 'Gratuit',
    price_month: 'DA / mois',
    price_popular: 'Populaire',

    // Dashboard
    dash_clients: 'Clients',
    dash_cards: 'Cartes',
    dash_points: 'Points distribués',
    dash_rewards: 'Récompenses',
    dash_pending: 'visite(s) à valider',
    dash_validate: 'Valider',
    dash_reject: 'Refuser',
    dash_create_card: 'Nouvelle carte',
    dash_logout: 'Déconnexion',
    dash_my_cards: 'Mes cartes',
    dash_no_cards: 'Aucune carte',
    dash_create_first: 'Créez votre première carte de fidélité',
    dash_overview: 'Vue d\'ensemble',
    dash_activity: 'Activité récente',
    dash_my_clients: 'Mes clients',
    dash_quick_actions: 'Actions rapides',
    dash_upgrade: 'Upgrader',

    // Login
    login_title: 'Connectez-vous à votre espace',
    login_email: 'Email',
    login_password: 'Mot de passe',
    login_submit: 'Se connecter',
    login_loading: 'Connexion...',
    login_no_account: 'Pas encore inscrit ? Créer un compte',
    login_back: 'Retour à l\'accueil',

    // Signup
    signup_title: 'Entrez votre numéro de téléphone',
    signup_verify: 'Vérification du numéro',
    signup_complete: 'Complétez votre inscription',
    signup_success: 'Inscription réussie !',
    signup_name: 'Votre nom complet',
    signup_business: 'Nom du commerce',
    signup_sector: 'Secteur d\'activité',
    signup_phone: 'Numéro de téléphone',
    signup_send_code: 'Recevoir le code SMS',
    signup_create: 'Créer mon compte',

    // Scan
    scan_welcome: 'Rejoindre la carte de fidélité',
    scan_your_name: 'Votre nom',
    scan_phone: 'Téléphone',
    scan_join: 'Rejoindre & confirmer ma visite',
    scan_purchased: 'Avez-vous effectué un achat ?',
    scan_confirm: 'Oui, confirmer ma visite',
    scan_pending: 'En attente de validation',
    scan_validated: 'Visite confirmée !',
    scan_rejected: 'Visite non confirmée',
    scan_cooldown: 'Trop tôt !',

    // Common
    common_back: 'Retour',
    common_next: 'Suivant',
    common_save: 'Sauvegarder',
    common_cancel: 'Annuler',
    common_loading: 'Chargement...',
    common_error: 'Erreur',
    common_success: 'Succès',

    // Footer
    footer_rights: 'Tous droits réservés',
    footer_product: 'Produit',
    footer_access: 'Accès',
    footer_contact: 'Contact',
  },

  ar: {
    // Navbar
    nav_features: 'المميزات',
    nav_how: 'كيف يعمل',
    nav_pricing: 'الأسعار',
    nav_login: 'تسجيل الدخول',
    nav_start: 'ابدأ الآن',

    // Hero
    hero_badge: 'برنامج الولاء الرقمي',
    hero_title1: 'حافظ على عملائك',
    hero_highlight: 'ببساطة.',
    hero_desc: 'استبدل البطاقات الورقية بحل رقمي أنيق. يجمع عملاؤك النقاط بمسح رمز QR.',
    hero_cta1: 'إنشاء برنامجي',
    hero_cta2: 'أنا عميل',
    hero_social: 'يستخدمه',
    hero_merchants: 'تاجر',

    // Features
    feat_title: 'كل ما تحتاجه لبناء ولاء العملاء',
    feat_subtitle: 'منصة متكاملة مصممة للتجار.',
    feat_card: 'بطاقة مخصصة',
    feat_card_desc: 'اختر ألوانك ومكافأتك وقواعد النقاط.',
    feat_qr: 'رمز QR ذكي',
    feat_qr_desc: 'مسح بسيط يكفي. يعمل على جميع الهواتف.',
    feat_valid: 'تحقق آمن',
    feat_valid_desc: 'يجب أن تؤكد كل زيارة بنفسك. حماية مدمجة.',
    feat_dash: 'لوحة التحكم',
    feat_dash_desc: 'تابع عملاءك ونقاطك ومكافآتك في الوقت الفعلي.',
    feat_notif: 'إشعارات مباشرة',
    feat_notif_desc: 'تنبيه فوري عند مسح العميل لرمز QR.',
    feat_reward: 'مكافآت تلقائية',
    feat_reward_desc: 'بلوغ الحد الأقصى للنقاط = فتح المكافأة تلقائياً.',

    // Pricing
    price_title: 'ابدأ مجاناً',
    price_subtitle: 'بدون التزام. تطور عندما تكون جاهزاً.',
    price_free: 'مجاني',
    price_month: 'دج / شهر',
    price_popular: 'الأكثر شعبية',

    // Dashboard
    dash_clients: 'العملاء',
    dash_cards: 'البطاقات',
    dash_points: 'النقاط الموزعة',
    dash_rewards: 'المكافآت',
    dash_pending: 'زيارة بانتظار التحقق',
    dash_validate: 'تأكيد',
    dash_reject: 'رفض',
    dash_create_card: 'بطاقة جديدة',
    dash_logout: 'تسجيل الخروج',
    dash_my_cards: 'بطاقاتي',
    dash_no_cards: 'لا توجد بطاقات',
    dash_create_first: 'أنشئ أول بطاقة ولاء لك',
    dash_overview: 'نظرة عامة',
    dash_activity: 'النشاط الأخير',
    dash_my_clients: 'عملائي',
    dash_quick_actions: 'إجراءات سريعة',
    dash_upgrade: 'ترقية',

    // Login
    login_title: 'سجل دخولك',
    login_email: 'البريد الإلكتروني',
    login_password: 'كلمة المرور',
    login_submit: 'تسجيل الدخول',
    login_loading: 'جاري الدخول...',
    login_no_account: 'ليس لديك حساب؟ أنشئ واحداً',
    login_back: 'العودة للرئيسية',

    // Signup
    signup_title: 'أدخل رقم هاتفك',
    signup_verify: 'التحقق من الرقم',
    signup_complete: 'أكمل تسجيلك',
    signup_success: 'تم التسجيل بنجاح!',
    signup_name: 'الاسم الكامل',
    signup_business: 'اسم المتجر',
    signup_sector: 'القطاع',
    signup_phone: 'رقم الهاتف',
    signup_send_code: 'استلام الرمز',
    signup_create: 'إنشاء حسابي',

    // Scan
    scan_welcome: 'انضم لبطاقة الولاء',
    scan_your_name: 'اسمك',
    scan_phone: 'الهاتف',
    scan_join: 'انضم وأكد زيارتك',
    scan_purchased: 'هل قمت بعملية شراء؟',
    scan_confirm: 'نعم، أكد زيارتي',
    scan_pending: 'في انتظار التحقق',
    scan_validated: 'تم تأكيد الزيارة!',
    scan_rejected: 'لم يتم تأكيد الزيارة',
    scan_cooldown: 'مبكر جداً!',

    // Common
    common_back: 'رجوع',
    common_next: 'التالي',
    common_save: 'حفظ',
    common_cancel: 'إلغاء',
    common_loading: 'جاري التحميل...',
    common_error: 'خطأ',
    common_success: 'نجاح',

    // Footer
    footer_rights: 'جميع الحقوق محفوظة',
    footer_product: 'المنتج',
    footer_access: 'الوصول',
    footer_contact: 'اتصل بنا',
  },
}

export function getTranslation(locale: Locale) {
  return translations[locale]
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function getFont(locale: Locale): string {
  return locale === 'ar' ? "'Noto Sans Arabic', 'Cairo', sans-serif" : "'Inter', -apple-system, sans-serif"
}
