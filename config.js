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
  const operatorRedSkins = p.operator_red_skins || [];
  if (operatorRedSkins.includes("凌霄戍卫")) {
    ratio -= cfg.bonus_lingxiao;
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
  let insName = ins === 9 ? '9格保险' : ins === 6 ? '6格保险' : (ins === 4 ? '4格保险' : '2格保险');
  let details = [`📊 基础比例: <b>${baseRatio}</b> (${insName})`];
  let changes = [];
  let totalChange = 0;
  
  // 体力负重分析
  if (sta === 7 && wgt === 7) {
    changes.push(`✅ 体力负重双7级 → 比例<b style="color:#28a745">-${cfg.bonus_sta7_wgt7}</b> (租金更低)`);
    totalChange -= cfg.bonus_sta7_wgt7;
  } else if (sta === 6 && wgt === 6) {
    changes.push(`✅ 体力负重双6级 → 比例<b style="color:#28a745">-${cfg.bonus_sta6_wgt6}</b> (租金更低)`);
    totalChange -= cfg.bonus_sta6_wgt6;
  } else if (sta <= 3 || wgt <= 3) {
    changes.push(`⚠️ 体力${sta}级/负重${wgt}级(有≤3) → 比例<b style="color:#dc3545">+${cfg.penalty_low}</b> (租金更高)`);
    totalChange += cfg.penalty_low;
  } else {
    changes.push(`➖ 体力${sta}级/负重${wgt}级 → 无影响`);
  }
  
  // 哈弗币分析
  if (hafuM >= 801) {
    changes.push(`💰 哈弗币${hafuM}M(≥801M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_801plus}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_801plus;
  } else if (hafuM >= 601) {
    changes.push(`💰 哈弗币${hafuM}M(601-800M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_601to800}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_601to800;
  } else if (hafuM >= 501) {
    changes.push(`💰 哈弗币${hafuM}M(501-600M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_501to600}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_501to600;
  } else if (hafuM >= 401) {
    changes.push(`💰 哈弗币${hafuM}M(401-500M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_401to500}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_401to500;
  } else if (hafuM >= 301) {
    changes.push(`💰 哈弗币${hafuM}M(301-400M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_301to400}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_301to400;
  } else if (hafuM >= 201) {
    changes.push(`💰 哈弗币${hafuM}M(201-300M) → 比例<b style="color:#28a745">+${cfg.bonus_hafu_201to300}</b> (大额优惠)`);
    totalChange += cfg.bonus_hafu_201to300;
  } else {
    changes.push(`💰 哈弗币${hafuM}M(<201M) → 无优惠`);
  }
  
  // 刀皮分析
  const knifeSkins = p.knife_skins || [];
  const allOwned = ALL_KNIFE_SKINS.every((s) => knifeSkins.includes(s));
  if (allOwned) {
    changes.push(`🔪 刀皮: 集齐全部10把 → 比例<b style="color:#28a745">-${cfg.bonus_all_knife}</b> (顶级加成)`);
    totalChange -= cfg.bonus_all_knife;
  } else {
    const hasChixiao = knifeSkins.includes("赤枭");
    const validCount = knifeSkins.filter((s) => !EXCLUDED_KNIFE.includes(s)).length;
    if (hasChixiao) {
      changes.push(`🔪 刀皮: 有赤枭 → 比例<b style="color:#28a745">-${cfg.bonus_chixiao}</b>`);
      totalChange -= cfg.bonus_chixiao;
    } else if (validCount >= 4) {
      changes.push(`🔪 刀皮: 有效${validCount}把(4-8把) → 比例<b style="color:#28a745">-${cfg.bonus_knife_4to8}</b>`);
      totalChange -= cfg.bonus_knife_4to8;
    } else if (validCount >= 2) {
      changes.push(`🔪 刀皮: 有效${validCount}把(2-3把) → 比例<b style="color:#28a745">-${cfg.bonus_knife_2to3}</b>`);
      totalChange -= cfg.bonus_knife_2to3;
    } else if (validCount === 1) {
      changes.push(`🔪 刀皮: 有效1把 → 比例<b style="color:#28a745">-${cfg.bonus_knife_1}</b>`);
      totalChange -= cfg.bonus_knife_1;
    } else {
      changes.push(`🔪 刀皮: 无有效刀皮 → 无加成`);
    }
  }
  
  // 武器皮肤分析
  const weaponSkins = p.weapon_skins || [];
  if (weaponSkins.some((s) => SPECIAL_WEAPON_SKINS.includes(s))) {
    changes.push(`🎯 武器皮肤: 有特殊皮肤 → 比例<b style="color:#28a745">-${cfg.bonus_weapon}</b>`);
    totalChange -= cfg.bonus_weapon;
  } else {
    changes.push(`🎯 武器皮肤: 无特殊皮肤 → 无加成`);
  }
  
  // 干员红皮分析
  const operatorRedSkins = p.operator_red_skins || [];
  if (operatorRedSkins.includes("凌霄戍卫")) {
    changes.push(`👤 干员红皮: 有凌霄戍卫 → 比例<b style="color:#28a745">-${cfg.bonus_lingxiao}</b>`);
    totalChange -= cfg.bonus_lingxiao;
  } else {
    changes.push(`👤 干员红皮: 无凌霄戍卫 → 无加成`);
  }
  
  // 体验卡分析
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
      changes.push(`🎫 体验卡: ${cards}天 → 比例<b style="color:#28a745">-${cardBonus}</b>`);
      totalChange -= cardBonus;
    }
  } else if (ins === 9) {
    changes.push(`🎫 体验卡: 9格保险不支持体验卡`);
  } else {
    changes.push(`🎫 体验卡: 无 → 无加成`);
  }
  
  let finalRatio = baseRatio + totalChange;
  if (finalRatio <= 0) finalRatio = 1;
  
  let summary = `<b>最终比例: ${finalRatio}</b> = ${baseRatio}`;
  if (totalChange > 0) summary += ` <span style="color:#28a745">+${totalChange}</span>`;
  else if (totalChange < 0) summary += ` <span style="color:#28a745">${totalChange}</span>`;
  
  return { base: baseRatio, changes: changes, summary: summary, finalRatio: finalRatio };
}
