// src/data/bible.js 무결성 검사.
// 장별 절수 1,189개를 사람이 손으로 적으면 어딘가 한두 개는 틀리기 마련이라,
// 널리 알려진 "권별 절수 합계"와 대조해서 어느 권이 틀렸는지 콕 집어낸다.
// 실행: node scripts/verify-bible.mjs
import { BIBLE_BOOKS } from '../src/data/bible.js'

const EXPECTED_CHAPTERS = {
  창세기:50, 출애굽기:40, 레위기:27, 민수기:36, 신명기:34, 여호수아:24, 사사기:21, 룻기:4,
  사무엘상:31, 사무엘하:24, 열왕기상:22, 열왕기하:25, 역대상:29, 역대하:36, 에스라:10, 느헤미야:13,
  에스더:10, 욥기:42, 시편:150, 잠언:31, 전도서:12, 아가:8, 이사야:66, 예레미야:52, 예레미야애가:5,
  에스겔:48, 다니엘:12, 호세아:14, 요엘:3, 아모스:9, 오바댜:1, 요나:4, 미가:7, 나훔:3, 하박국:3,
  스바냐:3, 학개:2, 스가랴:14, 말라기:4,
  마태복음:28, 마가복음:16, 누가복음:24, 요한복음:21, 사도행전:28, 로마서:16, 고린도전서:16,
  고린도후서:13, 갈라디아서:6, 에베소서:6, 빌립보서:4, 골로새서:4, 데살로니가전서:5, 데살로니가후서:3,
  디모데전서:6, 디모데후서:4, 디도서:3, 빌레몬서:1, 히브리서:13, 야고보서:5, 베드로전서:5,
  베드로후서:3, 요한일서:5, 요한이서:1, 요한삼서:1, 유다서:1, 요한계시록:22,
}

const EXPECTED_VERSES = {
  창세기:1533, 출애굽기:1213, 레위기:859, 민수기:1288, 신명기:959, 여호수아:658, 사사기:618, 룻기:85,
  사무엘상:810, 사무엘하:695, 열왕기상:816, 열왕기하:719, 역대상:942, 역대하:822, 에스라:280,
  느헤미야:406, 에스더:167, 욥기:1070, 시편:2461, 잠언:915, 전도서:222, 아가:117, 이사야:1292,
  예레미야:1364, 예레미야애가:154, 에스겔:1273, 다니엘:357, 호세아:197, 요엘:73, 아모스:146,
  오바댜:21, 요나:48, 미가:105, 나훔:47, 하박국:56, 스바냐:53, 학개:38, 스가랴:211, 말라기:55,
  마태복음:1071, 마가복음:678, 누가복음:1151, 요한복음:879, 사도행전:1007, 로마서:433,
  고린도전서:437, 고린도후서:257, 갈라디아서:149, 에베소서:155, 빌립보서:104, 골로새서:95,
  데살로니가전서:89, 데살로니가후서:47, 디모데전서:113, 디모데후서:83, 디도서:46, 빌레몬서:25,
  히브리서:303, 야고보서:108, 베드로전서:105, 베드로후서:61, 요한일서:105, 요한이서:13,
  요한삼서:14, 유다서:25, 요한계시록:404,
}

const TOTAL_VERSES = 31102
const problems = []

if (BIBLE_BOOKS.length !== 66) problems.push(`권 수가 66이 아님: ${BIBLE_BOOKS.length}`)

let total = 0
for (const book of BIBLE_BOOKS) {
  const expectedChapters = EXPECTED_CHAPTERS[book.name]
  const expectedVerses = EXPECTED_VERSES[book.name]
  if (expectedChapters === undefined) { problems.push(`알 수 없는 권 이름: ${book.name}`); continue }
  if (book.verses.length !== expectedChapters) {
    problems.push(`${book.name}: 장수 ${book.verses.length} (기대값 ${expectedChapters})`)
  }
  const sum = book.verses.reduce((a, b) => a + b, 0)
  total += sum
  if (sum !== expectedVerses) {
    problems.push(`${book.name}: 절수 합계 ${sum} (기대값 ${expectedVerses}, 차이 ${sum - expectedVerses})`)
  }
  book.verses.forEach((count, i) => {
    if (!Number.isInteger(count) || count < 1 || count > 176) {
      problems.push(`${book.name} ${i + 1}장: 절수가 이상함 (${count})`)
    }
  })
}

if (total !== TOTAL_VERSES) problems.push(`전체 절수 합계 ${total} (기대값 ${TOTAL_VERSES}, 차이 ${total - TOTAL_VERSES})`)

if (problems.length) {
  console.error('❌ 성경 데이터 검증 실패:')
  problems.forEach((p) => console.error('  -', p))
  process.exit(1)
}
console.log(`✅ 성경 데이터 정상 — 66권 / ${BIBLE_BOOKS.reduce((a, b) => a + b.verses.length, 0)}장 / ${total}절`)
