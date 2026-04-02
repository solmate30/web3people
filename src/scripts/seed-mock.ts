/**
 * 목업 데이터 시드 — 디자인 검증용
 *
 * 실행: pnpm seed:mock
 *
 * 이미 목업 데이터가 있으면 건너뜁니다.
 * Cloudinary 환경변수가 설정되어 있어야 합니다.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

// ── Lexical richText 헬퍼 ────────────────────────────────────────────

function richText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            format: 0,
            style: '',
            mode: 'normal',
            detail: 0,
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

// ── 이미지 다운로드 & 미디어 생성 ────────────────────────────────────

async function createMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  picsumSeed: string,
  width: number,
  height: number,
  alt: string,
) {
  const url = `https://picsum.photos/seed/${picsumSeed}/${width}/${height}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`이미지 다운로드 실패: ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())

  return await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      mimetype: 'image/jpeg',
      name: `${picsumSeed}-${width}x${height}.jpg`,
      size: buffer.length,
    },
    overrideAccess: true,
  })
}

// ── 메인 시드 ─────────────────────────────────────────────────────────

async function seedMock() {
  const payload = await getPayload({ config })

  // 이미 목업 인물 데이터가 있으면 건너뜀
  const existingPeople = await payload.find({ collection: 'people', limit: 1, overrideAccess: true })
  console.log(`[seed-mock] 기존 인물 수: ${existingPeople.totalDocs}`)
  if (existingPeople.totalDocs > 0) {
    console.log('[seed-mock] 목업 데이터가 이미 존재합니다. 건너뜁니다.')
    process.exit(0)
  }

  console.log('[seed-mock] 태그 생성 중...')

  const tagDeFi = await payload.create({ collection: 'tags', data: { name: 'DeFi', slug: 'defi' }, overrideAccess: true })
  const tagInfra = await payload.create({ collection: 'tags', data: { name: 'Infrastructure', slug: 'infrastructure' }, overrideAccess: true })
  const tagDAO = await payload.create({ collection: 'tags', data: { name: 'DAO', slug: 'dao' }, overrideAccess: true })
  const tagGameFi = await payload.create({ collection: 'tags', data: { name: 'GameFi', slug: 'gamefi' }, overrideAccess: true })

  console.log('[seed-mock] 프로필 이미지 업로드 중...')

  const photo1 = await createMedia(payload, 'web3-kim', 400, 400, '김민준 프로필')
  const photo2 = await createMedia(payload, 'web3-park', 400, 400, '박서연 프로필')
  const photo3 = await createMedia(payload, 'web3-lee', 400, 400, '이준혁 프로필')
  const photo4 = await createMedia(payload, 'web3-choi', 400, 400, '최아름 프로필')

  console.log('[seed-mock] 커버 이미지 업로드 중...')

  const cover1 = await createMedia(payload, 'interview-eth', 1200, 800, '이더리움 인터뷰 커버')
  const cover2 = await createMedia(payload, 'interview-defi', 1200, 800, 'DeFi 인터뷰 커버')
  const cover3 = await createMedia(payload, 'interview-game', 1200, 800, 'Web3 게임 인터뷰 커버')
  const cover4 = await createMedia(payload, 'interview-dao', 1200, 800, 'DAO 인터뷰 커버')

  console.log('[seed-mock] 인물 생성 중...')

  const person1 = await payload.create({
    collection: 'people',
    data: {
      name: '김민준',
      name_en: 'Kim Min-jun',
      slug: 'kim-min-jun',
      photo: photo1.id,
      title: 'Korea Community Lead',
      organization: 'Ethereum Foundation',
      country: 'KR',
      bio: richText([
        '이더리움 코리아 커뮤니티를 이끌며 국내 Web3 생태계 확장에 헌신하고 있다. 2017년부터 블록체인 기술에 깊이 관여해온 그는 개발자 교육, 해커톤 운영, 오픈소스 기여를 통해 한국 Web3 생태계의 성장을 이끌어왔다.',
        '현재는 이더리움 재단과 협력하여 한국 개발자 온보딩 프로그램을 운영하고 있으며, 분산화된 미래가 더 공정한 사회를 만든다는 믿음으로 활동하고 있다.',
      ]),
      socials: {
        twitter: 'https://twitter.com',
        website: 'https://ethereum.org',
      },
      tags: [tagInfra.id],
      status: 'published',
    },
    overrideAccess: true,
  })

  const person2 = await payload.create({
    collection: 'people',
    data: {
      name: '박서연',
      name_en: 'Park Seo-yeon',
      slug: 'park-seo-yeon',
      photo: photo2.id,
      title: 'Co-founder & CEO',
      organization: 'ArkSwap Protocol',
      country: 'KR',
      bio: richText([
        'ArkSwap Protocol의 공동창업자이자 CEO. 전통 금융 출신으로 Goldman Sachs에서 퀀트 트레이더로 활동하다 2020년 DeFi에 입문했다.',
        '탈중앙화 금융이 기존 금융 시스템의 구조적 불평등을 해소할 수 있다고 확신하며, 한국 사용자를 위한 접근성 높은 DeFi 프로토콜을 개발하고 있다.',
      ]),
      socials: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
      },
      tags: [tagDeFi.id],
      status: 'published',
    },
    overrideAccess: true,
  })

  const person3 = await payload.create({
    collection: 'people',
    data: {
      name: '이준혁',
      name_en: 'Lee Jun-hyuk',
      slug: 'lee-jun-hyuk',
      photo: photo3.id,
      title: 'Founder & CEO',
      organization: 'Metaforge Studios',
      country: 'KR',
      bio: richText([
        '블록체인 게임 스튜디오 Metaforge의 창업자. 넥슨과 넷마블에서 10년 이상 게임 개발 경험을 쌓은 후, 플레이어가 진정한 자산 소유권을 갖는 게임 세계를 만들기 위해 독립했다.',
        '진정한 P2E는 착취가 아닌 공정한 참여에서 비롯되어야 한다는 철학 아래, 게임성과 경제성을 모두 갖춘 Web3 게임을 만들고 있다.',
      ]),
      socials: {
        twitter: 'https://twitter.com',
        website: 'https://metaforgestudios.io',
      },
      tags: [tagGameFi.id],
      status: 'published',
    },
    overrideAccess: true,
  })

  const person4 = await payload.create({
    collection: 'people',
    data: {
      name: '최아름',
      name_en: 'Choi Ah-reum',
      slug: 'choi-ah-reum',
      photo: photo4.id,
      title: 'Research Lead',
      organization: 'BlockPolicy Institute',
      country: 'KR',
      bio: richText([
        'BlockPolicy Institute의 리서치 리드. 서울대학교 경제학과를 졸업하고 MIT Media Lab에서 분산 거버넌스를 연구했다.',
        'DAO가 기업과 정부를 대체할 새로운 조직 형태라고 주장하며, 한국의 DAO 법제화를 위한 정책 연구를 이끌고 있다.',
      ]),
      socials: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        website: 'https://blockpolicy.kr',
      },
      tags: [tagDAO.id],
      status: 'published',
    },
    overrideAccess: true,
  })

  console.log('[seed-mock] 인터뷰 생성 중...')

  await payload.create({
    collection: 'interviews',
    data: {
      title: '이더리움이 바꾼 세상: 한국 Web3 커뮤니티의 현재와 미래',
      slug: 'ethereum-korea-community-2025',
      subject: person1.id,
      coverImage: cover1.id,
      excerpt: '이더리움 코리아 커뮤니티 리드 김민준이 말하는 한국 Web3 생태계의 현재와, 우리가 만들어가야 할 탈중앙화의 미래.',
      content: [
        {
          blockType: 'qa',
          question: '이더리움 커뮤니티에 합류하게 된 계기가 무엇인가요?',
          answer: richText([
            '2017년 처음 이더리움 백서를 읽었을 때, 단순한 화폐가 아닌 프로그래밍 가능한 신뢰 기계라는 개념에 완전히 매료됐습니다. 당시 스마트컨트랙트가 중개자 없이도 계약이 집행될 수 있다는 아이디어는 제게 혁명적으로 느껴졌어요.',
            '처음엔 개발자로서 솔리디티를 배우기 시작했고, 자연스럽게 커뮤니티 이벤트에 참여하다 보니 지금의 역할까지 오게 되었습니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: '한국 Web3 생태계의 가장 큰 장점과 도전은 무엇이라고 보시나요?',
          answer: richText([
            '장점은 분명합니다. 한국은 세계 최고 수준의 인터넷 인프라와 기술 친화적인 인구를 보유하고 있어요. 특히 젊은 세대의 Web3 수용도는 글로벌 최상위 수준입니다.',
            '반면 규제 불확실성이 가장 큰 도전입니다. 명확한 법적 프레임워크가 없으면 우수한 개발자들이 해외로 나가거나 더 규제가 명확한 다른 나라에서 프로젝트를 론칭하게 됩니다. 이건 우리 생태계 전체의 손실이에요.',
          ]),
        },
        {
          blockType: 'qa',
          question: '앞으로 5년 후 이더리움 생태계는 어떤 모습일 것이라 예상하시나요?',
          answer: richText([
            'L2 중심의 멀티체인 생태계가 완전히 자리를 잡을 거라고 봅니다. 사용자들은 자신이 어떤 레이어에서 활동하는지 의식하지 않고 서비스를 이용하게 될 것입니다. 마치 지금 우리가 인터넷 프로토콜을 신경 쓰지 않고 웹을 이용하는 것처럼요.',
            '그리고 계정 추상화(Account Abstraction)가 온보딩 마찰을 획기적으로 줄여서, 지갑과 시드 구문 없이도 Web3 서비스를 이용하는 시대가 올 것입니다.',
          ]),
        },
      ],
      tags: [tagInfra.id],
      status: 'published',
      publishedAt: new Date('2025-03-15').toISOString(),
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'interviews',
    data: {
      title: 'DeFi의 미래: 탈중앙화 금융이 만드는 새로운 경제 질서',
      slug: 'defi-future-new-economy-2025',
      subject: person2.id,
      coverImage: cover2.id,
      excerpt: 'Goldman Sachs 출신 퀀트 트레이더에서 DeFi 프로토콜 창업자로. 박서연이 바라보는 탈중앙화 금융의 현실과 이상.',
      content: [
        {
          blockType: 'qa',
          question: '전통 금융에서 DeFi로 전향한 이유가 무엇인가요?',
          answer: richText([
            '월스트리트에서 일하면서 느낀 건, 금융이 결국 데이터와 알고리즘으로 수렴된다는 것이었어요. 그런데 그 과정이 극소수의 사람들만 접근할 수 있는 닫힌 시스템 안에서 이루어지고 있었습니다.',
            'DeFi를 처음 접했을 때 이게 바로 제가 원했던 것이라는 걸 직감했어요. 누구나 접근 가능한 금융 레일, 코드로 공개된 규칙, 허가 없이 참여 가능한 시스템. 기존 금융이 "왜 이렇게 복잡하고 불투명해야 하는가"에 대한 답이었습니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: 'ArkSwap Protocol이 기존 DEX들과 차별화되는 점은 무엇인가요?',
          answer: richText([
            '저희의 핵심 차별화는 한국 사용자 경험에 최적화된 UX입니다. 영어로만 되어 있고, 가스비 계산이 복잡하고, 슬리피지 설정을 이해해야 하는 기존 DEX들과 달리, ArkSwap은 처음 사용하는 사람도 5분 안에 첫 거래를 완료할 수 있도록 설계되었습니다.',
            '기술적으로는 집중 유동성과 동적 수수료 메커니즘을 결합해 LP들이 시장 상황에 따라 더 효율적으로 자본을 운용할 수 있게 했습니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: 'DeFi의 가장 큰 리스크는 무엇이라고 생각하시나요?',
          answer: richText([
            '스마트컨트랙트 취약점보다 더 근본적인 리스크는 경제 설계의 실패라고 생각합니다. 많은 프로토콜들이 토크노믹스를 충분히 검증하지 않고 출시해서 폰지 구조에 빠지거나, 인센티브 구조가 잘못 설계되어 공격자에게 악용됩니다.',
            '저는 항상 "이 프로토콜이 외부 자금 유입 없이도 지속 가능한가"를 먼저 묻습니다. 그게 진짜 DeFi인지 아닌지를 판별하는 가장 좋은 질문이에요.',
          ]),
        },
      ],
      tags: [tagDeFi.id],
      status: 'published',
      publishedAt: new Date('2025-03-10').toISOString(),
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'interviews',
    data: {
      title: 'Web3 게임의 가능성: 플레이어가 진정한 주인이 되는 세상',
      slug: 'web3-gaming-player-ownership-2025',
      subject: person3.id,
      coverImage: cover3.id,
      excerpt: '넥슨과 넷마블을 떠나 Web3 게임 스튜디오를 창업한 이준혁. 그가 그리는 진정한 플레이어 소유권의 세계.',
      content: [
        {
          blockType: 'qa',
          question: '안정적인 대형 게임사를 떠나 Web3 스튜디오를 창업한 이유가 무엇인가요?',
          answer: richText([
            '기존 게임사에서 10년 넘게 일하면서 하나의 패턴을 반복적으로 봤어요. 플레이어들이 수천 시간을 투자해서 만든 캐릭터, 아이템, 진행도가 결국 회사 서버에 종속되어 있다는 것. 게임이 서비스를 종료하면 그 모든 것이 사라집니다.',
            '블록체인이 이 문제를 풀 수 있다고 생각했어요. 게임 아이템이 진짜 소유 가능한 자산이 된다면, 플레이어와 개발사의 관계가 근본적으로 바뀝니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: 'P2E(Play-to-Earn) 모델에 대한 비판이 많습니다. 어떻게 생각하시나요?',
          answer: richText([
            '비판이 타당합니다. 1세대 P2E는 대부분 게임이 재미없었어요. 경제 모델만 있고 게임이 없는 것들이 많았습니다. 토큰 가격 상승이 유일한 재미인 게임은 폰지 구조에 불과합니다.',
            '저희가 추구하는 건 "게임이 먼저"입니다. 재미있어서 하는데 경제적 소유권까지 있는 것. Metaforge의 첫 번째 질문은 항상 "이게 블록체인 없어도 재미있는 게임인가?"입니다. 그 답이 예스가 아니면 출시하지 않습니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: '한국 게임 산업과 Web3의 결합 가능성을 어떻게 보시나요?',
          answer: richText([
            '한국은 세계 최고 수준의 게임 개발 역량을 가지고 있습니다. IP, 아트, 서버 운영 노하우 모두 세계적입니다. 여기에 Web3의 소유권 인프라가 결합되면 정말 강력한 시너지가 납니다.',
            '이미 넥슨, 넷마블, 위메이드가 Web3 게임에 투자하고 있습니다. 아직은 시행착오 단계지만, 향후 2-3년 안에 진짜 킬러 타이틀이 나올 것이라고 봅니다. 그 타이틀이 저희가 만드는 것이 되길 바라지만요.',
          ]),
        },
      ],
      tags: [tagGameFi.id],
      status: 'published',
      publishedAt: new Date('2025-03-05').toISOString(),
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'interviews',
    data: {
      title: 'DAO 거버넌스: 코드로 쓰여진 민주주의의 가능성',
      slug: 'dao-governance-future-organizations-2025',
      subject: person4.id,
      coverImage: cover4.id,
      excerpt: 'MIT에서 분산 거버넌스를 연구한 최아름이 말하는 DAO의 현실, 한계, 그리고 조직의 미래.',
      content: [
        {
          blockType: 'qa',
          question: 'DAO 연구를 시작하게 된 계기가 무엇인가요?',
          answer: richText([
            'MIT에서 경제학 박사 과정 중에 "왜 대형 조직은 항상 관료화되고 느려지는가"라는 질문을 연구했습니다. 전통 기업이든 NGO든 규모가 커질수록 의사결정이 느려지고, 소수가 권력을 독점하는 패턴이 반복됩니다.',
            'DAO를 처음 접했을 때, 이게 그 문제에 대한 기술적 해법일 수 있다는 가능성을 봤습니다. 토큰 기반 투표, 투명한 재무, 코드로 집행되는 규칙. 이론적으로는 기존 조직의 단점을 상당 부분 해소할 수 있습니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: '현재 DAO 거버넌스의 가장 큰 문제점은 무엇이라고 보시나요?',
          answer: richText([
            '투표 참여율이 극도로 낮다는 것입니다. 대부분의 주요 DAO에서 실제 거버넌스 투표 참여율은 5-10% 수준입니다. 이건 민주주의라고 부르기 어렵습니다.',
            '두 번째 문제는 고래(대형 토큰 보유자)의 지배입니다. 1토큰 1표 방식은 결국 자본이 많을수록 영향력이 크다는 뜻이에요. 이건 기존 자본주의의 문제를 그대로 복제합니다. 이차 투표(Quadratic Voting)나 대의 민주주의 메커니즘이 필요한 이유입니다.',
          ]),
        },
        {
          blockType: 'qa',
          question: '한국에서 DAO의 법적 지위를 어떻게 확립할 수 있을까요?',
          answer: richText([
            'BlockPolicy Institute에서 현재 국회의원실과 협력하여 "DAO 기본법" 초안을 작성하고 있습니다. 핵심은 DAO를 새로운 법인격으로 인정하는 것입니다. 지금처럼 DAO가 법적 실체가 없으면 계약, 고용, 세금 납부 등 모든 것이 불가능합니다.',
            '와이오밍 주가 2021년 DAOs를 LLC로 인정한 것이 좋은 선례입니다. 한국도 기존 법인 체계와 충돌하지 않는 방식으로 DAO 법인격을 인정할 수 있는 경로가 있다고 봅니다. 올해 안에 의미있는 진전이 있을 것으로 기대합니다.',
          ]),
        },
      ],
      tags: [tagDAO.id],
      status: 'published',
      publishedAt: new Date('2025-03-01').toISOString(),
    },
    overrideAccess: true,
  })

  console.log('[seed-mock] 목업 데이터 생성 완료!')
  console.log('[seed-mock] - 태그: 4개 (DeFi, Infrastructure, DAO, GameFi)')
  console.log('[seed-mock] - 인물: 4명')
  console.log('[seed-mock] - 인터뷰: 4개')

  process.exit(0)
}

seedMock().catch((err) => {
  console.error(err)
  process.exit(1)
})
