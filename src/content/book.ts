/**
 * Real content from the manuscript of "The Residual".
 * Excerpts are the opening lines of each chapter, quoted from the book.
 */

export type Chapter = {
  id: string;
  /** Label shown above the title, e.g. "Chapter 01" */
  label: string;
  title: string;
  /** One-line description of what the chapter covers */
  gist: string;
  /** Short opening excerpt, quoted from the book */
  excerpt: string;
};

export const BOOK = {
  title: "The Residual",
  subtitle: "A field guide for statistics graduates in Malaysia",
  author: "Luqman",
  edition: "First edition, 2026",
  format: "EPUB",
  readingTime: "About forty minutes",
  blurb:
    "You were trained to fit the line. This book is about the part the line leaves out: where the demand for statisticians is, the four doors graduates walk through, the tools employers screen for, and the proof worth building before anyone asks.",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    label: "Chapter 01",
    title: "Scarce and Unemployed",
    gist: "Why Malaysia lists statisticians as a critical shortage while graduates struggle to get hired, with the BLS, World Economic Forum and TalentCorp figures side by side.",
    excerpt:
      "Aina had three tabs open and a teh tarik she had stopped drinking an hour ago. The library at UiTM was down to the hum of the air-conditioning and a boy two tables over asleep on his probability notes. Both things could not be true. A country cannot be short of you and ignore you at the same moment. It can. This book begins there.",
  },
  {
    id: "ch2",
    label: "Chapter 02",
    title: "Four Doors",
    gist: "Technology, finance and insurance, biopharma, and public policy, including DOSM and Bank Negara Malaysia, with salary ranges in RM.",
    excerpt:
      "Hafiz graduated a year before Aina and told everyone he had no plan. This was not true. He had four plans, which was worse, because each one needed a different version of him.",
  },
  {
    id: "ch3",
    label: "Chapter 03",
    title: "The Toolbox",
    gist: "R, Python, SAS, SQL beyond the basics, Power BI and reproducible reporting. What interviewers actually ask for.",
    excerpt:
      "The interviewer had a quiet voice and a whiteboard marker that was nearly dry. He drew a table with two columns, customer_id and order_date, and asked Aina to write a query that returned each customer's most recent order.",
  },
  {
    id: "ch4",
    label: "Chapter 04",
    title: "The Dashboard Donkey",
    gist: "How to turn a p-value into a decision a director will act on, and why that skill decides how far you go.",
    excerpt:
      "The director looked up from his phone. “So what do I do on Monday?” Nobody spoke. The air-conditioning ticked. Hafiz looked at the slide as if it had been put there by someone else.",
  },
  {
    id: "ch5",
    label: "Chapter 05",
    title: "Proof",
    gist: "The credentials worth earning and three portfolio projects that go well beyond the Titanic dataset.",
    excerpt:
      "At a certain point you have to stop telling people you can do the work and show them. A recruiter reading a hundred applications has no way to check your claim. A repository she can open in thirty seconds is a different kind of sentence.",
  },
  {
    id: "ch6",
    label: "Chapter 06",
    title: "Eighty-One Percent",
    gist: "The survey result that should change how you spend your final year, and what to do about it.",
    excerpt:
      "The number came from a ZipRecruiter survey, and it was the kind that makes you put your cup down. Among graduates who had structured work experience during university, 81.6% had secured a professional position shortly after graduating. Among those who had none, 40.7%.",
  },
];

export const EPILOGUE: Chapter = {
  id: "epilogue",
  label: "Epilogue",
  title: "The Residual",
  gist: "What the degree gives you, and what it cannot.",
  excerpt:
    "When you fit a line to data, the line is your best account of what usually happens. The residual is the distance between that account and what actually happened to one point. Every model you ever build will have them. A good analyst does not delete the points that sit far off the line. She goes and looks at them.",
};

export const ALL_SECTIONS: Chapter[] = [...CHAPTERS, EPILOGUE];

/**
 * The 3D book shows two facing pages at a time.
 * spread 0 = closed, 1 = open at contents, 2..5 = further spreads.
 */
export const SPREADS: { left: string; right: string }[] = [
  { left: "Cover", right: "Cover" },
  { left: "Inside cover", right: "Contents" },
  { left: "ch1", right: "ch2" },
  { left: "ch3", right: "ch4" },
  { left: "ch5", right: "ch6" },
  { left: "epilogue", right: "About" },
];

export const MAX_SPREAD = SPREADS.length - 1;

/** Which spread shows a given chapter id */
export function spreadForChapter(id: string): number {
  if (id === "contents") return 1;
  if (id === "epilogue") return 5;
  const n = Number(id.replace("ch", ""));
  if (!Number.isFinite(n)) return 1;
  return Math.ceil(n / 2) + 1;
}

/** Real figures from the book (Figures 1 and 2) */
export const FIG1 = {
  title: "Projected growth",
  caption:
    "Projected growth. The first four rows are U.S. BLS projections for 2025 to 2035. The last row is the World Economic Forum's net growth estimate for 2025 to 2030. Two sources, two time windows, one direction.",
  rows: [
    { label: "All occupations", value: 3.5, base: true },
    { label: "Statisticians", value: 11 },
    { label: "Actuaries", value: 22 },
    { label: "Data scientists", value: 35 },
    { label: "Data analysts & scientists, world", value: 41 },
  ],
};

export const FIG2 = {
  title: "Work experience and early employment",
  caption:
    "Share of graduates in a professional position shortly after graduation. Source: ZipRecruiter Graduate Survey 2026.",
  rows: [
    { label: "With structured work experience", value: 81.6 },
    { label: "Without", value: 40.7, base: true },
  ],
};

export const FIG3 = {
  title: "The residual",
  caption:
    "The line is what the degree gives you. The distance marked e is the part it cannot.",
};
