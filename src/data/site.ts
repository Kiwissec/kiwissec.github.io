// Kiwissec website — content data (single source of content)
// Ported from the design bundle's ui_kits/website/data.js.
// Sources: old-website (archived) + kiwissec.com (參考，2026-06 擷取整理；
// 內容可能已改版，上線前以公司最新資訊為準). Internal hrefs use Astro
// routes ('/services', '/#about', …); base-prefixing is applied via withBase().

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
export interface NewsItem {
  tag: string;
  date: string;
  img: string;
  title: string;
  desc: string;
}
export interface Cta {
  label: string;
  href: string;
  primary?: boolean;
  external?: boolean;
}
export interface Service {
  id: string;
  icon: string;
  name: string;
  short: string;
  desc: string;
  points: string[];
  cta: Cta[];
}
export interface Testimonial {
  q: string;
  who: string;
  icon: string;
}
export interface CourseCat {
  id: string;
  label: string;
}
export interface Course {
  cat: string;
  title: string;
  tags: string[];
  desc: string;
  hours: string;
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

export const news: NewsItem[] = [
  {
    tag: "CYBERSEC 2023",
    date: "2023-07-31",
    img: "230731.webp",
    title: "CYBERSEC 2023 抱枕抽獎中獎名單來啦！",
    desc: "等了好久的抱枕抽獎終於來啦！恭喜以下幸運的朋朋們成為鳥鳥飼養員，記得打開信箱回覆收件資料囉，詳細名單請見官方粉專！",
  },
  {
    tag: "CYBERSEC 2023",
    date: "2023-05-12",
    img: "230512.webp",
    title: "Kiwis の #七維思神社 首次開張告捷！",
    desc: "感謝大家這三天的熱情參與和支持！七維思是專注於資安教育的新創公司，我們期望為台灣的資安盡一份心力，培育更多人才加入業界一起努力！",
  },
  {
    tag: "CYBERSEC 2023",
    date: "2023-05-08",
    img: "230508.webp",
    title: "Kiwis 期間限定 #七維思神社 即將開張啦！",
    desc: "參拜時間：5/9–5/11；參拜地點：Cyber Talent 專區 CT10 攤位。歡迎來找鳥鳥之神聊聊資安！",
  },
  {
    tag: "新聞發佈",
    date: "2023-04-24",
    img: "230425.webp",
    title: "Kiwis 來到 #金門大學 啦！",
    desc: "由講師 Tonya 帶來精彩的逆向工程與網頁安全講座。解 code 並不一定需要寫 code，學習靜態與動態分析，觀察程式碼到底偷偷做了些什麼。",
  },
  {
    tag: "CYBERSEC 2023",
    date: "2023-04-22",
    img: "230422.webp",
    title: "Kiwis 帶著精彩議程來啦！",
    desc: "講師：飛飛｜七維思執行長。時間：5/10 (三) 15:10–15:35。地點：臺北南港展覽二館 4F Cyber Talent 專區。",
  },
  {
    tag: "新聞發佈",
    date: "2023-04-14",
    img: "230414.webp",
    title: "七維思：專注耕耘資訊安全教育的公司",
    desc: "主要針對企業與大眾提供完善的資安教育訓練與學習資源，從基礎到進階陪伴每一位學習者。",
  },
];

export const about = {
  p1: "七維思股份有限公司是一間專注於資訊安全教育訓練與服務的資安公司，由具備豐富實戰背景的團隊組成，持有 OSCP、OSWA、OSEP、OSED、CEH 等多項國際證照，其中 OSCE³ 在台灣較為少見，是團隊的高階能力指標。",
  p2: "專業範疇涵蓋滲透測試、紅隊演練等實戰技能，以及資安管理諮詢。我們致力於協助組織建立自主的資安能力，從需求評估、客製化教育訓練到後續實施建議，將複雜的資安議題簡單化，成為值得信賴的長期合作夥伴。",
  points: [
    "團隊持有 OSCP、OSWA、OSEP、OSED、CEH 等多項國際證照，並具台灣少見的 OSCE³ 高階認證",
    "專長涵蓋滲透測試、紅隊演練實戰與資安管理諮詢；部分成員具 HITCON 講師資格、iThome 專欄",
    "授課單位涵蓋政府、教育、金融及資訊科技上市櫃公司與非營利組織，曾受邀調查局、新北市警察局擔任特聘講師",
  ],
};

// 服務項目（整理自 kiwissec.com 首頁「七維思服務項目」；描述為摘要，上線前以官方最新文案為準）
export const services: Service[] = [
  {
    id: "education",
    icon: "fa-solid fa-graduation-cap",
    name: "企業資安教育訓練",
    short: "從全員意識、技術深度到管理治理的客製培訓。",
    desc: "客製化的培訓課程，範圍從基礎的全公司資安意識培訓（如社交工程），到技術人員的深度課程（如程式安全開發、滲透測試），再到管理層的資安治理（如 NIST CSF）。",
    points: [
      "全員資安意識（社交工程、釣魚演練）",
      "技術深度課程（安全開發、滲透測試）",
      "管理層資安治理（NIST CSF、風險治理）",
      "依產業與角色客製課表",
    ],
    cta: [
      { label: "查看企業課程", href: "/courses", primary: true },
      { label: "洽詢內訓", href: "/#contact" },
    ],
  },
  {
    id: "consulting",
    icon: "fa-solid fa-clipboard-check",
    name: "企業資安顧問諮詢",
    short: "資安健檢與顧問，從政策、風險到法規遵循。",
    desc: "提供全面資安健檢與顧問服務，從資安政策制定、風險評估到法規遵循，協助企業建立符合標準的資安管理制度；以實務經驗為基礎，量身打造最適合的資安防護方案。",
    points: [
      "資安政策與制度制定",
      "風險評估與資安健檢",
      "法規遵循輔導（個資法 / ISO 等）",
      "資安管理制度導入",
    ],
    cta: [{ label: "預約顧問諮詢", href: "/#contact", primary: true }],
  },
  {
    id: "assessment",
    icon: "fa-solid fa-bug-slash",
    name: "企業資安檢測服務",
    short: "弱點掃描、滲透測試與社交工程演練。",
    desc: "提供完整資安檢測服務，包含弱點掃描、滲透測試與社交工程演練，模擬真實駭客的攻擊手法，全面檢測系統與人員弱點；範圍涵蓋網站應用程式、系統設備到物聯網設備。",
    points: [
      "網站 / 應用程式滲透測試",
      "系統與網路弱點掃描",
      "社交工程演練（釣魚 / 電話）",
      "物聯網（IoT）設備檢測",
    ],
    cta: [{ label: "洽詢檢測服務", href: "/#contact", primary: true }],
  },
  {
    id: "personal",
    icon: "fa-solid fa-video",
    name: "個人資安教育課程",
    short: "資安直播與系統化線上課程影片。",
    desc: "從互動性高的資安直播課程，到系統化錄製的課程影片，從基礎觀念到進階技術，包含實戰示範與技術分析，並提供即時解答與討論，確保學習成效。",
    points: [
      "互動式資安直播",
      "系統化錄製課程影片",
      "基礎到進階技術路線",
      "實戰示範與即時討論",
    ],
    cta: [
      {
        label: "前往個人課程平台",
        href: "https://feifei.tw/",
        primary: true,
        external: true,
      },
    ],
  },
];

// 課程見證（整理自 kiwissec.com 首頁學員回饋；節錄改寫，上線前請確認可用）
export const testimonials: Testimonial[] = [
  {
    q: "最深刻的部分是實際操作，看到如何透過 API 漏洞攻擊並修改其他人的資料，真的令人震驚。",
    who: "軟體工程師",
    icon: "fa-solid fa-code",
  },
  {
    q: "飛飛講得非常好，幫助我更深入理解 API 安全！",
    who: "資安工程師",
    icon: "fa-solid fa-shield-halved",
  },
  {
    q: "操作過程中的提權部分印象深刻，還需要再消化學到的知識。",
    who: "資工系學生",
    icon: "fa-solid fa-graduation-cap",
  },
  {
    q: "心智圖搭配實作的講解方式很棒，謝謝老師！",
    who: "軟體工程師",
    icon: "fa-solid fa-code",
  },
  {
    q: "飛飛的課程非常實用，特別是提權的部分，讓我理解更多攻擊手法。",
    who: "資安工程師",
    icon: "fa-solid fa-shield-halved",
  },
  {
    q: "感謝飛飛的細心指導，課程收穫滿滿！",
    who: "資安主管",
    icon: "fa-solid fa-user-tie",
  },
];

// ── 企業資安課程（B2B）— 依七維思官方《資訊與資安課程型錄 v20260503》逐門對齊：
//    壹、資安意識培訓 13 門；貳、資安專業培訓 13 門（攻防演練 9 + 資安防護 4）。
//    分類重整為 awareness / offensive / defensive 三類；標題用官方全名（去掉
//    「[攻防演練]」「[資安防護]」前綴，語意由分類承載），desc 為官方「課程簡介」
//    之忠實摘要，hours 取官方授課時數。──
export const courseIntro =
  "為企業與組織量身打造的資安內訓課程，涵蓋全員資安意識、攻防演練實戰與資安防護維運，皆可依產業與角色客製。歡迎來信洽詢完整課表與合作方式。";

export const courseCats: CourseCat[] = [
  { id: "all", label: "全部課程" },
  { id: "awareness", label: "資安意識" },
  { id: "offensive", label: "攻防演練" },
  { id: "defensive", label: "資安防護" },
];

export const courses: Course[] = [
  // ── 壹、資安意識培訓（全員適用、無技術門檻）──
  {
    cat: "awareness",
    title: "資安與你我的距離，識破生活與工作中的資安圈套",
    tags: ["資安意識", "防詐", "釣魚"],
    desc: "從近期實際案例拆解簡訊釣魚、AI 仿聲詐騙與數位足跡洩密，建立日常可立即執行的防護習慣。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，別讓社交工程騙走你的資料",
    tags: ["社交工程", "釣魚郵件", "防詐"],
    desc: "看懂釣魚郵件、匯款詐騙與社群足跡如何步步逼近，建立職場與生活通用的數位警覺心。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，守護企業資料與個人隱私原則",
    tags: ["資料保護", "個資隱私", "加密"],
    desc: "從資料分級、加密傳輸到備份與權限控管，把資料保護從口號落實為可執行的日常習慣。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，守護行動辦公的數位安全",
    tags: ["行動辦公", "遠距安全", "資安意識"],
    desc: "針對居家與公共場所辦公的多元場景，辨識日常資安地雷並建立隨身的設備防護原則。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，外部攻擊行為的識別與防護",
    tags: ["外部攻擊", "攻擊手法", "資安意識"],
    desc: "透過近期事件與常見駭客手法，學會識別外部攻擊的徵兆並採取適當的防護措施。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，內部行為的管理與盤點",
    tags: ["內部管理", "資料處理", "資安意識"],
    desc: "從郵件、檔案分享到機敏資料處理，把資安意識融入每個工作操作，建立內部防護直覺。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "資安與你我的距離，從外部攻擊到內部防禦",
    tags: ["攻擊視角", "整體防護", "資安意識"],
    desc: "從駭客視角理解資安事件如何發生，從外部威脅一路談到內部防護，建立整體性的資安思維。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "AI 時代下的我們，識破 AI 強化後的詐騙新面貌",
    tags: ["AI 資安", "反詐騙", "深偽"],
    desc: "從深偽影音的破綻到網址結構拆解，看懂 AI 強化後真假難辨的個人化詐騙並保持清醒。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "AI 時代下的我們，在職場與 AI 協作也能顧好個資與隱私",
    tags: ["AI 資安", "個資隱私", "合規"],
    desc: "跨越技術、倫理與法律三道邊界，在導入 AI 協作時守住個資、智財與合規操作的紅線。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "AI 時代下的我們，識破 AI 聊天機器人的便利與陷阱",
    tags: ["AI 資安", "生成式 AI", "風險控管"],
    desc: "直面提示注入、機密洩漏與 AI 幻覺等真實威脅，建立人與 AI 協作的安全邊界。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "萬物聯網時代下，智慧設備產生的風險",
    tags: ["物聯網", "IoT", "資安意識"],
    desc: "從智慧家電的出廠預設密碼談起，揭開 IoT 便利功能下的數位風險與遭受攻擊的徵兆。",
    hours: "1~3 小時",
  },
  {
    cat: "awareness",
    title: "高階主管資安培訓，資安韌性策略與實踐",
    tags: ["高階主管", "資安韌性", "資安治理"],
    desc: "以 NIST CSF、零信任與資安韌性框架，協助決策層制定從治理到復原的戰略策略。",
    hours: "2~4 小時",
  },
  {
    cat: "awareness",
    title: "高階主管資安培訓，資安風險威脅與決策思維",
    tags: ["高階主管", "資安決策", "風險治理"],
    desc: "剖析勒索軟體即服務與生成式 AI 攻防等新興威脅，培養由上而下的資安決策思維。",
    hours: "2~4 小時",
  },
  // ── 貳之一、資安專業培訓 ─ 攻防演練（技術人員的滲透測試與紅隊實戰）──
  {
    cat: "offensive",
    title: "系統化學習滲透測試課程（初階）",
    tags: ["滲透測試", "初階", "實作演練"],
    desc: "從滲透測試的目的與價值出發，系統化學習資料蒐集、弱點分析、提權到報告撰寫的完整流程。",
    hours: "6~18 小時",
  },
  {
    cat: "offensive",
    title: "系統化學習滲透測試課程（中階）",
    tags: ["滲透測試", "中階", "實作演練"],
    desc: "深入資訊蒐集、漏洞利用與權限提升，涵蓋網站攻擊、密碼攻擊、Shell 與 Metasploit 實戰。",
    hours: "6~18 小時",
  },
  {
    cat: "offensive",
    title: "系統化學習滲透測試課程（進階）",
    tags: ["滲透測試", "進階", "後滲透"],
    desc: "從 OSINT 偵察、WAF 繞過與 WebShell，到 CVE 分析與自動化提權，應對真實世界的複雜威脅。",
    hours: "6~18 小時",
  },
  {
    cat: "offensive",
    title: "網站滲透測試培訓課程（初階）",
    tags: ["滲透測試", "Web 安全", "初階"],
    desc: "從基礎安全概念到常見攻擊技巧，建立網站漏洞的識別、評估與防禦實作能力。",
    hours: "6~18 小時",
  },
  {
    cat: "offensive",
    title: "網站滲透測試培訓課程（中階）",
    tags: ["滲透測試", "Web 安全", "中階"],
    desc: "深化網站漏洞的識別與利用，涵蓋進階漏洞利用技術與最新的網路攻防趨勢。",
    hours: "6~18 小時",
  },
  {
    cat: "offensive",
    title: "從網站弱點學習滲透測試與資安防護實務",
    tags: ["Web 安全", "漏洞防護", "實作演練"],
    desc: "親手建立有漏洞的網站，研究常見網站漏洞的危害，並學習開發者修補與資安設備防護。",
    hours: "12~18 小時（僅實體）",
  },
  {
    cat: "offensive",
    title: "從情境演練強化紅隊演練手法",
    tags: ["紅隊", "攻防演練", "實作演練"],
    desc: "透過一系列 LAB 情境，從偵查、攻擊到提權，全面掌握紅隊演練的完整流程與技巧。",
    hours: "12~18 小時",
  },
  {
    cat: "offensive",
    title: "從 AI Security 到 Security of AI",
    tags: ["AI 資安", "LLM", "Prompt Injection"],
    desc: "剖析 LLM 的越獄、Prompt Injection、資料外洩與模型下毒等風險，規劃安全的 AI 導入。",
    hours: "2~3 小時",
  },
  {
    cat: "offensive",
    title: "物聯網安全課程",
    tags: ["物聯網", "IoT", "通訊協定"],
    desc: "從生活場景剖析 IoT 設備弱點與攻擊路徑，掌握未授權存取、MITM 與設備生命週期管理。",
    hours: "2~3 小時",
  },
  // ── 貳之二、資安專業培訓 ─ 資安防護（防禦維運、DevSecOps、雲端與事件應變）──
  {
    cat: "defensive",
    title: "資安維運與網路安全培訓課程",
    tags: ["資安維運", "網路安全", "零信任"],
    desc: "從重大資安事件解析企業網路防禦策略，掌握檢測手法、報告解讀、零信任與資安韌性實務。",
    hours: "1.5~3 小時",
  },
  {
    cat: "defensive",
    title: "資安事件通報流程與應變",
    tags: ["事件應變", "事件通報", "風險管理"],
    desc: "剖析常見攻擊手法與資安規定，學會在事件發生時迅速反應、保護資料並維持業務連續性。",
    hours: "1.5~3 小時",
  },
  {
    cat: "defensive",
    title: "開源軟體安全與 DevSecOps 自動化實務",
    tags: ["DevSecOps", "開源安全", "供應鏈"],
    desc: "涵蓋 SBOM 與軟體供應鏈安全、CI/CD pipeline 安全、Secret 管理與 Policy-as-Code 治理。",
    hours: "1.5~3 小時",
  },
  {
    cat: "defensive",
    title: "雲端架構與資安部署維運實務",
    tags: ["雲端安全", "Terraform", "IaC"],
    desc: "從公私有雲與三層式架構，到以 Terraform 實作 Azure 部署、權限管理、資安防護與成本控管。",
    hours: "3~4 小時",
  },
];

export const coursesUrl = "https://kiwissec.com/?page_id=27924";

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
