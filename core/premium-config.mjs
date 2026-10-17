export const deepReadingOffer={
 id:'reading-room-deep-reading-v1',
 name:'심층 리딩',
 englishName:'DEEP READING',
 price:4900,
 currency:'KRW',
 supported:['love','reunion','breakup','feelings','contact','reunion-timing','job','money','work','study'],
 checkoutReady:false,
 checkoutPath:'/deep-reading/'
};

export const supportsDeepReading=slug=>deepReadingOffer.supported.includes(slug);

export const deepReadingLabels={
 love:'연애운',
 reunion:'재회운',
 breakup:'이별운',
 feelings:'상대방 속마음',
 contact:'연락운',
 'reunion-timing':'재회 시기',
 job:'취업운',
 money:'금전운',
 work:'직장운',
 study:'시험 · 학업운'
};
