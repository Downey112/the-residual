import { CHAPTERS, EPILOGUE, FIG1, FIG2, FIG3 } from "./book";

export type AssetKind = "image" | "chapter" | "figure";

export type Asset = {
  id: string;
  kind: AssetKind;
  group: "Apparel" | "Book" | "Figures";
  title: string;
  caption: string;
  /** image kind */
  src?: string;
  /** chapter kind */
  chapterId?: string;
  /** figure kind */
  figure?: "fig1" | "fig2" | "fig3";
  /** tag shown on the card */
  tag: string;
};

export const ASSETS: Asset[] = [
  {
    id: "tee-front",
    kind: "image",
    group: "Apparel",
    title: "Tee, front",
    caption: "A small serif wordmark on the upper chest. Nothing else.",
    src: "/products/tee-front.webp",
    tag: "Mockup",
  },
  {
    id: "tee-back",
    kind: "image",
    group: "Apparel",
    title: "Tee, back",
    caption:
      "An OLS line, fitted points, and one isolated residual, e, in amber. Below it: You learned to fit the line.",
    src: "/products/tee-back.webp",
    tag: "Mockup",
  },
  {
    id: "tee-art",
    kind: "image",
    group: "Apparel",
    title: "Back print artwork",
    caption: "The print file for the back, shown on black.",
    src: "/textures/tee-back-art.png",
    tag: "Artwork",
  },
  {
    id: "book-cover",
    kind: "image",
    group: "Book",
    title: "Cover",
    caption: "The Residual. A field guide for statistics graduates in Malaysia.",
    src: "/textures/book-cover.jpg",
    tag: "Cover",
  },
  ...CHAPTERS.map<Asset>((c) => ({
    id: c.id,
    kind: "chapter",
    group: "Book",
    title: c.title,
    caption: c.gist,
    chapterId: c.id,
    tag: c.label,
  })),
  {
    id: EPILOGUE.id,
    kind: "chapter",
    group: "Book",
    title: EPILOGUE.title,
    caption: EPILOGUE.gist,
    chapterId: EPILOGUE.id,
    tag: EPILOGUE.label,
  },
  {
    id: "fig1",
    kind: "figure",
    group: "Figures",
    title: `Fig 1. ${FIG1.title}`,
    caption: FIG1.caption,
    figure: "fig1",
    tag: "Figure 1",
  },
  {
    id: "fig2",
    kind: "figure",
    group: "Figures",
    title: `Fig 2. ${FIG2.title}`,
    caption: FIG2.caption,
    figure: "fig2",
    tag: "Figure 2",
  },
  {
    id: "fig3",
    kind: "figure",
    group: "Figures",
    title: `Fig 3. ${FIG3.title}`,
    caption: FIG3.caption,
    figure: "fig3",
    tag: "Figure 3",
  },
];

export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
