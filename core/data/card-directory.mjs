export const suitInfo={
 wands:{en:'Wands',ko:'완드',emoji:'🔥'},
 cups:{en:'Cups',ko:'컵',emoji:'💧'},
 swords:{en:'Swords',ko:'소드',emoji:'🗡️'},
 pentacles:{en:'Pentacles',ko:'펜타클',emoji:'🪙'}
};
export function cardSlug(card){
 return String(card.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
export function cardGroupLabel(card){
 if(card.arcana==='major')return '메이저 아르카나';
 const suit=suitInfo[card.suit];
 return `마이너 아르카나 · ${suit?.ko||card.suit}`;
}
export function cardSearchLabel(card){
 return `${card.koreanName} ${card.name} ${card.keywords.join(' ')}`.toLowerCase();
}
