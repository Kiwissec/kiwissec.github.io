// Kiwissec website — stable site singletons & fixed UI copy (nav, hero, about,
// faq, contact, footer, resources, company). Dynamic collections (courses,
// services, news, testimonials) live in src/data/*.json; see content.config.ts.
// Ported from the design bundle's ui_kits/website/data.js.
// Sources: old-website (archived) + kiwissec.com (參考，2026-06 擷取整理；
// 內容可能已改版，上線前以公司最新資訊為準). Internal hrefs use Astro
// routes ('/services', '/#about', …); base-prefixing is applied via withBase().

import { COURSE_CAT_IDS, COURSE_CAT_META } from "./course-cats";

export interface NavChild {
  label: string;
  href: string;
  external?: boolean;
}
export interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
  external?: boolean;
  cta?: boolean;
}
export interface CourseCat {
  id: string;
  label: string;
}
export interface ResourceItem {
  icon: string;
  name: string;
  tag: string;
  desc: string;
  href: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  href: string;
}

export const nav: NavItem[] = [
  {
    label: "企業資安",
    children: [
      { label: "資安、資訊服務", href: "/services" },
      { label: "資訊安全教育訓練課程", href: "/courses" },
    ],
  },
  {
    label: "學習資源",
    children: [
      { label: "延伸資源總覽", href: "/#resources" },
      { label: "SSDLC 資源", href: "https://ssdlc.feifei.tw/", external: true },
      {
        label: "免費每月資安直播",
        href: "https://feifei.tw/course/free-information-security-live-broadcast/",
        external: true,
      },
      { label: "個人資安課程", href: "https://feifei.tw/", external: true },
    ],
  },
  { label: "關於我們", href: "/#about" },
  { label: "最新消息", href: "/news" },
  { label: "常見問題", href: "/#faq" },
  { label: "聯絡我們", href: "/#contact", cta: true },
];

export const hero = {
  title1: "學習資安不拐彎",
  title2: "委託服務更心安",
  brand: "七維思資安",
  desc: "七維思由專業的資安教學團隊與高度專業的成員組成，擁有多張國際資安證照，服務涵蓋政府、教育、金融與資訊業。我們把複雜的資安議題簡單化，協助企業建立最適合的防護。",
  trust: [
    { n: "10 年", l: "資安教學深耕" },
    { n: "OSCP · OSCE³", l: "國際證照" },
    { n: "1000+ 小時", l: "企業培訓時數" },
  ],
};

export const about = {
  p1: "七維思股份有限公司是一間專注於資訊安全教育訓練與服務的資安公司，由具備豐富實戰背景的團隊組成，持有 OSCP、OSWA、OSEP、OSED、CEH 等多項國際證照，其中 OSCE³ 在台灣較為少見，是團隊的高階能力指標。",
  p2: "專業範疇涵蓋滲透測試、紅隊演練等實戰技能，以及資安管理諮詢。我們致力於協助組織建立自主的資安能力，從需求評估、客製化教育訓練到後續實施建議，將複雜的資安議題簡單化，成為值得信賴的長期合作夥伴。",
  points: [
    "團隊持有 OSCP、OSWA、OSEP、OSED、CEH 等多項國際證照，並具台灣少見的 OSCE³ 高階認證",
    "專長涵蓋滲透測試、紅隊演練實戰與資安管理諮詢；部分成員具 HITCON 講師資格、iThome 專欄",
    "授課單位涵蓋政府、教育、金融及資訊科技上市櫃公司與非營利組織，曾受邀調查局、新北市警察局擔任特聘講師",
  ],
};

// ── 企業資安課程（B2B）──
// 課程資料已移至 Content Collection（src/data/courses.json；schema 見
// src/content.config.ts），依官方《資訊與資安課程型錄 v20260503》：資安意識 13 +
// 攻防演練 9 + 資安防護 4。以下 courseCats 為分類 UI／篩選字彙（含合成的 "all"），
// 其 id 對應 courses 的 cat enum（awareness / offensive / defensive）。
export const courseIntro =
  "為企業與組織量身打造的資安內訓課程，涵蓋全員資安意識、攻防演練實戰與資安防護維運，皆可依產業與角色客製。歡迎來信洽詢完整課表與合作方式。";

