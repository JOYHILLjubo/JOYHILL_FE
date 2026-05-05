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
  { key: 'jesus',     label: '예수',    category: '신약' },
  { key: 'peter',     label: '베드로',  category: '신약' },
  { key: 'paul',      label: '바울',    category: '신약' },
  { key: 'magi',      label: '동방박사', category: '신약' },
  { key: 'stephen',   label: '스데반',  category: '신약' },
  { key: 'james',     label: '야고보',  category: '신약' },
  { key: 'zacchaeus', label: '삭게오',  category: '신약' },
  { key: 'mary',      label: '마리아',  category: '신약' },
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
}

export function BibleAvatarIcon({ avatarKey, size = 48 }) {
  const SvgComp = SVG_MAP[avatarKey]
  if (!SvgComp) return null
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
      <SvgComp />
    </div>
  )
}
