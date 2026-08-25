/** @type {import('tailwindcss').Config} */
export default {
  // 터치 기기에서 버튼을 한 번 누르면 hover 스타일이 그대로 눌러붙어서(다른 곳을 누를 때까지)
  // "색이 남아있다"로 보인다. 이 플래그를 켜면 hover: 유틸리티가 hover를 실제로 지원하는
  // 기기에서만 적용된다(@media (hover: hover)로 감싸짐).
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        'xs':  ['13px', { lineHeight: '1.4' }],
        'sm':  ['15px', { lineHeight: '1.5' }],
        'base':['18px', { lineHeight: '1.5' }],
        'lg':  ['20px', { lineHeight: '1.4' }],
        'xl':  ['22px', { lineHeight: '1.3' }],
        '2xl': ['26px', { lineHeight: '1.3' }],
      },
      colors: {
        // 브랜드 색(primary/success/warning/danger의 DEFAULT·hover·bar)은 라이트/다크/세피아
        // 3테마에서 전부 동일하게 고정 — 테마별로 바뀌는 건 배경/텍스트/보더 계열의 중성색과
        // 각 브랜드색의 "-light"(연한 배경톤) 정도뿐이다.
        primary: {
          DEFAULT: '#4285F4',
          light: 'rgb(var(--jh-primary-light) / <alpha-value>)',
          hover: '#1A73E8',
          bar: '#C5DAF6',
        },
        success: {
          DEFAULT: '#34A853',
          light: 'rgb(var(--jh-success-light) / <alpha-value>)',
        },
        danger: {
          DEFAULT: '#EA4335',
          light: 'rgb(var(--jh-danger-light) / <alpha-value>)',
        },
        warning: {
          DEFAULT: '#F9AB00',
          light: 'rgb(var(--jh-warning-light) / <alpha-value>)',
        },
        gray: {
          50: 'rgb(var(--jh-gray-50) / <alpha-value>)',
          100: 'rgb(var(--jh-gray-100) / <alpha-value>)',
          200: 'rgb(var(--jh-gray-200) / <alpha-value>)',
          300: 'rgb(var(--jh-gray-300) / <alpha-value>)',
          400: 'rgb(var(--jh-gray-400) / <alpha-value>)',
          500: 'rgb(var(--jh-gray-500) / <alpha-value>)',
          600: 'rgb(var(--jh-gray-600) / <alpha-value>)',
          700: 'rgb(var(--jh-gray-700) / <alpha-value>)',
          // 800/900은 의도적으로 건드리지 않음 — 영상 썸네일 placeholder 같은
          // "항상 어두운 배경" 용도로 쓰여서 테마에 반응하면 안 됨.
        },
        // 카드/페이지 표면색(예전의 bg-white 자리) — 테마에 반응
        surface: 'rgb(var(--jh-surface) / <alpha-value>)',
        // 진한 본문 텍스트(예전의 text-gray-900/800 자리) — 테마에 반응
        ink: 'rgb(var(--jh-ink) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
