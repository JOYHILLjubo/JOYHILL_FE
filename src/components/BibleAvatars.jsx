// 성경 인물 아바타 SVG 컴포넌트
// avatarKey → SVG 매핑

export const BIBLE_AVATARS = [
  { key: 'noah',      label: '노아',    category: '구약' },
  { key: 'abraham',   label: '아브라함', category: '구약' },
  { key: 'isaac',     label: '이삭',    category: '구약' },
  { key: 'jacob',     label: '야곱',    category: '구약' },
  { key: 'rachel',    label: '라헬',    category: '구약' },
  { key: 'moses',     label: '모세',    category: '구약' },
  { key: 'david',     label: '다윗',    category: '구약' },
  { key: 'solomon',   label: '솔로몬',  category: '구약' },
  { key: 'elijah',    label: '엘리야',  category: '구약' },
  { key: 'ruth',      label: '룻',      category: '구약' },
  { key: 'joseph_ot', label: '요셉',    category: '구약' },
  { key: 'job',       label: '욥',      category: '구약' },
  { key: 'samuel',    label: '사무엘',  category: '구약' },
  { key: 'joshua',    label: '여호수아', category: '구약' },
  { key: 'caleb',     label: '갈렙',    category: '구약' },
  { key: 'aaron',     label: '아론',    category: '구약' },
  { key: 'daniel',    label: '다니엘',  category: '구약' },
  { key: 'jonah',     label: '요나',    category: '구약' },
  { key: 'esther',    label: '에스더',  category: '구약' },
  { key: 'deborah',   label: '드보라',  category: '구약' },
  { key: 'samson',    label: '삼손',    category: '구약' },
  { key: 'gideon',    label: '기드온',  category: '구약' },
  { key: 'hannah',    label: '한나',    category: '구약' },
  { key: 'miriam',    label: '미리암',  category: '구약' },
  { key: 'rahab',     label: '라합',    category: '구약' },
  { key: 'boaz',      label: '보아스',  category: '구약' },
  { key: 'naomi',     label: '나오미',  category: '구약' },
  { key: 'sarah',     label: '사라',    category: '구약' },
  { key: 'elisha',    label: '엘리사',  category: '구약' },
  { key: 'isaiah',    label: '이사야',  category: '구약' },
  { key: 'jeremiah',  label: '예레미야', category: '구약' },
  { key: 'nehemiah',  label: '느헤미야', category: '구약' },
  { key: 'jesus',     label: '예수',    category: '신약' },
  { key: 'peter',     label: '베드로',  category: '신약' },
  { key: 'paul',      label: '바울',    category: '신약' },
  { key: 'magi',      label: '동방박사', category: '신약' },
  { key: 'stephen',   label: '스데반',  category: '신약' },
  { key: 'james',     label: '야고보',  category: '신약' },
  { key: 'zacchaeus', label: '삭게오',  category: '신약' },
  { key: 'mary',      label: '마리아',  category: '신약' },
  { key: 'john_baptist',    label: '세례요한',   category: '신약' },
  { key: 'john_apostle',    label: '사도요한',   category: '신약' },
  { key: 'andrew',          label: '안드레',     category: '신약' },
  { key: 'matthew',         label: '마태',       category: '신약' },
  { key: 'thomas',          label: '도마',       category: '신약' },
  { key: 'philip',          label: '빌립',       category: '신약' },
  { key: 'luke',            label: '누가',       category: '신약' },
  { key: 'mark',            label: '마가',       category: '신약' },
  { key: 'barnabas',        label: '바나바',     category: '신약' },
  { key: 'timothy',         label: '디모데',     category: '신약' },
  { key: 'martha',          label: '마르다',     category: '신약' },
  { key: 'mary_magdalene',  label: '막달라마리아', category: '신약' },
  { key: 'lydia',           label: '루디아',     category: '신약' },
  { key: 'lazarus',         label: '나사로',     category: '신약' },
  { key: 'samaritan_woman', label: '사마리아여인', category: '신약' },
  { key: 'simeon',          label: '시므온',     category: '신약' },
]

function NoahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cn"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#D6EEFF"/>
      <rect x="0" y="46" width="72" height="26" fill="#5B9ED9" clipPath="url(#av-cn)"/>
      <rect x="8" y="46" width="56" height="10" rx="4" fill="#8B6914" clipPath="url(#av-cn)"/>
      <rect x="16" y="36" width="40" height="12" rx="3" fill="#A07830" clipPath="url(#av-cn)"/>
      <rect x="24" y="28" width="24" height="10" rx="2" fill="#B88A40" clipPath="url(#av-cn)"/>
      <rect x="30" y="30" width="5" height="5" rx="1" fill="#D4B060" clipPath="url(#av-cn)"/>
      <rect x="38" y="30" width="5" height="5" rx="1" fill="#D4B060" clipPath="url(#av-cn)"/>
      <path d="M0 52 Q10 48 20 52 Q30 56 40 52 Q50 48 62 52 Q66 54 72 52" fill="none" stroke="#4A90D9" strokeWidth="1.5" clipPath="url(#av-cn)"/>
      <circle cx="36" cy="20" r="11" fill="#F5CBA7"/>
      <ellipse cx="36" cy="29" rx="8" ry="5" fill="#D5D8DC"/>
      <circle cx="31" cy="18" r="1.8" fill="#2C3E50"/>
      <circle cx="41" cy="18" r="1.8" fill="#2C3E50"/>
      <rect x="27" y="14" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="14" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="11" rx="10" ry="5" fill="#D5D8DC"/>
      <path d="M50 12 Q54 8 58 11 Q55 12 53 15Z" fill="white"/>
      <circle cx="57" cy="10" r="1.8" fill="white"/>
    </svg>
  )
}

function AbrahamSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cab"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#0D1B3E"/>
      <circle cx="14" cy="10" r="1" fill="white" opacity=".9"/>
      <circle cx="25" cy="6" r="1.3" fill="white" opacity=".8"/>
      <circle cx="40" cy="9" r="1" fill="white" opacity=".7"/>
      <circle cx="52" cy="5" r="1.2" fill="white" opacity=".9"/>
      <circle cx="62" cy="13" r="1" fill="white" opacity=".7"/>
      <circle cx="8" cy="20" r="1" fill="white" opacity=".6"/>
      <circle cx="46" cy="16" r="1.3" fill="white" opacity=".8"/>
      <circle cx="58" cy="22" r="1" fill="white" opacity=".7"/>
      <circle cx="70" cy="8" r="1" fill="white" opacity=".5"/>
      <circle cx="20" cy="17" r=".8" fill="white" opacity=".7"/>
      <path d="M36 7 L37.5 11.5 L42 10 L38.5 13 L40 17 L36 14.5 L32 17 L33.5 13 L30 10 L34.5 11.5Z" fill="#F9AB00"/>
      <rect x="0" y="52" width="72" height="20" fill="#C8A060" clipPath="url(#av-cab)"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#C8860A" clipPath="url(#av-cab)"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#E8A020" clipPath="url(#av-cab)"/>
      <circle cx="36" cy="32" r="12" fill="#F0C070"/>
      <ellipse cx="36" cy="42" rx="9" ry="6" fill="#E0E0E0"/>
      <circle cx="31" cy="30" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="30" r="2" fill="#2C3E50"/>
      <rect x="27" y="25" width="7" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="38" y="25" width="7" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="22" rx="12" ry="6" fill="#E0E0E0"/>
      <path d="M20 50 Q14 44 16 36" fill="none" stroke="#F0C070" strokeWidth="3" strokeLinecap="round"/>
      <path d="M52 50 Q58 44 56 36" fill="none" stroke="#F0C070" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function IsaacSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cis"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E8F8F0"/>
      <rect x="0" y="0" width="72" height="48" fill="#D6EAF8" clipPath="url(#av-cis)"/>
      <rect x="0" y="56" width="72" height="16" fill="#C8A060" clipPath="url(#av-cis)"/>
      <rect x="44" y="38" width="26" height="18" rx="3" fill="#8B6914" clipPath="url(#av-cis)"/>
      <rect x="46" y="40" width="22" height="14" rx="2" fill="#A07830" clipPath="url(#av-cis)"/>
      <ellipse cx="57" cy="54" rx="10" ry="4" fill="#5DADE2" clipPath="url(#av-cis)"/>
      <rect x="44" y="30" width="3" height="24" rx="1" fill="#6B4C11" clipPath="url(#av-cis)"/>
      <rect x="67" y="30" width="3" height="24" rx="1" fill="#6B4C11" clipPath="url(#av-cis)"/>
      <path d="M40 32 L57 24 L74 32Z" fill="#8B6914" clipPath="url(#av-cis)"/>
      <line x1="57" y1="38" x2="57" y2="32" stroke="#8B6914" strokeWidth="1.5"/>
      <rect x="53" y="27" width="7" height="6" rx="2" fill="#A07830"/>
      <rect x="10" y="46" width="36" height="22" rx="6" fill="#5B9E5B" clipPath="url(#av-cis)"/>
      <circle cx="28" cy="32" r="13" fill="#F5CBA7"/>
      <ellipse cx="28" cy="43" rx="9" ry="6" fill="#C8A060"/>
      <circle cx="23" cy="30" r="2" fill="#2C3E50"/>
      <circle cx="33" cy="30" r="2" fill="#2C3E50"/>
      <rect x="19" y="25" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="31" y="25" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="28" cy="21" rx="11" ry="6" fill="#C8A060"/>
      <path d="M40 52 Q46 48 50 42" fill="none" stroke="#F5CBA7" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function JacobSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#F5F0FF"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#7B68EE"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#9B88FF"/>
      <rect x="19" y="50" width="5" height="14" rx="1" fill="#EA4335" opacity=".5"/>
      <rect x="25" y="50" width="5" height="14" rx="1" fill="#F9AB00" opacity=".5"/>
      <rect x="31" y="50" width="5" height="14" rx="1" fill="#34A853" opacity=".5"/>
      <rect x="37" y="50" width="5" height="14" rx="1" fill="#4285F4" opacity=".5"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="40" rx="9" ry="7" fill="#D5D8DC"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="19" rx="11" ry="6" fill="#D5D8DC"/>
      <line x1="57" y1="26" x2="55" y2="62" stroke="#8B6914" strokeWidth="2"/>
      <line x1="63" y1="26" x2="61" y2="62" stroke="#8B6914" strokeWidth="2"/>
      <line x1="57" y1="34" x2="63" y2="34" stroke="#8B6914" strokeWidth="1.5"/>
      <line x1="56" y1="42" x2="62" y2="42" stroke="#8B6914" strokeWidth="1.5"/>
      <line x1="56" y1="50" x2="62" y2="50" stroke="#8B6914" strokeWidth="1.5"/>
    </svg>
  )
}

function RachelSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cra"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FFF0F8"/>
      <rect x="0" y="52" width="72" height="20" fill="#90EE90" clipPath="url(#av-cra)"/>
      <rect x="0" y="46" width="72" height="8" fill="#A8D8A8" clipPath="url(#av-cra)"/>
      <ellipse cx="54" cy="50" rx="8" ry="5" fill="white"/>
      <circle cx="48" cy="48" r="5" fill="white"/>
      <circle cx="49" cy="52" r="2" fill="#DDD"/>
      <circle cx="58" cy="52" r="2" fill="#DDD"/>
      <circle cx="48" cy="45" r="2" fill="#C8A060"/>
      <ellipse cx="62" cy="54" rx="6" ry="4" fill="white"/>
      <circle cx="58" cy="52" r="4" fill="white"/>
      <circle cx="57" cy="56" r="1.5" fill="#DDD"/>
      <circle cx="65" cy="56" r="1.5" fill="#DDD"/>
      <circle cx="57" cy="50" r="2" fill="#C8A060"/>
      <rect x="16" y="44" width="36" height="22" rx="6" fill="#E8749A" clipPath="url(#av-cra)"/>
      <rect x="20" y="48" width="28" height="18" rx="4" fill="#F090B0" clipPath="url(#av-cra)"/>
      <circle cx="34" cy="30" r="13" fill="#F5CBA7"/>
      <path d="M21 26 Q18 36 20 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 26 Q50 36 48 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="34" cy="17" rx="13" ry="7" fill="#4A2800"/>
      <path d="M20 24 Q20 14 34 13 Q48 14 48 24 Q46 20 34 19 Q22 20 20 24Z" fill="#E8749A" opacity=".7"/>
      <circle cx="28" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="40" cy="29" r="2" fill="#2C3E50"/>
      <rect x="24" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="36" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <path d="M52 28 Q56 24 56 20" fill="none" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="52" y1="28" x2="50" y2="60" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function MosesSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cm"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#B8D8F0"/>
      <rect x="0" y="20" width="18" height="52" fill="#2E86C1" clipPath="url(#av-cm)"/>
      <rect x="54" y="20" width="18" height="52" fill="#2E86C1" clipPath="url(#av-cm)"/>
      <path d="M0 28 Q6 24 12 28 Q16 32 18 28" fill="none" stroke="#5DADE2" strokeWidth="1.5" clipPath="url(#av-cm)"/>
      <path d="M0 36 Q6 32 12 36 Q16 40 18 36" fill="none" stroke="#5DADE2" strokeWidth="1.5" clipPath="url(#av-cm)"/>
      <path d="M54 28 Q60 24 66 28 Q70 32 72 28" fill="none" stroke="#5DADE2" strokeWidth="1.5" clipPath="url(#av-cm)"/>
      <path d="M54 36 Q60 32 66 36 Q70 40 72 36" fill="none" stroke="#5DADE2" strokeWidth="1.5" clipPath="url(#av-cm)"/>
      <rect x="18" y="56" width="36" height="16" fill="#C8A060" clipPath="url(#av-cm)"/>
      <rect x="22" y="44" width="28" height="18" rx="6" fill="#4A90D9" clipPath="url(#av-cm)"/>
      <circle cx="36" cy="32" r="11" fill="#F5CBA7"/>
      <ellipse cx="36" cy="41" rx="8" ry="5" fill="#D5D8DC"/>
      <circle cx="31" cy="30" r="1.8" fill="#2C3E50"/>
      <circle cx="41" cy="30" r="1.8" fill="#2C3E50"/>
      <rect x="27" y="25" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="25" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="22" rx="10" ry="5" fill="#D5D8DC"/>
      <line x1="50" y1="26" x2="46" y2="58" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function DavidSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#FFF0F0"/>
      <rect x="16" y="44" width="40" height="22" rx="6" fill="#8B4513"/>
      <rect x="20" y="48" width="32" height="18" rx="4" fill="#A0522D"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="19" rx="12" ry="6" fill="#C8A060"/>
      <path d="M44 32 Q54 20 62 18" fill="none" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M44 32 Q56 28 62 18" fill="none" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="62" cy="17" r="4" fill="#888"/>
      <rect x="8" y="38" width="8" height="16" rx="2" fill="#666" opacity=".5"/>
      <rect x="9" y="32" width="6" height="8" rx="3" fill="#666" opacity=".5"/>
      <path d="M18 44 Q14 40 14 36 Q14 32 18 32" fill="none" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function SolomonSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#FFFBF0"/>
      <rect x="12" y="44" width="48" height="22" rx="6" fill="#8B0000"/>
      <rect x="16" y="48" width="40" height="18" rx="4" fill="#B22222"/>
      <circle cx="36" cy="30" r="13" fill="#F0C070"/>
      <ellipse cx="36" cy="40" rx="9" ry="6" fill="#C8A060"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="22" y="17" width="28" height="6" rx="1" fill="#F9AB00"/>
      <path d="M22 17 L22 11 L28 16 L36 9 L44 16 L50 11 L50 17Z" fill="#F9AB00" stroke="#C8860A" strokeWidth="1"/>
      <circle cx="36" cy="12" r="2" fill="#EA4335"/>
      <circle cx="26" cy="14" r="1.5" fill="#4285F4"/>
      <circle cx="46" cy="14" r="1.5" fill="#34A853"/>
      <rect x="54" y="44" width="10" height="14" rx="2" fill="#F5E6C8"/>
      <line x1="56" y1="48" x2="62" y2="48" stroke="#8B6914" strokeWidth="1"/>
      <line x1="56" y1="51" x2="62" y2="51" stroke="#8B6914" strokeWidth="1"/>
      <line x1="56" y1="54" x2="62" y2="54" stroke="#8B6914" strokeWidth="1"/>
    </svg>
  )
}

function ElijahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cel"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#1A1A2E"/>
      <ellipse cx="56" cy="36" rx="16" ry="28" fill="#F9AB00" opacity=".25" clipPath="url(#av-cel)"/>
      <path d="M44 62 Q46 50 44 42 Q48 46 50 38 Q52 46 56 40 Q56 50 60 44 Q62 52 60 62Z" fill="#EA4335" clipPath="url(#av-cel)"/>
      <path d="M46 62 Q48 52 46 44 Q50 48 52 40 Q54 48 57 43 Q58 52 62 47 Q62 54 60 62Z" fill="#F9AB00" clipPath="url(#av-cel)"/>
      <path d="M48 62 Q50 54 49 47 Q52 50 54 44 Q56 50 58 46 Q58 54 58 62Z" fill="#FFDD00" opacity=".8" clipPath="url(#av-cel)"/>
      <path d="M46 44 Q50 34 48 26 Q54 32 56 24 Q58 32 62 28 Q60 38 58 32 Q56 40 52 36 Q50 42 46 44Z" fill="#F9AB00" clipPath="url(#av-cel)"/>
      <path d="M48 42 Q52 34 51 27 Q55 33 57 26 Q58 34 60 30 Q58 38 55 34 Q53 40 48 42Z" fill="#FFDD00" opacity=".9" clipPath="url(#av-cel)"/>
      <rect x="14" y="44" width="36" height="22" rx="6" fill="#5555AA"/>
      <rect x="18" y="48" width="28" height="18" rx="4" fill="#7777CC"/>
      <circle cx="32" cy="30" r="12" fill="#F5CBA7"/>
      <ellipse cx="32" cy="40" rx="9" ry="6" fill="#D5D8DC"/>
      <circle cx="27" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="37" cy="28" r="2" fill="#2C3E50"/>
      <rect x="23" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="35" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="32" cy="19" rx="11" ry="6" fill="#D5D8DC"/>
    </svg>
  )
}

function RuthSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cru"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FFF8E8"/>
      <rect x="0" y="50" width="72" height="22" fill="#C8A060" clipPath="url(#av-cru)"/>
      <line x1="10" y1="50" x2="10" y2="34" stroke="#C8A060" strokeWidth="2"/>
      <ellipse cx="10" cy="32" rx="3" ry="6" fill="#D4A820"/>
      <line x1="18" y1="50" x2="18" y2="36" stroke="#C8A060" strokeWidth="2"/>
      <ellipse cx="18" cy="34" rx="3" ry="6" fill="#E8C030"/>
      <line x1="56" y1="50" x2="56" y2="32" stroke="#C8A060" strokeWidth="2"/>
      <ellipse cx="56" cy="30" rx="3" ry="6" fill="#D4A820"/>
      <line x1="64" y1="50" x2="64" y2="36" stroke="#C8A060" strokeWidth="2"/>
      <ellipse cx="64" cy="34" rx="3" ry="6" fill="#E8C030"/>
      <line x1="48" y1="50" x2="48" y2="38" stroke="#C8A060" strokeWidth="2"/>
      <ellipse cx="48" cy="36" rx="3" ry="5" fill="#D4A820"/>
      <rect x="22" y="48" width="30" height="18" rx="5" fill="#D4884A" clipPath="url(#av-cru)"/>
      <rect x="26" y="36" width="26" height="16" rx="5" fill="#E8A060" transform="rotate(-30 39 44)"/>
      <circle cx="46" cy="28" r="11" fill="#F5CBA7"/>
      <path d="M35 24 Q33 32 35 40" fill="none" stroke="#4A2800" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="46" cy="18" rx="11" ry="6" fill="#4A2800"/>
      <path d="M34 23 Q34 15 46 14 Q58 15 58 23 Q56 19 46 18 Q36 19 34 23Z" fill="#D4884A" opacity=".7"/>
      <circle cx="42" cy="27" r="2" fill="#2C3E50"/>
      <circle cx="52" cy="27" r="2" fill="#2C3E50"/>
      <ellipse cx="28" cy="46" rx="5" ry="3" fill="#D4A820" transform="rotate(-20 28 46)"/>
      <line x1="24" y1="48" x2="32" y2="44" stroke="#C8A060" strokeWidth="1.5"/>
    </svg>
  )
}

function JosephOTSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cyo"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FFF8DC"/>
      <path d="M2 66 L20 40 L38 66Z" fill="#D4B060" opacity=".4" clipPath="url(#av-cyo)"/>
      <path d="M34 66 L52 36 L70 66Z" fill="#C8A040" opacity=".4" clipPath="url(#av-cyo)"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#E8C830" clipPath="url(#av-cyo)"/>
      <rect x="15" y="46" width="6" height="18" fill="#EA4335" opacity=".6" clipPath="url(#av-cyo)"/>
      <rect x="22" y="46" width="6" height="18" fill="#4285F4" opacity=".6" clipPath="url(#av-cyo)"/>
      <rect x="29" y="46" width="6" height="18" fill="#34A853" opacity=".6" clipPath="url(#av-cyo)"/>
      <rect x="36" y="46" width="6" height="18" fill="#EA4335" opacity=".6" clipPath="url(#av-cyo)"/>
      <rect x="43" y="46" width="6" height="18" fill="#4285F4" opacity=".6" clipPath="url(#av-cyo)"/>
      <circle cx="36" cy="30" r="13" fill="#F0C070"/>
      <circle cx="30" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="42" cy="28" r="2" fill="#2C3E50"/>
      <rect x="26" y="22" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="40" y="22" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <path d="M22 24 L22 18 Q36 12 50 18 L50 24 L46 44 L42 44" fill="#1A5276" opacity=".85"/>
      <path d="M22 24 L18 44 L22 44" fill="#1A5276" opacity=".85"/>
      <rect x="33" y="12" width="6" height="4" rx="1" fill="#F9AB00"/>
      <path d="M22 44 Q36 50 50 44" fill="none" stroke="#F9AB00" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="29" cy="46" r="2" fill="#F9AB00"/>
      <circle cx="36" cy="48" r="2.5" fill="#EA4335"/>
      <circle cx="43" cy="46" r="2" fill="#F9AB00"/>
    </svg>
  )
}

function JesusSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cje"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FFF8E8"/>
      <rect x="33" y="0" width="6" height="72" fill="#C8A060" opacity=".2" clipPath="url(#av-cje)"/>
      <rect x="0" y="24" width="72" height="6" fill="#C8A060" opacity=".2" clipPath="url(#av-cje)"/>
      <circle cx="36" cy="30" r="20" fill="#FFF3CC" opacity=".9"/>
      <circle cx="36" cy="30" r="20" fill="none" stroke="#F9D054" strokeWidth="1.5"/>
      <rect x="16" y="50" width="40" height="24" rx="8" fill="#E8DDD0" clipPath="url(#av-cje)"/>
      <path d="M36 14 Q22 16 16 26 Q12 34 14 50" fill="#8B6030" clipPath="url(#av-cje)"/>
      <path d="M36 14 Q50 16 56 26 Q60 34 58 50" fill="#8B6030" clipPath="url(#av-cje)"/>
      <ellipse cx="36" cy="16" rx="16" ry="8" fill="#8B6030"/>
      <circle cx="36" cy="30" r="15" fill="#FADA9E"/>
      <ellipse cx="36" cy="41" rx="9" ry="6" fill="#A07030"/>
      <path d="M27 38 Q36 46 45 38" fill="#A07030"/>
      <path d="M28 25 Q31 23 34 25" fill="none" stroke="#7A4F1E" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M38 25 Q41 23 44 25" fill="none" stroke="#7A4F1E" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="31" cy="29" r="2.5" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2.5" fill="#2C3E50"/>
      <circle cx="32" cy="28" r="1" fill="white"/>
      <circle cx="42" cy="28" r="1" fill="white"/>
      <path d="M34 33 Q36 35 38 33" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function PeterSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cpe"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E0F0FF"/>
      <rect x="0" y="50" width="72" height="22" fill="#4A90D9" clipPath="url(#av-cpe)"/>
      <path d="M0 52 Q12 48 24 52 Q36 56 48 52 Q60 48 72 52" fill="none" stroke="#5DADE2" strokeWidth="1.5" clipPath="url(#av-cpe)"/>
      <line x1="38" y1="36" x2="30" y2="62" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="46" y1="34" x2="36" y2="62" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="54" y1="32" x2="42" y2="62" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="62" y1="30" x2="48" y2="62" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="30" y1="44" x2="62" y2="36" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="28" y1="50" x2="64" y2="40" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <line x1="28" y1="56" x2="56" y2="48" stroke="#8B6914" strokeWidth="1" opacity=".8"/>
      <ellipse cx="44" cy="54" rx="5" ry="3" fill="#5DADE2"/>
      <ellipse cx="52" cy="58" rx="4" ry="2.5" fill="#48C9B0"/>
      <ellipse cx="36" cy="58" rx="4" ry="2.5" fill="#5DADE2"/>
      <rect x="10" y="44" width="34" height="20" rx="6" fill="#3555AA"/>
      <circle cx="27" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="27" cy="40" rx="9" ry="6" fill="#D5D8DC"/>
      <circle cx="22" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="32" cy="28" r="2" fill="#2C3E50"/>
      <rect x="18" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="30" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="27" cy="19" rx="11" ry="6" fill="#D5D8DC"/>
    </svg>
  )
}

function PaulSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#FFF0E8"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#AA4422"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#CC6644"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="40" rx="9" ry="6" fill="#D5D8DC"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="20" rx="10" ry="5" fill="#D5D8DC"/>
      <rect x="50" y="42" width="14" height="18" rx="3" fill="#F5E6C8"/>
      <line x1="53" y1="47" x2="61" y2="47" stroke="#8B6914" strokeWidth="1"/>
      <line x1="53" y1="50" x2="61" y2="50" stroke="#8B6914" strokeWidth="1"/>
      <line x1="53" y1="53" x2="61" y2="53" stroke="#8B6914" strokeWidth="1"/>
      <line x1="10" y1="50" x2="16" y2="62" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="48" width="7" height="2" rx="1" fill="#AAA"/>
    </svg>
  )
}

function MagiSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cmg"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#1A1A3E"/>
      <circle cx="20" cy="10" r="1" fill="white" opacity=".6"/>
      <circle cx="45" cy="6" r="1" fill="white" opacity=".5"/>
      <circle cx="60" cy="14" r="1" fill="white" opacity=".6"/>
      <circle cx="10" cy="18" r=".8" fill="white" opacity=".5"/>
      <path d="M56 8 L57.5 12 L62 10 L58.5 13 L60 17 L56 14.5 L52 17 L53.5 13 L50 10 L54.5 12Z" fill="#F9AB00"/>
      <rect x="4" y="42" width="20" height="24" rx="4" fill="#C0392B" clipPath="url(#av-cmg)"/>
      <circle cx="14" cy="32" r="10" fill="#F0C070"/>
      <path d="M4 26 L14 18 L24 26 L22 32 L6 32Z" fill="#8B0000"/>
      <circle cx="11" cy="31" r="1.5" fill="#2C3E50"/>
      <circle cx="17" cy="31" r="1.5" fill="#2C3E50"/>
      <ellipse cx="14" cy="37" rx="5" ry="3" fill="#C8A060"/>
      <rect x="6" y="52" width="8" height="6" rx="1" fill="#F9AB00"/>
      <line x1="10" y1="52" x2="10" y2="58" stroke="#EA4335" strokeWidth="1"/>
      <line x1="6" y1="55" x2="14" y2="55" stroke="#EA4335" strokeWidth="1"/>
      <rect x="26" y="42" width="20" height="24" rx="4" fill="#1A5276" clipPath="url(#av-cmg)"/>
      <circle cx="36" cy="30" r="11" fill="#F5CBA7"/>
      <path d="M25 23 L36 14 L47 23 L45 30 L27 30Z" fill="#154360"/>
      <circle cx="31" cy="29" r="1.5" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="1.5" fill="#2C3E50"/>
      <ellipse cx="36" cy="36" rx="6" ry="3.5" fill="#C8A060"/>
      <ellipse cx="36" cy="54" rx="5" ry="4" fill="#D4AC0D"/>
      <rect x="48" y="42" width="20" height="24" rx="4" fill="#1E8449" clipPath="url(#av-cmg)"/>
      <circle cx="58" cy="32" r="10" fill="#F0C070"/>
      <path d="M48 26 L58 18 L68 26 L66 32 L50 32Z" fill="#145A32"/>
      <circle cx="54" cy="31" r="1.5" fill="#2C3E50"/>
      <circle cx="62" cy="31" r="1.5" fill="#2C3E50"/>
      <ellipse cx="58" cy="37" rx="5" ry="3" fill="#C8A060"/>
      <ellipse cx="62" cy="54" rx="4" ry="5" fill="#784212"/>
    </svg>
  )
}

function StephenSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#F8F0FF"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#7744AA"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#9966CC"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="39" rx="9" ry="5" fill="#C8A060"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="19" rx="11" ry="6" fill="#C8A060"/>
      <circle cx="36" cy="28" r="17" fill="none" stroke="#F9AB00" strokeWidth="1.5" strokeDasharray="3,2"/>
      <ellipse cx="54" cy="46" rx="6" ry="4" fill="#888"/>
      <ellipse cx="62" cy="52" rx="5" ry="3.5" fill="#999"/>
      <ellipse cx="54" cy="56" rx="5" ry="3" fill="#AAA"/>
    </svg>
  )
}

function JamesSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#F0FFF4"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#2D7A4F"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#3D9A6F"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="40" rx="9" ry="6" fill="#D5D8DC"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="19" rx="11" ry="6" fill="#D5D8DC"/>
      <rect x="52" y="22" width="5" height="36" rx="2" fill="#C0C0C0" transform="rotate(30 54 40)"/>
      <rect x="46" y="34" width="16" height="4" rx="1" fill="#A0784A" transform="rotate(30 54 36)"/>
      <rect x="53" y="20" width="4" height="7" rx="1" fill="#8B6914" transform="rotate(30 55 23)"/>
    </svg>
  )
}

function ZacchaesSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-czk"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E8F5E9"/>
      <rect x="30" y="38" width="8" height="34" rx="3" fill="#8B6914" clipPath="url(#av-czk)"/>
      <line x1="34" y1="48" x2="14" y2="38" stroke="#8B6914" strokeWidth="4" strokeLinecap="round"/>
      <line x1="34" y1="44" x2="58" y2="32" stroke="#8B6914" strokeWidth="4" strokeLinecap="round"/>
      <line x1="34" y1="52" x2="12" y2="50" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
      <line x1="34" y1="50" x2="60" y2="48" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="36" cy="16" r="18" fill="#34A853" opacity=".9" clipPath="url(#av-czk)"/>
      <circle cx="20" cy="22" r="13" fill="#2E8B57" opacity=".85" clipPath="url(#av-czk)"/>
      <circle cx="52" cy="20" r="13" fill="#3AA860" opacity=".85" clipPath="url(#av-czk)"/>
      <circle cx="36" cy="10" r="12" fill="#48C878" opacity=".8" clipPath="url(#av-czk)"/>
      <circle cx="14" cy="34" r="10" fill="#2E8B57" opacity=".75" clipPath="url(#av-czk)"/>
      <circle cx="56" cy="30" r="11" fill="#34A853" opacity=".8" clipPath="url(#av-czk)"/>
      <circle cx="50" cy="22" r="5" fill="#F5CBA7"/>
      <rect x="46" y="26" width="9" height="10" rx="2" fill="#B8860B"/>
      <circle cx="48" cy="20" r="1.5" fill="#2C3E50"/>
      <circle cx="52" cy="20" r="1.5" fill="#2C3E50"/>
      <circle cx="18" cy="60" r="5" fill="#F0C878"/>
      <rect x="14" y="63" width="10" height="9" rx="2" fill="#E8E0D0" clipPath="url(#av-czk)"/>
      <line x1="22" y1="62" x2="34" y2="56" stroke="#F5CBA7" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function MarySvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#FFF0F8"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#AA3366"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#CC5588"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <path d="M23 26 Q20 36 24 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <path d="M49 26 Q52 36 48 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="36" cy="17" rx="13" ry="7" fill="#4A2800"/>
      <path d="M22 24 Q22 14 36 13 Q50 14 50 24 Q48 20 36 19 Q24 20 22 24Z" fill="#6688CC"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <path d="M55 44 Q55 36 58 32 Q61 36 61 44" fill="none" stroke="#34A853" strokeWidth="2"/>
      <ellipse cx="58" cy="30" rx="4" ry="5" fill="white" stroke="#34A853" strokeWidth="1"/>
    </svg>
  )
}

function JobSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-job"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#3E3A34"/>
      <ellipse cx="20" cy="10" rx="20" ry="9" fill="#2A2724" clipPath="url(#av-job)"/>
      <ellipse cx="54" cy="8" rx="22" ry="10" fill="#2A2724" clipPath="url(#av-job)"/>
      <ellipse cx="36" cy="16" rx="26" ry="8" fill="#332F2B" clipPath="url(#av-job)"/>
      <path d="M44 6 L40 20 L46 19 L41 32" fill="none" stroke="#F9D054" strokeWidth="2" opacity=".9"/>
      <line x1="10" y1="18" x2="6" y2="30" stroke="#6E6A64" strokeWidth="1" opacity=".7"/>
      <line x1="20" y1="14" x2="16" y2="28" stroke="#6E6A64" strokeWidth="1" opacity=".6"/>
      <line x1="58" y1="16" x2="54" y2="30" stroke="#6E6A64" strokeWidth="1" opacity=".7"/>
      <line x1="66" y1="22" x2="63" y2="34" stroke="#6E6A64" strokeWidth="1" opacity=".5"/>
      <ellipse cx="36" cy="70" rx="44" ry="18" fill="#5E574E" clipPath="url(#av-job)"/>
      <ellipse cx="10" cy="60" rx="12" ry="5" fill="#4E4841" clipPath="url(#av-job)"/>
      <ellipse cx="62" cy="62" rx="12" ry="5" fill="#4E4841" clipPath="url(#av-job)"/>
      <path d="M18 48 L54 48 L56 66 L52 58 L48 66 L44 57 L40 66 L36 57 L32 66 L28 58 L24 66 L20 57Z" fill="#544A3E" clipPath="url(#av-job)"/>
      <path d="M22 50 L30 64" stroke="#3E362C" strokeWidth="1.5" clipPath="url(#av-job)"/>
      <path d="M44 50 L48 62" stroke="#3E362C" strokeWidth="1.5" clipPath="url(#av-job)"/>
      <path d="M22 54 Q14 50 12 44" fill="none" stroke="#C89870" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="17" cy="49" r="1.4" fill="#C4564A"/>
      <circle cx="14" cy="45" r="1.2" fill="#C4564A"/>
      <path d="M6 40 L14 38 L11 45Z" fill="#8E8378"/>
      <circle cx="36" cy="31" r="13" fill="#C89870"/>
      <ellipse cx="36" cy="42" rx="9" ry="6" fill="#D8D4CE"/>
      <ellipse cx="36" cy="20" rx="11" ry="6" fill="#D8D4CE"/>
      <ellipse cx="36" cy="17" rx="9" ry="3" fill="#7A7168" opacity=".8"/>
      <path d="M27 31 Q31 34 35 31" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M38 31 Q42 34 46 31" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="25" y="24" width="8" height="2" rx="1" fill="#6E6258" transform="rotate(20 29 25)"/>
      <rect x="39" y="24" width="8" height="2" rx="1" fill="#6E6258" transform="rotate(-20 43 25)"/>
      <path d="M30 34 Q30 38 31 40" fill="none" stroke="#8CC4EC" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M42 34 Q42 37 43 39" fill="none" stroke="#8CC4EC" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M31 37 Q36 34 41 37" fill="none" stroke="#9E7050" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="46" cy="35" r="1.3" fill="#C4564A"/>
      <circle cx="27" cy="37" r="1.2" fill="#C4564A"/>
      <circle cx="44" cy="27" r="1.1" fill="#C4564A"/>
    </svg>
  )
}

function SamuelSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-sml"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#2A2418"/>
      <ellipse cx="56" cy="40" rx="18" ry="20" fill="#F9AB00" opacity=".22" clipPath="url(#av-sml)"/>
      <rect x="0" y="10" width="8" height="62" fill="#4A4232" clipPath="url(#av-sml)"/>
      <rect x="64" y="10" width="8" height="62" fill="#4A4232" clipPath="url(#av-sml)"/>
      <ellipse cx="56" cy="48" rx="7" ry="4" fill="#C8A060"/>
      <path d="M50 47 Q47 45 45 46 Q48 48 50 49Z" fill="#C8A060"/>
      <path d="M46 46 Q44 41 46 38 Q48 41 47 46Z" fill="#F9AB00"/>
      <path d="M46 45 Q45 42 46 40 Q47 42 46.5 45Z" fill="#FFDD55"/>
      <rect x="16" y="46" width="34" height="20" rx="6" fill="#F0EDE4" clipPath="url(#av-sml)"/>
      <rect x="20" y="50" width="26" height="16" rx="4" fill="#FBFAF6" clipPath="url(#av-sml)"/>
      <rect x="24" y="50" width="18" height="3" rx="1" fill="#4285F4" opacity=".5"/>
      <circle cx="33" cy="32" r="12" fill="#F5CBA7"/>
      <path d="M21 30 Q21 18 33 18 Q45 18 45 30 Q41 24 33 24 Q25 24 21 30Z" fill="#3A2410"/>
      <circle cx="28" cy="32" r="2" fill="#2C3E50"/>
      <circle cx="38" cy="32" r="2" fill="#2C3E50"/>
      <circle cx="29" cy="31" r=".7" fill="white"/>
      <circle cx="39" cy="31" r=".7" fill="white"/>
      <rect x="24" y="27" width="6" height="2" rx="1" fill="#6B5030"/>
      <rect x="36" y="27" width="6" height="2" rx="1" fill="#6B5030"/>
      <path d="M30 38 Q33 40 36 38" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function JoshuaSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-jos"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#DCE9F5"/>
      <rect x="52" y="8" width="20" height="30" fill="#C8A878" clipPath="url(#av-jos)"/>
      <rect x="52" y="8" width="20" height="6" fill="#B89868" clipPath="url(#av-jos)"/>
      <rect x="52" y="18" width="20" height="6" fill="#B89868" clipPath="url(#av-jos)"/>
      <rect x="52" y="28" width="20" height="6" fill="#B89868" clipPath="url(#av-jos)"/>
      <rect x="58" y="38" width="9" height="8" fill="#C8A878" transform="rotate(18 62 42)" clipPath="url(#av-jos)"/>
      <rect x="50" y="44" width="8" height="7" fill="#B89868" transform="rotate(-24 54 47)" clipPath="url(#av-jos)"/>
      <rect x="62" y="48" width="8" height="7" fill="#C8A878" transform="rotate(32 66 51)" clipPath="url(#av-jos)"/>
      <rect x="0" y="58" width="72" height="14" fill="#C8A060" clipPath="url(#av-jos)"/>
      <rect x="12" y="44" width="38" height="22" rx="6" fill="#8B4A2B" clipPath="url(#av-jos)"/>
      <rect x="16" y="48" width="30" height="18" rx="4" fill="#A8613C" clipPath="url(#av-jos)"/>
      <rect x="18" y="48" width="26" height="4" rx="1" fill="#C0C0C0"/>
      <circle cx="32" cy="30" r="13" fill="#D8A878"/>
      <ellipse cx="32" cy="40" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="27" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="37" cy="28" r="2" fill="#2C3E50"/>
      <rect x="23" y="23" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="35" y="23" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="32" cy="19" rx="11" ry="6" fill="#3A2410"/>
      <path d="M42 36 Q52 34 56 26 Q58 22 55 20 Q54 26 48 30 Q44 33 42 36Z" fill="#E8D8B8" stroke="#B8A078" strokeWidth="1"/>
    </svg>
  )
}

function CalebSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-cal"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EDF6E4"/>
      <rect x="0" y="58" width="72" height="14" fill="#B8A878" clipPath="url(#av-cal)"/>
      <line x1="50" y1="10" x2="58" y2="30" stroke="#6B4C11" strokeWidth="2.5"/>
      <circle cx="54" cy="30" r="4" fill="#7B3FA0"/><circle cx="61" cy="32" r="4" fill="#8E5AB8"/>
      <circle cx="57" cy="37" r="4" fill="#7B3FA0"/><circle cx="64" cy="39" r="3.6" fill="#8E5AB8"/>
      <circle cx="59" cy="44" r="3.6" fill="#6A3E96"/><circle cx="53" cy="38" r="3.4" fill="#8E5AB8"/>
      <circle cx="62" cy="26" r="3" fill="#8E5AB8"/>
      <path d="M48 12 Q42 8 38 12 Q44 14 48 16Z" fill="#4EA860"/>
      <rect x="10" y="44" width="38" height="22" rx="6" fill="#7A5A2E" clipPath="url(#av-cal)"/>
      <rect x="14" y="48" width="30" height="18" rx="4" fill="#98753E" clipPath="url(#av-cal)"/>
      <path d="M42 48 Q48 38 51 30" fill="none" stroke="#E0AC7C" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="28" cy="30" r="13" fill="#E0AC7C"/>
      <ellipse cx="28" cy="41" rx="9" ry="6" fill="#D8D4CE"/>
      <circle cx="23" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="33" cy="29" r="2" fill="#2C3E50"/>
      <rect x="19" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="31" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="28" cy="19" rx="11" ry="6" fill="#D8D4CE"/>
    </svg>
  )
}

function AaronSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-aar"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FBF4E4"/>
      <rect x="0" y="8" width="8" height="64" fill="#D8C49A" clipPath="url(#av-aar)"/>
      <rect x="64" y="8" width="8" height="64" fill="#D8C49A" clipPath="url(#av-aar)"/>
      <rect x="12" y="44" width="48" height="22" rx="6" fill="#3E5FA8" clipPath="url(#av-aar)"/>
      <rect x="16" y="48" width="40" height="18" rx="4" fill="#5478C4" clipPath="url(#av-aar)"/>
      <rect x="27" y="47" width="18" height="15" rx="2" fill="#F0DCC0" stroke="#C8860A" strokeWidth="1.5"/>
      <circle cx="31" cy="51" r="1.6" fill="#EA4335"/><circle cx="36" cy="51" r="1.6" fill="#34A853"/><circle cx="41" cy="51" r="1.6" fill="#4285F4"/>
      <circle cx="31" cy="55" r="1.6" fill="#F9AB00"/><circle cx="36" cy="55" r="1.6" fill="#8E5AB8"/><circle cx="41" cy="55" r="1.6" fill="#48C9B0"/>
      <circle cx="31" cy="59" r="1.6" fill="#D4645A"/><circle cx="36" cy="59" r="1.6" fill="#639922"/><circle cx="41" cy="59" r="1.6" fill="#2E86C1"/>
      <circle cx="36" cy="29" r="13" fill="#F0C89E"/>
      <ellipse cx="36" cy="40" rx="9" ry="6" fill="#E4E4E4"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="18" rx="12" ry="6" fill="#E4E4E4"/>
      <rect x="24" y="11" width="24" height="7" rx="2" fill="#3E5FA8"/>
      <rect x="27" y="12" width="18" height="4" rx="1" fill="#F9AB00"/>
    </svg>
  )
}

function DanielSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-dan"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#3A2A0A"/>
      <circle cx="14" cy="52" r="14" fill="#B8860B" opacity=".5" clipPath="url(#av-dan)"/>
      <circle cx="58" cy="50" r="16" fill="#B8860B" opacity=".5" clipPath="url(#av-dan)"/>
      <path d="M4 60 L14 44 L24 60Z" fill="#8B6914" opacity=".7" clipPath="url(#av-dan)"/>
      <path d="M46 62 L58 42 L70 62Z" fill="#8B6914" opacity=".7" clipPath="url(#av-dan)"/>
      <rect x="16" y="44" width="40" height="22" rx="6" fill="#8B0000" clipPath="url(#av-dan)"/>
      <rect x="20" y="48" width="32" height="18" rx="4" fill="#B22222" clipPath="url(#av-dan)"/>
      <circle cx="36" cy="30" r="13" fill="#F0C070"/>
      <ellipse cx="36" cy="40" rx="9" ry="6" fill="#C8A060"/>
      <circle cx="31" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="2" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="19" rx="11" ry="6" fill="#C8A060"/>
    </svg>
  )
}

function JonahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-jnh"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#B8D8F0"/>
      <ellipse cx="40" cy="48" rx="34" ry="20" fill="#4A7FA8" clipPath="url(#av-jnh)"/>
      <path d="M60 40 Q72 44 68 54 Q62 50 60 40Z" fill="#3A6D93" clipPath="url(#av-jnh)"/>
      <circle cx="20" cy="42" r="1.5" fill="#2C3E50" opacity=".6"/>
      <rect x="18" y="44" width="36" height="20" rx="6" fill="#8B6914" clipPath="url(#av-jnh)"/>
      <circle cx="36" cy="30" r="12" fill="#F5CBA7"/>
      <ellipse cx="36" cy="39" rx="8" ry="5" fill="#D5D8DC"/>
      <circle cx="31" cy="28" r="1.8" fill="#2C3E50"/>
      <circle cx="41" cy="28" r="1.8" fill="#2C3E50"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="36" cy="20" rx="10" ry="5" fill="#D5D8DC"/>
    </svg>
  )
}

function EstherSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#F5F0FF"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#6A2C8F"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#8B44B0"/>
      <path d="M25 24 Q22 34 25 46" fill="none" stroke="#3A1F0A" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 24 Q50 34 47 46" fill="none" stroke="#3A1F0A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="17" rx="13" ry="7" fill="#3A1F0A"/>
      <rect x="26" y="10" width="20" height="6" rx="1" fill="#F9AB00"/>
      <path d="M26 10 L26 5 L31 9 L36 4 L41 9 L46 5 L46 10Z" fill="#F9AB00" stroke="#C8860A" strokeWidth="1"/>
      <circle cx="30" cy="7" r="1.3" fill="#D4004A"/>
      <circle cx="42" cy="7" r="1.3" fill="#1A5276"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2" fill="#2C3E50"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
    </svg>
  )
}

function DeborahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-deb"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EAF6EC"/>
      <path d="M58 8 L60 40" stroke="#6B4C11" strokeWidth="3" clipPath="url(#av-deb)"/>
      <path d="M58 12 Q46 6 58 2 Q70 6 58 12Z" fill="#3B8C4A" clipPath="url(#av-deb)"/>
      <path d="M58 18 Q44 12 58 8 Q72 12 58 18Z" fill="#4EA860" clipPath="url(#av-deb)"/>
      <path d="M58 24 Q44 18 58 14 Q72 18 58 24Z" fill="#3B8C4A" clipPath="url(#av-deb)"/>
      <rect x="12" y="44" width="40" height="22" rx="6" fill="#2D7A4F"/>
      <rect x="16" y="48" width="32" height="18" rx="4" fill="#3D9A6F"/>
      <path d="M21 24 Q18 34 21 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <path d="M43 24 Q46 34 43 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="32" cy="30" r="13" fill="#C88A5A"/>
      <ellipse cx="32" cy="17" rx="13" ry="7" fill="#2A1505"/>
      <circle cx="27" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="37" cy="29" r="2" fill="#2C3E50"/>
      <rect x="23" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="35" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
    </svg>
  )
}

function SamsonSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-sms"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F0E6D8"/>
      <rect x="2" y="18" width="12" height="54" fill="#B0A080" clipPath="url(#av-sms)"/>
      <rect x="58" y="18" width="12" height="54" fill="#B0A080" clipPath="url(#av-sms)"/>
      <rect x="16" y="46" width="40" height="20" rx="6" fill="#8B5A2B"/>
      <rect x="20" y="49" width="32" height="17" rx="4" fill="#A9713C"/>
      <path d="M18 46 Q10 30 22 24" fill="none" stroke="#4A2800" strokeWidth="6" strokeLinecap="round"/>
      <path d="M54 46 Q62 30 50 24" fill="none" stroke="#4A2800" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="36" cy="30" r="14" fill="#E8A868"/>
      <path d="M23 22 Q26 8 36 8 Q46 8 49 22 Q42 16 36 18 Q30 16 23 22Z" fill="#2A1505"/>
      <circle cx="30" cy="30" r="2.2" fill="#2C3E50"/>
      <circle cx="42" cy="30" r="2.2" fill="#2C3E50"/>
      <rect x="25" y="25" width="7" height="2" rx="1" fill="#5A4530"/>
      <rect x="40" y="25" width="7" height="2" rx="1" fill="#5A4530"/>
    </svg>
  )
}

function GideonSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-gid"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#1C2438"/>
      <circle cx="14" cy="12" r="1" fill="white" opacity=".6"/>
      <circle cx="30" cy="7" r="1.2" fill="white" opacity=".5"/>
      <circle cx="58" cy="14" r="1" fill="white" opacity=".6"/>
      <circle cx="66" cy="26" r=".8" fill="white" opacity=".4"/>
      <ellipse cx="52" cy="42" rx="17" ry="19" fill="#F9AB00" opacity=".2" clipPath="url(#av-gid)"/>
      <path d="M48 34 Q52 24 50 16 Q56 22 58 14 Q60 22 63 18 Q62 28 58 24 Q56 32 48 34Z" fill="#F9AB00"/>
      <path d="M50 33 Q53 26 52 19 Q56 24 57 18 Q59 25 60 22 Q59 29 56 26 Q54 31 50 33Z" fill="#FFDD55" opacity=".9"/>
      <path d="M46 36 Q44 50 52 56 Q60 50 58 36Z" fill="#A0714A"/>
      <path d="M46 36 L58 36 L57 40 L47 40Z" fill="#8B5A2B"/>
      <rect x="10" y="46" width="34" height="20" rx="6" fill="#4A5A7A" clipPath="url(#av-gid)"/>
      <rect x="14" y="50" width="26" height="16" rx="4" fill="#5F7098" clipPath="url(#av-gid)"/>
      <circle cx="28" cy="32" r="13" fill="#E8B888"/>
      <ellipse cx="28" cy="42" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="23" cy="30" r="2" fill="#2C3E50"/>
      <circle cx="33" cy="30" r="2" fill="#2C3E50"/>
      <rect x="19" y="25" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="31" y="25" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="28" cy="21" rx="11" ry="6" fill="#3A2410"/>
    </svg>
  )
}

function HannahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-han"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F3EDF8"/>
      <rect x="0" y="6" width="10" height="66" fill="#DCD2E4" clipPath="url(#av-han)"/>
      <rect x="62" y="6" width="10" height="66" fill="#DCD2E4" clipPath="url(#av-han)"/>
      <rect x="0" y="6" width="10" height="5" fill="#C8BAD4" clipPath="url(#av-han)"/>
      <rect x="62" y="6" width="10" height="5" fill="#C8BAD4" clipPath="url(#av-han)"/>
      <rect x="14" y="46" width="40" height="20" rx="6" fill="#7B6BA8" clipPath="url(#av-han)"/>
      <rect x="18" y="50" width="32" height="16" rx="4" fill="#9484C0" clipPath="url(#av-han)"/>
      <ellipse cx="36" cy="47" rx="7" ry="5" fill="#F5CBA7"/>
      <path d="M32 48 Q36 42 40 48" fill="none" stroke="#E8B898" strokeWidth="1.5"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <path d="M23 26 Q20 36 23 46" fill="none" stroke="#3A2410" strokeWidth="5" strokeLinecap="round"/>
      <path d="M49 26 Q52 36 49 46" fill="none" stroke="#3A2410" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="36" cy="17" rx="13" ry="7" fill="#3A2410"/>
      <path d="M22 24 Q22 13 36 12 Q50 13 50 24 Q48 20 36 19 Q24 20 22 24Z" fill="#C8B8E0"/>
      <path d="M27 28 Q30 26 33 28" fill="none" stroke="#7F8C8D" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M39 28 Q42 26 45 28" fill="none" stroke="#7F8C8D" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="31" cy="31" r="1.8" fill="#2C3E50"/>
      <circle cx="41" cy="31" r="1.8" fill="#2C3E50"/>
      <path d="M31 34 Q31 37 32 38" fill="none" stroke="#7FB8E8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MiriamSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-mrm"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E4F4FA"/>
      <rect x="0" y="20" width="9" height="52" fill="#5B9ED9" clipPath="url(#av-mrm)"/>
      <rect x="63" y="20" width="9" height="52" fill="#5B9ED9" clipPath="url(#av-mrm)"/>
      <path d="M0 26 Q5 22 9 26" fill="none" stroke="#8CC4EC" strokeWidth="1.5" clipPath="url(#av-mrm)"/>
      <path d="M63 26 Q68 22 72 26" fill="none" stroke="#8CC4EC" strokeWidth="1.5" clipPath="url(#av-mrm)"/>
      <rect x="0" y="60" width="72" height="12" fill="#D8C08A" clipPath="url(#av-mrm)"/>
      <rect x="16" y="46" width="38" height="20" rx="6" fill="#D4645A" clipPath="url(#av-mrm)"/>
      <rect x="20" y="50" width="30" height="16" rx="4" fill="#E8837A" clipPath="url(#av-mrm)"/>
      <circle cx="33" cy="30" r="13" fill="#E0AC7C"/>
      <path d="M20 26 Q17 36 20 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <path d="M46 26 Q49 36 46 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="33" cy="17" rx="13" ry="7" fill="#2A1505"/>
      <path d="M19 24 Q19 13 33 12 Q47 13 47 24 Q45 20 33 19 Q21 20 19 24Z" fill="#D4645A" opacity=".75"/>
      <circle cx="28" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="38" cy="29" r="2" fill="#2C3E50"/>
      <rect x="24" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="36" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <path d="M29 34 Q33 37 37 34" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="56" cy="30" r="9" fill="none" stroke="#C8860A" strokeWidth="3"/>
      <circle cx="56" cy="30" r="6" fill="#F0DCC0" opacity=".8"/>
      <circle cx="56" cy="21" r="1.8" fill="#F9AB00"/>
      <circle cx="64" cy="27" r="1.8" fill="#F9AB00"/>
      <circle cx="62" cy="37" r="1.8" fill="#F9AB00"/>
      <circle cx="50" cy="37" r="1.8" fill="#F9AB00"/>
      <circle cx="48" cy="26" r="1.8" fill="#F9AB00"/>
    </svg>
  )
}

function RahabSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-rah"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F6EDE4"/>
      <rect x="46" y="0" width="26" height="72" fill="#C8B08A" clipPath="url(#av-rah)"/>
      <rect x="46" y="0" width="26" height="4" fill="#B09868" clipPath="url(#av-rah)"/>
      <rect x="46" y="16" width="26" height="4" fill="#B09868" clipPath="url(#av-rah)"/>
      <rect x="46" y="40" width="26" height="4" fill="#B09868" clipPath="url(#av-rah)"/>
      <rect x="53" y="22" width="14" height="16" rx="2" fill="#4A4034" clipPath="url(#av-rah)"/>
      <path d="M60 38 Q56 50 62 62 Q66 68 63 72" fill="none" stroke="#D4342A" strokeWidth="3" strokeLinecap="round" clipPath="url(#av-rah)"/>
      <rect x="8" y="46" width="36" height="20" rx="6" fill="#B05A70" clipPath="url(#av-rah)"/>
      <rect x="12" y="50" width="28" height="16" rx="4" fill="#CC7A90" clipPath="url(#av-rah)"/>
      <circle cx="26" cy="30" r="13" fill="#E8C0A0"/>
      <path d="M13 26 Q10 36 13 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <path d="M39 26 Q42 36 39 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="26" cy="17" rx="13" ry="7" fill="#2A1505"/>
      <path d="M12 24 Q12 13 26 12 Q40 13 40 24 Q38 20 26 19 Q14 20 12 24Z" fill="#D4342A" opacity=".65"/>
      <circle cx="21" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <rect x="17" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="29" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <path d="M22 34 Q26 37 30 34" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function BoazSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-boa"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FBF3DC"/>
      <rect x="0" y="54" width="72" height="18" fill="#D8B860" clipPath="url(#av-boa)"/>
      <line x1="6" y1="54" x2="6" y2="36" stroke="#C8A84C" strokeWidth="2"/><ellipse cx="6" cy="34" rx="3" ry="6" fill="#E8C860"/>
      <line x1="14" y1="54" x2="14" y2="40" stroke="#C8A84C" strokeWidth="2"/><ellipse cx="14" cy="38" rx="3" ry="6" fill="#F0D470"/>
      <line x1="58" y1="54" x2="58" y2="34" stroke="#C8A84C" strokeWidth="2"/><ellipse cx="58" cy="32" rx="3" ry="6" fill="#E8C860"/>
      <line x1="66" y1="54" x2="66" y2="40" stroke="#C8A84C" strokeWidth="2"/><ellipse cx="66" cy="38" rx="3" ry="6" fill="#F0D470"/>
      <line x1="50" y1="54" x2="50" y2="42" stroke="#C8A84C" strokeWidth="2"/><ellipse cx="50" cy="40" rx="3" ry="5" fill="#E8C860"/>
      <rect x="14" y="44" width="42" height="22" rx="6" fill="#4A7A4E" clipPath="url(#av-boa)"/>
      <rect x="18" y="48" width="34" height="18" rx="4" fill="#639A66" clipPath="url(#av-boa)"/>
      <rect x="19" y="48" width="32" height="4" rx="1" fill="#C8A060" opacity=".8"/>
      <circle cx="36" cy="30" r="13" fill="#E0AC7C"/>
      <ellipse cx="36" cy="41" rx="9" ry="6" fill="#4A3018"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2" fill="#2C3E50"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="39" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="36" cy="19" rx="12" ry="6" fill="#C8A060"/>
      <path d="M24 19 Q36 10 48 19" fill="none" stroke="#A88840" strokeWidth="2"/>
    </svg>
  )
}

function NaomiSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-nao"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F4EFE6"/>
      <rect x="0" y="56" width="72" height="16" fill="#C8B08A" clipPath="url(#av-nao)"/>
      <path d="M0 56 Q18 40 36 46 Q54 52 72 42 L72 56Z" fill="#B89C74" opacity=".5" clipPath="url(#av-nao)"/>
      <rect x="14" y="46" width="40" height="20" rx="6" fill="#6E6A5E" clipPath="url(#av-nao)"/>
      <rect x="18" y="50" width="32" height="16" rx="4" fill="#8A8578" clipPath="url(#av-nao)"/>
      <circle cx="34" cy="30" r="13" fill="#E0BC98"/>
      <path d="M21 26 Q18 36 21 46" fill="none" stroke="#B8B0A4" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 26 Q50 36 47 46" fill="none" stroke="#B8B0A4" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="34" cy="17" rx="13" ry="7" fill="#B8B0A4"/>
      <path d="M20 24 Q20 13 34 12 Q48 13 48 24 Q46 20 34 19 Q22 20 20 24Z" fill="#7E7A6E" opacity=".85"/>
      <circle cx="29" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="39" cy="29" r="2" fill="#2C3E50"/>
      <rect x="25" y="24" width="6" height="2" rx="1" fill="#9A9184" transform="rotate(8 28 25)"/>
      <rect x="37" y="24" width="6" height="2" rx="1" fill="#9A9184" transform="rotate(-8 40 25)"/>
      <path d="M30 35 Q34 37 38 35" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M26 33 L28 34" stroke="#C8A88C" strokeWidth="1"/>
      <path d="M42 33 L40 34" stroke="#C8A88C" strokeWidth="1"/>
    </svg>
  )
}

function SarahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-sar"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FDF4E8"/>
      <path d="M6 20 L20 34 L6 48Z" fill="#E8D8B8" opacity=".6" clipPath="url(#av-sar)"/>
      <path d="M0 16 L18 34 L0 52Z" fill="#D8C8A8" opacity=".5" clipPath="url(#av-sar)"/>
      <circle cx="60" cy="14" r="7" fill="#F9D054" opacity=".5"/>
      <rect x="16" y="46" width="40" height="20" rx="6" fill="#B08A5A" clipPath="url(#av-sar)"/>
      <rect x="20" y="50" width="32" height="16" rx="4" fill="#C8A472" clipPath="url(#av-sar)"/>
      <ellipse cx="46" cy="52" rx="7" ry="6" fill="#F0DCC0"/>
      <path d="M42 50 Q46 46 50 50" fill="none" stroke="#D8C4A0" strokeWidth="1.2"/>
      <circle cx="34" cy="30" r="13" fill="#EBC4A0"/>
      <path d="M21 26 Q18 36 21 46" fill="none" stroke="#C8C0B4" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 26 Q50 36 47 46" fill="none" stroke="#C8C0B4" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="34" cy="17" rx="13" ry="7" fill="#C8C0B4"/>
      <path d="M20 24 Q20 13 34 12 Q48 13 48 24 Q46 20 34 19 Q22 20 20 24Z" fill="#E8C878" opacity=".7"/>
      <path d="M26 28 Q29 31 32 28" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M36 28 Q39 31 42 28" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="25" y="23" width="6" height="2" rx="1" fill="#A89C90" transform="rotate(-8 28 24)"/>
      <rect x="37" y="23" width="6" height="2" rx="1" fill="#A89C90" transform="rotate(8 40 24)"/>
      <path d="M29 34 Q34 39 39 34" fill="none" stroke="#B87860" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function ElishaSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-esh"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E8EFF6"/>
      <path d="M0 40 Q10 20 24 26 Q34 30 30 44" fill="#C8A060" opacity=".45" clipPath="url(#av-esh)"/>
      <path d="M4 30 Q14 18 26 24" fill="none" stroke="#A88840" strokeWidth="2" opacity=".6" clipPath="url(#av-esh)"/>
      <rect x="0" y="58" width="72" height="14" fill="#B8C4A8" clipPath="url(#av-esh)"/>
      <path d="M0 58 Q20 50 40 56 Q56 60 72 54 L72 58Z" fill="#A8B498" opacity=".6" clipPath="url(#av-esh)"/>
      <rect x="16" y="44" width="40" height="22" rx="6" fill="#5A6E8E" clipPath="url(#av-esh)"/>
      <rect x="20" y="48" width="32" height="18" rx="4" fill="#7288A8" clipPath="url(#av-esh)"/>
      <path d="M20 48 Q22 58 20 66" fill="none" stroke="#C8A060" strokeWidth="3" clipPath="url(#av-esh)"/>
      <circle cx="36" cy="30" r="13" fill="#E8B888"/>
      <ellipse cx="36" cy="41" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2" fill="#2C3E50"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="39" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <path d="M23 24 Q28 16 36 16 Q44 16 49 24 Q42 20 36 20 Q30 20 23 24Z" fill="#3A2410"/>
      <path d="M52 44 Q58 34 56 24" fill="none" stroke="#C8A060" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )
}

function IsaiahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-isa"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FAF0DE"/>
      <circle cx="36" cy="30" r="26" fill="#F9D054" opacity=".18" clipPath="url(#av-isa)"/>
      <path d="M50 14 Q60 10 62 18 Q56 18 52 20Z" fill="#E8B860"/>
      <path d="M52 20 Q62 20 62 28 Q56 26 51 25Z" fill="#F0C878"/>
      <circle cx="49" cy="17" r="3" fill="#F0C89E"/>
      <rect x="14" y="44" width="42" height="22" rx="6" fill="#7A4A8E" clipPath="url(#av-isa)"/>
      <rect x="18" y="48" width="34" height="18" rx="4" fill="#9A66AE" clipPath="url(#av-isa)"/>
      <circle cx="34" cy="30" r="13" fill="#F0C89E"/>
      <ellipse cx="34" cy="41" rx="9" ry="6" fill="#D8D4CE"/>
      <circle cx="29" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="39" cy="29" r="2" fill="#2C3E50"/>
      <rect x="25" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="37" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="34" cy="19" rx="11" ry="6" fill="#D8D4CE"/>
      <ellipse cx="34" cy="37" rx="4" ry="2.6" fill="#B87860"/>
      <circle cx="43" cy="34" r="3.4" fill="#EA4335"/>
      <circle cx="43" cy="34" r="1.8" fill="#F9D054"/>
      <path d="M47 32 Q52 28 54 24" fill="none" stroke="#C8A060" strokeWidth="1.5"/>
    </svg>
  )
}

function JeremiahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-jer"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E4E8EC"/>
      <ellipse cx="24" cy="8" rx="20" ry="8" fill="#C8CED4" clipPath="url(#av-jer)"/>
      <ellipse cx="56" cy="10" rx="18" ry="8" fill="#C8CED4" clipPath="url(#av-jer)"/>
      <rect x="0" y="56" width="72" height="16" fill="#A89880" clipPath="url(#av-jer)"/>
      <ellipse cx="56" cy="54" rx="10" ry="8" fill="#9E7048"/>
      <path d="M48 52 L52 44 L60 44 L64 52Z" fill="#B08050"/>
      <path d="M53 44 L55 36 L58 44Z" fill="#8E6238" opacity=".7"/>
      <rect x="10" y="46" width="38" height="20" rx="6" fill="#5A5A6E" clipPath="url(#av-jer)"/>
      <rect x="14" y="50" width="30" height="16" rx="4" fill="#76768C" clipPath="url(#av-jer)"/>
      <circle cx="28" cy="30" r="13" fill="#D8A878"/>
      <ellipse cx="28" cy="41" rx="9" ry="6" fill="#4A3018"/>
      <path d="M19 30 Q23 33 27 30" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M29 30 Q33 33 37 30" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="17" y="23" width="7" height="2" rx="1" fill="#5A4530" transform="rotate(18 20 24)"/>
      <rect x="31" y="23" width="7" height="2" rx="1" fill="#5A4530" transform="rotate(-18 35 24)"/>
      <ellipse cx="28" cy="19" rx="11" ry="6" fill="#4A3018"/>
      <path d="M22 33 Q22 38 23 41" fill="none" stroke="#7FB8E8" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M34 33 Q34 37 35 40" fill="none" stroke="#7FB8E8" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function NehemiahSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-neh"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EEF2F6"/>
      <rect x="44" y="22" width="28" height="12" fill="#C8B48C" clipPath="url(#av-neh)"/>
      <rect x="44" y="36" width="28" height="12" fill="#B8A47C" clipPath="url(#av-neh)"/>
      <rect x="44" y="50" width="28" height="12" fill="#C8B48C" clipPath="url(#av-neh)"/>
      <line x1="52" y1="22" x2="52" y2="34" stroke="#A8946C" strokeWidth="1.5" clipPath="url(#av-neh)"/>
      <line x1="62" y1="36" x2="62" y2="48" stroke="#A8946C" strokeWidth="1.5" clipPath="url(#av-neh)"/>
      <line x1="56" y1="50" x2="56" y2="62" stroke="#A8946C" strokeWidth="1.5" clipPath="url(#av-neh)"/>
      <rect x="46" y="12" width="12" height="9" fill="#D8C49C" clipPath="url(#av-neh)"/>
      <rect x="0" y="60" width="72" height="12" fill="#B8AE98" clipPath="url(#av-neh)"/>
      <rect x="8" y="46" width="36" height="20" rx="6" fill="#3E6E8E" clipPath="url(#av-neh)"/>
      <rect x="12" y="50" width="28" height="16" rx="4" fill="#5488A8" clipPath="url(#av-neh)"/>
      <path d="M38 50 Q44 44 48 40" fill="none" stroke="#E0AC7C" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M46 34 L54 42 L50 45 L43 38Z" fill="#B0B0B8"/>
      <rect x="42" y="36" width="4" height="6" rx="1" fill="#8B6914" transform="rotate(-42 44 39)"/>
      <circle cx="28" cy="30" r="13" fill="#E0AC7C"/>
      <ellipse cx="28" cy="41" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="23" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="33" cy="29" r="2" fill="#2C3E50"/>
      <rect x="19" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="31" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="28" cy="19" rx="11" ry="6" fill="#3A2410"/>
    </svg>
  )
}

function JohnBaptistSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-jbp"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#DCEEF5"/>
      <rect x="0" y="52" width="72" height="20" fill="#5B9ED9" clipPath="url(#av-jbp)"/>
      <path d="M0 54 Q10 50 20 54 Q30 58 40 54 Q50 50 62 54 Q66 56 72 54" fill="none" stroke="#7FB8E8" strokeWidth="1.5" clipPath="url(#av-jbp)"/>
      <rect x="16" y="44" width="40" height="22" rx="4" fill="#8B7355"/>
      <rect x="16" y="46" width="4" height="18" fill="#6B5A40" opacity=".6"/>
      <rect x="24" y="46" width="4" height="18" fill="#6B5A40" opacity=".6"/>
      <rect x="32" y="46" width="4" height="18" fill="#6B5A40" opacity=".6"/>
      <rect x="40" y="46" width="4" height="18" fill="#6B5A40" opacity=".6"/>
      <rect x="48" y="46" width="4" height="18" fill="#6B5A40" opacity=".6"/>
      <circle cx="36" cy="30" r="12" fill="#D8A878"/>
      <path d="M25 26 Q22 36 25 46" fill="none" stroke="#4A2800" strokeWidth="4" strokeLinecap="round"/>
      <path d="M47 26 Q50 36 47 46" fill="none" stroke="#4A2800" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="36" cy="19" rx="11" ry="6" fill="#4A2800"/>
      <circle cx="31" cy="29" r="1.8" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="1.8" fill="#2C3E50"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
    </svg>
  )
}

function JohnApostleSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-jap"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#E8F0F8"/>
      <rect x="0" y="46" width="72" height="26" fill="#4A7FA8" clipPath="url(#av-jap)"/>
      <path d="M0 48 Q12 44 24 48 Q36 52 48 48 Q60 44 72 48" fill="none" stroke="#6FA0C8" strokeWidth="1.5" clipPath="url(#av-jap)"/>
      <ellipse cx="60" cy="46" rx="16" ry="7" fill="#9E9070" clipPath="url(#av-jap)"/>
      <path d="M8 14 Q14 10 20 14 Q14 13 8 14Z" fill="#5A5A6E"/>
      <path d="M6 15 Q13 12 21 16 Q20 20 14 18 Q10 17 6 15Z" fill="#6E6E86"/>
      <rect x="12" y="46" width="40" height="20" rx="6" fill="#3C6E5A" clipPath="url(#av-jap)"/>
      <rect x="16" y="50" width="32" height="16" rx="4" fill="#508A72" clipPath="url(#av-jap)"/>
      <circle cx="32" cy="30" r="13" fill="#F0C89E"/>
      <ellipse cx="32" cy="41" rx="9" ry="6" fill="#E4E4E4"/>
      <circle cx="27" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="37" cy="29" r="2" fill="#2C3E50"/>
      <rect x="23" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="35" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="32" cy="19" rx="11" ry="6" fill="#E4E4E4"/>
      <rect x="46" y="40" width="18" height="13" rx="2" fill="#F5E6C8" transform="rotate(-12 55 46)"/>
      <line x1="49" y1="44" x2="61" y2="41" stroke="#B8A078" strokeWidth="1"/>
      <line x1="50" y1="47" x2="62" y2="44" stroke="#B8A078" strokeWidth="1"/>
      <line x1="51" y1="50" x2="60" y2="48" stroke="#B8A078" strokeWidth="1"/>
    </svg>
  )
}

function AndrewSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-and"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#DFF0F8"/>
      <rect x="0" y="48" width="72" height="24" fill="#4A90D9" clipPath="url(#av-and)"/>
      <path d="M0 50 Q12 46 24 50 Q36 54 48 50 Q60 46 72 50" fill="none" stroke="#7FB8E8" strokeWidth="1.5" clipPath="url(#av-and)"/>
      <line x1="46" y1="26" x2="44" y2="60" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <line x1="54" y1="28" x2="52" y2="60" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <line x1="62" y1="30" x2="60" y2="60" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <line x1="42" y1="36" x2="66" y2="34" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <line x1="42" y1="44" x2="66" y2="42" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <line x1="42" y1="52" x2="64" y2="50" stroke="#8B6914" strokeWidth="1" opacity=".7"/>
      <ellipse cx="50" cy="58" rx="5" ry="3" fill="#5DADE2"/>
      <ellipse cx="60" cy="62" rx="4" ry="2.5" fill="#48C9B0"/>
      <rect x="6" y="46" width="34" height="20" rx="6" fill="#2E7A6E" clipPath="url(#av-and)"/>
      <rect x="10" y="50" width="26" height="16" rx="4" fill="#3E9A8A" clipPath="url(#av-and)"/>
      <circle cx="24" cy="30" r="13" fill="#E0AC7C"/>
      <ellipse cx="24" cy="41" rx="9" ry="6" fill="#4A3018"/>
      <circle cx="19" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="29" cy="29" r="2" fill="#2C3E50"/>
      <rect x="15" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="24" cy="19" rx="11" ry="6" fill="#4A3018"/>
    </svg>
  )
}

function MatthewSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-mat"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FBF2E2"/>
      <rect x="0" y="52" width="72" height="20" fill="#A9713C" clipPath="url(#av-mat)"/>
      <rect x="0" y="52" width="72" height="4" fill="#8B5A2B" clipPath="url(#av-mat)"/>
      <ellipse cx="18" cy="50" rx="5" ry="2" fill="#E8C030"/>
      <ellipse cx="18" cy="47" rx="5" ry="2" fill="#F9D054"/>
      <ellipse cx="18" cy="44" rx="5" ry="2" fill="#E8C030"/>
      <ellipse cx="56" cy="50" rx="5" ry="2" fill="#E8C030"/>
      <ellipse cx="56" cy="47" rx="5" ry="2" fill="#F9D054"/>
      <rect x="14" y="42" width="42" height="24" rx="6" fill="#2E6E8E" clipPath="url(#av-mat)"/>
      <rect x="18" y="46" width="34" height="20" rx="4" fill="#3E8CAE" clipPath="url(#av-mat)"/>
      <rect x="24" y="54" width="24" height="12" rx="2" fill="#F5E6C8" clipPath="url(#av-mat)"/>
      <line x1="27" y1="58" x2="45" y2="58" stroke="#B8A078" strokeWidth="1"/>
      <line x1="27" y1="61" x2="45" y2="61" stroke="#B8A078" strokeWidth="1"/>
      <circle cx="36" cy="28" r="13" fill="#F0C89E"/>
      <ellipse cx="36" cy="38" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="31" cy="27" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="27" r="2" fill="#2C3E50"/>
      <rect x="27" y="22" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="39" y="22" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="36" cy="17" rx="12" ry="6" fill="#3A2410"/>
      <rect x="33" y="12" width="6" height="4" rx="1" fill="#C8860A"/>
    </svg>
  )
}

function ThomasSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-tho"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EAF0F4"/>
      <ellipse cx="58" cy="34" rx="18" ry="24" fill="#F9D054" opacity=".22" clipPath="url(#av-tho)"/>
      <path d="M56 6 L58 26 L60 6Z" fill="#F9D054" opacity=".35" clipPath="url(#av-tho)"/>
      <path d="M70 14 L58 28 L72 24Z" fill="#F9D054" opacity=".3" clipPath="url(#av-tho)"/>
      <path d="M52 42 Q58 34 66 40" fill="none" stroke="#F9D054" strokeWidth="2" opacity=".5"/>
      <path d="M50 30 Q58 26 60 34 Q58 40 52 38 Q48 34 50 30Z" fill="#F0C89E"/>
      <circle cx="55" cy="33" r="2.2" fill="#D4645A" opacity=".8"/>
      <rect x="10" y="46" width="38" height="20" rx="6" fill="#4A6E8E" clipPath="url(#av-tho)"/>
      <rect x="14" y="50" width="30" height="16" rx="4" fill="#5F88AC" clipPath="url(#av-tho)"/>
      <path d="M40 50 Q47 40 50 34" fill="none" stroke="#F0C89E" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="28" cy="30" r="13" fill="#F0C89E"/>
      <ellipse cx="28" cy="40" rx="9" ry="6" fill="#4A3018"/>
      <circle cx="23" cy="29" r="2.2" fill="#2C3E50"/>
      <circle cx="33" cy="29" r="2.2" fill="#2C3E50"/>
      <circle cx="24" cy="28" r=".8" fill="white"/>
      <circle cx="34" cy="28" r=".8" fill="white"/>
      <rect x="19" y="23" width="6" height="2" rx="1" fill="#6B5030" transform="rotate(-10 22 24)"/>
      <rect x="31" y="23" width="6" height="2" rx="1" fill="#6B5030" transform="rotate(10 34 24)"/>
      <ellipse cx="28" cy="19" rx="11" ry="6" fill="#4A3018"/>
    </svg>
  )
}

function PhilipSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-phi"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F6F1E4"/>
      <rect x="0" y="56" width="72" height="16" fill="#D0BE94" clipPath="url(#av-phi)"/>
      <path d="M0 56 L72 50 L72 54 L0 60Z" fill="#BCAA82" opacity=".6" clipPath="url(#av-phi)"/>
      <rect x="46" y="36" width="24" height="14" rx="3" fill="#8B5A2B" clipPath="url(#av-phi)"/>
      <rect x="48" y="38" width="20" height="10" rx="2" fill="#A9713C" clipPath="url(#av-phi)"/>
      <circle cx="52" cy="52" r="5" fill="none" stroke="#6B4C11" strokeWidth="2"/>
      <circle cx="66" cy="52" r="5" fill="none" stroke="#6B4C11" strokeWidth="2"/>
      <rect x="10" y="46" width="34" height="20" rx="6" fill="#4A5F9E" clipPath="url(#av-phi)"/>
      <rect x="14" y="50" width="26" height="16" rx="4" fill="#6178BC" clipPath="url(#av-phi)"/>
      <rect x="36" y="40" width="14" height="10" rx="2" fill="#F5E6C8" transform="rotate(-10 43 45)"/>
      <line x1="38" y1="44" x2="48" y2="42" stroke="#B8A078" strokeWidth="1"/>
      <line x1="39" y1="47" x2="48" y2="45" stroke="#B8A078" strokeWidth="1"/>
      <circle cx="26" cy="30" r="13" fill="#F0C89E"/>
      <ellipse cx="26" cy="41" rx="9" ry="6" fill="#3A2410"/>
      <circle cx="21" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <rect x="17" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="29" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <ellipse cx="26" cy="19" rx="11" ry="6" fill="#3A2410"/>
    </svg>
  )
}

function LukeSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-luk"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EAF6F2"/>
      <rect x="48" y="42" width="22" height="16" rx="3" fill="#B8875A" clipPath="url(#av-luk)"/>
      <rect x="48" y="46" width="22" height="3" fill="#96693E" clipPath="url(#av-luk)"/>
      <rect x="56" y="38" width="6" height="4" rx="1" fill="#96693E"/>
      <rect x="52" y="30" width="5" height="10" rx="2" fill="#C8DED4"/>
      <rect x="60" y="28" width="5" height="12" rx="2" fill="#D8E8E0"/>
      <rect x="53" y="34" width="3" height="5" fill="#5A9E7A"/>
      <rect x="61" y="33" width="3" height="6" fill="#7ABE9A"/>
      <rect x="12" y="44" width="40" height="22" rx="6" fill="#2E7A6E" clipPath="url(#av-luk)"/>
      <rect x="16" y="48" width="32" height="18" rx="4" fill="#42998C" clipPath="url(#av-luk)"/>
      <rect x="20" y="54" width="24" height="12" rx="2" fill="#F5E6C8" clipPath="url(#av-luk)"/>
      <line x1="23" y1="58" x2="41" y2="58" stroke="#B8A078" strokeWidth="1"/>
      <line x1="23" y1="61" x2="41" y2="61" stroke="#B8A078" strokeWidth="1"/>
      <circle cx="32" cy="29" r="13" fill="#F0C89E"/>
      <ellipse cx="32" cy="40" rx="9" ry="6" fill="#5A4530"/>
      <circle cx="27" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="37" cy="28" r="2" fill="#2C3E50"/>
      <rect x="23" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="35" y="23" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <ellipse cx="32" cy="18" rx="11" ry="6" fill="#5A4530"/>
    </svg>
  )
}

function MarkSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-mrk"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FBF0E0"/>
      <circle cx="58" cy="46" r="13" fill="#C8944A" opacity=".85"/>
      <circle cx="58" cy="46" r="9" fill="#E0AC62"/>
      <circle cx="55" cy="44" r="1.5" fill="#4A3018"/>
      <circle cx="61" cy="44" r="1.5" fill="#4A3018"/>
      <path d="M55 49 Q58 51 61 49" fill="none" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round"/>
      <ellipse cx="58" cy="47" rx="3" ry="2" fill="#F0C888"/>
      <rect x="8" y="44" width="38" height="22" rx="6" fill="#8E4A3E" clipPath="url(#av-mrk)"/>
      <rect x="12" y="48" width="30" height="18" rx="4" fill="#AE6252" clipPath="url(#av-mrk)"/>
      <rect x="16" y="54" width="22" height="12" rx="2" fill="#F5E6C8" clipPath="url(#av-mrk)"/>
      <line x1="19" y1="58" x2="35" y2="58" stroke="#B8A078" strokeWidth="1"/>
      <line x1="19" y1="61" x2="35" y2="61" stroke="#B8A078" strokeWidth="1"/>
      <circle cx="27" cy="29" r="13" fill="#F0C89E"/>
      <path d="M14 27 Q14 15 27 15 Q40 15 40 27 Q36 21 27 21 Q18 21 14 27Z" fill="#3A2410"/>
      <circle cx="22" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="32" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="23" cy="28" r=".7" fill="white"/>
      <circle cx="33" cy="28" r=".7" fill="white"/>
      <rect x="18" y="24" width="6" height="2" rx="1" fill="#6B5030"/>
      <rect x="30" y="24" width="6" height="2" rx="1" fill="#6B5030"/>
      <path d="M24 35 Q27 37 30 35" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function BarnabasSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-bar"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EFF6EC"/>
      <circle cx="36" cy="28" r="24" fill="#8ECFA0" opacity=".2" clipPath="url(#av-bar)"/>
      <rect x="0" y="60" width="72" height="12" fill="#C0CBA8" clipPath="url(#av-bar)"/>
      <rect x="12" y="44" width="42" height="22" rx="6" fill="#3E7A52" clipPath="url(#av-bar)"/>
      <rect x="16" y="48" width="34" height="18" rx="4" fill="#569A6C" clipPath="url(#av-bar)"/>
      <path d="M50 48 Q60 42 62 34" fill="none" stroke="#E0AC7C" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="63" cy="31" r="4" fill="#E0AC7C"/>
      <path d="M56 24 Q60 18 64 22 Q68 18 70 24 Q66 30 63 33 Q59 30 56 24Z" fill="#D4645A" opacity=".8"/>
      <circle cx="34" cy="29" r="13" fill="#E8B888"/>
      <ellipse cx="34" cy="40" rx="9" ry="6" fill="#D8D4CE"/>
      <circle cx="29" cy="28" r="2" fill="#2C3E50"/>
      <circle cx="39" cy="28" r="2" fill="#2C3E50"/>
      <rect x="25" y="23" width="6" height="2" rx="1" fill="#7F8C8D" transform="rotate(-6 28 24)"/>
      <rect x="37" y="23" width="6" height="2" rx="1" fill="#7F8C8D" transform="rotate(6 40 24)"/>
      <ellipse cx="34" cy="18" rx="11" ry="6" fill="#D8D4CE"/>
      <path d="M29 34 Q34 38 39 34" fill="none" stroke="#B87860" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function TimothySvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-tim"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F0F4FA"/>
      <rect x="0" y="10" width="7" height="62" fill="#D4DCE8" clipPath="url(#av-tim)"/>
      <rect x="65" y="10" width="7" height="62" fill="#D4DCE8" clipPath="url(#av-tim)"/>
      <rect x="12" y="46" width="42" height="20" rx="6" fill="#3E5F9E" clipPath="url(#av-tim)"/>
      <rect x="16" y="50" width="34" height="16" rx="4" fill="#5478BC" clipPath="url(#av-tim)"/>
      <rect x="22" y="52" width="26" height="14" rx="2" fill="#F5E6C8" clipPath="url(#av-tim)"/>
      <line x1="25" y1="56" x2="45" y2="56" stroke="#B8A078" strokeWidth="1"/>
      <line x1="25" y1="59" x2="45" y2="59" stroke="#B8A078" strokeWidth="1"/>
      <line x1="25" y1="62" x2="40" y2="62" stroke="#B8A078" strokeWidth="1"/>
      <circle cx="34" cy="30" r="12.5" fill="#F5CBA7"/>
      <path d="M22 28 Q22 16 34 16 Q46 16 46 28 Q42 22 34 22 Q26 22 22 28Z" fill="#5A3A18"/>
      <circle cx="29" cy="30" r="2" fill="#2C3E50"/>
      <circle cx="39" cy="30" r="2" fill="#2C3E50"/>
      <circle cx="30" cy="29" r=".7" fill="white"/>
      <circle cx="40" cy="29" r=".7" fill="white"/>
      <rect x="25" y="25" width="6" height="2" rx="1" fill="#7A5830"/>
      <rect x="37" y="25" width="6" height="2" rx="1" fill="#7A5830"/>
      <path d="M31 36 Q34 38 37 36" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function MarthaSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="36" fill="#FFF6E8"/>
      <rect x="14" y="44" width="44" height="22" rx="6" fill="#C8860A"/>
      <rect x="18" y="48" width="36" height="18" rx="4" fill="#E8A020"/>
      <ellipse cx="54" cy="52" rx="10" ry="7" fill="#E8E0D0"/>
      <circle cx="50" cy="50" r="2" fill="#B8860B"/>
      <circle cx="56" cy="50" r="2" fill="#D4A020"/>
      <circle cx="53" cy="55" r="2" fill="#C8860A"/>
      <path d="M25 24 Q22 34 25 46" fill="none" stroke="#3A1F0A" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 24 Q50 34 47 46" fill="none" stroke="#3A1F0A" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="36" cy="30" r="13" fill="#F5CBA7"/>
      <ellipse cx="36" cy="17" rx="13" ry="7" fill="#3A1F0A"/>
      <path d="M22 24 Q22 14 36 13 Q50 14 50 24 Q48 20 36 19 Q24 20 22 24Z" fill="#C8860A" opacity=".7"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="41" cy="29" r="2" fill="#2C3E50"/>
      <rect x="27" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="39" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
    </svg>
  )
}

function MaryMagdaleneSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-mmg"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#FBF6E8"/>
      <circle cx="58" cy="18" r="10" fill="#F9D054" opacity=".4"/>
      <path d="M44 30 Q44 14 60 14 L72 14 L72 58 L44 58Z" fill="#9E9484" clipPath="url(#av-mmg)"/>
      <path d="M48 34 Q48 22 60 22 L72 22 L72 54 L48 54Z" fill="#33302C" clipPath="url(#av-mmg)"/>
      <ellipse cx="46" cy="50" rx="9" ry="12" fill="#8A8074" clipPath="url(#av-mmg)"/>
      <path d="M56 40 L68 38 L67 44 L55 46Z" fill="#F0EDE4" clipPath="url(#av-mmg)"/>
      <rect x="6" y="46" width="34" height="20" rx="6" fill="#B04A6E" clipPath="url(#av-mmg)"/>
      <rect x="10" y="50" width="26" height="16" rx="4" fill="#CC6A8A" clipPath="url(#av-mmg)"/>
      <circle cx="24" cy="30" r="13" fill="#F0C89E"/>
      <path d="M11 26 Q8 36 11 46" fill="none" stroke="#8E4A18" strokeWidth="5" strokeLinecap="round"/>
      <path d="M37 26 Q40 36 37 46" fill="none" stroke="#8E4A18" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="24" cy="17" rx="13" ry="7" fill="#8E4A18"/>
      <circle cx="19" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="29" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="20" cy="28" r=".7" fill="white"/>
      <circle cx="30" cy="28" r=".7" fill="white"/>
      <rect x="15" y="23" width="6" height="2" rx="1" fill="#7F8C8D" transform="rotate(-8 18 24)"/>
      <rect x="27" y="23" width="6" height="2" rx="1" fill="#7F8C8D" transform="rotate(8 30 24)"/>
      <path d="M20 34 Q24 38 28 34" fill="none" stroke="#B87860" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function LydiaSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-lyd"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F6EEFA"/>
      <path d="M50 8 Q66 14 62 30 Q58 46 66 58 L72 58 L72 0 L50 0Z" fill="#8E5AB8" opacity=".35" clipPath="url(#av-lyd)"/>
      <path d="M54 6 Q68 14 63 28 Q59 42 68 54" fill="none" stroke="#6A3E96" strokeWidth="3" opacity=".5" clipPath="url(#av-lyd)"/>
      <rect x="0" y="58" width="72" height="14" fill="#D8C8B0" clipPath="url(#av-lyd)"/>
      <ellipse cx="10" cy="56" rx="8" ry="5" fill="#5F3080"/>
      <ellipse cx="10" cy="54" rx="8" ry="4" fill="#7B44A0"/>
      <rect x="16" y="46" width="40" height="20" rx="6" fill="#6A3E96" clipPath="url(#av-lyd)"/>
      <rect x="20" y="50" width="32" height="16" rx="4" fill="#8E5AB8" clipPath="url(#av-lyd)"/>
      <rect x="22" y="50" width="28" height="3" rx="1" fill="#C9A0E8" opacity=".8"/>
      <circle cx="34" cy="30" r="13" fill="#E8C0A0"/>
      <path d="M21 26 Q18 36 21 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <path d="M47 26 Q50 36 47 46" fill="none" stroke="#4A2800" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="34" cy="17" rx="13" ry="7" fill="#4A2800"/>
      <path d="M20 24 Q20 13 34 12 Q48 13 48 24 Q46 20 34 19 Q22 20 20 24Z" fill="#8E5AB8" opacity=".8"/>
      <circle cx="29" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="39" cy="29" r="2" fill="#2C3E50"/>
      <rect x="25" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <rect x="37" y="24" width="6" height="2" rx="1" fill="#7F8C8D"/>
      <path d="M30 34 Q34 37 38 34" fill="none" stroke="#C8956A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function LazarusSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-laz"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#EFEAE0"/>
      <path d="M0 22 Q0 4 18 4 L18 60 L0 60Z" fill="#8A8074" clipPath="url(#av-laz)"/>
      <path d="M4 24 Q4 10 18 10 L18 56 L4 56Z" fill="#33302C" clipPath="url(#av-laz)"/>
      <circle cx="60" cy="16" r="14" fill="#F9D054" opacity=".3" clipPath="url(#av-laz)"/>
      <path d="M50 6 L52 24" stroke="#F9D054" strokeWidth="2" opacity=".5" clipPath="url(#av-laz)"/>
      <path d="M64 6 L60 24" stroke="#F9D054" strokeWidth="2" opacity=".5" clipPath="url(#av-laz)"/>
      <rect x="18" y="44" width="40" height="22" rx="6" fill="#DEDAD0" clipPath="url(#av-laz)"/>
      <rect x="22" y="48" width="32" height="18" rx="4" fill="#F0EDE6" clipPath="url(#av-laz)"/>
      <path d="M22 52 L54 50" stroke="#D0CBBF" strokeWidth="1.5"/>
      <path d="M22 58 L54 56" stroke="#D0CBBF" strokeWidth="1.5"/>
      <path d="M22 64 L54 62" stroke="#D0CBBF" strokeWidth="1.5"/>
      <circle cx="38" cy="30" r="13" fill="#EFC69E"/>
      <ellipse cx="38" cy="41" rx="9" ry="6" fill="#4A3018"/>
      <circle cx="33" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="43" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="34" cy="28" r=".7" fill="white"/>
      <circle cx="44" cy="28" r=".7" fill="white"/>
      <rect x="29" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="41" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <path d="M27 22 Q38 12 49 22 L49 26 Q44 20 38 20 Q32 20 27 26Z" fill="#E4E0D6"/>
    </svg>
  )
}

function SamaritanWomanSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-smw"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F2F6EE"/>
      <circle cx="58" cy="14" r="8" fill="#F9D054" opacity=".45"/>
      <rect x="0" y="58" width="72" height="14" fill="#C4B896" clipPath="url(#av-smw)"/>
      <ellipse cx="56" cy="52" rx="14" ry="7" fill="#9E9484" clipPath="url(#av-smw)"/>
      <ellipse cx="56" cy="52" rx="10" ry="4.5" fill="#33302C" clipPath="url(#av-smw)"/>
      <ellipse cx="56" cy="53" rx="7" ry="3" fill="#4A7FA8" clipPath="url(#av-smw)"/>
      <rect x="52" y="34" width="8" height="12" rx="3" fill="#B08050"/>
      <path d="M52 38 L60 38" stroke="#8E6238" strokeWidth="1"/>
      <path d="M44 40 Q50 36 54 38" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
      <rect x="8" y="46" width="36" height="20" rx="6" fill="#7A5A9E" clipPath="url(#av-smw)"/>
      <rect x="12" y="50" width="28" height="16" rx="4" fill="#9878BC" clipPath="url(#av-smw)"/>
      <path d="M38 50 Q44 44 50 42" fill="none" stroke="#E0AC7C" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="26" cy="30" r="13" fill="#E0AC7C"/>
      <path d="M13 26 Q10 36 13 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <path d="M39 26 Q42 36 39 46" fill="none" stroke="#2A1505" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="26" cy="17" rx="13" ry="7" fill="#2A1505"/>
      <path d="M12 24 Q12 13 26 12 Q40 13 40 24 Q38 20 26 19 Q14 20 12 24Z" fill="#9878BC" opacity=".7"/>
      <circle cx="21" cy="29" r="2" fill="#2C3E50"/>
      <circle cx="31" cy="29" r="2" fill="#2C3E50"/>
      <rect x="17" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
      <rect x="29" y="24" width="6" height="2" rx="1" fill="#5A4530"/>
    </svg>
  )
}

function SimeonSvg() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 72 72">
      <clipPath id="av-sim"><circle cx="36" cy="36" r="36"/></clipPath>
      <circle cx="36" cy="36" r="36" fill="#F8F2E6"/>
      <rect x="0" y="8" width="8" height="64" fill="#DCD0B4" clipPath="url(#av-sim)"/>
      <rect x="64" y="8" width="8" height="64" fill="#DCD0B4" clipPath="url(#av-sim)"/>
      <circle cx="36" cy="26" r="24" fill="#F9D054" opacity=".16" clipPath="url(#av-sim)"/>
      <rect x="12" y="44" width="44" height="22" rx="6" fill="#5A6E8E" clipPath="url(#av-sim)"/>
      <rect x="16" y="48" width="36" height="18" rx="4" fill="#7288A8" clipPath="url(#av-sim)"/>
      <ellipse cx="44" cy="50" rx="13" ry="8" fill="#F4EDE0" transform="rotate(-14 44 50)"/>
      <circle cx="50" cy="48" r="5.5" fill="#F7D6B4"/>
      <path d="M45 45 Q50 41 55 45" fill="none" stroke="#D8B892" strokeWidth="1.5"/>
      <circle cx="48" cy="48" r="1" fill="#2C3E50"/>
      <circle cx="52" cy="48" r="1" fill="#2C3E50"/>
      <path d="M48 51 Q50 52.5 52 51" fill="none" stroke="#C8956A" strokeWidth="1"/>
      <path d="M34 48 Q38 44 44 46" fill="none" stroke="#E8B888" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="28" cy="30" r="13" fill="#E8B888"/>
      <ellipse cx="28" cy="41" rx="9" ry="6" fill="#E4E4E4"/>
      <path d="M19 30 Q23 33 27 30" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M29 30 Q33 33 37 30" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="19" y="24" width="6" height="2" rx="1" fill="#9AA0A2"/>
      <rect x="31" y="24" width="6" height="2" rx="1" fill="#9AA0A2"/>
      <ellipse cx="28" cy="19" rx="11" ry="6" fill="#E4E4E4"/>
      <path d="M23 35 Q28 39 33 35" fill="none" stroke="#B87860" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

const SVG_MAP = {
  noah: NoahSvg,
  abraham: AbrahamSvg,
  isaac: IsaacSvg,
  jacob: JacobSvg,
  rachel: RachelSvg,
  moses: MosesSvg,
  david: DavidSvg,
  solomon: SolomonSvg,
  elijah: ElijahSvg,
  ruth: RuthSvg,
  joseph_ot: JosephOTSvg,
  jesus: JesusSvg,
  peter: PeterSvg,
  paul: PaulSvg,
  magi: MagiSvg,
  stephen: StephenSvg,
  james: JamesSvg,
  zacchaeus: ZacchaesSvg,
  mary: MarySvg,
  job: JobSvg,
  samuel: SamuelSvg,
  joshua: JoshuaSvg,
  caleb: CalebSvg,
  aaron: AaronSvg,
  daniel: DanielSvg,
  jonah: JonahSvg,
  esther: EstherSvg,
  deborah: DeborahSvg,
  samson: SamsonSvg,
  gideon: GideonSvg,
  hannah: HannahSvg,
  miriam: MiriamSvg,
  rahab: RahabSvg,
  boaz: BoazSvg,
  naomi: NaomiSvg,
  sarah: SarahSvg,
  elisha: ElishaSvg,
  isaiah: IsaiahSvg,
  jeremiah: JeremiahSvg,
  nehemiah: NehemiahSvg,
  john_baptist: JohnBaptistSvg,
  john_apostle: JohnApostleSvg,
  andrew: AndrewSvg,
  matthew: MatthewSvg,
  thomas: ThomasSvg,
  philip: PhilipSvg,
  luke: LukeSvg,
  mark: MarkSvg,
  barnabas: BarnabasSvg,
  timothy: TimothySvg,
  martha: MarthaSvg,
  mary_magdalene: MaryMagdaleneSvg,
  lydia: LydiaSvg,
  lazarus: LazarusSvg,
  samaritan_woman: SamaritanWomanSvg,
  simeon: SimeonSvg,
}

// photoUrl(업로드한 내 사진)이 있으면 그걸 우선 그리고, 없으면 avatarKey(성경 인물 아바타)를 그림.
// 둘 다 없으면 null을 반환하므로, 호출부에서 이름 첫 글자 fallback을 그대로 쓰면 됨.
export function BibleAvatarIcon({ avatarKey, photoUrl, size = 48 }) {
  const SvgComp = SVG_MAP[avatarKey]
  if (!photoUrl && !SvgComp) return null
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
      {photoUrl
        ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <SvgComp />}
    </div>
  )
}