// "all" is a UI-only sentinel (filter tab); the real categories come from the
// single source in ./course-cats.
export const courseCats: CourseCat[] = [
  { id: "all", label: "全部課程" },
  ...COURSE_CAT_IDS.map((id) => ({ id, label: COURSE_CAT_META[id].label })),
];

export const resourceIntro =
  "除了企業服務，七維思團隊也經營一系列開放的學習資源，歡迎免費取用。";

export const resources: ResourceItem[] = [
  {
    icon: "fa-solid fa-code-branch",
    name: "SSDLC 資源",
    tag: "開放資源",
    desc: "安全軟體開發生命週期（SSDLC）的開放知識與實務資源。",
    href: "https://ssdlc.feifei.tw/",
  },
  {
    icon: "fa-solid fa-tower-broadcast",
    name: "免費每月資安直播",
    tag: "免費直播",
    desc: "每月一場免費資安直播，與飛飛一起聊最新資安議題。",
    href: "https://feifei.tw/course/free-information-security-live-broadcast/",
  },
  {
    icon: "fa-solid fa-user-graduate",
    name: "個人資安課程",
    tag: "線上課程",
    desc: "飛飛的個人線上課程平台，從基礎到進階自主學習。",
    href: "https://feifei.tw/",
  },
];

export const faq: Faq[] = [
  {
    q: "我們是誰？",
    a: "七維思成員具有多年教育訓練經驗，含有業界實作能量，能提供學員所需要的教育方式。",
  },
  {
    q: "我們提供什麼？",
    a: "七維思提供資安學習課程，帶給學員所需的資安技術，包含攻擊與防禦實作。",
  },
  {
    q: "課程類型？",
    a: "課程分為三大類：適合全員的「資安意識」培訓、技術人員的「攻防演練」（滲透測試、紅隊、網站與物聯網安全），以及「資安防護」（資安維運、DevSecOps、雲端與事件應變）。皆可依產業與角色客製。",
  },
];

export const contact = {
  lead: "想合作、洽詢企業內訓，或單純想跟鳥鳥聊聊資安？歡迎透過以下方式找到我們。",
  methods: [
    {
      icon: "fa-solid fa-envelope",
      label: "電子郵件",
      value: "contact@kiwissec.com",
      href: "mailto:contact@kiwissec.com",
    },
    {
      icon: "fa-brands fa-line",
      label: "Line 社群",
      value: "飛飛的資安大圈圈",
      href: "https://links.kiwissec.io/fei-community",
    },
    {
      icon: "fa-solid fa-graduation-cap",
      label: "企業內訓洽詢",
      value: "來信索取完整課表",
      href: "mailto:contact@kiwissec.com?subject=企業內訓洽詢",
    },
    {
      icon: "fa-solid fa-location-dot",
      label: "聯絡地址",
      value: "臺北市中山區復興北路48號7樓",
      href: "https://maps.google.com/?q=臺北市中山區復興北路48號7樓",
    },
  ] as ContactMethod[],
};

export const footer = {
  slogan: ["七維思資安", "學習資安不拐彎", "委託服務更心安"],
  about: [
    ["/#about", "關於我們"],
    ["/services", "服務項目"],
    ["/courses", "企業課程"],
    ["/news", "最新消息"],
    ["/#faq", "常見問題"],
    ["/#contact", "聯絡我們"],
  ] as [string, string][],
  help: [
    ["/policy", "隱私權政策"],
    ["/terms", "會員服務條款"],
    ["/consumer", "消費者權益"],
    ["/return", "退換貨政策"],
  ] as [string, string][],
  email: "contact@kiwissec.com",
  phone: "02-2312 0400",
  addr: "臺北市中山區復興北路48號7樓",
  tax: "統一編號：90286907",
  socials: [
    ["fa-facebook-f", "https://www.facebook.com/KiwisSec"],
    ["fa-instagram", "https://www.instagram.com/kiwissec"],
    ["fa-discord", "https://discord.gg/7MXDAGUp4P"],
    ["fa-youtube", "https://www.youtube.com/@KiwisSec"],
    ["fa-x-twitter", "https://twitter.com/KiwisSec"],
  ] as [string, string][],
};

export const company = {
  name: "七維思股份有限公司",
  nameEn: "Kiwis Co., Ltd.",
  copyright: "© 2026 七維思股份有限公司 Kiwis Co., Ltd. All Rights Reserved.",
};
