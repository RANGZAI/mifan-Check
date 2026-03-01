// 共享配置和函数
const CFG = {
  base9: 41, base6: 45, base24: 49, bonus_sta7_wgt7: 1, bonus_sta6_wgt6: 0.5, penalty_low: 1,
  bonus_chixiao: 1, bonus_knife_1: 0.5, bonus_knife_2to3: 1, bonus_knife_4to8: 1.5, bonus_all_knife: 3,
  bonus_weapon: 1, bonus_hafu_201to300: 1, bonus_hafu_301plus: 2,
  card24_1: 0.5, card24_2: 0.5, card24_3: 1.5, card24_4: 2, card24_5: 2.25, card24_6: 2.5, card24_7plus: 2.5,
  card6_1: 0.25, card6_2: 0.75, card6_3: 1.25, card6_4: 1.5, card6_5: 1.75, card6_6: 2, card6_7plus: 2.5,
};

const EXCLUDED_KNIFE = ["电锯惊魂", "处刑者"];
const ALL_KNIFE_SKINS = ["暗星", "龙牙", "信条", "赤霄", "怜悯", "影锋", "黑海", "北极星", "电锯惊魂", "处刑者"];
const SPECIAL_WEAPON_SKINS = ["M7棱镜攻势", "AS-Val-巨浪"];

function calcRentPrice(cfg, p) {
  cfg = cfg || CFG;
  p = p || {};
  const hafuM = parseFloat(p.hafu_coin) || 0;
  if (!hafuM) return 0;
  const lv = parseInt(p.level) || 0;
  if (lv < 60) {
    const levelRatio = lv <= 30 ? 60 : lv <= 45 ? 55 : 52;
    return Math.round((hafuM * 100) / levelRatio);
  }
  const ins = parseInt(p.insurance) || 2;
  let ratio = ins === 9 ? cfg.base9 : ins === 6 ? cfg.base6 : cfg.base24;
  const sta = parseInt(p.stamina) || 1;
  const wgt = parseInt(p.weight) || 1;
  if (sta === 7 && wgt === 7) {
    ratio += cfg.bonus_sta7_wgt7;
  } else if (sta === 6 && wgt === 6) {
    ratio += cfg.bonus_sta6_wgt6;
  } else if (sta <= 3 || wgt <= 3) {
    ratio -= cfg.penalty_low;
  }
  if (hafuM >= 301) {
    ratio += cfg.bonus_hafu_301plus;
  } else if (hafuM >= 201) {
    ratio += cfg.bonus_hafu_201to300;
  }
  const knifeSkins = p.knife_skins || [];
  const allOwned = ALL_KNIFE_SKINS.every((s) => knifeSkins.includes(s));
  if (allOwned) {
    ratio -= cfg.bonus_all_knife;
  } else {
    const hasChixiao = knifeSkins.includes("赤霄");
    const validCount = knifeSkins.filter((s) => !EXCLUDED_KNIFE.includes(s)).length;
    let chixiaoBonus = hasChixiao ? cfg.bonus_chixiao : 0;
    let countBonus = 0;
    if (validCount === 1) countBonus = cfg.bonus_knife_1;
    else if (validCount >= 2 && validCount <= 3) countBonus = cfg.bonus_knife_2to3;
    else if (validCount >= 4 && validCount <= 8) countBonus = cfg.bonus_knife_4to8;
    ratio -= Math.max(chixiaoBonus, countBonus);
  }
  const weaponSkins = p.weapon_skins || [];
  if (weaponSkins.some((s) => SPECIAL_WEAPON_SKINS.includes(s))) {
    ratio -= cfg.bonus_weapon;
  }
  const cards = parseInt(p.insurance_cards) || 0;
  if (cards > 0 && ins !== 9) {
    let cardBonus = 0;
    if (ins === 2 || ins === 4) {
      if (cards >= 7) cardBonus = cfg.card24_7plus;
      else if (cards === 6) cardBonus = cfg.card24_6;
      else if (cards === 5) cardBonus = cfg.card24_5;
      else if (cards === 4) cardBonus = cfg.card24_4;
      else if (cards === 3) cardBonus = cfg.card24_3;
      else if (cards === 2) cardBonus = cfg.card24_2;
      else cardBonus = cfg.card24_1;
    } else if (ins === 6) {
      if (cards >= 7) cardBonus = cfg.card6_7plus;
      else if (cards === 6) cardBonus = cfg.card6_6;
      else if (cards === 5) cardBonus = cfg.card6_5;
      else if (cards === 4) cardBonus = cfg.card6_4;
      else if (cards === 3) cardBonus = cfg.card6_3;
      else if (cards === 2) cardBonus = cfg.card6_2;
      else cardBonus = cfg.card6_1;
    }
    ratio -= cardBonus;
  }
  if (ratio <= 0) ratio = 1;
  return Math.round((hafuM * 100) / ratio);
}
