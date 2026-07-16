export const LOCALES = ["en", "zh", "fr", "es", "de", "ja", "ko", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  zh: "CN",
  fr: "FR",
  es: "ES",
  de: "DE",
  ja: "JA",
  ko: "KO",
  ar: "AR",
};

export const RTL_LOCALES: Locale[] = ["ar"];

export interface Translations {
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginButton: string;
    registerButton: string;
    loading: string;
    switchToRegister: string;
    switchToLogin: string;
    errorInvalidEmail: string;
    errorGeneric: string;
    login: string;
    myProfile: string;
    logout: string;
  };
  profile: {
    title: string;
    tabs: {
      cart: string;
      orders: string;
      jewelry: string;
      portrait: string;
    };
    cart: {
      empty: string;
      emptySub: string;
      browseCollection: string;
    };
    jewelry: {
      empty: string;
      emptySub: string;
      browseCollection: string;
      addedOn: string;
      upload: string;
      uploadHint: string;
      namePlaceholder: string;
      descPlaceholder: string;
      save: string;
      cancel: string;
      delete: string;
    };
    portrait: {
      empty: string;
      emptySub: string;
      goToPortrait: string;
      generatedOn: string;
      viewDetails: string;
    };
    orders: {
      empty: string;
      emptySub: string;
      shopNow: string;
      loading: string;
      orderId: string;
      placed: string;
      total: string;
      items: string;
      qty: string;
      shippingAddress: string;
      timeline: {
        ordered: string;
        confirmed: string;
        shipped: string;
        delivered: string;
      };
      status: {
        confirmed: string;
        processing: string;
        shipped: string;
        delivered: string;
      };
    };
    memberSince: string;
  };
  nav: {
    collection: string;
    advisor: string;
    tryOn: string;
    arTryOn: string;
    identityPortrait: string;
    designerCapsule: string;
    vip: string;
    bag: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    exploreCollection: string;
    tryAIStylist: string;
  };
  services: {
    eyebrow: string;
    title: string;
    aiStylist: { title: string; desc: string };
    arTryOn: { title: string; desc: string };
    smartMatch: { title: string; desc: string };
  };
  brand: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  advisorSplit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    youLabel: string;
    userMessage: string;
    stylixReply: string;
    openAdvisor: string;
    livePreview: string;
    arExperience: string;
    seeOnYou: string;
    arDesc: string;
    launchTryOn: string;
  };
  vipTeaser: {
    eyebrow: string;
    title: string;
    services: [
      { title: string; text: string },
      { title: string; text: string },
      { title: string; text: string },
    ];
    inquire: string;
  };
  stayUpdated: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  newsletter: {
    emailPlaceholder: string;
    subscribe: string;
    received: string;
  };
  collection: {
    eyebrow: string;
    filteredBy: string;
    categoryLabel: string;
    styleLabel: string;
    materialLabel: string;
    showing: string;
    pieces: string;
    piece: string;
    all: string;
    emptyTitle: string;
    emptyBody: string;
    categoryLabels: Record<string, string>;
    styleLabels: Record<string, string>;
    materialLabels: Record<string, string>;
  };
  advisor: {
    eyebrow: string;
    title: string;
    subtitle: string;
    outfitLabel: string;
    outfitNote: string;
    zodiacLabel: string;
    zodiacNone: string;
    occasionLabel: string;
    styleLabel: string;
    moodLabel: string;
    budgetLabel: string;
    categoryLabel: string;
    noPreference: string;
    allCategories: string;
    submit: string;
    emptyResult: string;
    styleDirection: string;
    stylingNote: string;
    mainPick: string;
    supportingPicks: string;
    tryAnotherDirection: string;
    exploreOtherStyles: string;
    luxuryInspirationTitle: string;
    luxuryInspirationSoon: string;
    luxuryInspirationNote: string;
    viewProduct: string;
    tryOn: string;
    requestCustomization: string;
    budgets: [string, string, string, string];
    occasionLabels: Record<string, string>;
    styleLabels: Record<string, string>;
    moodLabels: Record<string, string>;
    categoryLabels: Record<string, string>;
    zodiacSigns: string[];
  };
  vip: {
    eyebrow: string;
    title: string;
    intro: string;
    offerings: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
    form: {
      title: string;
      subtitle: string;
      desiredStyle: string;
      referenceImage: string;
      story: string;
      budget: string;
      timeline: string;
      timelinePlaceholder: string;
      name: string;
      email: string;
      submit: string;
      success: string;
      budgetOptions: [string, string, string, string];
    };
    consultation: {
      headerEyebrow: string;
      headerTitle: string;
      headerTitleResult: string;
      steps: { num: string; label: string }[];
      identity: {
        title: string;
        subtitle: string;
        options: { value: string; label: string }[];
      };
      occasion: {
        title: string;
        subtitle: string;
        options: { value: string; label: string }[];
      };
      aesthetic: {
        title: string;
        subtitle: string;
        options: { value: string; label: string }[];
      };
      investment: {
        title: string;
        subtitle: string;
        options: { value: string; label: string }[];
      };
      story: {
        label: string;
        title: string;
        subtitle: string;
        placeholder: string;
        charHint: string;
      };
      back: string;
      continue: string;
      generate: string;
      loadingTitle: string;
      loadingSteps: string[];
      result: {
        archetypeLabel: string;
        styleDna: string;
        occasionMatch: string;
        recommendedCollection: string;
        collectionNote: string;
        whyThisPiece: string;
        saveProfileLabel: string;
        saveProfileTitle: string;
        saveProfileSubtitle: string;
        profileSentTitle: string;
        profileSentSubtitle: string;
        saving: string;
        saveButton: string;
        exploreCollection: string;
        beginAgain: string;
      };
    };
  };
  tryOn: {
    eyebrow: string;
    title: string;
    subtitle: string;
    photoUpload: string;
    liveWebcam: string;
    yourPhoto: string;
    handTracking: string;
    loadingModel: string;
    arActive: string;
    arInitialising: string;
    arOff: string;
    downloadingModel: string;
    manualMode: string;
    requestingCamera: string;
    sizeLabel: string;
    opacityLabel: string;
    jewelryPiece: string;
    savePreview: string;
    clear: string;
    stopCamera: string;
    uploadPrompt: string;
    initialisingCamera: string;
    handDetected3D: string;
    handDetected2D: string;
    handDetectedDownloading: string;
    handDetectedManual: string;
    modelError: string;
    assetMissing: string;
    assetMissingDesc: string;
    add3DModel: string;
    or2DOverlay: string;
    glbNote: string;
    statusSelected: string;
    status3D: string;
    status2D: string;
    statusManual: string;
    statusUpload: string;
  };
  identityPortrait: {
    pageTitle: string;
    pageSubtitle: string;
    uploadPhoto: string;
    stepUpload: string;
    stepIdentity: string;
    stepJewelry: string;
    stepMood: string;
    chooseIdentity: string;
    chooseIdentitySubtitle: string;
    surpriseMe: string;
    quizButton: string;
    quizTitle: string;
    quizSubtitle: string;
    quizComingSoon: string;
    quizComingSoonSub: string;
    quizBack: string;
    chooseJewelry: string;
    chooseJewelrySubtitle: string;
    skip: string;
    chooseMood: string;
    genPhase1: string;
    genPhase2: string;
    genPhase3: string;
    genPhase4: string;
    resultLabel: string;
    resultUnavailable: string;
    othersViewLabel: string;
    shadowTraitLabel: string;
    downloadCard: string;
    regenerate: string;
    youMayAlsoLike: string;
    back: string;
  };
  home: {
    panels: {
      aiStylist: { label: string; sub: string };
      digitalAtelier: { label: string; sub: string };
      tryOn3d: { label: string; sub: string };
      discoverJewelry: { label: string; sub: string };
    };
    heroEyebrow: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    heroCta1: string;
    heroCta2: string;
    personalization: {
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
    collectionPreview: {
      eyebrow: string;
      title: string;
      subtitle: string;
      designerCapsuleName: string;
      designerCapsuleEyebrow: string;
      designerCapsuleDesc: string;
      designerCapsuleCta: string;
      designerQuote: string;
      designerAttribution: string;
      celestialName: string;
      celestialEyebrow: string;
      celestialDesc: string;
      celestialCta: string;
      celestialPlaceholderDesc: string;
      explore: string;
    };
    intelligence: {
      eyebrow: string;
      title: string;
      subtitle: string;
      cta: string;
      pillars: Array<{ title: string; body: string }>;
    };
    featuredDesigner: {
      eyebrow: string;
      name: string;
      desc: string;
      note: string;
      cta: string;
      quote: string;
      attribution: string;
      capsuleLabel: string;
    };
    waitlist: {
      eyebrow: string;
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      countryLabel: string;
      countryPlaceholder: string;
      genderLabel: string;
      genderSelect: string;
      genderFemale: string;
      genderMale: string;
      genderNonBinary: string;
      genderPreferNotToSay: string;
      interestLabel: string;
      interestPlaceholder: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
    };
  };
  collectionPage: {
    pageEyebrow: string;
    pageTitle: string;
    pageSubtitle: string;
    tabs: {
      all: { label: string; eyebrow: string; description: string };
      designerCapsule: { label: string; eyebrow: string; description: string };
      celestialEssentials: { label: string; eyebrow: string; description: string };
      aiConceptArchive: { label: string; eyebrow: string; description: string };
    };
    designerCapsuleNote: string;
    archiveNote: string;
    allTabArchiveHint: string;
    archiveCta: { eyebrow: string; description: string; button: string };
    badges: { conceptArchive: string; selectedByStylix: string };
    collaboratorCapsule: string;
    conceptPieceArchive: string;
    emptyTitle: string;
    emptyBody: string;
  };
  footer: {
    tagline: string;
    collectionsLabel: string;
    servicesLabel: string;
    contactLabel: string;
    concierge: string;
    cities: string;
    privacy: string;
    terms: string;
    allRights: string;
    allPieces: string;
    celestialGuardians: string;
    hearthHalo: string;
    aiStylist: string;
    virtualTryOn: string;
    bespokeVip: string;
    social: {
      instagram: string;
      pinterest: string;
      linkedin: string;
    };
  };
  bag: {
    pageEyebrow: string;
    pageTitle: string;
    emptyTitle: string;
    emptyBody: string;
    exploreCta: string;
    designerCapsule: string;
    decreaseQty: string;
    increaseQty: string;
    remove: string;
    continueShopping: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    complimentary: string;
    calculatedAtCheckout: string;
    freeShippingNote: string;
    estimatedTax: string;
    estimatedTotal: string;
    taxNote: string;
    proceedToCheckout: string;
    availableAtCheckout: string;
    trustSignals: [string, string, string];
  };
  checkout: {
    secureCheckout: string;
    redirecting: string;
    doNotClose: string;
    emptyBag: string;
    exploreCta: string;
    contactInfo: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneOptional: string;
    shippingAddress: string;
    addressLine1: string;
    addressLine2Optional: string;
    city: string;
    stateProvince: string;
    zipPostal: string;
    country: string;
    countryUS: string;
    countryCA: string;
    payment: string;
    stripeRedirect: string;
    paymentMethods: [string, string, string, string];
    submitRedirecting: string;
    submitContinue: string;
    termsPrefix: string;
    termsOfService: string;
    and: string;
    privacyPolicy: string;
    termsSuffix: string;
    errorDefault: string;
    errorNetwork: string;
    yourOrder: string;
    editBag: string;
    pageEyebrow: string;
    pageTitle: string;
    loading: string;
  };
  checkoutSuccess: {
    eyebrow: string;
    title: string;
    orderReceived: string;
    confirming: string;
    checkEmail: string;
    trustSignals: [string, string, string];
    orderLabel: string;
    placedLabel: string;
    paymentLabel: string;
    stripeCheckout: string;
    yourPieces: string;
    qty: string;
    shippingTo: string;
    confirmationSentTo: string;
    dispatchNote: string;
    continueShopping: string;
    startAIStyling: string;
  };
  checkoutCancel: {
    pageTitle: string;
    noCharge: string;
    bagSaved: string;
    backToCheckout: string;
    viewBag: string;
    trustSignals: [string, string, string];
  };
  product: {
    designSymbolism: string;
    materialEnergy: string;
    stylingNotes: string;
    privateAtelier: string;
    designerNote: string;
    designedBy: string;
    virtualStyling: string;
    requestAIStyling: string;
    privateAtelierBtn: string;
    alsoFromCollection: string;
    exploreCollection: string;
    preview3D: string;
    viewer3DError: string;
    model3DUnavailable: string;
    loading: string;
    exitFullscreen: string;
    fullscreen: string;
    view360: string;
    addedToBag: string;
    addAnother: string;
    addToBag: string;
    viewBag: string;
    conceptArchive: string;
    selectedByStylix: string;
    designerCapsule: string;
    conceptPieceArchive: string;
    viewDetails: string;
  };
  errors: {
    notFoundCode: string;
    notFoundTitle: string;
    notFoundBody: string;
    collection: string;
    home: string;
    aiAdvisor: string;
    somethingWrong: string;
    unexpectedError: string;
    tryAgain: string;
    refresh: string;
    loading: string;
    loadingCollection: string;
    loadingBag: string;
  };
}
