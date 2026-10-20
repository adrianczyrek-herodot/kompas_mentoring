"use strict";
(() => {
  // src/mocks.ts
  var NOW = /* @__PURE__ */ new Date("2026-10-20T14:00:00+02:00");
  var CATEGORIES = [
    "Frontend",
    "Backend",
    "Data & AI",
    "Product Management",
    "UX/UI Design",
    "Kariera w IT",
    "DevOps & Cloud",
    "Przyw\xF3dztwo"
  ];
  var std = { 0: [9, 10, 17, 18], 1: [17, 18, 19], 2: [9, 10, 11], 3: [18, 19], 4: [8, 9, 16], 5: [10, 11], 6: [] };
  var MENTORS = [
    {
      id: "m1",
      name: "Kasia Nowicka",
      headline: "Senior Frontend Engineer \xB7 React, TypeScript, architektura UI",
      bio: "Od 9 lat buduj\u0119 aplikacje webowe \u2014 od startup\xF3w po produkty z milionami u\u017Cytkownik\xF3w. Pomagam juniorom przej\u015B\u0107 z \u201Edzia\u0142a\u201D do \u201Ejest utrzymywalne\u201D: code review, architektura komponent\xF3w, przygotowanie do rozm\xF3w technicznych. Na pierwszej sesji ustalamy cel i plan na 8 tygodni.",
      country: "Polska",
      languages: ["polski", "angielski"],
      categories: ["Frontend", "Kariera w IT"],
      tags: ["React", "TypeScript", "Next.js", "Code review", "Rozmowy techniczne"],
      yearsExp: 9,
      companies: ["Allegro", "Brainly"],
      rate60: 180,
      trialPrice: 49,
      rating: 4.9,
      reviewsCount: 87,
      sessions: 642,
      returningPct: 82,
      responseHours: 2,
      verified: true,
      acceptingNew: true,
      hue: 168,
      reviews: [
        { author: "Micha\u0142", rating: 5, date: "2026-10-02", text: "Po trzech sesjach przepisa\u0142em sw\xF3j projekt portfolio i dosta\u0142em pierwsz\u0105 ofert\u0119. Konkretne uwagi, zero lania wody.", tags: ["konkretna", "dobrze przygotowana"] },
        { author: "Ola", rating: 5, date: "2026-09-18", text: "\u015Awietnie t\u0142umaczy, dlaczego co\u015B jest problemem, zamiast dawa\u0107 gotowe rozwi\u0105zanie.", tags: ["cierpliwa"] },
        { author: "Piotr", rating: 4, date: "2026-09-01", text: "Bardzo dobra sesja pr\xF3bna, chcia\u0142bym wi\u0119cej wolnych termin\xF3w wieczorem.", tags: ["konkretna"] }
      ],
      availability: std
    },
    {
      id: "m2",
      name: "Tomasz Wierzbicki",
      headline: "Engineering Manager \xB7 od developera do lidera zespo\u0142u",
      bio: "Prowadz\u0119 zespo\u0142y od 6 lat. Pracuj\u0119 z osobami, kt\xF3re dosta\u0142y pierwszy awans na lidera albo chc\u0105 go dosta\u0107: rozmowy 1:1, feedback, delegowanie, rozmowy o podwy\u017Cce.",
      country: "Polska",
      languages: ["polski"],
      categories: ["Przyw\xF3dztwo", "Kariera w IT"],
      tags: ["Leadership", "1:1", "Feedback", "Awans"],
      yearsExp: 14,
      companies: ["Netguru", "DocPlanner"],
      rate60: 240,
      trialPrice: 59,
      rating: 4.8,
      reviewsCount: 41,
      sessions: 310,
      returningPct: 76,
      responseHours: 5,
      verified: true,
      acceptingNew: true,
      hue: 28,
      reviews: [{ author: "Agnieszka", rating: 5, date: "2026-10-10", text: "Pierwszy raz kto\u015B roz\u0142o\u017Cy\u0142 mi delegowanie na konkretne kroki.", tags: ["praktyczny"] }],
      availability: { 0: [19, 20], 1: [], 2: [19, 20], 3: [7, 8], 4: [], 5: [9, 10, 11], 6: [] }
    },
    {
      id: "m3",
      name: "Ewa Sadowska",
      headline: "Data Scientist \xB7 ML w produkcji, Python, przebran\u017Cowienie",
      bio: "Przesz\u0142am z finans\xF3w do data science i wiem, jak wygl\u0105da ta droga. Pomagam zbudowa\u0107 portfolio projekt\xF3w ML, kt\xF3re rekruterzy faktycznie czytaj\u0105.",
      country: "Polska",
      languages: ["polski", "angielski"],
      categories: ["Data & AI", "Kariera w IT"],
      tags: ["Python", "Machine Learning", "SQL", "Portfolio", "LLM"],
      yearsExp: 7,
      companies: ["ING Tech", "Revolut"],
      rate60: 200,
      trialPrice: 49,
      rating: 5,
      reviewsCount: 23,
      sessions: 128,
      returningPct: 88,
      responseHours: 3,
      verified: true,
      acceptingNew: true,
      hue: 262,
      reviews: [{ author: "Kuba", rating: 5, date: "2026-10-12", text: "Plan nauki dopasowany do mojego czasu, a nie z YouTube.", tags: ["konkretna"] }],
      availability: { 0: [12, 13], 1: [12, 13], 2: [], 3: [12, 13, 18], 4: [12], 5: [], 6: [10] }
    },
    {
      id: "m4",
      name: "Marek Lis",
      headline: "Staff Backend Engineer \xB7 Java, Kotlin, systemy rozproszone",
      bio: "Projektuj\u0119 systemy, kt\xF3re obs\u0142uguj\u0105 du\u017Cy ruch. Ucz\u0119 my\u015Blenia o skalowalno\u015Bci, testowaniu i projektowaniu API.",
      country: "Polska",
      languages: ["polski", "angielski"],
      categories: ["Backend", "DevOps & Cloud"],
      tags: ["Java", "Kotlin", "Kafka", "System design", "AWS"],
      yearsExp: 12,
      companies: ["OLX", "Zalando"],
      rate60: 260,
      trialPrice: 59,
      rating: 4.7,
      reviewsCount: 56,
      sessions: 401,
      returningPct: 70,
      responseHours: 12,
      verified: true,
      acceptingNew: false,
      hue: 210,
      reviews: [{ author: "Bartek", rating: 5, date: "2026-09-22", text: "System design przerobiony na prawdziwych przyk\u0142adach.", tags: ["ekspert"] }],
      availability: { 0: [], 1: [20], 2: [], 3: [20], 4: [], 5: [], 6: [] }
    },
    {
      id: "m5",
      name: "Natalia Kurek",
      headline: "Product Designer \xB7 UX research, portfolio, Figma",
      bio: "Pomagam projektantkom i projektantom zbudowa\u0107 portfolio, kt\xF3re pokazuje proces, a nie tylko \u0142adne ekrany.",
      country: "Polska",
      languages: ["polski"],
      categories: ["UX/UI Design"],
      tags: ["Figma", "UX research", "Portfolio", "Design systems"],
      yearsExp: 6,
      companies: ["Booksy"],
      rate60: 150,
      trialPrice: 39,
      rating: 4.9,
      reviewsCount: 34,
      sessions: 215,
      returningPct: 79,
      responseHours: 4,
      verified: true,
      acceptingNew: true,
      hue: 330,
      reviews: [{ author: "Zuza", rating: 5, date: "2026-10-05", text: "Case study z portfolio wreszcie ma sens.", tags: ["konkretna"] }],
      availability: std
    },
    {
      id: "m6",
      name: "Adam G\xF3rski",
      headline: "Product Manager \xB7 discovery, metryki, rozmowy rekrutacyjne PM",
      bio: "By\u0142em developerem, teraz jestem PM-em. Pomagam w przej\u015Bciu do produktu i w przygotowaniu do rozm\xF3w.",
      country: "Polska",
      languages: ["polski", "angielski"],
      categories: ["Product Management", "Kariera w IT"],
      tags: ["Discovery", "OKR", "Metryki", "Rozmowy PM"],
      yearsExp: 8,
      companies: ["Pracuj.pl"],
      rate60: 170,
      trialPrice: 0,
      rating: 0,
      reviewsCount: 0,
      sessions: 0,
      returningPct: 0,
      responseHours: 1,
      verified: false,
      acceptingNew: true,
      hue: 90,
      reviews: [],
      availability: { 0: [18], 1: [18], 2: [18], 3: [18], 4: [], 5: [], 6: [] }
    }
  ];
  var SESSIONS = [
    { id: "s1", mentorId: "m1", student: "Ty", startsAt: "2026-10-20T14:05:00+02:00", durationMin: 60, type: "plan", status: "scheduled", goal: "Review architektury komponent\xF3w w projekcie portfolio" },
    { id: "s2", mentorId: "m1", student: "Ty", startsAt: "2026-10-23T18:00:00+02:00", durationMin: 60, type: "plan", status: "scheduled", goal: "Testy jednostkowe hook\xF3w" },
    { id: "s3", mentorId: "m3", student: "Ty", startsAt: "2026-10-21T08:00:00+02:00", durationMin: 30, type: "trial", status: "scheduled", goal: "Czy da si\u0119 przej\u015B\u0107 z frontendu do ML w rok?" },
    {
      id: "s4",
      mentorId: "m1",
      student: "Ty",
      startsAt: "2026-10-18T18:00:00+02:00",
      durationMin: 60,
      type: "plan",
      status: "completed",
      goal: "Zarz\u0105dzanie stanem w React",
      reviewed: true,
      note: "Om\xF3wili\u015Bmy, kiedy stan lokalny wystarcza, a kiedy potrzebny jest store. Twoje komponenty formularza robi\u0105 za du\u017Co \u2014 rozdziel walidacj\u0119 od prezentacji.",
      actionItems: [{ text: "Wydziel hook useCheckoutForm", done: true }, { text: "Przeczytaj dokumentacj\u0119 React o \u201Elifting state up\u201D", done: true }, { text: "Dodaj testy do walidacji formularza", done: false }]
    },
    {
      id: "s5",
      mentorId: "m1",
      student: "Ty",
      startsAt: "2026-10-09T18:00:00+02:00",
      durationMin: 30,
      type: "trial",
      status: "completed",
      goal: "Sesja pr\xF3bna \u2014 ustalenie celu",
      reviewed: false,
      note: "Cel: pierwsza praca jako frontend developer do marca 2027. Plan: portfolio (3 projekty), code review co tydzie\u0144, 2 pr\xF3bne rozmowy techniczne.",
      actionItems: [{ text: "Spisz list\u0119 10 firm, do kt\xF3rych chcesz aplikowa\u0107", done: true }]
    },
    { id: "s6", mentorId: "m5", student: "Ty", startsAt: "2026-10-02T17:00:00+02:00", durationMin: 30, type: "trial", status: "cancelled", goal: "Konsultacja portfolio" }
  ];
  var STUDENTS = [
    { id: "st1", name: "Adrian C.", status: "aktywny", goal: "Pierwsza praca jako frontend dev do marca 2027", sessions: 6, balance: 3, plan: "1\xD760 min / tydz.", nextSession: "2026-10-20T14:05:00+02:00", hue: 12 },
    { id: "st2", name: "Julia M.", status: "aktywny", goal: "Awans na mid w obecnej firmie", sessions: 14, balance: 5, plan: "2\xD760 min / tydz.", nextSession: "2026-10-20T17:00:00+02:00", hue: 300 },
    { id: "st3", name: "Pawe\u0142 R.", status: "pr\xF3bny", goal: "Przygotowanie do rozmowy w scale-upie", sessions: 0, balance: 0, plan: "\u2014", nextSession: "2026-10-22T09:00:00+02:00", hue: 190 },
    { id: "st4", name: "Monika K.", status: "nieaktywny", goal: "Nauka TypeScript", sessions: 4, balance: 0, plan: "anulowany", hue: 50 }
  ];
  var REQUESTS = [
    { id: "r1", student: "Pawe\u0142 R.", startsAt: "2026-10-22T09:00:00+02:00", goal: "Mam rozmow\u0119 techniczn\u0105 za 2 tygodnie w scale-upie, chc\u0119 prze\u0107wiczy\u0107 zadanie live coding w React.", hue: 190 },
    { id: "r2", student: "Iga T.", startsAt: "2026-10-24T10:00:00+02:00", goal: "Ucz\u0119 si\u0119 sama od p\xF3\u0142 roku, nie wiem, czy m\xF3j kod jest \u201Eprodukcyjny\u201D.", hue: 140 }
  ];
  var EARNINGS = [
    { date: "2026-10-19", student: "Julia M.", type: "Plan 60 min", gross: 180, fee: 36, status: "oczekuj\u0105ce" },
    { date: "2026-10-17", student: "Julia M.", type: "Plan 60 min", gross: 180, fee: 36, status: "dost\u0119pne" },
    { date: "2026-10-18", student: "Adrian C.", type: "Plan 60 min", gross: 180, fee: 36, status: "dost\u0119pne" },
    { date: "2026-10-14", student: "Monika K.", type: "Plan 60 min", gross: 180, fee: 36, status: "dost\u0119pne" },
    { date: "2026-10-09", student: "Adrian C.", type: "Sesja pr\xF3bna", gross: 49, fee: 49, status: "wyp\u0142acone" },
    { date: "2026-10-08", student: "Julia M.", type: "Plan 60 min", gross: 180, fee: 36, status: "wyp\u0142acone" }
  ];
  var THREADS = [
    { id: "t1", withName: "Kasia Nowicka", hue: 168, unread: 1, messages: [
      { me: false, text: "Cze\u015B\u0107! Przed czwartkiem wrzu\u0107 prosz\u0119 link do repo z formularzem, przejrz\u0119 go wcze\u015Bniej.", at: "2026-10-19T19:12:00+02:00" },
      { me: true, text: "Jasne, wrzuc\u0119 jutro rano.", at: "2026-10-19T19:30:00+02:00" },
      { me: false, text: "Super, dzi\u0119ki. Dzi\u015B o 14:05 widzimy si\u0119 w pokoju sesji.", at: "2026-10-20T09:02:00+02:00" }
    ] },
    { id: "t2", withName: "Ewa Sadowska", hue: 262, unread: 0, messages: [
      { me: true, text: "Dzie\u0144 dobry, czy na sesji pr\xF3bnej mo\u017Cemy om\xF3wi\u0107 plan przej\u015Bcia do ML?", at: "2026-10-18T10:00:00+02:00" },
      { me: false, text: "Oczywi\u015Bcie. Przygotuj kr\xF3tko, co ju\u017C umiesz z Pythona i matematyki.", at: "2026-10-18T13:40:00+02:00" }
    ] }
  ];
  var APPLICATIONS = [
    { id: "a1", name: "Adam G\xF3rski", headline: "Product Manager \xB7 discovery, metryki", submitted: "2026-10-17", kyc: "zweryfikowano", linkedin: true, hue: 90, categories: ["Product Management"] },
    { id: "a2", name: "Robert Zaj\u0105c", headline: "iOS Developer \xB7 Swift, SwiftUI", submitted: "2026-10-18", kyc: "oczekuje", linkedin: true, hue: 20, categories: ["Frontend"] },
    { id: "a3", name: "Laura Bielecka", headline: "Cloud Architect \xB7 Azure, Terraform", submitted: "2026-10-19", kyc: "niezgodno\u015B\u0107", linkedin: false, hue: 230, categories: ["DevOps & Cloud"] }
  ];
  var DISPUTES = [
    {
      id: "d1",
      sessionId: "s-901",
      student: "Filip W.",
      mentor: "Marek Lis",
      reason: "Mentor si\u0119 nie pojawi\u0142",
      opened: "2026-10-18",
      amount: 260,
      events: ["18:00:12 \u2014 ucze\u0144 do\u0142\u0105czy\u0142 do pokoju", "18:10:40 \u2014 ucze\u0144 klikn\u0105\u0142 \u201EMentor si\u0119 nie pojawi\u0142\u201D", "18:14:02 \u2014 mentor do\u0142\u0105czy\u0142 do pokoju", "18:15:30 \u2014 ucze\u0144 opu\u015Bci\u0142 pok\xF3j"],
      studentSays: "Czeka\u0142em 10 minut, potem zg\u0142osi\u0142em problem i wyszed\u0142em.",
      mentorSays: "Mia\u0142em awari\u0119 internetu, do\u0142\u0105czy\u0142em z 14-minutowym op\xF3\u017Anieniem."
    },
    {
      id: "d2",
      sessionId: "s-877",
      student: "Hanna P.",
      mentor: "Natalia Kurek",
      reason: "Sesja niezgodna z opisem",
      opened: "2026-10-19",
      amount: 150,
      events: ["17:00:01 \u2014 obie strony w pokoju", "17:58:44 \u2014 koniec sesji"],
      studentSays: "Chcia\u0142am om\xF3wi\u0107 research, a rozmawia\u0142y\u015Bmy tylko o Figmie.",
      mentorSays: "Cel sesji w rezerwacji dotyczy\u0142 Figmy."
    }
  ];
  var NOTIFICATIONS = [
    { text: "Sesja z Kasi\u0105 Nowick\u0105 zaczyna si\u0119 za 5 minut", at: "2026-10-20T14:00:00+02:00", link: "#/sesje/s1", unread: true },
    { text: "Nowa wiadomo\u015B\u0107 od Kasi Nowickiej", at: "2026-10-20T09:02:00+02:00", link: "#/wiadomosci/t1", unread: true },
    { text: "Oce\u0144 sesj\u0119 pr\xF3bn\u0105 z 9 pa\u017Adziernika", at: "2026-10-10T09:00:00+02:00", link: "#/sesje/s5/ocena", unread: false },
    { text: "Plan odnowiony: 4 sesje dodane do salda", at: "2026-10-06T08:00:00+02:00", link: "#/plany", unread: false }
  ];
  var PLAN_OPTIONS = [1, 2, 3, 5];

  // src/store.ts
  var store = {
    role: "guest",
    loggedIn: false,
    returnTo: "",
    favorites: /* @__PURE__ */ new Set(["m3"]),
    draft: null,
    sessions: [],
    threads: [],
    requests: [...REQUESTS],
    applications: [...APPLICATIONS],
    disputes: [...DISPUTES],
    notifications: NOTIFICATIONS.map((n) => ({ ...n })),
    balances: {},
    subscription: null,
    goal: {
      text: "Pierwsza praca jako frontend developer do marca 2027",
      target: "2027-03-31",
      milestones: [
        { text: "Projekt portfolio #1 (sklep) po code review", done: true },
        { text: "Projekt portfolio #2 z testami", done: false },
        { text: "2 pr\xF3bne rozmowy techniczne", done: false },
        { text: "20 wys\u0142anych aplikacji", done: false }
      ]
    },
    onboarding: { step: 1, status: "draft", data: {}, availability: /* @__PURE__ */ new Set(["0-18", "0-19", "2-18", "2-19", "5-10"]) },
    mentorTemplate: /* @__PURE__ */ new Set(["0-9", "0-10", "0-17", "0-18", "1-17", "1-18", "1-19", "2-9", "2-10", "2-11", "3-18", "3-19", "4-8", "4-9", "4-16", "5-10", "5-11"]),
    payoutDone: false,
    bookingSeq: 100
  };
  var mentorById = (id) => MENTORS.find((m) => m.id === id);
  var sessionById = (id) => store.sessions.find((s) => s.id === id);
  var DEFAULT_ROUTE = {
    guest: "#/",
    student: "#/sesje",
    mentor: "#/mentor",
    admin: "#/admin/weryfikacja"
  };
  function applyDemoStudent() {
    store.sessions = SESSIONS.map((s) => ({ ...s, actionItems: s.actionItems?.map((a) => ({ ...a })) }));
    store.threads = THREADS.map((t) => ({ ...t, messages: [...t.messages] }));
    store.balances = { m1: 3, m3: 0 };
    store.subscription = { mentorId: "m1", perWeek: 1, durationMin: 60, renewsOn: "2026-11-03", status: "active" };
  }
  function applyFreshStudent() {
    store.sessions = [];
    store.threads = [];
    store.balances = {};
    store.subscription = null;
  }
  applyDemoStudent();

  // src/ui.ts
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var DAYS = ["pon", "wt", "\u015Br", "czw", "pt", "sob", "nd"];
  var DAYS_LONG = ["poniedzia\u0142ek", "wtorek", "\u015Broda", "czwartek", "pi\u0105tek", "sobota", "niedziela"];
  var MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "pa\u017A", "lis", "gru"];
  var weekday = (d) => (d.getDay() + 6) % 7;
  var dayShort = (i) => DAYS[i];
  var fmtDate = (iso) => {
    const d = new Date(iso);
    return `${DAYS[weekday(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  var fmtDateLong = (iso) => {
    const d = new Date(iso);
    return `${DAYS_LONG[weekday(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };
  var fmtTime = (iso) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  var money = (n) => `${n.toLocaleString("pl-PL")} z\u0142`;
  var hoursUntil = (iso) => (new Date(iso).getTime() - NOW.getTime()) / 36e5;
  var initials = (name) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  var avatar = (name, hue, size = 44) => `<span class="avatar" style="--h:${hue};--s:${size}px" aria-hidden="true">${esc(initials(name))}</span>`;
  var stars = (r) => r > 0 ? `<span class="rating"><span class="star">\u2605</span> ${r.toFixed(1)}</span>` : `<span class="badge badge--new">Nowy</span>`;
  var icon = (name) => {
    const p = {
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
      chat: '<path d="M4 5h16v11H8l-4 4z"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
      chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
      home: '<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',
      users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.5 3.4-5 7-5s6.2 1.5 7 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.3 2.2 4 5"/>',
      wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
      bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
      play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
      check: '<path d="m5 12 5 5L20 7"/>',
      shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
      alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
      cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
      screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
      x: '<path d="M6 6l12 12M18 6 6 18"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
      flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
      map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'
    };
    return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name] ?? ""}</svg>`;
  };
  var skeleton = (rows = 3, kind = "card") => `<div class="skeleton-wrap" aria-busy="true" aria-label="Wczytywanie">${Array.from(
    { length: rows },
    () => kind === "card" ? '<div class="sk sk--card"></div>' : '<div class="sk sk--line"></div>'
  ).join("")}</div>`;
  var emptyState = (title, text, cta = "") => `<div class="state state--empty">${icon("target")}<h3>${esc(title)}</h3><p>${esc(text)}</p>${cta}</div>`;
  var errorState = (text = "Nie uda\u0142o si\u0119 wczyta\u0107 danych.") => `<div class="state state--error" role="alert">${icon("alert")}<h3>Co\u015B posz\u0142o nie tak</h3><p>${esc(text)}</p>
   <button class="btn btn--ghost" data-retry>Spr\xF3buj ponownie</button></div>`;
  function states(ctx, v) {
    switch (ctx.state) {
      case "loading":
        return v.loading ? v.loading() : skeleton(3);
      case "empty":
        return v.empty ? v.empty() : v.success();
      case "error":
        return v.error ? v.error() : errorState();
      default:
        return v.success();
    }
  }
  function toast(msg, kind = "ok") {
    const el = document.createElement("div");
    el.className = `toast toast--${kind}`;
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("toast--out"), 2600);
    setTimeout(() => el.remove(), 3e3);
  }
  function openModal(html, bind) {
    closeModal();
    const wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <button class="modal__close" data-close aria-label="Zamknij">${icon("x")}</button>${html}</div>`;
    wrap.addEventListener("click", (e) => {
      const t = e.target;
      if (t === wrap || t.closest("[data-close]")) closeModal();
    });
    document.body.appendChild(wrap);
    bind?.(wrap.querySelector(".modal"));
    wrap.querySelector("input,textarea,button:not([data-close])")?.focus();
    return wrap;
  }
  function closeModal() {
    document.querySelector(".modal-backdrop")?.remove();
  }
  var req = (msg = "To pole jest wymagane.") => (v) => v.trim() ? null : msg;
  var len = (min, max) => (v) => {
    const n = v.trim().length;
    if (n < min) return `Wpisz co najmniej ${min} znak\xF3w (teraz: ${n}).`;
    if (n > max) return `Maksymalnie ${max} znak\xF3w (teraz: ${n}).`;
    return null;
  };
  var emailRule = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "Podaj poprawny adres e-mail.";
  var range = (min, max, unit = "") => (v) => {
    const n = Number(v);
    return Number.isFinite(n) && v !== "" && n >= min && n <= max ? null : `Podaj warto\u015B\u0107 od ${min} do ${max}${unit}.`;
  };
  function validate(form, rules) {
    let ok = true;
    let first = null;
    for (const [name, list] of Object.entries(rules)) {
      const field2 = form.elements.namedItem(name);
      let value = "";
      if (field2 instanceof RadioNodeList) value = field2.value;
      else if (field2 && "type" in field2 && field2.type === "checkbox") value = field2.checked ? "on" : "";
      else if (field2) value = field2.value;
      const err = list.map((r) => r(value, form)).find(Boolean) ?? null;
      const slot = form.querySelector(`[data-err="${name}"]`);
      if (slot) slot.textContent = err ?? "";
      const input = form.querySelector(`[name="${name}"]`);
      input?.setAttribute("aria-invalid", err ? "true" : "false");
      if (err) {
        ok = false;
        if (!first) first = input;
      }
    }
    first?.focus();
    return ok;
  }
  var field = (o) => {
    const id = `f-${o.name}`;
    const control = o.textarea ? `<textarea id="${id}" name="${o.name}" rows="${o.rows ?? 4}" placeholder="${esc(o.placeholder ?? "")}" ${o.counter ? `data-counter="${o.counter}"` : ""} ${o.attrs ?? ""}>${esc(o.value ?? "")}</textarea>` : `<input id="${id}" name="${o.name}" type="${o.type ?? "text"}" value="${esc(o.value ?? "")}" placeholder="${esc(o.placeholder ?? "")}" ${o.attrs ?? ""}/>`;
    return `<div class="field"><label for="${id}">${esc(o.label)}</label>${control}
    <div class="field__meta"><span class="field__err" data-err="${o.name}" aria-live="polite"></span>
    ${o.counter ? `<span class="field__count" data-count-for="${o.name}">${(o.value ?? "").length}/${o.counter}</span>` : o.hint ? `<span class="field__hint">${esc(o.hint)}</span>` : ""}</div></div>`;
  };
  function bindCounters(root) {
    root.querySelectorAll("[data-counter]").forEach((ta) => {
      const out = root.querySelector(`[data-count-for="${ta.name}"]`);
      const upd = () => {
        if (out) out.textContent = `${ta.value.length}/${ta.dataset.counter}`;
      };
      ta.addEventListener("input", upd);
      upd();
    });
  }
  var go = (hash) => {
    location.hash = hash;
  };

  // src/domain.ts
  var FREE_CANCEL_HOURS = 12;
  var MIN_NOTICE_HOURS = 6;
  var HOLD_MINUTES = 10;
  var JOIN_BEFORE_MIN = 10;
  var startOfWeek = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - (x.getDay() + 6) % 7);
    return x;
  };
  function weekSlots(m, weekOffset, now = NOW) {
    const start = startOfWeek(now);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const slots = (m.availability[i] ?? []).map((h) => {
        const d = new Date(day);
        d.setHours(h, 0, 0, 0);
        return d;
      }).filter((d) => d.getTime() - now.getTime() >= MIN_NOTICE_HOURS * 36e5).map((d) => ({ iso: d.toISOString(), taken: (d.getDate() * 7 + d.getHours() + m.id.length) % 5 === 0 }));
      return { day, slots };
    });
  }
  function nextFreeWeek(m, from) {
    for (let w = from + 1; w < from + 6; w++) {
      if (weekSlots(m, w).some((d) => d.slots.some((s) => !s.taken))) return w;
    }
    return null;
  }
  var canCancelFree = (s, now = NOW) => new Date(s.startsAt).getTime() - now.getTime() >= FREE_CANCEL_HOURS * 36e5;
  var canJoin = (s, now = NOW) => {
    const start = new Date(s.startsAt).getTime();
    return s.status === "scheduled" && now.getTime() >= start - JOIN_BEFORE_MIN * 6e4 && now.getTime() <= start + s.durationMin * 6e4;
  };
  var hasStarted = (s, now = NOW) => new Date(s.startsAt).getTime() <= now.getTime();
  function commissionRate(hours) {
    if (hours < 20) return 0.33;
    if (hours < 50) return 0.28;
    if (hours < 200) return 0.2;
    return 0.18;
  }
  var nextTier = (hours) => [20, 50, 200].find((t) => t > hours) ?? null;
  var planPrice = (rate60, perWeek, durationMin) => Math.round(rate60 * (durationMin / 60) * perWeek * 4);
  var transferSessions = (sessions2, fromRate, toRate) => Math.floor(sessions2 * fromRate / toRate);
  var OFF_PLATFORM = /(\+?\d[\d\s-]{7,}\d)|([^\s@]+@[^\s@]+\.[a-z]{2,})|(whatsapp|telegram|revolut|blik na)/i;

  // src/screens/public.ts
  function home(ctx) {
    const featured = MENTORS.filter((m) => m.verified).slice(0, 4);
    const html = `
  <section class="hero">
    <p class="eyebrow">Mentoring 1:1 online</p>
    <h1>Rozwijaj si\u0119 szybciej z mentorem, kt\xF3ry ju\u017C przeszed\u0142 t\u0119 drog\u0119</h1>
    <p class="lead">Zweryfikowani praktycy z IT, produktu i designu. Zacznij od 30-minutowej sesji pr\xF3bnej \u2014 je\u015Bli nie zaiskrzy, zmienisz mentora za darmo.</p>
    <form class="searchbar" data-form="search" role="search">
      ${icon("search")}
      <input name="q" list="topics" placeholder="Czego chcesz si\u0119 nauczy\u0107? np. React, awans na lidera" aria-label="Temat" />
      <datalist id="topics">${CATEGORIES.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
      <button class="btn btn--primary">Szukaj</button>
    </form>
    <div class="field__err" data-err="q"></div>
    <div class="chips">${CATEGORIES.map((c) => `<a class="chip" href="#/mentorzy?topic=${encodeURIComponent(c)}">${esc(c)}</a>`).join("")}</div>
  </section>

  <section class="steps">
    <div><span class="steps__n">1</span><h3>Znajd\u017A mentora</h3><p>Filtruj po temacie, bud\u017Cecie i godzinach. Obejrzyj wideo i opinie.</p></div>
    <div><span class="steps__n">2</span><h3>Sesja pr\xF3bna</h3><p>30 minut na poznanie si\u0119 i ustalenie celu. Gwarancja zamiany lub zwrotu.</p></div>
    <div><span class="steps__n">3</span><h3>Plan i post\u0119py</h3><p>Sta\u0142y rytm sesji, notatki i zadania po ka\u017Cdym spotkaniu.</p></div>
  </section>

  <section>
    <div class="section-head"><h2>Polecani mentorzy</h2><a href="#/mentorzy" class="link">Wszyscy mentorzy ${icon("arrow")}</a></div>
    ${states(ctx, {
      loading: () => skeleton(4),
      empty: () => "",
      error: () => "",
      success: () => `<div class="grid-4">${featured.map(miniCard).join("")}</div>`
    })}
  </section>

  <section class="cta-band">
    <div><h2>Masz do\u015Bwiadczenie, kt\xF3rym chcesz si\u0119 dzieli\u0107?</h2><p>Ustal w\u0142asn\u0105 stawk\u0119 i godziny. P\u0142atno\u015Bci i rozliczenia bierzemy na siebie.</p></div>
    <a class="btn btn--light" href="#/mentor/onboarding/1" data-become-mentor>Zosta\u0144 mentorem</a>
  </section>`;
    return {
      html,
      bind(root) {
        root.querySelector("[data-form=search]").addEventListener("submit", (e) => {
          e.preventDefault();
          const f = e.target;
          const q = f.elements.namedItem("q").value.trim();
          if (q.length === 1) {
            validate(f, { q: [len(2, 80)] });
            return;
          }
          go(q ? `#/mentorzy?topic=${encodeURIComponent(q)}` : "#/mentorzy");
        });
      }
    };
  }
  var miniCard = (m) => `
  <a class="card card--mini" href="#/mentorzy/${m.id}">
    ${avatar(m.name, m.hue, 56)}
    <strong>${esc(m.name)}</strong>
    <span class="muted small">${esc(m.headline.split("\xB7")[0])}</span>
    <span class="row gap-s">${stars(m.rating)}<span class="muted small">${money(m.rate60)}/h</span></span>
  </a>`;
  function readFilters(q) {
    return {
      topic: q.get("topic") ?? "",
      priceMax: Number(q.get("priceMax") ?? 300),
      verified: q.get("verified") === "1",
      sort: q.get("sort") ?? "trafnosc",
      time: q.get("time") ?? ""
    };
  }
  function applyFilters(f) {
    const t = f.topic.toLowerCase();
    let list = MENTORS.filter((m) => (!t || [m.name, m.headline, ...m.categories, ...m.tags].join(" ").toLowerCase().includes(t)) && m.rate60 <= f.priceMax && (!f.verified || m.verified) && (!f.time || Object.values(m.availability).flat().some((h) => f.time === "rano" ? h < 12 : f.time === "popoludnie" ? h >= 12 && h < 17 : h >= 17)));
    const by = {
      "cena-rosnaco": (a, b) => a.rate60 - b.rate60,
      "cena-malejaco": (a, b) => b.rate60 - a.rate60,
      ocena: (a, b) => b.rating - a.rating,
      sesje: (a, b) => b.sessions - a.sessions
    };
    if (by[f.sort]) list = [...list].sort(by[f.sort]);
    return list;
  }
  function search(ctx) {
    const f = readFilters(ctx.query);
    const list = ctx.state === "empty" ? [] : applyFilters(f);
    const active = [
      f.topic && ["topic", `Temat: ${f.topic}`],
      f.priceMax < 300 && ["priceMax", `Do ${f.priceMax} z\u0142`],
      f.verified && ["verified", "Zweryfikowani"],
      f.time && ["time", `Pora: ${f.time}`]
    ].filter(Boolean);
    const filtersForm = `
  <form class="filters" data-form="filters">
    <div class="field"><label for="f-topic">Temat</label><input id="f-topic" name="topic" value="${esc(f.topic)}" list="topics2" placeholder="np. React"/>
      <datalist id="topics2">${CATEGORIES.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
    <div class="field"><label for="f-price">Cena za 60 min: do <output id="price-out">${f.priceMax}</output> z\u0142</label>
      <input id="f-price" type="range" name="priceMax" min="50" max="300" step="10" value="${f.priceMax}"/></div>
    <div class="field"><label for="f-time">Dost\u0119pno\u015B\u0107</label><select id="f-time" name="time">
      ${[["", "Dowolna pora"], ["rano", "Rano (do 12)"], ["popoludnie", "Popo\u0142udnie (12\u201317)"], ["wieczor", "Wiecz\xF3r (od 17)"]].map(([v, l]) => `<option value="${v}" ${f.time === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    <label class="check"><input type="checkbox" name="verified" ${f.verified ? "checked" : ""}/> Tylko zweryfikowani</label>
    <div class="field"><label for="f-sort">Sortuj</label><select id="f-sort" name="sort">
      ${[["trafnosc", "Trafno\u015B\u0107"], ["cena-rosnaco", "Cena rosn\u0105co"], ["cena-malejaco", "Cena malej\u0105co"], ["ocena", "Ocena"], ["sesje", "Liczba sesji"]].map(([v, l]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
  </form>`;
    const narrowest = active[0];
    const html = `
  <div class="page-head"><h1>Mentorzy</h1>
    <button class="btn btn--ghost only-mobile" data-toggle-filters>Filtry${active.length ? ` (${active.length})` : ""}</button></div>
  <div class="layout-side">
    <aside class="side" data-filters-panel>${filtersForm}</aside>
    <div>
      ${active.length ? `<div class="chips chips--active">${active.map(([k, l]) => `<button class="chip chip--on" data-clear="${k}">${esc(l)} ${icon("x")}</button>`).join("")}</div>` : ""}
      ${states(ctx, {
      loading: () => skeleton(4),
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 listy mentor\xF3w."),
      empty: () => emptyState(
        "Brak mentor\xF3w dla tych filtr\xF3w",
        "Spr\xF3buj poluzowa\u0107 filtry \u2014 najbardziej zaw\u0119\u017Ca wynik filtr poni\u017Cej.",
        narrowest ? `<button class="btn btn--primary" data-clear="${narrowest[0]}">Wyczy\u015B\u0107: ${esc(narrowest[1])}</button>` : `<a class="btn btn--primary" href="#/mentorzy">Poka\u017C wszystkich</a>`
      ),
      success: () => list.length === 0 ? emptyState("Brak mentor\xF3w dla tych filtr\xF3w", "Spr\xF3buj poluzowa\u0107 filtry.", narrowest ? `<button class="btn btn--primary" data-clear="${narrowest[0]}">Wyczy\u015B\u0107: ${esc(narrowest[1])}</button>` : "") : `<p class="muted small">${list.length} ${list.length === 1 ? "mentor" : list.length < 5 ? "mentor\xF3w" : "mentor\xF3w"}</p>
             <div class="stack">${list.map(mentorCard).join("")}</div>`
    })}
    </div>
  </div>`;
    return {
      html,
      bind(root) {
        const form = root.querySelector("[data-form=filters]");
        const push = () => {
          const fd = new FormData(form);
          const q = new URLSearchParams();
          const topic = String(fd.get("topic") ?? "").trim();
          if (topic) q.set("topic", topic);
          if (Number(fd.get("priceMax")) < 300) q.set("priceMax", String(fd.get("priceMax")));
          if (fd.get("verified")) q.set("verified", "1");
          if (fd.get("time")) q.set("time", String(fd.get("time")));
          if (fd.get("sort") !== "trafnosc") q.set("sort", String(fd.get("sort")));
          history.replaceState(null, "", `#/mentorzy${q.toString() ? `?${q}` : ""}`);
          ctx.rerender();
        };
        form.addEventListener("change", push);
        form.querySelector("#f-price").addEventListener("input", (e) => {
          root.querySelector("#price-out").textContent = e.target.value;
        });
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          push();
        });
        root.querySelectorAll("[data-clear]").forEach((b) => b.addEventListener("click", () => {
          const q = new URLSearchParams(ctx.query);
          q.delete(b.dataset.clear);
          q.delete("state");
          history.replaceState(null, "", `#/mentorzy${q.toString() ? `?${q}` : ""}`);
          ctx.rerender();
        }));
        root.querySelector("[data-toggle-filters]")?.addEventListener("click", () => root.querySelector("[data-filters-panel]").classList.toggle("side--open"));
        bindFavorites(root);
      }
    };
  }
  var mentorCard = (m) => `
  <article class="card mentor-card">
    <a href="#/mentorzy/${m.id}" class="mentor-card__media" aria-label="Profil: ${esc(m.name)}">
      ${avatar(m.name, m.hue, 88)}<span class="play-dot">${icon("play")}</span>
    </a>
    <div class="mentor-card__body">
      <div class="row between">
        <a href="#/mentorzy/${m.id}" class="h3link">${esc(m.name)} ${m.verified ? `<span class="verified" title="Zweryfikowany">${icon("shield")}</span>` : ""}</a>
        <button class="fav ${store.favorites.has(m.id) ? "fav--on" : ""}" data-fav="${m.id}" aria-pressed="${store.favorites.has(m.id)}" aria-label="Ulubiony">\u2665</button>
      </div>
      <p class="mentor-card__headline">${esc(m.headline)}</p>
      <div class="tags">${m.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <p class="muted small clamp">${esc(m.bio)}</p>
      <div class="row wrap gap-s small muted">${stars(m.rating)}${m.reviewsCount ? `<span>${m.reviewsCount} opinii</span>` : ""}<span>${m.sessions} sesji</span><span>Odpowiada zwykle w ${m.responseHours} h</span></div>
    </div>
    <div class="mentor-card__aside">
      <div><strong class="price">${money(m.rate60)}</strong><span class="muted small"> / 60 min</span></div>
      ${m.acceptingNew ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Sesja pr\xF3bna${m.trialPrice ? ` \xB7 ${money(m.trialPrice)}` : ""}</a>` : '<span class="badge">Nie przyjmuje nowych</span>'}
      <a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>
    </div>
  </article>`;
  function bindFavorites(root) {
    root.querySelectorAll("[data-fav]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.fav;
      if (store.favorites.has(id)) store.favorites.delete(id);
      else store.favorites.add(id);
      b.classList.toggle("fav--on");
      b.setAttribute("aria-pressed", String(store.favorites.has(id)));
      toast(store.favorites.has(id) ? "Dodano do ulubionych" : "Usuni\u0119to z ulubionych");
    }));
  }
  function profile(ctx) {
    const m = mentorById(ctx.params.id);
    if (!m || ctx.state === "error") {
      return { html: `<div class="narrow">${errorState("Ten profil jest niedost\u0119pny \u2014 m\xF3g\u0142 zosta\u0107 zawieszony lub usuni\u0119ty.")}
      <h2>Podobni mentorzy</h2><div class="grid-4">${MENTORS.slice(0, 4).map(miniCard).join("")}</div></div>` };
    }
    if (ctx.state === "loading") return { html: `<div class="sk sk--hero"></div>${skeleton(2)}` };
    const empty = ctx.state === "empty" || m.reviews.length === 0;
    const week = weekSlots(m, 0);
    const anySlot = week.some((d) => d.slots.length);
    const similar = MENTORS.filter((x) => x.id !== m.id && x.categories.some((c) => m.categories.includes(c))).slice(0, 3);
    const html = `
  <a href="#/mentorzy" class="back">${icon("back")} Wr\xF3\u0107 do wynik\xF3w</a>
  <div class="layout-profile">
    <div class="stack-l">
      <section class="profile-hero card">
        ${avatar(m.name, m.hue, 96)}
        <div>
          <h1>${esc(m.name)} ${m.verified ? `<span class="verified" title="Zweryfikowany">${icon("shield")}</span>` : ""}</h1>
          <p class="lead">${esc(m.headline)}</p>
          <p class="muted small">${esc(m.country)} \xB7 ${m.languages.map(esc).join(", ")} \xB7 ${m.yearsExp} lat do\u015Bwiadczenia \xB7 ${m.companies.map(esc).join(", ")}</p>
        </div>
      </section>
      <div class="video-ph" role="img" aria-label="Wideo powitalne">${icon("play")}<span>Wideo powitalne \xB7 1:42</span></div>
      <div class="stats">
        <div><strong>${m.rating ? m.rating.toFixed(1) : "\u2014"}</strong><span>ocena</span></div>
        <div><strong>${m.sessions}</strong><span>sesji</span></div>
        <div><strong>${m.returningPct ? `${m.returningPct}%` : "\u2014"}</strong><span>wraca po pr\xF3bnej</span></div>
        <div><strong>${m.responseHours} h</strong><span>czas odpowiedzi</span></div>
      </div>
      <section><h2>O mnie</h2><p>${esc(m.bio)}</p><div class="tags">${m.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></section>
      <section>
        <div class="section-head"><h2>Dost\u0119pno\u015B\u0107 w tym tygodniu</h2><span class="muted small">Twoja strefa: Europe/Warsaw</span></div>
        ${anySlot ? `<div class="week">${week.map((d, i) => `<div class="week__day"><span class="week__label">${dayShort(i)} ${d.day.getDate()}</span>
          ${d.slots.length ? d.slots.map((s) => `<span class="week__slot ${s.taken ? "is-taken" : ""}">${fmtTime(s.iso)}</span>`).join("") : '<span class="muted small">\u2014</span>'}</div>`).join("")}</div>` : emptyState("Brak wolnych termin\xF3w w tym tygodniu", "Napisz do mentora, \u017Ceby ustali\u0107 termin, albo sprawd\u017A kolejny tydzie\u0144 przy rezerwacji.")}
      </section>
      <section>
        <h2>Opinie${m.reviewsCount ? ` (${m.reviewsCount})` : ""}</h2>
        ${empty ? emptyState("Nowy mentor", "Ten mentor nie ma jeszcze opinii. Zweryfikowali\u015Bmy jego do\u015Bwiadczenie i to\u017Csamo\u015B\u0107.") : `<div class="rating-break">${[5, 4, 3, 2, 1].map((r) => {
      const pct = r === 5 ? 86 : r === 4 ? 11 : r === 3 ? 3 : 0;
      return `<div class="row gap-s small"><span>${r}\u2605</span><span class="bar"><span style="width:${pct}%"></span></span><span class="muted">${pct}%</span></div>`;
    }).join("")}</div>
            <div class="stack">${m.reviews.map((r) => `<article class="review"><div class="row between"><strong>${esc(r.author)}</strong><span class="muted small">${fmtDate(r.date)}</span></div>
              <div class="stars-line">${"\u2605".repeat(r.rating)}${"\u2606".repeat(5 - r.rating)}</div><p>${esc(r.text)}</p>
              <div class="tags">${r.tags.map((t) => `<span class="tag tag--soft">${esc(t)}</span>`).join("")}</div></article>`).join("")}</div>`}
      </section>
      ${similar.length ? `<section><h2>Podobni mentorzy</h2><div class="grid-3">${similar.map(miniCard).join("")}</div></section>` : ""}
    </div>
    <aside class="booking-box card">
      <div><strong class="price">${money(m.rate60)}</strong><span class="muted"> / 60 min</span></div>
      <p class="small muted">Sesja pr\xF3bna 30 min: <strong>${m.trialPrice ? money(m.trialPrice) : "bezp\u0142atna"}</strong></p>
      ${m.acceptingNew ? `<a class="btn btn--primary btn--block" href="#/rezerwacja/${m.id}">Zarezerwuj sesj\u0119 pr\xF3bn\u0105</a>` : `<button class="btn btn--primary btn--block" disabled>Nie przyjmuje nowych uczni\xF3w</button>`}
      <a class="btn btn--ghost btn--block" href="#/wiadomosci/nowa?m=${m.id}">Napisz wiadomo\u015B\u0107</a>
      <p class="guarantee">${icon("shield")} Je\u015Bli sesja pr\xF3bna nie spe\u0142ni oczekiwa\u0144, zmienisz mentora za darmo albo odzyskasz pieni\u0105dze.</p>
    </aside>
  </div>
  <div class="sticky-bar only-mobile">
    <div><strong>${money(m.rate60)}</strong><span class="muted small"> / 60 min</span></div>
    ${m.acceptingNew ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Sesja pr\xF3bna</a>` : '<span class="badge">Nie przyjmuje nowych</span>'}
  </div>`;
    return { html };
  }
  function auth(ctx) {
    const mode = ctx.params.mode === "rejestracja" ? "register" : "login";
    const asMentor = ctx.query.get("jako") === "mentor";
    const html = `
  <div class="narrow card auth">
    <div class="tabs" role="tablist">
      <a role="tab" class="tab ${mode === "login" ? "is-active" : ""}" href="#/logowanie${location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?")) : ""}">Logowanie</a>
      <a role="tab" class="tab ${mode === "register" ? "is-active" : ""}" href="#/rejestracja${location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?")) : ""}">Rejestracja</a>
    </div>
    ${store.returnTo.startsWith("#/rezerwacja") ? `<p class="notice">${icon("cal")} Tw\xF3j wybrany termin jest zachowany \u2014 po zalogowaniu wr\xF3cisz do p\u0142atno\u015Bci.</p>` : ""}
    ${ctx.state === "error" ? `<p class="notice notice--err" role="alert">Za du\u017Co nieudanych pr\xF3b. Spr\xF3buj ponownie za 5 minut.</p>` : ""}
    <div class="stack">
      <button class="btn btn--social" data-social>Kontynuuj z Google</button>
      <button class="btn btn--social" data-social>Kontynuuj z LinkedIn</button>
    </div>
    <div class="divider"><span>lub e-mailem</span></div>
    <form data-form="auth" novalidate>
      ${mode === "register" ? field({ name: "name", label: "Imi\u0119", placeholder: "np. Adrian" }) : ""}
      ${field({ name: "email", label: "E-mail", type: "email", placeholder: "ty@firma.pl", attrs: 'autocomplete="email"' })}
      ${field({ name: "password", label: "Has\u0142o", type: "password", hint: mode === "register" ? "Min. 10 znak\xF3w" : "", attrs: 'autocomplete="current-password"' })}
      ${mode === "register" ? `
        <fieldset class="segmented"><legend>Chc\u0119</legend>
          <label><input type="radio" name="as" value="student" ${asMentor ? "" : "checked"}/> si\u0119 uczy\u0107</label>
          <label><input type="radio" name="as" value="mentor" ${asMentor ? "checked" : ""}/> mentorowa\u0107</label>
        </fieldset>
        <label class="check"><input type="checkbox" name="terms"/> Akceptuj\u0119 regulamin i polityk\u0119 prywatno\u015Bci</label>
        <div class="field__err" data-err="terms"></div>
        <label class="check"><input type="checkbox" name="marketing"/> Chc\u0119 dostawa\u0107 wskaz\xF3wki i oferty (opcjonalnie)</label>` : '<a class="link small" href="#/logowanie" data-reset>Nie pami\u0119tasz has\u0142a?</a>'}
      <button class="btn btn--primary btn--block" type="submit">${mode === "register" ? "Za\u0142\xF3\u017C konto" : "Zaloguj si\u0119"}</button>
      <p class="muted small">Podpowied\u017A do mockupu: e-mail <code>zajety@kompas.pl</code> symuluje b\u0142\u0105d.</p>
    </form>
  </div>`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const finish = (role, fresh) => {
          if (fresh) applyFreshStudent();
          else applyDemoStudent();
          store.loggedIn = true;
          store.role = role;
          const back = store.returnTo;
          store.returnTo = "";
          toast("Zalogowano");
          go(back || (role === "mentor" ? "#/mentor/onboarding/1" : "#/sesje"));
        };
        root.querySelectorAll("[data-social]").forEach((b) => b.addEventListener("click", () => finish("student", false)));
        root.querySelector("[data-reset]")?.addEventListener("click", (e) => {
          e.preventDefault();
          toast("Wys\u0142ali\u015Bmy link do zmiany has\u0142a (je\u015Bli konto istnieje).");
        });
        const form = root.querySelector("[data-form=auth]");
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const rules = mode === "register" ? { name: [req(), len(2, 50)], email: [req(), emailRule], password: [req(), len(10, 128)], terms: [req("Akceptacja regulaminu jest wymagana.")] } : { email: [req(), emailRule], password: [req()] };
          if (!validate(form, rules)) return;
          const email = form.elements.namedItem("email").value.trim();
          const btn = form.querySelector("button[type=submit]");
          btn.disabled = true;
          btn.textContent = "Chwileczk\u0119\u2026";
          setTimeout(() => {
            btn.disabled = false;
            btn.textContent = mode === "register" ? "Za\u0142\xF3\u017C konto" : "Zaloguj si\u0119";
            if (email === "zajety@kompas.pl") {
              form.querySelector("[data-err=email]").innerHTML = mode === "register" ? 'To konto ju\u017C istnieje. <a class="link" href="#/logowanie">Zaloguj si\u0119</a>' : "Nieprawid\u0142owy e-mail lub has\u0142o.";
              return;
            }
            const as = mode === "register" ? form.elements.namedItem("as").value : "student";
            finish(as, mode === "register");
          }, 500);
        });
      }
    };
  }

  // src/screens/student.ts
  var statusLabel = {
    scheduled: "Zaplanowana",
    completed: "Odbyta",
    cancelled: "Anulowana",
    no_show: "Nieobecno\u015B\u0107",
    disputed: "Zg\u0142oszony problem",
    requested: "Oczekuje na mentora"
  };
  var typeLabel = (s) => s.type === "trial" ? "Sesja pr\xF3bna" : "Sesja z planu";
  function pickSlot(ctx) {
    const m = mentorById(ctx.params.mentorId);
    if (!m) return { html: errorState("Nie znaleziono mentora.") };
    const w = Number(ctx.query.get("w") ?? 0);
    const fromBalance = store.loggedIn && (store.balances[m.id] ?? 0) > 0;
    const type = fromBalance ? "plan" : "trial";
    const duration = type === "trial" ? 30 : Number(ctx.query.get("d") ?? 60);
    const week = ctx.state === "empty" ? weekSlots(m, w).map((d) => ({ ...d, slots: [] })) : weekSlots(m, w);
    const hasFree = week.some((d) => d.slots.some((s) => !s.taken));
    const next = hasFree ? null : nextFreeWeek(m, w);
    const sel = store.draft?.mentorId === m.id ? store.draft.startsAt : void 0;
    const grid = `
    <div class="row between week-nav">
      <a class="btn btn--ghost btn--s ${w <= 0 ? "is-disabled" : ""}" href="#/rezerwacja/${m.id}?w=${Math.max(0, w - 1)}" aria-disabled="${w <= 0}">${icon("back")}</a>
      <strong>${fmtDate(week[0].day)} \u2013 ${fmtDate(week[6].day)}</strong>
      <a class="btn btn--ghost btn--s" href="#/rezerwacja/${m.id}?w=${w + 1}">${icon("arrow")}</a>
    </div>
    ${hasFree ? `<div class="slot-grid">${week.map((d, i) => `
      <div class="slot-col"><span class="slot-col__head">${dayShort(i)}<b>${d.day.getDate()}</b></span>
        ${d.slots.map((s) => `<button class="slot ${s.iso === sel ? "is-selected" : ""}" data-slot="${s.iso}" ${s.taken ? 'disabled aria-label="zaj\u0119te"' : ""}>${fmtTime(s.iso)}</button>`).join("") || '<span class="slot-none">\u2014</span>'}
      </div>`).join("")}</div>` : emptyState(
      "Brak wolnych termin\xF3w w tym tygodniu",
      next !== null ? "Najbli\u017Csze wolne terminy s\u0105 w kolejnym tygodniu." : "Mentor nie ma wolnych termin\xF3w w najbli\u017Cszych tygodniach.",
      next !== null ? `<a class="btn btn--primary" href="#/rezerwacja/${m.id}?w=${next}">Przejd\u017A do najbli\u017Cszego terminu</a>` : `<a class="btn btn--primary" href="#/wiadomosci/nowa?m=${m.id}">Napisz do mentora</a>`
    )}`;
    const html = `
  <a href="#/mentorzy/${m.id}" class="back">${icon("back")} ${esc(m.name)}</a>
  <div class="steps-bar"><span class="is-active">1 Termin</span><span>2 P\u0142atno\u015B\u0107</span><span>3 Gotowe</span></div>
  <div class="layout-checkout">
    <section class="card">
      <h1 class="h2">${type === "trial" ? "Wybierz termin sesji pr\xF3bnej" : "Zarezerwuj sesj\u0119 z salda"}</h1>
      <div class="row between wrap gap-s">
        ${type === "trial" ? '<span class="badge">30 min \xB7 sesja pr\xF3bna</span>' : `<div class="segmented segmented--inline" role="radiogroup">${[30, 60].map((d) => `<a role="radio" aria-checked="${d === duration}" class="${d === duration ? "is-on" : ""}" href="#/rezerwacja/${m.id}?w=${w}&d=${d}">${d} min</a>`).join("")}</div>`}
        <label class="small muted">Strefa czasowa <select class="select-s" aria-label="Strefa czasowa"><option>Europe/Warsaw (UTC+2)</option><option>Europe/London (UTC+1)</option><option>America/New_York (UTC\u22124)</option></select></label>
      </div>
      ${states(ctx, { loading: () => skeleton(5, "line"), error: () => errorState("Nie uda\u0142o si\u0119 pobra\u0107 dost\u0119pno\u015Bci mentora."), success: () => grid, empty: () => grid })}
      <p class="muted small">${icon("cal")} Prze\u0142o\u017Cenie lub anulowanie jest bezp\u0142atne do ${FREE_CANCEL_HOURS} h przed sesj\u0105. Rezerwacja mo\u017Cliwa najp\xF3\u017Aniej 6 h przed terminem.</p>
    </section>
    <aside class="card summary">
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${esc(m.headline.split("\xB7")[0])}</span></div></div>
      <dl class="dl">
        <dt>Termin</dt><dd data-sel-label>${sel ? `${fmtDate(sel)}, ${fmtTime(sel)}` : "\u2014"}</dd>
        <dt>Czas</dt><dd>${duration} min</dd>
        <dt>Koszt</dt><dd>${type === "trial" ? money(m.trialPrice) : "1 sesja z salda"}</dd>
      </dl>
      <button class="btn btn--primary btn--block" data-continue ${sel ? "" : "disabled"}>Dalej</button>
      <button class="link small" data-sim409>Mockup: symuluj zaj\u0119cie terminu (409)</button>
    </aside>
  </div>`;
    return {
      html,
      bind(root) {
        root.querySelectorAll("[data-slot]").forEach((b) => b.addEventListener("click", () => {
          store.draft = { mentorId: m.id, startsAt: b.dataset.slot, durationMin: duration, type };
          root.querySelectorAll(".slot.is-selected").forEach((x) => x.classList.remove("is-selected"));
          b.classList.add("is-selected");
          root.querySelector("[data-sel-label]").textContent = `${fmtDate(b.dataset.slot)}, ${fmtTime(b.dataset.slot)}`;
          root.querySelector("[data-continue]").disabled = false;
        }));
        root.querySelector("[data-continue]")?.addEventListener("click", () => {
          if (!store.draft?.startsAt) return;
          store.draft.holdExpires = Date.now() + HOLD_MINUTES * 6e4;
          const target = `#/rezerwacja/${m.id}/platnosc`;
          if (!store.loggedIn) {
            store.returnTo = target;
            toast("Zaloguj si\u0119, aby doko\u0144czy\u0107 rezerwacj\u0119");
            go("#/rejestracja");
          } else go(target);
        });
        root.querySelector("[data-sim409]")?.addEventListener("click", () => {
          const selBtn = root.querySelector(".slot.is-selected");
          if (!selBtn) {
            toast("Najpierw wybierz termin", "err");
            return;
          }
          selBtn.classList.remove("is-selected");
          selBtn.disabled = true;
          store.draft = null;
          root.querySelector("[data-sel-label]").textContent = "\u2014";
          root.querySelector("[data-continue]").disabled = true;
          toast("Ten termin zosta\u0142 w\u0142a\u015Bnie zaj\u0119ty. Wybierz inny.", "err");
        });
      }
    };
  }
  function checkout(ctx) {
    const m = mentorById(ctx.params.mentorId);
    const d = store.draft;
    if (!m) return { html: errorState("Nie znaleziono mentora.") };
    if (!d?.startsAt || d.mentorId !== m.id) {
      return { html: `<div class="narrow">${emptyState("Nie wybrano terminu", "Wr\xF3\u0107 do kalendarza mentora i wybierz termin.", `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Wybierz termin</a>`)}</div>` };
    }
    if (!d.holdExpires) d.holdExpires = Date.now() + HOLD_MINUTES * 6e4;
    const isTrial = d.type === "trial";
    const price = isTrial ? m.trialPrice : 0;
    const fee = isTrial && price > 0 ? 3 : 0;
    const html = `
  <a href="#/rezerwacja/${m.id}" class="back">${icon("back")} Zmie\u0144 termin</a>
  <div class="steps-bar"><span class="is-done">1 Termin</span><span class="is-active">2 ${isTrial ? "P\u0142atno\u015B\u0107" : "Potwierdzenie"}</span><span>3 Gotowe</span></div>
  ${ctx.state === "error" ? `<p class="notice notice--err" role="alert">P\u0142atno\u015B\u0107 odrzucona przez bank: niewystarczaj\u0105ce \u015Brodki. Termin jest nadal zablokowany \u2014 spr\xF3buj inn\u0105 metod\u0105.</p>` : ""}
  <form class="layout-checkout" data-form="checkout" novalidate>
    <section class="card stack">
      <h1 class="h2">${isTrial ? "Op\u0142a\u0107 sesj\u0119 pr\xF3bn\u0105" : "Potwierd\u017A rezerwacj\u0119 z salda"}</h1>
      ${field({
      name: "goal",
      label: isTrial ? "Z czym przychodzisz? (mentor zobaczy to przed sesj\u0105)" : "Temat sesji (opcjonalnie)",
      textarea: true,
      rows: 4,
      counter: 500,
      placeholder: "np. Ucz\u0119 si\u0119 Reacta od p\xF3\u0142 roku, chc\u0119 wiedzie\u0107, czy m\xF3j projekt nadaje si\u0119 do portfolio i co poprawi\u0107."
    })}
      ${isTrial ? `
      <fieldset class="pay-methods"><legend>Metoda p\u0142atno\u015Bci</legend>
        ${[["card", "Karta p\u0142atnicza"], ["blik", "BLIK"], ["p24", "Przelewy24"]].map(([v, l], i) => `<label class="pay-method"><input type="radio" name="method" value="${v}" ${i === 0 ? "checked" : ""}/> <span>${l}</span></label>`).join("")}
        <div class="field__err" data-err="method"></div>
      </fieldset>
      <div class="pay-embed" data-pay-embed>
        <div class="field"><label>Numer karty</label><input name="card" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="cc-number"/><div class="field__meta"><span class="field__err" data-err="card"></span></div></div>
        <div class="row gap-s"><div class="field grow"><label>Wa\u017Cna do</label><input name="exp" placeholder="MM/RR"/><div class="field__meta"><span class="field__err" data-err="exp"></span></div></div>
        <div class="field grow"><label>CVC</label><input name="cvc" inputmode="numeric" placeholder="123"/><div class="field__meta"><span class="field__err" data-err="cvc"></span></div></div></div>
        <p class="muted small">Pola karty osadza operator p\u0142atno\u015Bci \u2014 nie przechowujemy danych karty.</p>
      </div>
      <div class="row gap-s align-end">
        <div class="field grow"><label for="f-promo">Kod rabatowy</label><input id="f-promo" name="promo" placeholder="np. KOMPAS10"/><div class="field__meta"><span class="field__err" data-err="promo"></span></div></div>
        <button type="button" class="btn btn--ghost" data-promo>Zastosuj</button>
      </div>
      <label class="check small"><input type="checkbox" name="simDecline"/> Mockup: symuluj odrzucon\u0105 p\u0142atno\u015B\u0107</label>` : ""}
    </section>
    <aside class="card summary">
      <div class="hold" data-hold>${icon("cal")} Termin zarezerwowany dla Ciebie przez <b data-countdown>10:00</b></div>
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${isTrial ? "Sesja pr\xF3bna" : "Sesja z planu"} \xB7 ${d.durationMin} min</span></div></div>
      <dl class="dl">
        <dt>Termin</dt><dd>${fmtDateLong(d.startsAt)}, ${fmtTime(d.startsAt)}</dd>
        ${isTrial ? `<dt>Sesja</dt><dd>${money(price)}</dd><dt>Op\u0142ata serwisowa</dt><dd>${money(fee)}</dd><dt data-disc-l hidden>Rabat</dt><dd data-disc hidden></dd>
        <dt class="total">Razem</dt><dd class="total" data-total>${money(price + fee)}</dd>` : `<dt>Saldo po rezerwacji</dt><dd>${(store.balances[m.id] ?? 0) - 1} sesji</dd>`}
      </dl>
      <button class="btn btn--primary btn--block" type="submit">${isTrial ? `Zap\u0142a\u0107 ${money(price + fee)}` : "Zarezerwuj"}</button>
      <p class="guarantee">${icon("shield")} Gwarancja sesji pr\xF3bnej: zamiana mentora albo zwrot.</p>
      <button type="button" class="link small" data-expire>Mockup: symuluj wyga\u015Bni\u0119cie blokady</button>
    </aside>
  </form>`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const form = root.querySelector("[data-form=checkout]");
        let discount = 0;
        const total = () => Math.max(0, Math.round(price - discount + fee));
        const cd = root.querySelector("[data-countdown]");
        const tick = () => {
          if (!document.body.contains(cd)) {
            clearInterval(timer);
            return;
          }
          const left = Math.max(0, (d.holdExpires ?? 0) - Date.now());
          cd.textContent = `${String(Math.floor(left / 6e4)).padStart(2, "0")}:${String(Math.floor(left % 6e4 / 1e3)).padStart(2, "0")}`;
          if (left === 0) {
            clearInterval(timer);
            root.innerHTML = `<div class="narrow">${emptyState(
              "Blokada terminu wygas\u0142a",
              `Termin ${fmtDate(d.startsAt)}, ${fmtTime(d.startsAt)} m\xF3g\u0142 zosta\u0107 zaj\u0119ty. Wybierz go ponownie.`,
              `<a class="btn btn--primary" href="#/rezerwacja/${m.id}">Wr\xF3\u0107 do kalendarza</a>`
            )}</div>`;
          }
        };
        const timer = setInterval(tick, 1e3);
        tick();
        root.querySelector("[data-expire]").addEventListener("click", () => {
          d.holdExpires = Date.now();
          tick();
        });
        const methods = form.querySelectorAll("input[name=method]");
        methods.forEach((r) => r.addEventListener("change", () => {
          root.querySelector("[data-pay-embed]").hidden = r.value !== "card" || !r.checked;
        }));
        root.querySelector("[data-promo]")?.addEventListener("click", () => {
          const input = form.elements.namedItem("promo");
          const err = form.querySelector("[data-err=promo]");
          if (input.value.trim().toUpperCase() === "KOMPAS10") {
            discount = Math.round(price * 0.1);
            err.textContent = "";
            root.querySelector("[data-disc-l]").hidden = false;
            const dd = root.querySelector("[data-disc]");
            dd.hidden = false;
            dd.textContent = `\u2212${money(discount)}`;
            root.querySelector("[data-total]").textContent = money(total());
            form.querySelector("button[type=submit]").textContent = `Zap\u0142a\u0107 ${money(total())}`;
            toast("Kod zastosowany: \u221210%");
          } else err.textContent = "Ten kod jest nieprawid\u0142owy lub wygas\u0142.";
        });
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const method = form.elements.namedItem("method")?.value;
          const rules = { goal: isTrial ? [req("Opisz kr\xF3tko cel sesji."), len(20, 500)] : [len(0, 500)] };
          if (isTrial && method === "card") {
            rules.card = [(v) => /^\d{16}$/.test(v.replace(/\s/g, "")) ? null : "Podaj 16 cyfr numeru karty."];
            rules.exp = [(v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim()) ? null : "Format MM/RR."];
            rules.cvc = [(v) => /^\d{3,4}$/.test(v.trim()) ? null : "3 lub 4 cyfry."];
          }
          if (!validate(form, rules)) return;
          const btn = form.querySelector("button[type=submit]");
          btn.disabled = true;
          btn.innerHTML = '<span class="spinner"></span> Przetwarzamy p\u0142atno\u015B\u0107\u2026';
          const decline = form.elements.namedItem("simDecline")?.checked;
          setTimeout(() => {
            if (decline) {
              btn.disabled = false;
              btn.textContent = `Zap\u0142a\u0107 ${money(total())}`;
              toast("P\u0142atno\u015B\u0107 odrzucona: bank odm\xF3wi\u0142 autoryzacji. Spr\xF3buj inn\u0105 metod\u0105.", "err");
              return;
            }
            const id = `s${++store.bookingSeq}`;
            store.sessions.push({
              id,
              mentorId: m.id,
              student: "Ty",
              startsAt: d.startsAt,
              durationMin: d.durationMin,
              type: d.type,
              status: d.type === "trial" ? "requested" : "scheduled",
              goal: form.elements.namedItem("goal").value.trim() || "Sesja z planu"
            });
            if (!isTrial) store.balances[m.id] = (store.balances[m.id] ?? 1) - 1;
            store.draft = null;
            clearInterval(timer);
            go(`#/potwierdzenie/${id}`);
          }, 1100);
        });
      }
    };
  }
  function confirmation(ctx) {
    const s = sessionById(ctx.params.id);
    if (ctx.state === "loading") {
      return { html: `<div class="narrow card center stack">${'<span class="spinner spinner--l"></span>'}<h1 class="h2">Potwierdzamy p\u0142atno\u015B\u0107\u2026</h1><p class="muted">To zwykle trwa kilka sekund. Je\u015Bli potrwa d\u0142u\u017Cej, potwierdzimy rezerwacj\u0119 e-mailem.</p></div>` };
    }
    if (!s || ctx.state === "error") {
      return { html: `<div class="narrow">${errorState("Nie mamy jeszcze potwierdzenia p\u0142atno\u015Bci. Nie p\u0142a\u0107 ponownie \u2014 skontaktuj si\u0119 z pomoc\u0105, je\u015Bli status nie zmieni si\u0119 w ci\u0105gu 5 minut.")}</div>` };
    }
    const m = mentorById(s.mentorId);
    const html = `
  <div class="steps-bar"><span class="is-done">1 Termin</span><span class="is-done">2 P\u0142atno\u015B\u0107</span><span class="is-active">3 Gotowe</span></div>
  <div class="narrow stack-l">
    <div class="success-head">${icon("check")}<h1>Sesja zarezerwowana</h1>
      <p class="muted">${s.status === "requested" ? `${esc(m.name.split(" ")[0])} potwierdzi termin w ci\u0105gu 24 h. Je\u015Bli odrzuci \u2014 zwr\xF3cimy pieni\u0105dze automatycznie.` : "Mentor dosta\u0142 powiadomienie."}</p></div>
    <div class="card booking-card">
      <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${typeLabel(s)} \xB7 ${s.durationMin} min</span></div></div>
      <p class="big">${fmtDateLong(s.startsAt)} \xB7 ${fmtTime(s.startsAt)}</p>
      <div class="row wrap gap-s">
        <button class="btn btn--ghost btn--s" data-cal>Google Calendar</button><button class="btn btn--ghost btn--s" data-cal>Outlook</button><button class="btn btn--ghost btn--s" data-cal>Pobierz .ics</button>
      </div>
    </div>
    <div class="card"><h2 class="h3">Jak si\u0119 przygotowa\u0107</h2>
      <ul class="checklist"><li>Sprawd\u017A kamer\u0119 i mikrofon \u2014 test jest przed wej\u015Bciem do pokoju.</li><li>Przygotuj link do kodu lub dokumentu, kt\xF3ry chcesz om\xF3wi\u0107.</li><li>Zapisz 2\u20133 pytania, na kt\xF3re chcesz pozna\u0107 odpowied\u017A.</li></ul></div>
    <div class="row wrap gap-s"><a class="btn btn--primary" href="#/sesje/${s.id}">Szczeg\xF3\u0142y sesji</a><a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz do mentora</a></div>
  </div>`;
    return { html, bind: (r) => r.querySelectorAll("[data-cal]").forEach((b) => b.addEventListener("click", () => toast("Dodano do kalendarza"))) };
  }
  function sessions(ctx) {
    const tab = ctx.query.get("tab") === "minione" ? "past" : "upcoming";
    const all = ctx.state === "empty" ? [] : store.sessions;
    const upcoming = all.filter((s) => (s.status === "scheduled" || s.status === "requested") && new Date(s.startsAt).getTime() + s.durationMin * 6e4 > NOW.getTime()).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const past = all.filter((s) => !upcoming.includes(s)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    const next = upcoming[0];
    const list = tab === "upcoming" ? upcoming.slice(next ? 1 : 0) : past;
    const item = (s) => {
      const m = mentorById(s.mentorId);
      const toReview = s.status === "completed" && !s.reviewed;
      return `<a class="list-item" href="#/sesje/${s.id}">
      <div class="date-tile"><b>${new Date(s.startsAt).getDate()}</b><span>${fmtDate(s.startsAt).split(",")[0]}</span></div>
      <div class="grow"><strong>${esc(m.name)}</strong><br><span class="muted small">${fmtTime(s.startsAt)} \xB7 ${s.durationMin} min \xB7 ${typeLabel(s)}</span></div>
      ${toReview ? '<span class="badge badge--accent">Oce\u0144</span>' : `<span class="badge badge--${s.status}">${statusLabel[s.status]}</span>`}
    </a>`;
    };
    const html = `
  <div class="page-head"><h1>Moje sesje</h1><a class="btn btn--primary btn--s" href="#/mentorzy">Znajd\u017A mentora</a></div>
  ${states(ctx, {
      loading: () => `<div class="sk sk--hero"></div>${skeleton(3, "line")}`,
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 sesji."),
      empty: () => emptyState("Nie masz jeszcze sesji", "Zacznij od sesji pr\xF3bnej \u2014 30 minut, \u017Ceby pozna\u0107 mentora i ustali\u0107 cel.", '<a class="btn btn--primary" href="#/mentorzy">Znajd\u017A mentora</a>'),
      success: () => `
      ${Object.entries(store.balances).filter(([, n]) => n > 0).length ? `<div class="chips">${Object.entries(store.balances).filter(([, n]) => n > 0).map(([id, n]) => `<a class="chip" href="#/plany">${esc(mentorById(id).name)}: saldo ${n} ${n === 1 ? "sesja" : n < 5 ? "sesje" : "sesji"}</a>`).join("")}</div>` : ""}
      ${next && tab === "upcoming" ? `<section class="card next-session">
        <span class="eyebrow">Najbli\u017Csza sesja</span>
        <div class="row between wrap gap-s"><div class="row gap-s">${avatar(mentorById(next.mentorId).name, mentorById(next.mentorId).hue, 52)}
          <div><strong>${esc(mentorById(next.mentorId).name)}</strong><br><span class="muted small">${fmtDateLong(next.startsAt)} \xB7 ${fmtTime(next.startsAt)} \xB7 ${next.durationMin} min</span></div></div>
          ${canJoin(next) ? `<a class="btn btn--primary" href="#/sesje/${next.id}/pokoj">${icon("cam")} Do\u0142\u0105cz</a>` : `<span class="muted small">Do\u0142\u0105czenie mo\u017Cliwe 10 min przed startem (za ${Math.max(0, Math.round(hoursUntil(next.startsAt)))} h)</span>`}
        </div>
        <p class="small">${icon("target")} ${esc(next.goal)}</p>
        <div class="row gap-s"><a class="link small" href="#/sesje/${next.id}">Prze\u0142\xF3\u017C lub anuluj</a></div>
      </section>` : ""}
      <div class="tabs" role="tablist"><a role="tab" class="tab ${tab === "upcoming" ? "is-active" : ""}" href="#/sesje">Nadchodz\u0105ce (${upcoming.length})</a>
        <a role="tab" class="tab ${tab === "past" ? "is-active" : ""}" href="#/sesje?tab=minione">Minione (${past.length})</a></div>
      <div class="list">${list.length ? list.map(item).join("") : `<p class="muted center pad">${tab === "upcoming" ? "Brak kolejnych zaplanowanych sesji." : "Brak minionych sesji."}</p>`}</div>`
    })}`;
    return { html };
  }
  function sessionDetail(ctx) {
    const s = sessionById(ctx.params.id);
    if (ctx.state === "loading") return { html: skeleton(3) };
    if (!s || ctx.state === "error") return { html: `<div class="narrow">${errorState("Ta sesja nie istnieje albo nie masz do niej dost\u0119pu.")}</div>` };
    const m = mentorById(s.mentorId);
    const upcoming = s.status === "scheduled" || s.status === "requested";
    const started = hasStarted(s);
    const free = canCancelFree(s);
    const hoursAfter = -hoursUntil(s.startsAt) - s.durationMin / 60;
    const canReport = s.status === "completed" && hoursAfter <= 72;
    const html = `
  <a href="#/sesje" class="back">${icon("back")} Moje sesje</a>
  <div class="narrow stack-l">
    <section class="card stack">
      <div class="row between wrap gap-s"><span class="badge badge--${s.status}">${statusLabel[s.status]}</span><span class="muted small">${typeLabel(s)}</span></div>
      <div class="row gap-s">${avatar(m.name, m.hue, 56)}<div><h1 class="h2">${esc(m.name)}</h1><span class="muted">${fmtDateLong(s.startsAt)} \xB7 ${fmtTime(s.startsAt)} \xB7 ${s.durationMin} min</span></div></div>
      <p>${icon("target")} <strong>Cel:</strong> ${esc(s.goal)}</p>
      ${upcoming ? `
        <p class="notice ${free ? "" : "notice--warn"}">${free ? `Mo\u017Cesz bezp\u0142atnie prze\u0142o\u017Cy\u0107 lub anulowa\u0107 sesj\u0119 do ${FREE_CANCEL_HOURS} h przed startem.` : started ? "Sesja ju\u017C si\u0119 rozpocz\u0119\u0142a \u2014 prze\u0142o\u017Cenie i anulowanie nie s\u0105 mo\u017Cliwe." : `Do sesji zosta\u0142o mniej ni\u017C ${FREE_CANCEL_HOURS} h. Anulowanie teraz oznacza utrat\u0119 sesji.`}</p>
        <div class="row wrap gap-s">
          ${canJoin(s) ? `<a class="btn btn--primary" href="#/sesje/${s.id}/pokoj">${icon("cam")} Do\u0142\u0105cz</a>` : ""}
          <button class="btn btn--ghost" data-reschedule ${started || !free ? "disabled" : ""}>Prze\u0142\xF3\u017C</button>
          <button class="btn btn--danger-ghost" data-cancel ${started ? "disabled" : ""}>Anuluj sesj\u0119</button>
          <a class="btn btn--ghost" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>
        </div>` : ""}
      ${s.status === "completed" && !s.reviewed ? `<a class="btn btn--primary" href="#/sesje/${s.id}/ocena">Oce\u0144 sesj\u0119</a>` : ""}
    </section>
    ${s.note ? `<section class="card stack"><h2 class="h3">Notatka mentora</h2><p>${esc(s.note)}</p>
      ${s.actionItems?.length ? `<h3 class="h4">Zadania</h3><ul class="todo">${s.actionItems.map((a, i) => `<li><label class="check"><input type="checkbox" data-ai="${i}" ${a.done ? "checked" : ""}/> ${esc(a.text)}</label></li>`).join("")}</ul>` : ""}</section>` : s.status === "completed" ? `<section class="card">${emptyState("Brak notatki", "Mentor zwykle dodaje notatk\u0119 do 24 h po sesji.")}</section>` : ""}
    ${s.status === "completed" ? `<section class="card"><h2 class="h3">Co\u015B posz\u0142o nie tak?</h2>
      ${canReport ? `<p class="muted small">Mo\u017Cesz zg\u0142osi\u0107 problem do 72 h po sesji.</p><button class="btn btn--ghost" data-report>${icon("flag")} Zg\u0142o\u015B problem</button>` : '<p class="muted small">Termin zg\u0142oszenia problemu (72 h po sesji) min\u0105\u0142. W razie w\u0105tpliwo\u015Bci napisz do pomocy.</p>'}</section>` : ""}
  </div>`;
    return {
      html,
      bind(root) {
        root.querySelectorAll("[data-ai]").forEach((c) => c.addEventListener("change", () => {
          s.actionItems[Number(c.dataset.ai)].done = c.checked;
          toast(c.checked ? "Zadanie wykonane" : "Zadanie otwarte");
        }));
        root.querySelector("[data-cancel]")?.addEventListener("click", () => {
          openModal(
            `<h2 class="h3">Anulowa\u0107 sesj\u0119?</h2>
          <p>${free ? `Sesja wr\xF3ci do salda u ${esc(m.name.split(" ")[0])}${s.type === "trial" ? " \u2014 za sesj\u0119 pr\xF3bn\u0105 zwr\xF3cimy pieni\u0105dze" : ""}.` : `<strong>Do sesji zosta\u0142o mniej ni\u017C ${FREE_CANCEL_HOURS} h.</strong> Sesja przepadnie i nie wr\xF3ci do salda.`}</p>
          <div class="field"><label for="f-why">Pow\xF3d (opcjonalnie, widzi mentor)</label><select id="f-why"><option>Zmiana plan\xF3w</option><option>Choroba</option><option>Inny</option></select></div>
          <div class="row gap-s end"><button class="btn btn--ghost" data-close>Nie anuluj</button><button class="btn btn--danger" data-confirm>${free ? "Anuluj sesj\u0119" : "Anuluj mimo to"}</button></div>`,
            (mod) => mod.querySelector("[data-confirm]").addEventListener("click", () => {
              s.status = "cancelled";
              if (free && s.type === "plan") store.balances[m.id] = (store.balances[m.id] ?? 0) + 1;
              closeModal();
              toast(free ? "Sesja anulowana, wr\xF3ci\u0142a do salda" : "Sesja anulowana");
              ctx.rerender();
            })
          );
        });
        root.querySelector("[data-reschedule]")?.addEventListener("click", () => {
          const slots = [...weekSlots(m, 0), ...weekSlots(m, 1)].flatMap((d) => d.slots).filter((x) => !x.taken).slice(0, 12);
          openModal(
            `<h2 class="h3">Wybierz nowy termin</h2>
          ${slots.length ? `<div class="slot-list">${slots.map((x) => `<button class="slot" data-new="${x.iso}">${fmtDate(x.iso)} \xB7 ${fmtTime(x.iso)}</button>`).join("")}</div>` : emptyState("Brak wolnych termin\xF3w w 14 dni", "Napisz do mentora, \u017Ceby ustali\u0107 termin.", `<a class="btn btn--primary" href="#/wiadomosci/nowa?m=${m.id}">Napisz</a>`)}`,
            (mod) => mod.querySelectorAll("[data-new]").forEach((b) => b.addEventListener("click", () => {
              s.startsAt = b.dataset.new;
              closeModal();
              toast(`Prze\u0142o\u017Cono na ${fmtDate(s.startsAt)}, ${fmtTime(s.startsAt)}. Mentor zosta\u0142 powiadomiony.`);
              ctx.rerender();
            }))
          );
        });
        root.querySelector("[data-report]")?.addEventListener("click", () => {
          openModal(
            `<h2 class="h3">Zg\u0142o\u015B problem z sesj\u0105</h2>
          <form data-form="report" novalidate class="stack">
            <div class="field"><label for="f-reason">Pow\xF3d</label><select id="f-reason" name="reason"><option value="">Wybierz\u2026</option>
              <option>Mentor si\u0119 nie pojawi\u0142</option><option>Problemy techniczne</option><option>Sesja niezgodna z opisem</option><option>Niew\u0142a\u015Bciwe zachowanie</option></select>
              <div class="field__meta"><span class="field__err" data-err="reason"></span></div></div>
            ${field({ name: "desc", label: "Opisz, co si\u0119 sta\u0142o", textarea: true, counter: 1e3 })}
            <p class="muted small">Druga strona ma 48 h na odpowied\u017A. Decyzj\u0119 podejmie zesp\xF3\u0142 Kompasu.</p>
            <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary">Wy\u015Blij zg\u0142oszenie</button></div>
          </form>`,
            (mod) => {
              bindCounters(mod);
              const f = mod.querySelector("form");
              f.addEventListener("submit", (e) => {
                e.preventDefault();
                if (!validate(f, { reason: [req("Wybierz pow\xF3d.")], desc: [req(), len(30, 1e3)] })) return;
                s.status = "disputed";
                closeModal();
                toast("Zg\u0142oszenie wys\u0142ane. Odpowiemy w ci\u0105gu 2 dni roboczych.");
                ctx.rerender();
              });
            }
          );
        });
      }
    };
  }
  function room(ctx) {
    const s = sessionById(ctx.params.id);
    if (!s) return { html: errorState("Nie znaleziono sesji.") };
    const m = mentorById(s.mentorId);
    const phase = ctx.query.get("krok") === "pokoj" ? "room" : "check";
    if (ctx.state === "error") {
      return { html: `<div class="narrow card stack">${icon("alert")}<h1 class="h2">Brak dost\u0119pu do kamery i mikrofonu</h1>
      <p>Przegl\u0105darka zablokowa\u0142a dost\u0119p. Kliknij ikon\u0119 k\u0142\xF3dki obok adresu strony, zezw\xF3l na kamer\u0119 i mikrofon, a potem od\u015Bwie\u017C.</p>
      <div class="row gap-s"><a class="btn btn--primary" href="#/sesje/${s.id}/pokoj">Spr\xF3buj ponownie</a><a class="btn btn--ghost" href="#/sesje/${s.id}/pokoj?krok=pokoj">Wejd\u017A tylko z czatem</a></div></div>` };
    }
    if (ctx.state === "loading") return { html: `<div class="room room--loading"><span class="spinner spinner--l"></span><p>\u0141\u0105czenie z pokojem\u2026</p></div>` };
    if (phase === "check") {
      const html2 = `
    <a href="#/sesje/${s.id}" class="back">${icon("back")} Szczeg\xF3\u0142y sesji</a>
    <div class="layout-checkout">
      <section class="card stack">
        <h1 class="h2">Test sprz\u0119tu</h1>
        <div class="video-ph video-ph--self">${avatar("Ty", 12, 80)}<span>Podgl\u0105d kamery</span></div>
        <div class="stack-s">
          <div class="row between"><span>${icon("cam")} Kamera</span><span class="ok">${icon("check")} dzia\u0142a</span></div>
          <div class="row between"><span>${icon("mic")} Mikrofon</span><span class="meter"><span></span></span></div>
          <div class="row between"><span>Po\u0142\u0105czenie</span><span class="ok">${icon("check")} dobre (38 ms)</span></div>
        </div>
      </section>
      <aside class="card summary">
        <div class="row gap-s">${avatar(m.name, m.hue, 48)}<div><strong>${esc(m.name)}</strong><br><span class="muted small">${fmtTime(s.startsAt)} \xB7 ${s.durationMin} min</span></div></div>
        <p class="small">${icon("target")} ${esc(s.goal)}</p>
        ${canJoin(s) ? `<a class="btn btn--primary btn--block" href="#/sesje/${s.id}/pokoj?krok=pokoj">Do\u0142\u0105cz do sesji</a>` : `<button class="btn btn--primary btn--block" disabled>Pok\xF3j otworzy si\u0119 10 min przed startem</button>`}
      </section>
    </div>`;
      return { html: html2 };
    }
    const waiting = ctx.state === "empty";
    const html = `
  <div class="room">
    <div class="room__top"><strong>${esc(m.name)}</strong><span class="timer" data-timer>00:00 / ${s.durationMin}:00</span></div>
    <div class="room__stage">
      <div class="tile tile--main">${waiting ? `<div class="center stack-s"><span class="spinner"></span><p>${esc(m.name.split(" ")[0])} jeszcze nie do\u0142\u0105czy\u0142a</p>
        <button class="btn btn--light btn--s" data-noshow>Mentor si\u0119 nie pojawi\u0142</button><span class="small muted-inv">Przycisk aktywny po 10 min oczekiwania</span></div>` : `${avatar(m.name, m.hue, 120)}<span class="tile__name">${esc(m.name)}</span>`}</div>
      <div class="tile tile--self">${avatar("Ty", 12, 48)}<span class="tile__name">Ty</span></div>
    </div>
    <div class="room__controls">
      <button class="ctrl is-on" data-toggle aria-pressed="true" aria-label="Mikrofon">${icon("mic")}</button>
      <button class="ctrl is-on" data-toggle aria-pressed="true" aria-label="Kamera">${icon("cam")}</button>
      <button class="ctrl" data-toggle aria-pressed="false" aria-label="Udost\u0119pnij ekran">${icon("screen")}</button>
      <button class="ctrl" data-panel aria-label="Czat i notatki">${icon("chat")}</button>
      <button class="ctrl ctrl--end" data-end aria-label="Zako\u0144cz">Zako\u0144cz</button>
    </div>
    <aside class="room__panel" data-room-panel>
      <div class="tabs"><button class="tab is-active" data-rtab="chat">Czat</button><button class="tab" data-rtab="notes">Wsp\xF3lne notatki</button></div>
      <div data-rpane="chat" class="stack-s"><div class="bubble">Hej! Wrzu\u0107 link do repo, przejrzymy na ekranie.</div>
        <form class="row gap-s" data-form="rchat"><input name="msg" placeholder="Wiadomo\u015B\u0107\u2026" aria-label="Wiadomo\u015B\u0107"/><button class="btn btn--primary btn--s">Wy\u015Blij</button></form></div>
      <div data-rpane="notes" hidden><textarea rows="8" aria-label="Wsp\xF3lne notatki">- Rozdzieli\u0107 walidacj\u0119 od komponentu formularza
- </textarea><p class="muted small">Zapisuje si\u0119 automatycznie.</p></div>
    </aside>
  </div>`;
    return {
      html,
      bind(root) {
        let sec = 0;
        const t = root.querySelector("[data-timer]");
        const iv = setInterval(() => {
          if (!document.body.contains(t)) {
            clearInterval(iv);
            return;
          }
          sec++;
          t.textContent = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")} / ${s.durationMin}:00`;
        }, 1e3);
        root.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
          const on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", String(on));
          b.classList.toggle("is-on", on);
        }));
        root.querySelector("[data-panel]").addEventListener("click", () => root.querySelector("[data-room-panel]").classList.toggle("is-open"));
        root.querySelectorAll("[data-rtab]").forEach((b) => b.addEventListener("click", () => {
          root.querySelectorAll("[data-rtab]").forEach((x) => x.classList.toggle("is-active", x === b));
          root.querySelectorAll("[data-rpane]").forEach((p) => {
            p.hidden = p.dataset.rpane !== b.dataset.rtab;
          });
        }));
        root.querySelector("[data-form=rchat]").addEventListener("submit", (e) => {
          e.preventDefault();
          const f = e.target;
          const input = f.elements.namedItem("msg");
          if (!input.value.trim()) return;
          f.insertAdjacentHTML("beforebegin", `<div class="bubble bubble--me">${esc(input.value)}</div>`);
          input.value = "";
        });
        root.querySelector("[data-noshow]")?.addEventListener("click", () => {
          clearInterval(iv);
          s.status = "no_show";
          if (s.type === "plan") store.balances[m.id] = (store.balances[m.id] ?? 0) + 1;
          toast("Zg\u0142oszono nieobecno\u015B\u0107 mentora. Sesja wr\xF3ci\u0142a do salda.");
          go(`#/sesje/${s.id}`);
        });
        root.querySelector("[data-end]").addEventListener("click", () => {
          clearInterval(iv);
          s.status = "completed";
          go(`#/sesje/${s.id}/ocena`);
        });
      }
    };
  }
  function review(ctx) {
    const s = sessionById(ctx.params.id);
    if (!s) return { html: errorState("Nie znaleziono sesji.") };
    const m = mentorById(s.mentorId);
    const tags = ["konkretny/a", "dobrze przygotowany/a", "cierpliwy/a", "praktyczne przyk\u0142ady", "jasne zadania"];
    const html = `
  <div class="narrow stack-l">
    <div class="center stack-s">${avatar(m.name, m.hue, 72)}<h1 class="h2">Jak min\u0119\u0142a sesja z ${esc(m.name.split(" ")[0])}?</h1><span class="muted small">${fmtDateLong(s.startsAt)} \xB7 ${typeLabel(s)}</span></div>
    ${ctx.state === "error" ? '<p class="notice notice--err" role="alert">Nie uda\u0142o si\u0119 zapisa\u0107 oceny. Twoje odpowiedzi s\u0105 zachowane \u2014 spr\xF3buj ponownie.</p>' : ""}
    <form class="card stack" data-form="review" novalidate>
      <fieldset class="star-input"><legend>Ocena</legend>
        ${[5, 4, 3, 2, 1].map((r) => `<input type="radio" id="r${r}" name="rating" value="${r}"/><label for="r${r}" title="${r}">\u2605</label>`).join("")}
      </fieldset>
      <div class="field__err" data-err="rating"></div>
      <fieldset><legend class="small">Co wyr\xF3\u017Cnia\u0142o t\u0119 sesj\u0119? (opcjonalnie)</legend><div class="chips">${tags.map((t) => `<label class="chip chip--check"><input type="checkbox" name="tag" value="${t}"/> ${t}</label>`).join("")}</div></fieldset>
      ${field({ name: "public", label: "Opinia publiczna (widoczna na profilu)", textarea: true, rows: 3, counter: 1e3, placeholder: "Co pomog\u0142o Ci najbardziej?" })}
      ${field({ name: "private", label: "Uwaga tylko dla mentora (opcjonalnie)", textarea: true, rows: 2, counter: 500 })}
      ${s.type === "trial" ? `<fieldset class="choice"><legend>Co dalej?</legend>
        <label class="choice__opt"><input type="radio" name="next" value="continue" checked/><span><strong>Kontynuuj\u0119 z ${esc(m.name.split(" ")[0])}</strong><br><span class="muted small">Wybierzesz plan sesji tygodniowo.</span></span></label>
        <label class="choice__opt"><input type="radio" name="next" value="swap"/><span><strong>Chc\u0119 spr\xF3bowa\u0107 z innym mentorem</strong><br><span class="muted small">Kolejna sesja pr\xF3bna na nasz koszt.</span></span></label>
      </fieldset>` : ""}
      <button class="btn btn--primary btn--block">Wy\u015Blij ocen\u0119</button>
    </form>
  </div>`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const f = root.querySelector("[data-form=review]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const rating = Number(f.elements.namedItem("rating").value || 0);
          const ok = validate(f, {
            rating: [req("Wybierz ocen\u0119 od 1 do 5.")],
            public: [
              (v) => v.trim() && v.trim().length < 20 ? "Opinia publiczna: minimum 20 znak\xF3w lub zostaw puste." : null,
              (v, form) => rating > 0 && rating <= 2 && !v.trim() && !form.elements.namedItem("private").value.trim() ? "Przy ocenie 1\u20132 napisz, co posz\u0142o nie tak (publicznie lub tylko do mentora)." : null
            ]
          });
          if (!ok) return;
          s.reviewed = true;
          const next = f.elements.namedItem("next")?.value;
          toast("Dzi\u0119kujemy za ocen\u0119!");
          if (next === "continue") go(`#/plany?m=${m.id}`);
          else if (next === "swap") {
            toast("Nast\u0119pna sesja pr\xF3bna jest na nasz koszt");
            go("#/mentorzy");
          } else go("#/postepy");
        });
      }
    };
  }
  function plans(ctx) {
    const pickFor = ctx.query.get("m");
    const pm = pickFor ? mentorById(pickFor) : void 0;
    const sub = ctx.state === "empty" ? null : store.subscription;
    if (pm) {
      const html2 = `
    <a href="#/sesje" class="back">${icon("back")} Moje sesje</a>
    <div class="narrow stack-l">
      <div class="row gap-s">${avatar(pm.name, pm.hue, 56)}<div><h1 class="h2">Wybierz plan z ${esc(pm.name.split(" ")[0])}</h1><span class="muted small">Rozliczenie co 4 tygodnie \xB7 zmiana lub anulowanie w dowolnym momencie</span></div></div>
      <form class="card stack" data-form="plan">
        <div class="segmented segmented--inline" role="radiogroup" aria-label="D\u0142ugo\u015B\u0107 sesji">
          <label><input type="radio" name="dur" value="60" checked/> 60 min</label><label><input type="radio" name="dur" value="30"/> 30 min</label></div>
        <div class="plan-grid">${PLAN_OPTIONS.map((n, i) => `
          <label class="plan-opt"><input type="radio" name="per" value="${n}" ${i === 0 ? "checked" : ""}/>
            <span><strong>${n}\xD7</strong> w tygodniu<br><span class="muted small" data-price="${n}">${money(planPrice(pm.rate60, n, 60))} / 4 tyg.</span>${n === 2 ? '<span class="badge badge--accent">najcz\u0119\u015Bciej wybierany</span>' : ""}</span></label>`).join("")}</div>
        <p class="muted small">Op\u0142acone sesje trafiaj\u0105 do salda. Nie wykorzysta\u0142e\u015B sesji? Zostaj\u0105 w saldzie, a plan mo\u017Cesz zmniejszy\u0107 od kolejnego okresu.</p>
        <button class="btn btn--primary btn--block" data-plan-pay>Op\u0142a\u0107 plan</button>
      </form>
    </div>`;
      return {
        html: html2,
        bind(root) {
          const f = root.querySelector("[data-form=plan]");
          const upd = () => {
            const dur = Number(f.elements.namedItem("dur").value);
            const per = Number(f.elements.namedItem("per").value);
            f.querySelectorAll("[data-price]").forEach((el) => {
              el.textContent = `${money(planPrice(pm.rate60, Number(el.dataset.price), dur))} / 4 tyg.`;
            });
            f.querySelector("[data-plan-pay]").textContent = `Op\u0142a\u0107 plan \xB7 ${money(planPrice(pm.rate60, per, dur))}`;
          };
          f.addEventListener("change", upd);
          upd();
          f.addEventListener("submit", (e) => {
            e.preventDefault();
            const dur = Number(f.elements.namedItem("dur").value);
            const per = Number(f.elements.namedItem("per").value);
            const btn = f.querySelector("[data-plan-pay]");
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Przetwarzamy\u2026';
            setTimeout(() => {
              store.subscription = { mentorId: pm.id, perWeek: per, durationMin: dur, renewsOn: "2026-11-17", status: "active" };
              store.balances[pm.id] = (store.balances[pm.id] ?? 0) + per * 4;
              toast(`Plan aktywny. Dodano ${per * 4} sesji do salda.`);
              go(`#/rezerwacja/${pm.id}`);
            }, 900);
          });
        }
      };
    }
    const sm = sub ? mentorById(sub.mentorId) : null;
    const html = `
  <div class="page-head"><h1>Plany i saldo</h1></div>
  ${ctx.state === "error" ? `<p class="notice notice--err" role="alert">${icon("alert")} Nie uda\u0142o si\u0119 odnowi\u0107 planu \u2014 karta wygas\u0142a. Zaktualizuj metod\u0119 p\u0142atno\u015Bci do 27 pa\u017Adziernika, inaczej plan zostanie wstrzymany. Twoje saldo pozostaje. <a class="link" href="#/konto">Zaktualizuj</a></p>` : ""}
  ${ctx.state === "loading" ? skeleton(3) : `
  ${sub && sm ? `<section class="card stack">
    <div class="row between wrap gap-s"><div class="row gap-s">${avatar(sm.name, sm.hue, 48)}<div><strong>${esc(sm.name)}</strong><br>
      <span class="muted small">${sub.perWeek}\xD7 ${sub.durationMin} min tygodniowo \xB7 ${money(planPrice(sm.rate60, sub.perWeek, sub.durationMin))} / 4 tyg.</span></div></div>
      <span class="badge badge--${sub.status === "active" ? "scheduled" : "cancelled"}">${sub.status === "active" ? "Aktywny" : "Wstrzymany"}</span></div>
    <p class="small">${sub.status === "active" ? `Nast\u0119pne odnowienie: <strong>${fmtDateLong(sub.renewsOn)}</strong>` : "Plan wstrzymany \u2014 nie pobieramy op\u0142at, saldo zostaje."}</p>
    <div class="row wrap gap-s"><a class="btn btn--ghost btn--s" href="#/plany?m=${sm.id}">Zmie\u0144 plan</a>
      <button class="btn btn--ghost btn--s" data-pause>${sub.status === "active" ? "Wstrzymaj" : "Wzn\xF3w"}</button>
      <button class="btn btn--danger-ghost btn--s" data-cancel-sub>Anuluj plan</button></div>
  </section>` : emptyState("Nie masz aktywnego planu", "Plan dobierzesz po sesji pr\xF3bnej z wybranym mentorem.", '<a class="btn btn--primary" href="#/mentorzy">Znajd\u017A mentora</a>')}
  <section class="card"><h2 class="h3">Saldo sesji</h2>
    <table class="table"><thead><tr><th>Mentor</th><th>Sesje</th><th></th></tr></thead><tbody>
    ${Object.entries(store.balances).map(([id, n]) => `<tr><td>${esc(mentorById(id).name)}</td><td>${n}</td>
      <td class="right">${n > 0 ? `<button class="link small" data-transfer="${id}">Przenie\u015B do innego mentora</button>` : ""}</td></tr>`).join("")}
    </tbody></table></section>
  <section class="card"><h2 class="h3">Historia p\u0142atno\u015Bci</h2>
    <table class="table"><thead><tr><th>Data</th><th>Opis</th><th class="right">Kwota</th><th></th></tr></thead><tbody>
      <tr><td>6 pa\u017A</td><td>Plan 1\xD760 min \xB7 Kasia Nowicka</td><td class="right">${money(720)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
      <tr><td>9 pa\u017A</td><td>Sesja pr\xF3bna \xB7 Kasia Nowicka</td><td class="right">${money(52)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
      <tr><td>18 pa\u017A</td><td>Sesja pr\xF3bna \xB7 Ewa Sadowska</td><td class="right">${money(52)}</td><td class="right"><button class="link small" data-inv>Faktura</button></td></tr>
    </tbody></table></section>`}`;
    return {
      html,
      bind(root) {
        root.querySelectorAll("[data-inv]").forEach((b) => b.addEventListener("click", () => toast("Pobieranie faktury PDF\u2026")));
        root.querySelector("[data-pause]")?.addEventListener("click", () => {
          store.subscription.status = store.subscription.status === "active" ? "paused" : "active";
          toast(store.subscription.status === "paused" ? "Plan wstrzymany" : "Plan wznowiony");
          ctx.rerender();
        });
        root.querySelector("[data-cancel-sub]")?.addEventListener("click", () => openModal(
          `<h2 class="h3">Anulowa\u0107 plan?</h2>
        <p>Plan nie odnowi si\u0119 ${fmtDateLong(store.subscription.renewsOn)}. Sesje w saldzie (${store.balances[store.subscription.mentorId]}) mo\u017Cesz wykorzysta\u0107 do ko\u0144ca okresu.</p>
        <div class="row gap-s end"><button class="btn btn--ghost" data-close>Zostaw plan</button><button class="btn btn--danger" data-ok>Anuluj plan</button></div>`,
          (mod) => mod.querySelector("[data-ok]").addEventListener("click", () => {
            store.subscription = null;
            closeModal();
            toast("Plan anulowany");
            ctx.rerender();
          })
        ));
        root.querySelectorAll("[data-transfer]").forEach((b) => b.addEventListener("click", () => {
          const from = mentorById(b.dataset.transfer);
          const n = store.balances[from.id];
          const others = MENTORS.filter((x) => x.id !== from.id && x.acceptingNew);
          openModal(
            `<h2 class="h3">Przenie\u015B saldo</h2><p class="small muted">Warto\u015B\u0107 sesji przeliczamy wed\u0142ug stawki nowego mentora.</p>
          <div class="field"><label for="f-to">Do mentora</label><select id="f-to">${others.map((o) => `<option value="${o.id}">${esc(o.name)} \xB7 ${money(o.rate60)}/h</option>`).join("")}</select></div>
          <p class="notice" data-calc></p>
          <div class="row gap-s end"><button class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary" data-ok>Przenie\u015B</button></div>`,
            (mod) => {
              const sel = mod.querySelector("#f-to");
              const calc = () => {
                const to = mentorById(sel.value);
                mod.querySelector("[data-calc]").textContent = `${n} ${n === 1 ? "sesja" : "sesje"} u ${from.name} (${money(from.rate60)}/h) \u2192 ${transferSessions(n, from.rate60, to.rate60)} u ${to.name} (${money(to.rate60)}/h)`;
              };
              sel.addEventListener("change", calc);
              calc();
              mod.querySelector("[data-ok]").addEventListener("click", () => {
                const to = mentorById(sel.value);
                store.balances[to.id] = (store.balances[to.id] ?? 0) + transferSessions(n, from.rate60, to.rate60);
                store.balances[from.id] = 0;
                closeModal();
                toast("Saldo przeniesione");
                ctx.rerender();
              });
            }
          );
        }));
      }
    };
  }
  function progress(ctx) {
    const g = ctx.state === "empty" ? null : store.goal;
    const done = store.sessions.filter((s) => s.note);
    const items = done.flatMap((s) => (s.actionItems ?? []).map((a, i) => ({ s, a, i })));
    const html = `
  <div class="page-head"><h1>Post\u0119py</h1></div>
  ${states(ctx, {
      loading: () => skeleton(3),
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 post\u0119p\xF3w."),
      empty: () => `<section class="card stack">${emptyState("Ustal sw\xF3j cel", "Cel pomaga mentorowi zaplanowa\u0107 sesje. Zwykle ustalacie go razem na sesji pr\xF3bnej.")}
      <form data-form="goal" class="stack" novalidate>${field({ name: "goal", label: "M\xF3j cel", placeholder: "np. Pierwsza praca jako frontend developer" })}
      ${field({ name: "target", label: "Termin", type: "date" })}<button class="btn btn--primary">Zapisz cel</button></form></section>`,
      success: () => {
        const pct = Math.round(g.milestones.filter((x) => x.done).length / g.milestones.length * 100);
        return `
      <section class="card goal">
        <span class="eyebrow">${icon("target")} M\xF3j cel</span>
        <h2>${esc(g.text)}</h2>
        <p class="muted small">Termin: ${fmtDateLong(g.target)}</p>
        <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
        <ul class="todo">${g.milestones.map((x, i) => `<li><label class="check"><input type="checkbox" data-ms="${i}" ${x.done ? "checked" : ""}/> ${esc(x.text)}</label></li>`).join("")}</ul>
      </section>
      <div class="grid-2">
        <section class="card"><h2 class="h3">Zadania od mentor\xF3w</h2>
          ${items.length ? `<ul class="todo">${items.map(({ s, a, i }) => `<li><label class="check"><input type="checkbox" data-s="${s.id}" data-i="${i}" ${a.done ? "checked" : ""}/> ${esc(a.text)}</label><span class="muted small"> \xB7 ${fmtDate(s.startsAt)}</span></li>`).join("")}</ul>` : '<p class="muted">Brak zada\u0144.</p>'}</section>
        <section class="card"><h2 class="h3">Notatki z sesji</h2>
          <ol class="timeline">${done.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((s) => `<li><a href="#/sesje/${s.id}"><strong>${fmtDate(s.startsAt)}</strong> \xB7 ${esc(mentorById(s.mentorId).name)}</a><p class="small">${esc(s.note)}</p></li>`).join("")}</ol></section>
      </div>`;
      }
    })}`;
    return {
      html,
      bind(root) {
        root.querySelectorAll("[data-ms]").forEach((c) => c.addEventListener("change", () => {
          store.goal.milestones[Number(c.dataset.ms)].done = c.checked;
          ctx.rerender();
        }));
        root.querySelectorAll("[data-s]").forEach((c) => c.addEventListener("change", () => {
          sessionById(c.dataset.s).actionItems[Number(c.dataset.i)].done = c.checked;
        }));
        const f = root.querySelector("[data-form=goal]");
        f?.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!validate(f, {
            goal: [req(), len(10, 200)],
            target: [req("Podaj termin."), (v) => new Date(v) > NOW ? null : "Termin musi by\u0107 w przysz\u0142o\u015Bci."]
          })) return;
          toast("Cel zapisany");
        });
      }
    };
  }

  // src/screens/mentor.ts
  var HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
  var STEPS = ["O mnie", "Kompetencje", "Opis i wideo", "Stawka", "Dost\u0119pno\u015B\u0107", "Weryfikacja"];
  function onboarding(ctx) {
    const ob = store.onboarding;
    const step = Math.min(6, Math.max(1, Number(ctx.params.step) || 1));
    const d = ob.data;
    if (ob.status === "submitted" || ctx.params.step === "wyslano") {
      return {
        html: `<div class="narrow stack-l"><div class="success-head">${icon("check")}<h1>Profil wys\u0142any do weryfikacji</h1>
      <p class="muted">Zwykle sprawdzamy zg\u0142oszenia w ci\u0105gu 2 dni roboczych. Damy zna\u0107 e-mailem \u2014 je\u015Bli czego\u015B zabraknie, wska\u017Cemy konkretne pola.</p></div>
      <div class="card"><h2 class="h3">Status</h2><ol class="status-steps"><li class="is-done">Szkic</li><li class="is-active">Weryfikacja</li><li>Profil publiczny</li></ol></div>
      <p class="muted small">Mockup: zatwierd\u017A zg\u0142oszenie jako admin (prze\u0142\u0105cz rol\u0119) albo <a class="link" href="#/mentor" data-skip>przejd\u017A do panelu mentora</a>.</p></div>`,
        bind: (r) => r.querySelector("[data-skip]")?.addEventListener("click", () => {
          store.role = "mentor";
        })
      };
    }
    const body = {
      1: `<div class="row gap-m"><div class="photo-up">${d.name ? avatar(d.name, 168, 88) : `<span class="photo-up__ph">${icon("user")}</span>`}
          <button type="button" class="btn btn--ghost btn--s" data-photo>Dodaj zdj\u0119cie</button><span class="field__err" data-err="photo"></span></div>
        <div class="grow stack">${field({ name: "name", label: "Imi\u0119 i nazwisko", value: d.name })}
        ${field({ name: "country", label: "Kraj", value: d.country ?? "Polska" })}</div></div>
        <fieldset><legend class="small">J\u0119zyki sesji</legend><div class="chips">${["polski", "angielski", "niemiecki", "ukrai\u0144ski"].map((l) => `<label class="chip chip--check"><input type="checkbox" name="lang" value="${l}" ${(d.lang ?? "polski").split(",").includes(l) ? "checked" : ""}/> ${l}</label>`).join("")}</div>
          <div class="field__err" data-err="lang"></div></fieldset>
        <p class="muted small">Zdj\u0119cie: JPG/PNG, min. 400\xD7400 px, do 5 MB, wyra\u017Anie widoczna twarz.</p>`,
      2: `<fieldset><legend class="small">Kategorie (1\u20135)</legend><div class="chips">${CATEGORIES.map((c) => `<label class="chip chip--check"><input type="checkbox" name="cat" value="${c}" ${(d.cat ?? "").split(",").includes(c) ? "checked" : ""}/> ${c}</label>`).join("")}</div>
          <div class="field__err" data-err="cat"></div></fieldset>
        ${field({ name: "tags", label: "Umiej\u0119tno\u015Bci (3\u201315, oddziel przecinkami)", value: d.tags, placeholder: "np. React, TypeScript, Code review" })}
        <div class="row gap-s">${field({ name: "years", label: "Lata do\u015Bwiadczenia", type: "number", value: d.years, attrs: 'min="1" max="50"' })}
        ${field({ name: "companies", label: "Firmy (opcjonalnie)", value: d.companies })}</div>`,
      3: `${field({ name: "headline", label: "Nag\u0142\xF3wek profilu", value: d.headline, placeholder: "np. Senior Frontend Engineer \xB7 React i architektura UI", counter: 80 })}
        ${field({ name: "bio", label: "Opis: z czym pomagasz i jak pracujesz", textarea: true, rows: 7, counter: 2e3, value: d.bio })}
        <div class="stack-s"><span class="label">Wideo powitalne</span>
          <div class="upload" data-video>${icon("play")}<span>${d.video ? `Dodano: ${esc(d.video)}` : "Przeci\u0105gnij plik MP4/MOV (30 s \u2013 3 min, do 200 MB)"}</span><button type="button" class="btn btn--ghost btn--s" data-video-btn>Wybierz plik</button></div>
          ${field({ name: "videoUrl", label: "albo link YouTube / Vimeo", value: d.videoUrl, placeholder: "https://youtu.be/\u2026" })}</div>`,
      4: `${field({ name: "rate", label: "Stawka za 60 min (z\u0142)", type: "number", value: d.rate ?? "180", attrs: 'min="40" max="1000" step="5"' })}
        <div class="earn-preview" data-earn></div>
        <p class="muted small">Sesja 30 min kosztuje po\u0142ow\u0119 stawki. Prowizja maleje z liczb\u0105 przepracowanych godzin: 33% \u2192 28% \u2192 20% \u2192 18%. Sesja pr\xF3bna w ca\u0142o\u015Bci jest prowizj\u0105 platformy.</p>`,
      5: `<p class="small">Zaznacz godziny, w kt\xF3rych uczniowie mog\u0105 rezerwowa\u0107 sesje (Twoja strefa: Europe/Warsaw). Minimum 3 h tygodniowo.</p>
        ${availabilityEditor(ob.availability)}<div class="field__err" data-err="avail"></div>`,
      6: `<div class="verify-list">
          <div class="verify-item"><span>${icon("user")} Profil LinkedIn</span>${field({ name: "linkedin", label: "Link do profilu", value: d.linkedin, placeholder: "https://linkedin.com/in/\u2026" })}</div>
          <div class="verify-item"><span>${icon("shield")} Weryfikacja to\u017Csamo\u015Bci</span><button type="button" class="btn btn--ghost btn--s" data-kyc>${d.kyc ? `${icon("check")} Zweryfikowano` : "Rozpocznij (u operatora, ok. 3 min)"}</button><span class="field__err" data-err="kyc"></span></div>
          <div class="verify-item"><span>${icon("wallet")} Dane do wyp\u0142at</span>${field({ name: "iban", label: "Numer konta (IBAN)", value: d.iban, placeholder: "PL00 0000 0000 0000 0000 0000 0000" })}</div>
        </div>
        <label class="check"><input type="checkbox" name="terms" ${d.terms ? "checked" : ""}/> Akceptuj\u0119 regulamin dla mentor\xF3w (m.in. zakaz rozlicze\u0144 poza platform\u0105)</label><div class="field__err" data-err="terms"></div>`
    };
    const html = `
  <div class="narrow stack-l">
    <div><span class="eyebrow">Zosta\u0144 mentorem \xB7 krok ${step} z 6</span><h1 class="h2">${STEPS[step - 1]}</h1>
      <div class="progress"><span style="width:${step / 6 * 100}%"></span></div>
      <ol class="stepper">${STEPS.map((s, i) => `<li class="${i + 1 < step ? "is-done" : i + 1 === step ? "is-active" : ""}">${i + 1 < step ? `<a href="#/mentor/onboarding/${i + 1}">${s}</a>` : s}</li>`).join("")}</ol></div>
    ${ctx.state === "error" ? '<p class="notice notice--err" role="alert">Nie uda\u0142o si\u0119 zapisa\u0107 kroku. Twoje dane s\u0105 w formularzu \u2014 spr\xF3buj ponownie.</p>' : ""}
    <form class="card stack" data-form="ob" novalidate>
      ${ctx.state === "loading" ? skeleton(3, "line") : body[step]}
      <div class="row between">
        ${step > 1 ? `<a class="btn btn--ghost" href="#/mentor/onboarding/${step - 1}">Wstecz</a>` : "<span></span>"}
        <div class="row gap-s">${step === 3 ? '<button type="button" class="btn btn--ghost" data-preview>Podgl\u0105d profilu</button>' : ""}
        <button class="btn btn--primary">${step === 6 ? "Wy\u015Blij do weryfikacji" : "Zapisz i dalej"}</button></div>
      </div>
    </form>
    <p class="muted small center">Szkic zapisuje si\u0119 po ka\u017Cdym kroku \u2014 mo\u017Cesz wr\xF3ci\u0107 p\xF3\u017Aniej.</p>
  </div>`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const f = root.querySelector("[data-form=ob]");
        const vals = (name) => [...f.querySelectorAll(`input[name=${name}]:checked`)].map((x) => x.value);
        root.querySelector("[data-photo]")?.addEventListener("click", () => {
          d.photo = "zdjecie.jpg";
          toast("Dodano zdj\u0119cie (400\xD7400)");
        });
        root.querySelector("[data-video-btn]")?.addEventListener("click", () => {
          d.video = "powitanie.mp4 \xB7 1:42";
          ctx.rerender();
        });
        root.querySelector("[data-kyc]")?.addEventListener("click", () => {
          d.kyc = "1";
          toast("To\u017Csamo\u015B\u0107 zweryfikowana przez operatora");
          ctx.rerender();
        });
        root.querySelector("[data-preview]")?.addEventListener("click", () => openModal(`<h2 class="h3">Podgl\u0105d karty w wynikach</h2>
        <div class="card"><div class="row gap-s">${avatar(d.name || "Nowy Mentor", 168, 56)}<div><strong>${esc(d.name || "Twoje imi\u0119")}</strong><br><span class="small">${esc(f.elements.namedItem("headline").value || "Tw\xF3j nag\u0142\xF3wek")}</span></div></div>
        <p class="small muted">${esc((f.elements.namedItem("bio").value || "Tw\xF3j opis\u2026").slice(0, 180))}</p></div>`));
        const earn = root.querySelector("[data-earn]");
        if (earn) {
          const rate = f.elements.namedItem("rate");
          const upd = () => {
            const r = Number(rate.value) || 0;
            earn.innerHTML = `<div><span class="muted small">Zarobisz za 60 min (na start, prowizja 33%)</span><strong>${money(Math.round(r * 0.67))}</strong></div>
            <div><span class="muted small">Po 200 h (prowizja 18%)</span><strong>${money(Math.round(r * 0.82))}</strong></div>`;
          };
          rate.addEventListener("input", upd);
          upd();
        }
        bindAvailabilityEditor(root, ob.availability);
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const rules = {
            1: { name: [req(), len(2, 60)], country: [req()], lang: [() => vals("lang").length ? null : "Wybierz co najmniej jeden j\u0119zyk."] },
            2: {
              cat: [() => {
                const n = vals("cat").length;
                return n >= 1 && n <= 5 ? null : "Wybierz od 1 do 5 kategorii.";
              }],
              tags: [(v) => {
                const n = v.split(",").map((x) => x.trim()).filter(Boolean).length;
                return n >= 3 && n <= 15 ? null : `Podaj 3\u201315 umiej\u0119tno\u015Bci (teraz: ${n}).`;
              }],
              years: [range(1, 50, " lat")]
            },
            3: {
              headline: [req(), len(20, 80)],
              bio: [req(), len(300, 2e3)],
              videoUrl: [
                (v) => !v.trim() || /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(v.trim()) ? null : "Link musi prowadzi\u0107 do YouTube lub Vimeo.",
                (v) => v.trim() || d.video ? null : "Dodaj wideo albo link \u2014 profile z wideo maj\u0105 wyra\u017Anie wi\u0119cej rezerwacji."
              ]
            },
            4: { rate: [req(), range(40, 1e3, " z\u0142")] },
            5: { avail: [() => ob.availability.size >= 3 ? null : `Zaznacz co najmniej 3 godziny (teraz: ${ob.availability.size}).`] },
            6: {
              linkedin: [req(), (v) => /linkedin\.com\/in\//.test(v) ? null : "Podaj link w formacie linkedin.com/in/\u2026"],
              kyc: [() => d.kyc ? null : "Zweryfikuj to\u017Csamo\u015B\u0107, zanim wy\u015Blesz profil."],
              iban: [req(), (v) => /^PL\d{26}$/.test(v.replace(/\s/g, "").toUpperCase()) ? null : "Polski IBAN: PL + 26 cyfr."],
              terms: [req("Akceptacja regulaminu jest wymagana.")]
            }
          };
          if (step === 1 && !d.photo) {
            f.querySelector("[data-err=photo]").textContent = "Dodaj zdj\u0119cie.";
          }
          if (!validate(f, rules[step]) || step === 1 && !d.photo) return;
          new FormData(f).forEach((v, k) => {
            if (!["lang", "cat"].includes(k)) d[k] = String(v);
          });
          if (step === 1) d.lang = vals("lang").join(",");
          if (step === 2) d.cat = vals("cat").join(",");
          if (step === 6) {
            ob.status = "submitted";
            store.applications.unshift({ id: "a-new", name: d.name, headline: d.headline ?? "", submitted: "2026-10-20", kyc: "zweryfikowano", linkedin: true, hue: 168, categories: (d.cat ?? "").split(",") });
            go("#/mentor/onboarding/wyslano");
          } else {
            toast("Zapisano szkic");
            go(`#/mentor/onboarding/${step + 1}`);
          }
        });
      }
    };
  }
  function availabilityEditor(set) {
    return `<div class="avail" role="grid" aria-label="Dost\u0119pno\u015B\u0107 tygodniowa">
    <div class="avail__row avail__head"><span></span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<span>${dayShort(d)}</span>`).join("")}</div>
    ${HOURS.map((h) => `<div class="avail__row"><span class="avail__h">${h}:00</span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<button type="button" class="avail__cell ${set.has(`${d}-${h}`) ? "is-on" : ""}" data-cell="${d}-${h}" aria-pressed="${set.has(`${d}-${h}`)}" aria-label="${dayShort(d)} ${h}:00"></button>`).join("")}</div>`).join("")}
  </div><p class="muted small" data-avail-sum>${set.size} h tygodniowo</p>`;
  }
  var painting = null;
  window.addEventListener("pointerup", () => {
    painting = null;
  });
  function bindAvailabilityEditor(root, set, onChange) {
    const apply = (b) => {
      const k = b.dataset.cell;
      if (painting) set.add(k);
      else set.delete(k);
      b.classList.toggle("is-on", !!painting);
      b.setAttribute("aria-pressed", String(!!painting));
      const sum = root.querySelector("[data-avail-sum]");
      if (sum) sum.textContent = `${set.size} h tygodniowo`;
      onChange?.();
    };
    root.querySelectorAll("[data-cell]").forEach((b) => {
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        painting = !set.has(b.dataset.cell);
        apply(b);
      });
      b.addEventListener("pointerenter", () => {
        if (painting !== null) apply(b);
      });
      b.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          painting = !set.has(b.dataset.cell);
          apply(b);
          painting = null;
        }
      });
    });
  }
  function mentorDashboard(ctx) {
    const today = STUDENTS.filter((s) => s.nextSession?.startsWith("2026-10-20"));
    const reqs = ctx.state === "empty" ? [] : store.requests;
    const html = `
  <div class="page-head"><div><span class="eyebrow">Wtorek, 20 pa\u017Adziernika</span><h1>Dzie\u0144 dobry, Kasia</h1></div></div>
  ${ctx.state === "error" ? errorState("Nie uda\u0142o si\u0119 wczyta\u0107 panelu.") : ctx.state === "loading" ? `<div class="grid-4">${skeleton(4)}</div>${skeleton(2)}` : `
  <div class="kpis">
    <div class="kpi"><span>Godziny w tym tygodniu</span><strong>9</strong><em class="up">+2 vs poprz.</em></div>
    <div class="kpi"><span>Przych\xF3d (pa\u017A)</span><strong>${money(3240)}</strong><em class="up">+12%</em></div>
    <div class="kpi"><span>Pr\xF3bne \u2192 plan (90 dni)</span><strong>64%</strong><em>14 z 22</em></div>
    <div class="kpi"><span>Ocena</span><strong>4,9</strong><em>87 opinii</em></div>
  </div>
  <div class="grid-2">
    <section class="card"><div class="section-head"><h2 class="h3">Dzi\u015B</h2><a class="link small" href="#/mentor/kalendarz">Kalendarz</a></div>
      ${ctx.state === "empty" || !today.length ? emptyState("Brak sesji dzisiaj", "Dodaj wieczorne godziny dost\u0119pno\u015Bci \u2014 to najcz\u0119\u015Bciej wyszukiwana pora.", '<a class="btn btn--ghost" href="#/mentor/kalendarz">Edytuj dost\u0119pno\u015B\u0107</a>') : `<div class="list">${today.map((s) => `<div class="list-item"><div class="date-tile"><b>${fmtTime(s.nextSession)}</b></div>
            <div class="grow"><strong>${esc(s.name)}</strong><br><span class="muted small">${esc(s.goal)}</span></div>
            ${fmtTime(s.nextSession) === "14:05" ? '<button class="btn btn--primary btn--s" data-join>Do\u0142\u0105cz</button>' : '<span class="badge">Za 3 h</span>'}</div>`).join("")}</div>`}
    </section>
    <section class="card"><div class="section-head"><h2 class="h3">Pro\u015Bby o sesj\u0119 pr\xF3bn\u0105 ${reqs.length ? `<span class="count">${reqs.length}</span>` : ""}</h2></div>
      <p class="muted small">Odpowiedz w 24 h \u2014 potem zaakceptujemy automatycznie, je\u015Bli termin jest wolny.</p>
      ${reqs.length ? `<div class="stack">${reqs.map((r) => `<article class="request" data-req="${r.id}">
          <div class="row gap-s">${avatar(r.student, r.hue, 40)}<div><strong>${esc(r.student)}</strong><br><span class="muted small">${fmtDate(r.startsAt)}, ${fmtTime(r.startsAt)} \xB7 30 min</span></div></div>
          <p class="small">\u201E${esc(r.goal)}\u201D</p>
          <div class="row gap-s"><button class="btn btn--primary btn--s" data-accept="${r.id}">Akceptuj</button><button class="btn btn--ghost btn--s" data-decline="${r.id}">Odrzu\u0107</button></div>
        </article>`).join("")}</div>` : emptyState("Brak nowych pr\xF3\u015Bb", "Nowe pro\u015Bby o sesj\u0119 pr\xF3bn\u0105 pojawi\u0105 si\u0119 tutaj.")}
    </section>
  </div>
  <section class="card"><h2 class="h3">Do zrobienia</h2><ul class="todo">
    <li><a class="link" href="#/mentor/uczniowie/st1">Dodaj notatk\u0119 po sesji z Adrianem C. (18 pa\u017A)</a></li>
    <li><a class="link" href="#/wiadomosci">Odpowiedz na 1 wiadomo\u015B\u0107</a></li>
    <li><a class="link" href="#/mentor/kalendarz">Brak dost\u0119pno\u015Bci w weekend 31 pa\u017A \u2013 1 lis \u2014 uzupe\u0142nij lub oznacz urlop</a></li>
  </ul></section>`}`;
    return {
      html,
      bind(root) {
        root.querySelector("[data-join]")?.addEventListener("click", () => go("#/sesje/s1/pokoj"));
        root.querySelectorAll("[data-accept]").forEach((b) => b.addEventListener("click", () => {
          store.requests = store.requests.filter((r) => r.id !== b.dataset.accept);
          toast("Sesja pr\xF3bna potwierdzona. Ucze\u0144 dosta\u0142 powiadomienie.");
          ctx.rerender();
        }));
        root.querySelectorAll("[data-decline]").forEach((b) => b.addEventListener("click", () => {
          openModal(
            `<h2 class="h3">Odrzu\u0107 pro\u015Bb\u0119</h2><form class="stack" novalidate>
          <fieldset><legend class="small">Pow\xF3d (ucze\u0144 go zobaczy)</legend>
            ${["Termin mi nie pasuje", "Temat poza moimi kompetencjami", "Nie przyjmuj\u0119 nowych uczni\xF3w", "Inny"].map((r) => `<label class="check"><input type="radio" name="why" value="${r}"/> ${r}</label>`).join("")}
            <div class="field__err" data-err="why"></div></fieldset>
          ${field({ name: "other", label: "Wyja\u015Bnienie", textarea: true, rows: 2, counter: 300 })}
          <p class="muted small">Ucze\u0144 dostanie automatyczny zwrot i propozycj\u0119 3 podobnych mentor\xF3w.</p>
          <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--danger">Odrzu\u0107</button></div></form>`,
            (mod) => {
              bindCounters(mod);
              const f = mod.querySelector("form");
              f.addEventListener("submit", (e) => {
                e.preventDefault();
                if (!validate(f, {
                  why: [req("Wybierz pow\xF3d.")],
                  other: [(v, form) => form.elements.namedItem("why").value === "Inny" ? len(10, 300)(v, form) : null]
                })) return;
                store.requests = store.requests.filter((r) => r.id !== b.dataset.decline);
                closeModal();
                toast("Pro\u015Bba odrzucona, ucze\u0144 dostanie zwrot.");
                ctx.rerender();
              });
            }
          );
        }));
      }
    };
  }
  function mentorCalendar(ctx) {
    const set = store.mentorTemplate;
    const booked = { "1-17": "Julia M.", "1-14": "Adrian C.", "3-18": "Adrian C.", "2-9": "Pawe\u0142 R. (pr\xF3bna)", "4-10": "Iga T. (pr\xF3bna)" };
    const html = `
  <div class="page-head"><h1>Kalendarz i dost\u0119pno\u015B\u0107</h1><span class="muted small">Europe/Warsaw</span></div>
  ${ctx.state === "empty" ? `<p class="notice notice--warn">${icon("alert")} Nie masz ustawionej dost\u0119pno\u015Bci \u2014 uczniowie nie mog\u0105 ci\u0119 zarezerwowa\u0107.</p>` : ""}
  ${ctx.state === "error" ? `<p class="notice notice--err" role="alert">Synchronizacja z Google Calendar przesta\u0142a dzia\u0142a\u0107. <button class="link" data-resync>Po\u0142\u0105cz ponownie</button></p>` : ""}
  <div class="layout-side layout-side--right">
    <section class="card">
      <div class="row between wrap gap-s"><h2 class="h3">Tydzie\u0144 19\u201325 pa\u017A</h2>
        <div class="legend small"><span class="lg lg--free"></span>dost\u0119pne <span class="lg lg--booked"></span>sesja <span class="lg lg--off"></span>niedost\u0119pne</div></div>
      <p class="muted small">Kliknij lub przeci\u0105gnij po siatce, \u017Ceby zmieni\u0107 szablon tygodniowy.</p>
      ${ctx.state === "loading" ? skeleton(6, "line") : `<div class="avail avail--cal">
        <div class="avail__row avail__head"><span></span>${[0, 1, 2, 3, 4, 5, 6].map((d) => `<span>${dayShort(d)} ${19 + d}</span>`).join("")}</div>
        ${HOURS.map((h) => `<div class="avail__row"><span class="avail__h">${h}:00</span>${[0, 1, 2, 3, 4, 5, 6].map((d) => {
      const k = `${d}-${h}`;
      if (booked[k]) return `<span class="avail__cell is-booked" title="${esc(booked[k])}">${esc(booked[k].split(" ")[0])}</span>`;
      const on = ctx.state !== "empty" && set.has(k);
      return `<button type="button" class="avail__cell ${on ? "is-on" : ""}" data-cell="${k}" aria-pressed="${on}" aria-label="${dayShort(d)} ${h}:00"></button>`;
    }).join("")}</div>`).join("")}
      </div><p class="muted small" data-avail-sum>${set.size} h tygodniowo</p>`}
      <div class="row gap-s"><button class="btn btn--primary" data-save>Zapisz szablon</button><span class="muted small" data-dirty></span></div>
    </section>
    <aside class="stack">
      <section class="card stack"><h2 class="h3">Ustawienia rezerwacji</h2>
        <form class="stack" data-form="cal-settings" novalidate>
          ${field({ name: "notice", label: "Minimalne wyprzedzenie (h)", type: "number", value: "6", attrs: 'min="2" max="48"' })}
          ${field({ name: "buffer", label: "Przerwa mi\u0119dzy sesjami (min)", type: "number", value: "10", attrs: 'min="0" max="30"' })}
          <label class="check"><input type="checkbox" name="accepting" checked/> Przyjmuj\u0119 nowych uczni\xF3w</label>
          <button class="btn btn--ghost">Zapisz ustawienia</button>
        </form></section>
      <section class="card stack"><h2 class="h3">Wyj\u0105tki</h2>
        <ul class="todo"><li>31 pa\u017A \u2013 2 lis \xB7 urlop</li></ul>
        <button class="btn btn--ghost btn--s" data-exception>Dodaj wyj\u0105tek</button></section>
      <section class="card stack"><h2 class="h3">Google Calendar</h2>
        <p class="small">${ctx.state === "error" ? '<span class="err">Roz\u0142\u0105czono</span>' : `${icon("check")} Po\u0142\u0105czono \xB7 zaj\u0119te terminy z kalendarza s\u0105 automatycznie niedost\u0119pne`}</p></section>
    </aside>
  </div>`;
    return {
      html,
      bind(root) {
        bindAvailabilityEditor(root, set, () => {
          root.querySelector("[data-dirty]").textContent = "Niezapisane zmiany";
        });
        root.querySelector("[data-save]").addEventListener("click", () => {
          root.querySelector("[data-dirty]").textContent = "";
          toast("Szablon dost\u0119pno\u015Bci zapisany");
        });
        root.querySelector("[data-resync]")?.addEventListener("click", () => toast("Przekierowanie do Google\u2026"));
        const f = root.querySelector("[data-form=cal-settings]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          if (validate(f, { notice: [range(2, 48, " h")], buffer: [range(0, 30, " min")] })) toast("Ustawienia zapisane");
        });
        root.querySelector("[data-exception]").addEventListener("click", () => openModal(
          `<h2 class="h3">Dodaj wyj\u0105tek</h2>
        <form class="stack" novalidate>
          <div class="segmented"><label><input type="radio" name="type" value="off" checked/> Niedost\u0119pno\u015B\u0107</label><label><input type="radio" name="type" value="extra"/> Dodatkowe godziny</label></div>
          <div class="row gap-s">${field({ name: "from", label: "Od", type: "date" })}${field({ name: "to", label: "Do", type: "date" })}</div>
          <div class="row gap-s end"><button type="button" class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary">Dodaj</button></div></form>`,
          (mod) => {
            const mf = mod.querySelector("form");
            mf.addEventListener("submit", (e) => {
              e.preventDefault();
              if (!validate(mf, { from: [req("Podaj dat\u0119.")], to: [req("Podaj dat\u0119."), (v, form) => v >= form.elements.namedItem("from").value ? null : "Data ko\u0144ca nie mo\u017Ce by\u0107 wcze\u015Bniejsza."] })) return;
              closeModal();
              toast("Wyj\u0105tek dodany. 1 sesja w tym okresie wymaga prze\u0142o\u017Cenia \u2014 wys\u0142ali\u015Bmy uczniowi pro\u015Bb\u0119.");
            });
          }
        ));
      }
    };
  }
  function mentorStudents(ctx) {
    const filter = ctx.query.get("f") ?? "wszyscy";
    const list = ctx.state === "empty" ? [] : STUDENTS.filter((s) => filter === "wszyscy" || s.status === filter);
    const html = `
  <div class="page-head"><h1>Uczniowie</h1></div>
  <div class="chips">${["wszyscy", "aktywny", "pr\xF3bny", "nieaktywny"].map((f) => `<a class="chip ${f === filter ? "chip--on" : ""}" href="#/mentor/uczniowie?f=${encodeURIComponent(f)}">${f === "wszyscy" ? "Wszyscy" : f[0].toUpperCase() + f.slice(1)}</a>`).join("")}</div>
  ${states(ctx, {
      loading: () => skeleton(4, "line"),
      error: () => errorState(),
      empty: () => emptyState("Nie masz jeszcze uczni\xF3w", "Pierwsi uczniowie pojawi\u0105 si\u0119 po zaakceptowaniu sesji pr\xF3bnej."),
      success: () => `<div class="list">${list.map((s) => `<a class="list-item" href="#/mentor/uczniowie/${s.id}">${avatar(s.name, s.hue, 44)}
      <div class="grow"><strong>${esc(s.name)}</strong> <span class="badge badge--${s.status === "aktywny" ? "scheduled" : s.status === "pr\xF3bny" ? "requested" : "cancelled"}">${s.status}</span><br>
      <span class="muted small">${esc(s.goal)}</span></div>
      <div class="right small muted hide-s">${s.sessions} sesji<br>${s.nextSession ? `Nast\u0119pna: ${fmtDate(s.nextSession)}` : "\u2014"}</div></a>`).join("")}</div>`
    })}`;
    return { html };
  }
  function mentorStudent(ctx) {
    const s = STUDENTS.find((x) => x.id === ctx.params.id);
    if (!s || ctx.state === "error") return { html: errorState("Nie znaleziono ucznia.") };
    const past = s.id === "st1" ? store.sessions.filter((x) => x.mentorId === "m1" && x.status === "completed") : [];
    const html = `
  <a href="#/mentor/uczniowie" class="back">${icon("back")} Uczniowie</a>
  <div class="layout-side layout-side--right">
    <div class="stack-l">
      <section class="card row gap-m wrap">${avatar(s.name, s.hue, 64)}<div class="grow"><h1 class="h2">${esc(s.name)}</h1>
        <p>${icon("target")} ${esc(s.goal)}</p><p class="muted small">Plan: ${esc(s.plan)} \xB7 saldo: ${s.balance} \xB7 ${s.sessions} sesji</p></div>
        <a class="btn btn--ghost btn--s" href="#/wiadomosci/t1">Napisz</a></section>
      <section class="card stack"><h2 class="h3">Notatka po sesji \xB7 18 pa\u017A</h2>
        <form class="stack" data-form="note" novalidate>
          ${field({ name: "covered", label: "Co om\xF3wili\u015Bmy", textarea: true, rows: 3, counter: 3e3, placeholder: "np. Rozdzielenie logiki formularza od prezentacji\u2026" })}
          <div class="stack-s"><span class="label">Zadania dla ucznia</span><div data-items class="stack-s">
            <div class="row gap-s"><input name="item" placeholder="np. Dodaj testy do walidacji" aria-label="Zadanie"/><input name="due" type="date" class="w-date" aria-label="Termin"/></div></div>
            <button type="button" class="link small" data-add-item>+ Dodaj zadanie</button><span class="field__err" data-err="item"></span></div>
          ${field({ name: "next", label: "Na nast\u0119pn\u0105 sesj\u0119 (opcjonalnie)", textarea: true, rows: 2 })}
          <button class="btn btn--primary">Wy\u015Blij notatk\u0119 uczniowi</button>
        </form></section>
      <section class="card"><h2 class="h3">Historia</h2>
        ${past.length ? `<ol class="timeline">${past.map((p) => `<li><strong>${fmtDateLong(p.startsAt)}</strong> \xB7 ${esc(p.goal)}${p.note ? `<p class="small">${esc(p.note)}</p>` : '<p class="small err">Brak notatki</p>'}</li>`).join("")}</ol>` : '<p class="muted">Brak odbytych sesji.</p>'}</section>
    </div>
    <aside class="card stack"><h2 class="h3">Prywatne notatki</h2><p class="muted small">Widzisz tylko Ty.</p>
      <textarea rows="6" aria-label="Prywatne notatki">Mocny w CSS, s\u0142abszy w testach. Motywuje go konkretny termin.</textarea>
      <button class="btn btn--ghost btn--s" data-priv>Zapisz</button></aside>
  </div>`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        root.querySelector("[data-priv]").addEventListener("click", () => toast("Zapisano"));
        root.querySelector("[data-add-item]").addEventListener("click", () => root.querySelector("[data-items]").insertAdjacentHTML(
          "beforeend",
          '<div class="row gap-s"><input name="item" placeholder="Zadanie" aria-label="Zadanie"/><input name="due" type="date" class="w-date" aria-label="Termin"/></div>'
        ));
        const f = root.querySelector("[data-form=note]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const items = [...f.querySelectorAll("input[name=item]")].map((i) => i.value.trim()).filter(Boolean);
          const okCovered = validate(f, { covered: [req(), len(20, 3e3)] });
          const bad = items.find((i) => i.length < 3 || i.length > 200);
          f.querySelector("[data-err=item]").textContent = bad ? "Zadanie: 3\u2013200 znak\xF3w." : "";
          if (!okCovered || bad) return;
          toast(`Notatka wys\u0142ana${items.length ? ` z ${items.length} zadaniem/ami` : ""}`);
          f.reset();
        });
      }
    };
  }
  function earnings(ctx) {
    const hours = 176;
    const rate = commissionRate(hours);
    const nt = nextTier(hours);
    const avail = store.payoutDone ? 0 : EARNINGS.filter((e) => e.status === "dost\u0119pne").reduce((a, e) => a + e.gross - e.fee, 0);
    const pending = EARNINGS.filter((e) => e.status === "oczekuj\u0105ce").reduce((a, e) => a + e.gross - e.fee, 0);
    const list = ctx.state === "empty" ? [] : EARNINGS;
    const html = `
  <div class="page-head"><h1>Zarobki i wyp\u0142aty</h1><button class="btn btn--ghost btn--s" data-csv>Eksport CSV</button></div>
  ${ctx.state === "error" ? `<p class="notice notice--err" role="alert">${icon("alert")} Ostatnia wyp\u0142ata nie powiod\u0142a si\u0119: bank odrzuci\u0142 przelew (nieprawid\u0142owy IBAN). <a class="link" href="#/konto">Zaktualizuj dane do wyp\u0142at</a></p>` : ""}
  ${ctx.state === "loading" ? `<div class="grid-3">${skeleton(3)}</div>` : `
  <div class="grid-3">
    <div class="card kpi kpi--big"><span>Dost\u0119pne do wyp\u0142aty</span><strong>${money(avail)}</strong>
      <button class="btn btn--primary btn--s" data-payout ${avail < 100 ? "disabled" : ""}>Wyp\u0142a\u0107</button>${avail < 100 ? "<em>Minimum wyp\u0142aty: 100 z\u0142</em>" : ""}</div>
    <div class="card kpi kpi--big"><span>Oczekuj\u0105ce</span><strong>${money(pending)}</strong><em>Dost\u0119pne 48 h po sesji, je\u015Bli nie ma zg\u0142oszenia</em></div>
    <div class="card kpi kpi--big"><span>Twoja prowizja</span><strong>${Math.round(rate * 100)}%</strong>
      ${nt ? `<div class="progress"><span style="width:${hours / nt * 100}%"></span></div><em>${hours} h z ${nt} h do progu ${Math.round(commissionRate(nt) * 100)}%</em>` : "<em>Najni\u017Cszy pr\xF3g</em>"}</div>
  </div>`}
  <section class="card"><h2 class="h3">Historia</h2>
    ${list.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Data</th><th>Ucze\u0144</th><th>Typ</th><th class="right">Brutto</th><th class="right">Prowizja</th><th class="right">Netto</th><th>Status</th></tr></thead><tbody>
      ${list.map((e) => `<tr><td>${fmtDate(e.date)}</td><td>${esc(e.student)}</td><td>${esc(e.type)}</td><td class="right">${money(e.gross)}</td><td class="right">\u2212${money(e.fee)}</td>
        <td class="right"><strong>${money(e.gross - e.fee)}</strong></td><td><span class="badge badge--${e.status === "dost\u0119pne" ? "scheduled" : e.status === "oczekuj\u0105ce" ? "requested" : "completed"}">${store.payoutDone && e.status === "dost\u0119pne" ? "w drodze" : e.status}</span></td></tr>`).join("")}
    </tbody></table></div>` : emptyState("Brak zarobk\xF3w", "Twoje rozliczone sesje pojawi\u0105 si\u0119 tutaj.")}
  </section>`;
    return {
      html,
      bind(root) {
        root.querySelector("[data-csv]").addEventListener("click", () => toast("Pobieranie zarobki-2026-10.csv"));
        root.querySelector("[data-payout]")?.addEventListener("click", () => openModal(
          `<h2 class="h3">Wyp\u0142ata ${money(avail)}</h2>
        <p>Na konto PL61 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4420. \u015Arodki zwykle docieraj\u0105 w 1\u20132 dni robocze.</p><p class="muted small">Limit: 1 r\u0119czna wyp\u0142ata na dob\u0119.</p>
        <div class="row gap-s end"><button class="btn btn--ghost" data-close>Anuluj</button><button class="btn btn--primary" data-ok>Zle\u0107 wyp\u0142at\u0119</button></div>`,
          (mod) => mod.querySelector("[data-ok]").addEventListener("click", () => {
            store.payoutDone = true;
            closeModal();
            toast("Wyp\u0142ata zlecona");
            ctx.rerender();
          })
        ));
      }
    };
  }

  // src/screens/admin.ts
  function verification(ctx) {
    const list = ctx.state === "empty" ? [] : store.applications;
    const sel = list.find((a) => a.id === ctx.query.get("id")) ?? list[0];
    const kycBadge = (k) => `<span class="badge badge--${k === "zweryfikowano" ? "scheduled" : k === "oczekuje" ? "requested" : "cancelled"}">KYC: ${k}</span>`;
    const html = `
  <div class="page-head"><h1>Weryfikacja mentor\xF3w</h1><span class="muted small">SLA: 2 dni robocze</span></div>
  ${states(ctx, {
      loading: () => skeleton(3, "line"),
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 kolejki."),
      empty: () => emptyState("Kolejka pusta", "Wszystkie zg\u0142oszenia zosta\u0142y rozpatrzone."),
      success: () => `<div class="layout-side">
      <aside class="side side--static"><div class="list">${list.map((a) => `<a class="list-item ${a === sel ? "is-active" : ""}" href="#/admin/weryfikacja?id=${a.id}">${avatar(a.name, a.hue, 40)}
        <div class="grow"><strong>${esc(a.name)}</strong><br><span class="muted small">${fmtDate(a.submitted)}</span></div>${a.kyc !== "zweryfikowano" ? icon("alert") : ""}</a>`).join("")}</div></aside>
      <section class="card stack">
        <div class="row gap-m wrap">${avatar(sel.name, sel.hue, 72)}<div class="grow"><h2>${esc(sel.name)}</h2><p>${esc(sel.headline)}</p>
          <div class="row gap-s wrap">${kycBadge(sel.kyc)}<span class="badge">${sel.linkedin ? "LinkedIn podany" : "Brak LinkedIn"}</span>${sel.categories.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}</div></div></div>
        <div class="video-ph video-ph--s">${icon("play")}<span>Wideo powitalne</span></div>
        <fieldset class="stack-s"><legend class="h4">Checklista</legend>
          ${["Zdj\u0119cie przedstawia twarz, bez logo i tekstu", "Opis bez danych kontaktowych i link\xF3w do p\u0142atno\u015Bci", "Do\u015Bwiadczenie zgodne z LinkedIn", "Wideo: dobra jako\u015B\u0107 d\u017Awi\u0119ku, ten sam cz\u0142owiek co na zdj\u0119ciu", "Stawka w wide\u0142kach kategorii"].map((c) => `<label class="check"><input type="checkbox" data-chk/> ${c}</label>`).join("")}
        </fieldset>
        <form class="stack" data-form="decision" novalidate>
          <fieldset class="segmented"><legend class="small">Decyzja</legend>
            <label><input type="radio" name="decision" value="approve"/> Zatwierd\u017A</label><label><input type="radio" name="decision" value="changes"/> Popro\u015B o zmiany</label><label><input type="radio" name="decision" value="reject"/> Odrzu\u0107</label></fieldset>
          <div class="field__err" data-err="decision"></div>
          <div data-fields hidden><fieldset><legend class="small">Pola do poprawy</legend><div class="chips">${["Zdj\u0119cie", "Nag\u0142\xF3wek", "Opis", "Wideo", "Stawka", "Dokument"].map((p) => `<label class="chip chip--check"><input type="checkbox" name="fieldsToFix" value="${p}"/> ${p}</label>`).join("")}</div>
            <div class="field__err" data-err="fieldsToFix"></div></fieldset></div>
          ${field({ name: "comment", label: "Komentarz dla kandydata", textarea: true, rows: 3, counter: 1e3 })}
          <button class="btn btn--primary">Zapisz decyzj\u0119</button>
        </form>
        <p class="muted small">${icon("shield")} Ka\u017Cda decyzja trafia do dziennika audytu.</p>
      </section></div>`
    })}`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const f = root.querySelector("[data-form=decision]");
        if (!f || !sel) return;
        f.addEventListener("change", () => {
          root.querySelector("[data-fields]").hidden = f.elements.namedItem("decision").value !== "changes";
        });
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const dec = f.elements.namedItem("decision").value;
          const ok = validate(f, {
            decision: [
              req("Wybierz decyzj\u0119."),
              (v) => v === "approve" && sel.kyc !== "zweryfikowano" ? "Nie mo\u017Cna zatwierdzi\u0107 bez pozytywnej weryfikacji KYC." : null,
              (v) => v === "approve" && root.querySelectorAll("[data-chk]:not(:checked)").length ? "Odhacz ca\u0142\u0105 checklist\u0119 przed zatwierdzeniem." : null
            ],
            fieldsToFix: [() => dec === "changes" && !f.querySelectorAll("input[name=fieldsToFix]:checked").length ? "Wska\u017C co najmniej jedno pole." : null],
            comment: [(v) => dec !== "approve" ? req("Komentarz jest wymagany.")(v, f) ?? len(10, 1e3)(v, f) : null]
          });
          if (!ok) return;
          store.applications = store.applications.filter((a) => a.id !== sel.id);
          toast(dec === "approve" ? `${sel.name}: profil opublikowany` : dec === "changes" ? "Wys\u0142ano pro\u015Bb\u0119 o zmiany" : "Zg\u0142oszenie odrzucone");
          history.replaceState(null, "", "#/admin/weryfikacja");
          ctx.rerender();
        });
      }
    };
  }
  function disputes(ctx) {
    const list = ctx.state === "empty" ? [] : store.disputes;
    const sel = list.find((d) => d.id === ctx.query.get("id")) ?? list[0];
    const html = `
  <div class="page-head"><h1>Spory i zwroty</h1></div>
  ${states(ctx, {
      loading: () => skeleton(3, "line"),
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 spor\xF3w."),
      empty: () => emptyState("Brak otwartych spor\xF3w", "Nowe zg\u0142oszenia problem\xF3w pojawi\u0105 si\u0119 tutaj."),
      success: () => `<div class="layout-side">
      <aside class="side side--static"><div class="list">${list.map((d) => `<a class="list-item ${d === sel ? "is-active" : ""}" href="#/admin/spory?id=${d.id}">
        <div class="grow"><strong>${esc(d.reason)}</strong><br><span class="muted small">${esc(d.student)} \u2194 ${esc(d.mentor)} \xB7 ${fmtDate(d.opened)}</span></div></a>`).join("")}</div></aside>
      <section class="card stack">
        <div class="row between wrap"><h2>${esc(sel.reason)}</h2><span class="badge badge--requested">Otwarty</span></div>
        <p class="muted small">Sesja ${esc(sel.sessionId)} \xB7 warto\u015B\u0107 ${money(sel.amount)}</p>
        <h3 class="h4">O\u015B zdarze\u0144 pokoju</h3><ol class="timeline timeline--mono">${sel.events.map((e) => `<li>${esc(e)}</li>`).join("")}</ol>
        <div class="grid-2"><div class="quote"><span class="eyebrow">Ucze\u0144 \xB7 ${esc(sel.student)}</span><p>${esc(sel.studentSays)}</p></div>
          <div class="quote"><span class="eyebrow">Mentor \xB7 ${esc(sel.mentor)}</span><p>${esc(sel.mentorSays)}</p></div></div>
        <form class="stack" data-form="resolve" novalidate>
          <fieldset class="stack-s"><legend class="h4">Rozstrzygni\u0119cie</legend>
            ${[["balance", "Zwrot do salda ucznia"], ["card", "Zwrot na kart\u0119"], ["partial", "Zwrot cz\u0119\u015Bciowy"], ["none", "Bez zwrotu"]].map(([v, l]) => `<label class="check"><input type="radio" name="res" value="${v}"/> ${l}</label>`).join("")}
            <div class="field__err" data-err="res"></div></fieldset>
          <div data-partial hidden>${field({ name: "amount", label: `Kwota zwrotu (maks. ${sel.amount} z\u0142)`, type: "number" })}</div>
          ${field({ name: "why", label: "Uzasadnienie (otrzymaj\u0105 obie strony)", textarea: true, rows: 3, counter: 1e3 })}
          <button class="btn btn--primary">Rozstrzygnij sp\xF3r</button>
        </form>
      </section></div>`
    })}`;
    return {
      html,
      bind(root) {
        bindCounters(root);
        const f = root.querySelector("[data-form=resolve]");
        if (!f || !sel) return;
        f.addEventListener("change", () => {
          root.querySelector("[data-partial]").hidden = f.elements.namedItem("res").value !== "partial";
        });
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const res = f.elements.namedItem("res").value;
          if (!validate(f, {
            res: [req("Wybierz rozstrzygni\u0119cie.")],
            amount: [(v) => res === "partial" ? Number(v) > 0 && Number(v) <= sel.amount ? null : `Kwota od 1 do ${sel.amount} z\u0142.` : null],
            why: [req(), len(20, 1e3)]
          })) return;
          store.disputes = store.disputes.filter((x) => x.id !== sel.id);
          toast("Sp\xF3r rozstrzygni\u0119ty. Obie strony dosta\u0142y powiadomienie.");
          history.replaceState(null, "", "#/admin/spory");
          ctx.rerender();
        });
      }
    };
  }

  // src/screens/shared.ts
  function messages(ctx) {
    let threadId = ctx.params.id;
    if (threadId === "nowa") {
      const m = mentorById(ctx.query.get("m") ?? "");
      if (m) {
        let t2 = store.threads.find((x) => x.withName === m.name);
        if (!t2) {
          t2 = { id: `t-${m.id}`, withName: m.name, hue: m.hue, unread: 0, messages: [] };
          store.threads.unshift(t2);
        }
        if (!store.loggedIn) {
          store.returnTo = `#/wiadomosci/${t2.id}`;
          toast("Zaloguj si\u0119, aby napisa\u0107 do mentora");
          go("#/logowanie");
          return { html: "" };
        }
        history.replaceState(null, "", `#/wiadomosci/${t2.id}`);
        threadId = t2.id;
      }
    }
    const threads = ctx.state === "empty" ? [] : store.threads;
    const t = threads.find((x) => x.id === threadId);
    if (t) t.unread = 0;
    const listHtml = `<div class="list threads">${threads.map((x) => `<a class="list-item ${x === t ? "is-active" : ""}" href="#/wiadomosci/${x.id}">${avatar(x.withName, x.hue, 44)}
    <div class="grow min0"><div class="row between"><strong>${esc(x.withName)}</strong><span class="muted small">${x.messages.length ? fmtDate(x.messages[x.messages.length - 1].at) : ""}</span></div>
    <span class="muted small ellipsis">${esc(x.messages[x.messages.length - 1]?.text ?? "Nowa rozmowa")}</span></div>${x.unread ? `<span class="count">${x.unread}</span>` : ""}</a>`).join("")}</div>`;
    const upcoming = t ? store.sessions.find((s) => mentorById(s.mentorId)?.name === t.withName && s.status === "scheduled") : void 0;
    const threadHtml = t ? `
    <div class="thread">
      <div class="thread__head"><a href="#/wiadomosci" class="only-mobile back-ic" aria-label="Wr\xF3\u0107">${icon("back")}</a>${avatar(t.withName, t.hue, 36)}<strong>${esc(t.withName)}</strong></div>
      ${upcoming ? `<a class="context-card" href="#/sesje/${upcoming.id}">${icon("cal")} Najbli\u017Csza sesja: ${fmtDate(upcoming.startsAt)}, ${fmtTime(upcoming.startsAt)}</a>` : ""}
      <div class="thread__body" data-body>${t.messages.length ? t.messages.map((m) => `<div class="bubble ${m.me ? "bubble--me" : ""}">${esc(m.text)}<span class="bubble__t">${fmtTime(m.at)}</span></div>`).join("") : '<p class="muted center pad">Przedstaw si\u0119 i napisz, z czym przychodzisz. Mentorzy odpowiadaj\u0105 zwykle w ci\u0105gu kilku godzin.</p>'}</div>
      <p class="notice notice--warn small" data-warn hidden>${icon("shield")} Dla Twojego bezpiecze\u0144stwa rozliczaj si\u0119 tylko przez Kompas \u2014 poza platform\u0105 nie dzia\u0142a gwarancja ani zwroty.</p>
      <form class="composer" data-form="msg" novalidate>
        <textarea name="text" rows="1" placeholder="Napisz wiadomo\u015B\u0107\u2026" aria-label="Wiadomo\u015B\u0107"></textarea>
        <button class="btn btn--primary" aria-label="Wy\u015Blij">${icon("arrow")}</button>
      </form>
      <div class="field__err pad-x" data-err="text"></div>
    </div>` : `<div class="thread thread--empty only-desktop">${emptyState("Wybierz rozmow\u0119", "Wiadomo\u015Bci z mentorami i uczniami s\u0105 tutaj.")}</div>`;
    const html = `
  <div class="page-head ${t ? "hide-mobile" : ""}"><h1>Wiadomo\u015Bci</h1></div>
  ${states(ctx, {
      loading: () => skeleton(4, "line"),
      error: () => errorState("Nie uda\u0142o si\u0119 wczyta\u0107 wiadomo\u015Bci."),
      empty: () => emptyState("Brak wiadomo\u015Bci", "Napisz do mentora z jego profilu, \u017Ceby zapyta\u0107 o szczeg\xF3\u0142y przed rezerwacj\u0105.", '<a class="btn btn--primary" href="#/mentorzy">Przegl\u0105daj mentor\xF3w</a>'),
      success: () => `<div class="messages ${t ? "has-thread" : ""}">${listHtml}${threadHtml}</div>`
    })}`;
    return {
      html,
      bind(root) {
        const f = root.querySelector("[data-form=msg]");
        if (!f || !t) return;
        const ta = f.elements.namedItem("text");
        const body = root.querySelector("[data-body]");
        body.scrollTop = body.scrollHeight;
        ta.addEventListener("input", () => {
          root.querySelector("[data-warn]").hidden = !OFF_PLATFORM.test(ta.value);
        });
        ta.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            f.requestSubmit();
          }
        });
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!validate(f, { text: [req("Wiadomo\u015B\u0107 nie mo\u017Ce by\u0107 pusta."), len(1, 2e3)] })) return;
          const text = ta.value.trim();
          if (text.toLowerCase().includes("b\u0142\u0105d")) {
            body.insertAdjacentHTML("beforeend", `<div class="bubble bubble--me bubble--failed">${esc(text)}<button class="link small" data-resend>Nie wys\u0142ano \xB7 Pon\xF3w</button></div>`);
            body.querySelector("[data-resend]").addEventListener("click", () => {
              t.messages.push({ me: true, text, at: NOW.toISOString() });
              ctx.rerender();
            });
            ta.value = "";
            return;
          }
          t.messages.push({ me: true, text, at: NOW.toISOString() });
          ctx.rerender();
        });
      }
    };
  }
  function notifications(ctx) {
    const list = ctx.state === "empty" ? [] : store.notifications;
    const html = `
  <div class="page-head"><h1>Powiadomienia</h1>${list.some((n) => n.unread) ? '<button class="btn btn--ghost btn--s" data-read>Oznacz wszystkie jako przeczytane</button>' : ""}</div>
  ${states(ctx, {
      loading: () => skeleton(4, "line"),
      error: () => errorState(),
      empty: () => emptyState("Wszystko przeczytane", "Tutaj pojawi\u0105 si\u0119 przypomnienia o sesjach, wiadomo\u015Bci i zmiany w planie."),
      success: () => `<div class="list">${list.map((n) => `<a class="list-item ${n.unread ? "is-unread" : ""}" href="${n.link}">${icon("bell")}<div class="grow">${esc(n.text)}<br><span class="muted small">${fmtDate(n.at)}, ${fmtTime(n.at)}</span></div></a>`).join("")}</div>`
    })}`;
    return { html, bind: (r) => r.querySelector("[data-read]")?.addEventListener("click", () => {
      store.notifications.forEach((n) => {
        n.unread = false;
      });
      ctx.rerender();
    }) };
  }
  function account(ctx) {
    if (ctx.state === "loading") return { html: skeleton(3) };
    if (ctx.state === "error") return { html: errorState("Nie uda\u0142o si\u0119 wczyta\u0107 ustawie\u0144 konta.") };
    const html = `
  <div class="page-head"><h1>Konto i ustawienia</h1></div>
  <div class="narrow stack-l">
    <form class="card stack" data-form="profile" novalidate><h2 class="h3">Profil</h2>
      ${field({ name: "name", label: "Imi\u0119", value: "Adrian" })}
      ${field({ name: "email", label: "E-mail", value: "adrian@example.com", type: "email" })}
      <div class="row gap-s"><div class="field grow"><label for="f-tz">Strefa czasowa</label><select id="f-tz"><option>Europe/Warsaw</option><option>Europe/London</option></select></div>
      <div class="field grow"><label for="f-cur">Waluta</label><select id="f-cur"><option>PLN</option><option>EUR</option></select></div></div>
      <button class="btn btn--primary">Zapisz</button></form>
    <section class="card stack"><h2 class="h3">Metody p\u0142atno\u015Bci</h2>
      <div class="row between"><span>Visa \u2022\u2022\u2022\u2022 4242 \xB7 wa\u017Cna do 10/26</span><span class="badge badge--cancelled">wygasa</span></div>
      <button class="btn btn--ghost btn--s" data-card>Dodaj kart\u0119</button></section>
    <section class="card stack"><h2 class="h3">Powiadomienia</h2>
      <table class="table"><thead><tr><th></th><th>E-mail</th><th>Push</th></tr></thead><tbody>
        ${["Przypomnienia o sesjach", "Wiadomo\u015Bci", "Zmiany w rezerwacjach", "Wskaz\xF3wki i oferty"].map((n, i) => `<tr><td>${n}</td><td><input type="checkbox" ${i < 3 ? "checked" : ""} aria-label="${n} e-mail"/></td><td><input type="checkbox" ${i < 2 ? "checked" : ""} aria-label="${n} push"/></td></tr>`).join("")}
      </tbody></table></section>
    <section class="card stack"><h2 class="h3">Prywatno\u015B\u0107</h2>
      <div class="row wrap gap-s"><button class="btn btn--ghost btn--s" data-export>Pobierz moje dane</button><button class="btn btn--danger-ghost btn--s" data-del>Usu\u0144 konto</button></div></section>
  </div>`;
    return {
      html,
      bind(root) {
        const f = root.querySelector("[data-form=profile]");
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          if (validate(f, { name: [req(), len(2, 50)], email: [req(), (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Podaj poprawny adres e-mail."] })) toast("Zapisano");
        });
        root.querySelector("[data-card]").addEventListener("click", () => toast("Otwieramy bezpieczny formularz operatora p\u0142atno\u015Bci\u2026"));
        root.querySelector("[data-export]").addEventListener("click", () => toast("Przygotujemy eksport i wy\u015Blemy link e-mailem (do 24 h)"));
        root.querySelector("[data-del]").addEventListener("click", () => toast("Usuni\u0119cie wymaga potwierdzenia e-mailem. Aktywny plan zostanie anulowany.", "err"));
      }
    };
  }
  var SCREEN_MAP = [
    { group: "Publiczne", items: [
      ["P1", "Strona g\u0142\xF3wna", "#/", "guest"],
      ["P2", "Wyszukiwarka mentor\xF3w", "#/mentorzy", "guest"],
      ["P3", "Profil mentora", "#/mentorzy/m1", "guest"],
      ["P4", "Logowanie / rejestracja", "#/rejestracja", "guest"]
    ] },
    { group: "Ucze\u0144", items: [
      ["U1", "Wyb\xF3r terminu", "#/rezerwacja/m5", "student"],
      ["U2", "Checkout", "#/rezerwacja/m5/platnosc", "student"],
      ["U3", "Potwierdzenie", "#/potwierdzenie/s3", "student"],
      ["U4", "Moje sesje", "#/sesje", "student"],
      ["U5", "Szczeg\xF3\u0142y sesji", "#/sesje/s2", "student"],
      ["U6", "Pok\xF3j sesji", "#/sesje/s1/pokoj", "student"],
      ["U7", "Ocena sesji (po pr\xF3bnej)", "#/sesje/s5/ocena", "student"],
      ["U8", "Plany i saldo", "#/plany", "student"],
      ["U9", "Post\u0119py", "#/postepy", "student"],
      ["S1", "Wiadomo\u015Bci", "#/wiadomosci/t1", "student"],
      ["S2", "Powiadomienia", "#/powiadomienia", "student"],
      ["S3", "Konto", "#/konto", "student"]
    ] },
    { group: "Mentor", items: [
      ["M1", "Onboarding (6 krok\xF3w)", "#/mentor/onboarding/1", "mentor"],
      ["M2", "Panel mentora", "#/mentor", "mentor"],
      ["M3", "Kalendarz i dost\u0119pno\u015B\u0107", "#/mentor/kalendarz", "mentor"],
      ["M4", "Uczniowie i notatki", "#/mentor/uczniowie/st1", "mentor"],
      ["M5", "Zarobki i wyp\u0142aty", "#/mentor/zarobki", "mentor"]
    ] },
    { group: "Admin", items: [["A1", "Weryfikacja mentor\xF3w", "#/admin/weryfikacja", "admin"], ["A2", "Spory i zwroty", "#/admin/spory", "admin"]] }
  ];
  var FLOWS = [
    { name: "F1 Wyszukanie \u2192 sesja pr\xF3bna", steps: "Go\u015B\u0107: Strona g\u0142\xF3wna \u2192 szukaj \u201EReact\u201D \u2192 profil Kasi \u2192 wybierz termin \u2192 rejestracja \u2192 p\u0142atno\u015B\u0107 (kod KOMPAS10) \u2192 potwierdzenie" },
    { name: "F2 Sesja \u2192 ocena \u2192 plan", steps: "Ucze\u0144: Moje sesje \u2192 Do\u0142\u0105cz (sesja o 14:05) \u2192 test sprz\u0119tu \u2192 pok\xF3j \u2192 Zako\u0144cz \u2192 ocena (sesja pr\xF3bna z 9 pa\u017A) \u2192 wyb\xF3r planu" },
    { name: "F3 Prze\u0142o\u017Cenie i anulowanie", steps: "Ucze\u0144: Moje sesje \u2192 sesja 23 pa\u017A \u2192 Prze\u0142\xF3\u017C / Anuluj (bezp\u0142atnie) \xB7 sesja dzi\u015B 14:05 \u2192 Anuluj (ostrze\u017Cenie: przepada)" },
    { name: "F4 Onboarding mentora", steps: "Go\u015B\u0107: \u201EZosta\u0144 mentorem\u201D \u2192 6 krok\xF3w z walidacj\u0105 \u2192 wys\u0142ano \u2192 Admin: Weryfikacja \u2192 zatwierd\u017A" },
    { name: "F5 Praca mentora", steps: "Mentor: Panel \u2192 akceptuj/odrzu\u0107 pro\u015Bby \u2192 Kalendarz (przeci\u0105gnij po siatce) \u2192 Uczniowie \u2192 notatka \u2192 Zarobki \u2192 wyp\u0142ata" },
    { name: "F6 Sp\xF3r i zwrot", steps: "Ucze\u0144: sesja z 18 pa\u017A \u2192 Zg\u0142o\u015B problem \xB7 Admin: Spory \u2192 rozstrzygnij" }
  ];
  function screenMap() {
    const html = `
  <div class="page-head"><h1>Mapa ekran\xF3w</h1></div>
  <p class="muted">Klikni\u0119cie ustawia odpowiedni\u0105 rol\u0119 i otwiera ekran. Ka\u017Cdy ekran ma podgl\u0105d stan\xF3w w pasku mockupu na dole.</p>
  <section class="card"><h2 class="h3">\u015Acie\u017Cki do przej\u015Bcia</h2><ol class="flows">${FLOWS.map((f) => `<li><strong>${esc(f.name)}</strong><br><span class="small">${esc(f.steps)}</span></li>`).join("")}</ol></section>
  <div class="grid-2">${SCREEN_MAP.map((g) => `<section class="card"><h2 class="h3">${g.group}</h2><ul class="map-list">${g.items.map(([id, name, href, role]) => `<li><a href="${href}" data-role-go="${role}"><span class="map-id">${id}</span>${esc(name)}</a></li>`).join("")}</ul></section>`).join("")}</div>`;
    return {
      html,
      bind(root) {
        root.querySelectorAll("[data-role-go]").forEach((a) => a.addEventListener("click", () => {
          const r = a.dataset.roleGo;
          if (r === "student" && store.role !== "student") applyDemoStudent();
          store.role = r;
          store.loggedIn = r !== "guest";
          if (a.getAttribute("href") === "#/rezerwacja/m5/platnosc") store.draft = { mentorId: "m5", startsAt: "2026-10-22T09:00:00.000Z", durationMin: 30, type: "trial" };
        }));
      }
    };
  }

  // src/main.ts
  var ROUTES = [
    { pattern: "/", id: "P1", title: "Strona g\u0142\xF3wna", access: "public", screen: home },
    { pattern: "/mentorzy", id: "P2", title: "Wyszukiwarka mentor\xF3w", access: "public", screen: search },
    { pattern: "/mentorzy/:id", id: "P3", title: "Profil mentora", access: "public", screen: profile },
    { pattern: "/logowanie", id: "P4", title: "Logowanie", access: "public", screen: (c) => auth({ ...c, params: { mode: "logowanie" } }) },
    { pattern: "/rejestracja", id: "P4", title: "Rejestracja", access: "public", screen: (c) => auth({ ...c, params: { mode: "rejestracja" } }) },
    { pattern: "/rezerwacja/:mentorId", id: "U1", title: "Wyb\xF3r terminu", access: "public", screen: pickSlot },
    { pattern: "/rezerwacja/:mentorId/platnosc", id: "U2", title: "Checkout", access: "student", screen: checkout },
    { pattern: "/potwierdzenie/:id", id: "U3", title: "Potwierdzenie rezerwacji", access: "student", screen: confirmation },
    { pattern: "/sesje", id: "U4", title: "Moje sesje", access: "student", screen: sessions },
    { pattern: "/sesje/:id", id: "U5", title: "Szczeg\xF3\u0142y sesji", access: "student", screen: sessionDetail },
    { pattern: "/sesje/:id/pokoj", id: "U6", title: "Pok\xF3j sesji", access: "auth", screen: room, bare: true },
    { pattern: "/sesje/:id/ocena", id: "U7", title: "Ocena sesji", access: "student", screen: review },
    { pattern: "/plany", id: "U8", title: "Plany i saldo", access: "student", screen: plans },
    { pattern: "/postepy", id: "U9", title: "Post\u0119py", access: "student", screen: progress },
    { pattern: "/wiadomosci", id: "S1", title: "Wiadomo\u015Bci", access: "auth", screen: messages },
    { pattern: "/wiadomosci/:id", id: "S1", title: "Wiadomo\u015Bci", access: "public", screen: messages },
    { pattern: "/powiadomienia", id: "S2", title: "Powiadomienia", access: "auth", screen: notifications },
    { pattern: "/konto", id: "S3", title: "Konto i ustawienia", access: "auth", screen: account },
    { pattern: "/mentor/onboarding/:step", id: "M1", title: "Onboarding mentora", access: "public", screen: onboarding },
    { pattern: "/mentor", id: "M2", title: "Panel mentora", access: "mentor", screen: mentorDashboard },
    { pattern: "/mentor/kalendarz", id: "M3", title: "Kalendarz i dost\u0119pno\u015B\u0107", access: "mentor", screen: mentorCalendar },
    { pattern: "/mentor/uczniowie", id: "M4", title: "Uczniowie", access: "mentor", screen: mentorStudents },
    { pattern: "/mentor/uczniowie/:id", id: "M4", title: "Ucze\u0144", access: "mentor", screen: mentorStudent },
    { pattern: "/mentor/zarobki", id: "M5", title: "Zarobki i wyp\u0142aty", access: "mentor", screen: earnings },
    { pattern: "/admin/weryfikacja", id: "A1", title: "Weryfikacja mentor\xF3w", access: "admin", screen: verification },
    { pattern: "/admin/spory", id: "A2", title: "Spory i zwroty", access: "admin", screen: disputes },
    { pattern: "/mapa", id: "\u2014", title: "Mapa ekran\xF3w", access: "public", screen: screenMap }
  ];
  var ROLE_LABEL = { guest: "Go\u015B\u0107", student: "Ucze\u0144", mentor: "Mentor", admin: "Admin" };
  var NAV = {
    guest: [["#/mentorzy", "Znajd\u017A mentora", "search"], ["#/mentor/onboarding/1", "Zosta\u0144 mentorem", "user"]],
    student: [["#/mentorzy", "Szukaj", "search"], ["#/sesje", "Sesje", "cal"], ["#/wiadomosci", "Wiadomo\u015Bci", "chat"], ["#/postepy", "Post\u0119py", "target"], ["#/plany", "Plany", "wallet"]],
    mentor: [["#/mentor", "Panel", "home"], ["#/mentor/kalendarz", "Kalendarz", "cal"], ["#/mentor/uczniowie", "Uczniowie", "users"], ["#/wiadomosci", "Wiadomo\u015Bci", "chat"], ["#/mentor/zarobki", "Zarobki", "wallet"]],
    admin: [["#/admin/weryfikacja", "Weryfikacja", "shield"], ["#/admin/spory", "Spory", "flag"]]
  };
  function match(path) {
    const parts = path.split("/").filter(Boolean);
    for (const route of ROUTES) {
      const rp = route.pattern.split("/").filter(Boolean);
      if (rp.length !== parts.length) continue;
      const params = {};
      if (rp.every((p, i) => p.startsWith(":") ? (params[p.slice(1)] = decodeURIComponent(parts[i]), true) : p === parts[i])) return { route, params };
    }
    return null;
  }
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = raw.split("?");
    const query = new URLSearchParams(qs ?? "");
    const outer = new URLSearchParams(location.search).get("state");
    if (outer && !query.get("state")) query.set("state", outer);
    return { path: path || "/", query };
  }
  var app = document.getElementById("app");
  var navToken = 0;
  function header(route) {
    const r = store.role;
    const unread = store.notifications.filter((n) => n.unread).length;
    const cur = location.hash.split("?")[0] || "#/";
    const navLinks = NAV[r].map(([href, label, ic]) => `<a href="${href}" class="${cur === href || href !== "#/mentor" && cur.startsWith(href) ? "is-active" : ""}">${icon(ic)}<span>${label}</span></a>`).join("");
    return `
  <div class="mockbar" role="region" aria-label="Pasek mockupu">
    <span class="mockbar__tag">MOCKUP</span>
    <span class="mockbar__screen"><b>${esc(route.id)}</b> ${esc(route.title)}</span>
    <label>Rola <select data-role>${Object.keys(ROLE_LABEL).map((k) => `<option value="${k}" ${k === r ? "selected" : ""}>${ROLE_LABEL[k]}</option>`).join("")}</select></label>
    <span class="mockbar__states" role="group" aria-label="Stan ekranu">${["success", "loading", "empty", "error"].map((s) => `<button data-state="${s}" class="${(parseHash().query.get("state") ?? "success") === s ? "is-on" : ""}">${s === "success" ? "domy\u015Blny" : s}</button>`).join("")}</span>
    <a href="#/mapa">${icon("map")} Mapa ekran\xF3w</a>
  </div>
  <header class="topbar">
    <a href="${DEFAULT_ROUTE[r]}" class="logo" aria-label="Kompas \u2014 strona g\u0142\xF3wna"><span class="logo__mark">\u2726</span>kompas</a>
    <nav class="topnav" aria-label="G\u0142\xF3wna">${navLinks}</nav>
    <div class="topbar__right">
      ${r === "guest" ? '<a class="btn btn--ghost btn--s" href="#/logowanie">Zaloguj</a><a class="btn btn--primary btn--s hide-s" href="#/rejestracja">Za\u0142\xF3\u017C konto</a>' : `<a href="#/powiadomienia" class="iconbtn" aria-label="Powiadomienia">${icon("bell")}${unread ? `<span class="dot">${unread}</span>` : ""}</a>
           <a href="#/konto" class="avatar avatar--me" style="--h:${r === "mentor" ? 168 : r === "admin" ? 0 : 12};--s:34px" aria-label="Konto">${r === "mentor" ? "KN" : r === "admin" ? "AD" : "AC"}</a>`}
    </div>
  </header>
  ${r !== "guest" ? `<nav class="bottomnav" aria-label="G\u0142\xF3wna (mobile)">${navLinks}</nav>` : ""}`;
  }
  function guard(route) {
    const a = route.access;
    if (a === "public") return null;
    if (store.role === "guest") {
      store.returnTo = location.hash;
      return `<div class="narrow card stack center">${icon("user")}<h1 class="h2">Zaloguj si\u0119, \u017Ceby kontynuowa\u0107</h1>
      <p class="muted">Ten ekran wymaga konta.</p><div class="row gap-s center-row"><a class="btn btn--primary" href="#/logowanie">Zaloguj</a><a class="btn btn--ghost" href="#/rejestracja">Za\u0142\xF3\u017C konto</a></div></div>`;
    }
    if (a !== "auth" && a !== store.role) {
      return `<div class="narrow card stack center">${icon("alert")}<h1 class="h2">Ten ekran jest dla roli: ${ROLE_LABEL[a]}</h1>
      <p class="muted">W mockupie mo\u017Cesz prze\u0142\u0105czy\u0107 rol\u0119.</p><button class="btn btn--primary" data-switch="${a}">Prze\u0142\u0105cz na: ${ROLE_LABEL[a]}</button></div>`;
    }
    return null;
  }
  function render(fresh) {
    closeModal();
    const { path, query } = parseHash();
    const m = match(path);
    const route = m?.route ?? ROUTES.find((r) => r.pattern === "/mapa");
    const forced = query.get("state");
    const token = ++navToken;
    const draw = (state) => {
      if (token !== navToken) return;
      const blocked = guard(route);
      const ctx = { params: m?.params ?? {}, query, state, rerender: () => render(false) };
      const view = blocked ? { html: blocked } : !m ? { html: `<div class="narrow">${"<h1>404</h1><p>Nie ma takiej strony.</p>"}</div>` } : route.screen(ctx);
      document.title = `${route.title} \xB7 Kompas (mockup)`;
      app.innerHTML = `${header(route)}<main class="main ${route.bare ? "main--bare" : ""} ${store.role !== "guest" ? "has-bottomnav" : ""}" id="main">${view.html}</main>
      ${route.bare ? "" : `<footer class="footer"><span>Kompas \xB7 mockup koncepcji \xB7 dane fikcyjne</span><a href="#/mapa">Mapa ekran\xF3w</a></footer>`}`;
      bindChrome();
      const main = app.querySelector("#main");
      view.bind?.(main);
      main.querySelectorAll("[data-retry]").forEach((b) => b.addEventListener("click", () => setState("success")));
    };
    if (fresh) window.scrollTo(0, 0);
    if (fresh && !forced && m && !guard(route)) {
      draw("loading");
      setTimeout(() => draw("success"), 280);
    } else draw(forced ?? "success");
  }
  function setState(s) {
    const { path, query } = parseHash();
    if (s === "success") query.delete("state");
    else query.set("state", s);
    const qs = query.toString();
    history.replaceState(null, "", `${location.pathname}#${path}${qs ? `?${qs}` : ""}`);
    render(false);
  }
  function bindChrome() {
    app.querySelector("[data-role]").addEventListener("change", (e) => {
      const r = e.target.value;
      if (r === "student") applyDemoStudent();
      store.role = r;
      store.loggedIn = r !== "guest";
      location.hash = DEFAULT_ROUTE[r];
    });
    app.querySelectorAll("[data-state]").forEach((b) => b.addEventListener("click", () => setState(b.dataset.state)));
    app.querySelectorAll("[data-switch]").forEach((b) => b.addEventListener("click", () => {
      store.role = b.dataset.switch;
      store.loggedIn = true;
      render(false);
    }));
    app.querySelector("[data-become-mentor]")?.addEventListener("click", () => {
      if (store.role === "student") store.role = "mentor";
    });
  }
  window.addEventListener("hashchange", () => render(true));
  render(true);
})();
