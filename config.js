// 共享配置和函数
// CFG 配置已移至 price-config.js，请确保已引入该文件

const EXCLUDED_KNIFE = ["电锯惊魂", "处刑者"];
const ALL_KNIFE_SKINS = ["暗星", "龙牙", "信条", "赤枭", "怜悯", "影锋", "黑海", "北极星", "电锯惊魂", "处刑者"];
const SPECIAL_WEAPON_SKINS = ["M7棱镜攻势", "AS-Val-巨浪"];

function calcRentPrice(cfg, p) {
  cfg = cfg || CFG;
  p = p || {};
  const hafuM = parseFloat(p.hafu_coin) || 0;
  if (!hafuM) return 0;
  const lv = parseInt(p.level) || 0;
  if (lv < 60) return Math.round((hafuM * 100) / 50);
  const ins = parseInt(p.insurance) || 2;
  let ratio = ins === 9 ? cfg.base9 : ins === 6 ? cfg.base6 : cfg.base24;
  const sta = parseInt(p.stamina) || 1;
  const wgt = parseInt(p.weight) || 1;
  if (sta === 7 && wgt === 7) {
    ratio -= cfg.bonus_sta7_wgt7;
  } else if (sta === 6 && wgt === 6) {
    ratio -= cfg.bonus_sta6_wgt6;
  } else if (sta <= 3 || wgt <= 3) {
    ratio += cfg.penalty_low;
  }
  if (hafuM >= 801) {
    ratio += cfg.bonus_hafu_801plus;
  } else if (hafuM >= 601) {
    ratio += cfg.bonus_hafu_601to800;
  } else if (hafuM >= 501) {
    ratio += cfg.bonus_hafu_501to600;
  } else if (hafuM >= 401) {
    ratio += cfg.bonus_hafu_401to500;
  } else if (hafuM >= 301) {
    ratio += cfg.bonus_hafu_301to400;
  } else if (hafuM >= 201) {
    ratio += cfg.bonus_hafu_201to300;
  }
  const knifeSkins = p.knife_skins || [];
  const allOwned = ALL_KNIFE_SKINS.every((s) => knifeSkins.includes(s));
  if (allOwned) {
    ratio -= cfg.bonus_all_knife;
  } else {
    const hasChixiao = knifeSkins.includes("赤枭");
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
  // 其他武器皮肤：每个 -0.1
  const otherWeaponCount = weaponSkins.filter((s) => !SPECIAL_WEAPON_SKINS.includes(s)).length;
  if (otherWeaponCount > 0) {
    ratio -= otherWeaponCount * cfg.bonus_other_weapon_per1;
  }
  const operatorRedSkins = p.operator_red_skins || [];
  if (operatorRedSkins.includes("凌霄戍卫")) {
    ratio -= cfg.bonus_lingxiao;
  }
  // 其他干员红皮：每个 -0.2
  const OTHER_RED_SKINS = ["蚀金玫瑰", "水墨云图", "午夜邮差", "天际线", "维什戴尔"];
  const otherRedCount = operatorRedSkins.filter((s) => OTHER_RED_SKINS.includes(s)).length;
  if (otherRedCount > 0) {
    ratio -= otherRedCount * cfg.bonus_other_red_per1;
  }
  // 干员金皮：每个 -0.3
  const operatorGoldSkins = p.operator_gold_skins || [];
  if (operatorGoldSkins.length > 0) {
    ratio -= operatorGoldSkins.length * cfg.bonus_gold_per1;
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
  if (ratio < 36) ratio = 36;
  return Math.round((hafuM * 100) / ratio);
}

function analyzeRatio(cfg, p) {
  cfg = cfg || CFG;
  p = p || {};
  const hafuM = parseFloat(p.hafu_coin) || 0;
  const lv = parseInt(p.level) || 0;
  const ins = parseInt(p.insurance) || 2;
  const sta = parseInt(p.stamina) || 1;
  const wgt = parseInt(p.weight) || 1;
  const cards = parseInt(p.insurance_cards) || 0;
  
  let baseRatio = ins === 9 ? cfg.base9 : ins === 6 ? cfg.base6 : cfg.base24;
  let insName = ins === 9 ? '9格' : ins === 6 ? '6格' : (ins === 4 ? '4格' : '2格');
  let changes = [];
  let totalChange = 0;
  let notes = [];
  
  // 体力负重
  if (sta === 7 && wgt === 7) {
    changes.push(`✅ 体力负重双7 <b style="color:#28a745">-${cfg.bonus_sta7_wgt7}</b>`);
    totalChange -= cfg.bonus_sta7_wgt7;
  } else if (sta === 6 && wgt === 6) {
    changes.push(`✅ 体力负重双6 <b style="color:#28a745">-${cfg.bonus_sta6_wgt6}</b>`);
    totalChange -= cfg.bonus_sta6_wgt6;
  } else if (sta <= 3 || wgt <= 3) {
    changes.push(`⚠️ 体力负重(${sta}-${wgt}) <b style="color:#dc3545">+${cfg.penalty_low}</b>`);
    notes.push(`体力负重${sta}-${wgt}`);
    totalChange += cfg.penalty_low;
  } else {
    notes.push(`体力负重${sta}-${wgt}`);
  }
  
  // 哈弗币
  if (hafuM >= 801) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_801plus}</b> (大额账号市场调整)`);
    totalChange += cfg.bonus_hafu_801plus;
  } else if (hafuM >= 601) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_601to800}</b> (大额账号市场调整)`);
    totalChange += cfg.bonus_hafu_601to800;
  } else if (hafuM >= 501) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_501to600}</b> (大额账号市场调整)`);
    totalChange += cfg.bonus_hafu_501to600;
  } else if (hafuM >= 401) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_401to500}</b>`);
    totalChange += cfg.bonus_hafu_401to500;
  } else if (hafuM >= 301) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_301to400}</b>`);
    totalChange += cfg.bonus_hafu_301to400;
  } else if (hafuM >= 201) {
    changes.push(`💰 哈弗币${hafuM}M <b style="color:#17a2b8">+${cfg.bonus_hafu_201to300}</b>`);
    totalChange += cfg.bonus_hafu_201to300;
  }
  
  // 刀皮
  const knifeSkins = p.knife_skins || [];
  const allOwned = ALL_KNIFE_SKINS.every((s) => knifeSkins.includes(s));
  if (allOwned) {
    changes.push(`🔪 刀皮全齐(10把) <b style="color:#28a745">-${cfg.bonus_all_knife}</b>`);
    totalChange -= cfg.bonus_all_knife;
  } else {
    const hasChixiao = knifeSkins.includes("赤枭");
    const validCount = knifeSkins.filter((s) => !EXCLUDED_KNIFE.includes(s)).length;
    if (hasChixiao) {
      changes.push(`🔪 有赤枭 <b style="color:#28a745">-${cfg.bonus_chixiao}</b>`);
      totalChange -= cfg.bonus_chixiao;
    } else if (validCount >= 4) {
      changes.push(`🔪 刀皮${validCount}把 <b style="color:#28a745">-${cfg.bonus_knife_4to8}</b>`);
      totalChange -= cfg.bonus_knife_4to8;
    } else if (validCount >= 2) {
      changes.push(`🔪 刀皮${validCount}把 <b style="color:#28a745">-${cfg.bonus_knife_2to3}</b>`);
      totalChange -= cfg.bonus_knife_2to3;
    } else if (validCount === 1) {
      changes.push(`🔪 刀皮1把 <b style="color:#28a745">-${cfg.bonus_knife_1}</b>`);
      totalChange -= cfg.bonus_knife_1;
    } else {
      changes.push(`➖ 无刀皮`);
      notes.push('无刀皮');
    }
  }
  
  // 武器皮肤
  const weaponSkins = p.weapon_skins || [];
  if (weaponSkins.some((s) => SPECIAL_WEAPON_SKINS.includes(s))) {
    changes.push(`🎯 特殊武器皮(M7/AS-Val) <b style="color:#28a745">-${cfg.bonus_weapon}</b>`);
    totalChange -= cfg.bonus_weapon;
  } else {
    changes.push(`➖ 无特殊武器皮`);
    notes.push('无特殊武器皮');
  }
  const otherWeaponCount = weaponSkins.filter((s) => !SPECIAL_WEAPON_SKINS.includes(s)).length;
  if (otherWeaponCount > 0) {
    const otherWeaponBonus = otherWeaponCount * cfg.bonus_other_weapon_per1;
    changes.push(`🎯 其他武器皮${otherWeaponCount}个 <b style="color:#28a745">-${otherWeaponBonus.toFixed(1)}</b>`);
    totalChange -= otherWeaponBonus;
  }

  // 干员红皮
  const operatorRedSkins = p.operator_red_skins || [];
  if (operatorRedSkins.includes("凌霄戍卫")) {
    changes.push(`👤 凌霄戍卫 <b style="color:#28a745">-${cfg.bonus_lingxiao}</b>`);
    totalChange -= cfg.bonus_lingxiao;
  } else {
    changes.push(`➖ 无凌霄戍卫`);
    notes.push('无凌霄戍卫');
  }
  const OTHER_RED_SKINS = ["蚀金玫瑰", "水墨云图", "午夜邮差", "天际线", "维什戴尔"];
  const otherRedCount = operatorRedSkins.filter((s) => OTHER_RED_SKINS.includes(s)).length;
  if (otherRedCount > 0) {
    const otherRedBonus = otherRedCount * cfg.bonus_other_red_per1;
    changes.push(`👤 其他红皮${otherRedCount}个 <b style="color:#28a745">-${otherRedBonus.toFixed(1)}</b>`);
    totalChange -= otherRedBonus;
  }

  // 干员金皮
  const operatorGoldSkins = p.operator_gold_skins || [];
  if (operatorGoldSkins.length > 0) {
    const goldBonus = operatorGoldSkins.length * cfg.bonus_gold_per1;
    changes.push(`⭐ 金皮${operatorGoldSkins.length}个 <b style="color:#28a745">-${goldBonus.toFixed(1)}</b>`);
    totalChange -= goldBonus;
  }
  
  // 体验卡
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
    if (cardBonus > 0) {
      changes.push(`🎫 体验卡${cards}天 <b style="color:#28a745">-${cardBonus}</b>`);
      totalChange -= cardBonus;
    }
  } else if (ins !== 9) {
    notes.push('无体验卡');
  }
  
  const totalChangeRounded = Math.round(totalChange * 1000) / 1000;
  let finalRatio = Math.round((baseRatio + totalChangeRounded) * 1000) / 1000;
  if (finalRatio < 36) finalRatio = 36;
  
  const rentPrice = Math.round((hafuM * 100) / finalRatio);
  let summary = `<b style="font-size:15px;color:#007bff">系统比例 ${finalRatio} = ${rentPrice}元</b>`;
  if (notes.length > 0) {
    summary += `<br><span style="color:#6c757d;font-size:12px">📝 ${notes.join('、')}</span>`;
  }
  summary += `<br><span style="color:#6c757d;font-size:11px">${insName}保险基础${baseRatio}`;
  if (totalChangeRounded !== 0) {
    summary += totalChangeRounded > 0 ? `+${totalChangeRounded}` : `${totalChangeRounded}`;
  }
  summary += ` = ${finalRatio}</span>`;
  
  return { base: baseRatio, changes: changes, summary: summary, finalRatio: finalRatio };
}

