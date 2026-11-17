/**
 * Design tokens resmi diekstrak dari Figma page `⭐️ Templates (Copy)` (node 1331:4912).
 * Seluruh nilai warna, bayangan, dimensi tablet 1280×800, dan peta node Figma disimpan terpusat di sini.
 */
export const COLORS = {
  mint: "#EBF4E8",
  cream: "#FFFDF9",
  forest: "#465947",
  forestSub: "#D6E3D9",
  green: "#2D7A53",
  greenSoft: "#E7F5EC",
  orange: "#E86339",
  peach: "#FDECE6",
  amberBg: "#FFF6E5",
  amberBorder: "#D9822B",
  amberInk: "#8A5111",
  ink: "#1F2024",
  muted: "#71727A",
  border: "#E3E5EA",
  fieldBg: "#F9FAFB",
  red: "#ED3241",
  redSoft: "#FDECEC",
  white: "#FFFFFF",
} as const;

export const SHADOWS = {
  card: "0 4px 14px rgba(20, 31, 23, 0.10)",
  productBox: "0 4px 10px rgba(20, 31, 23, 0.16)",
} as const;

export const LAYOUT_DIMENSIONS = {
  TABLET_WIDTH: 1280,
  TABLET_HEIGHT: 800,
  SIDEBAR_WIDTH: 84,
  AVATAR_SIZE: 44,
  NAV_BUTTON_SIZE: 42,
  PRODUCT_CARD_HEIGHT: 148,
  PRODUCT_GRID_COLS_TABLET: 3,
} as const;

/**
 * Referensi silang setiap fitur & layar kode ke nodeId Figma pada halaman `1331:4912`.
 */
export const FIGMA_NODE_MAP = {
  PAGE_COPY: "1331:4912",
  SECTIONS: {
    LOGIN_KETUA_KWU: "1331:5579",
    LOGIN_ERROR_NEGATIF: "1387:4827",
    LOGIN_KASIR: "1331:5785",
    REGISTER_FORGOT: "1331:6003",
    US01_PENGELOLA: "1390:4621",
    US01_KWU: "1331:6084",
    US05_PENJUALAN: "1331:6270",
    US16_REKAP_OCR: "1331:6426",
  },
  FRAMES: {
    LOGIN_KWU_EMPTY: "1331:5580",
    LOGIN_KWU_EMAIL: "1331:5622",
    LOGIN_KWU_FILLED: "1331:5638",
    BERANDA_KWU: "1331:5698",
    LOGIN_EMPTY_ERROR: "1331:5596",
    LOGIN_WRONG_FILLED: "1331:6664",
    LOGIN_WRONG_ERROR: "1331:6680",
    LOGIN_KASIR_EMPTY: "1331:5786",
    LOGIN_KASIR_EMAIL: "1331:5838",
    LOGIN_KASIR_FILLED: "1331:5854",
    KASIR_HOME: "1331:5870",
    KASIR_ROLE_RESTRICTED: "1331:5947",
    REGISTER: "1331:6004",
    VERIFY_REGISTER: "1331:6065",
    FORGOT_PASSWORD: "1331:6033",
    VERIFY_RECOVER: "1331:6046",
    CHANGE_PASSWORD: "1331:6019",
    US01_PENGELOLA_LIST: "1390:4624",
    US01_PENGELOLA_DETAIL: "1390:4693",
    US01_KWU_LIST: "1390:4781",
    US01_KWU_DETAIL: "1390:4854",
    US01_KWU_FORM_EMPTY: "1390:4946",
    US01_KWU_FORM_VALID: "1390:5033",
    US01_KWU_FORM_INVALID: "1390:5120",
    US01_KWU_SAVED_LIST: "1390:5212",
    US05_EMPTY_CART: "1338:4925",
    US05_SELECT_ITEM: "1338:5007",
    US05_AUTO_TOTAL: "1338:5097",
    US05_SAVED_RECEIPT: "1338:5211",
    US16_UPLOAD_EMPTY: "1341:4836",
    US16_PHOTO_READY: "1341:4923",
    US16_OCR_CONVERTED: "1341:5010",
    US16_OFFLINE_QUEUE: "1341:5098",
    US16_SAVED_REPORT: "1341:5178",
  },
} as const;
