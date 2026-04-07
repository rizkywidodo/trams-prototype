export interface PatrolCategory {
  id: string;
  name: string;
  items: PatrolItem[];
}

export interface PatrolItem {
  id: string;
  indicator: string;
  description: string;
}

export const PATROL_CATEGORIES: PatrolCategory[] = [
  {
    id: "keselamatan",
    name: "KESELAMATAN",
    items: [
      { id: "k1", indicator: "Perangkat dan Fasilitas Keselamatan berfungsi dengan baik", description: "Ketersediaan: APAR, Sprinkler, Smoke Detector, Hydrant, Pintu dan Daftar Telepon Darurat" },
      { id: "k2", indicator: "Perlengkapan penunjang kondisi kedaruratan berfungsi dengan baik", description: "Memastikan ketersediaan, jumlah dan kondisi perlengkapan pada Warden Box" },
      { id: "k3", indicator: "Fasilitas kesehatan berfungsi dengan baik", description: "Memastikan ketersediaan dan kondisi ruangan P3K dan perlengkapan penunjang" },
      { id: "k4", indicator: "Fasilitas penunjang evakuasi berfungsi dengan baik", description: "Ketersediaan: Signage Assembly Point dan Arah Evakuasi, PSD, ESD" },
      { id: "k5", indicator: "Perangkat dan Fasilitas keselamatan berfungsi dengan baik", description: "Ketersediaan Fasilitas: Ramp Portabel, Panel LCPS, Marka Antrian, Guiding Block, Area licin & tdk rata" },
    ],
  },
  {
    id: "kemudahan",
    name: "KEMUDAHAN",
    items: [
      { id: "m1", indicator: "Signage informasi jelas", description: "Papan informasi dan petunjuk arah terbaca dengan baik" },
      { id: "m2", indicator: "Customer service tersedia", description: "Petugas CS bertugas dan siap melayani" },
    ],
  },
  {
    id: "kesetaraan",
    name: "KESETARAAN",
    items: [
      { id: "s1", indicator: "Fasilitas disabilitas tersedia", description: "Guiding block, ramp, dan braille sign berfungsi" },
      { id: "s2", indicator: "Ruang laktasi tersedia dan bersih", description: "Ketersediaan dan kebersihan ruang laktasi" },
    ],
  },
  {
    id: "kehandalan",
    name: "KEHANDALAN",
    items: [
      { id: "h1", indicator: "Eskalator dan elevator beroperasi normal", description: "Cek kondisi operasional eskalator dan elevator" },
      { id: "h2", indicator: "Gate dan mesin tiket berfungsi", description: "Pastikan gate dan mesin tiket beroperasi dengan baik" },
      { id: "h3", indicator: "Sistem pendingin berfungsi", description: "AC dan ventilasi stasiun berjalan normal" },
    ],
  },
  {
    id: "kenyamanan",
    name: "KENYAMANAN",
    items: [
      { id: "n1", indicator: "Kebersihan area stasiun terjaga", description: "Lantai, dinding, dan ceiling bersih" },
      { id: "n2", indicator: "Pencahayaan memadai", description: "Semua lampu berfungsi dengan baik" },
      { id: "n3", indicator: "Toilet bersih dan berfungsi", description: "Ketersediaan air, sabun, dan tissue" },
    ],
  },
  {
    id: "keamanan",
    name: "KEAMANAN",
    items: [
      { id: "a1", indicator: "CCTV beroperasi normal", description: "Semua kamera CCTV aktif dan merekam" },
      { id: "a2", indicator: "Petugas keamanan tersedia", description: "Petugas keamanan bertugas sesuai jadwal" },
    ],
  },
];

export const ALL_ITEMS = PATROL_CATEGORIES.flatMap((c) => c.items);

export const SHIFTS = [
  { id: "handover-1", label: "Handover 06:00", shortLabel: "Handover 06:00" },
  { id: "checklist-1", label: "Checklist I", shortLabel: "Checklist I" },
  { id: "handover-2", label: "Handover 14:00", shortLabel: "Handover 14:00" },
  { id: "checklist-2", label: "Checklist II", shortLabel: "Checklist II" },
  { id: "handover-3", label: "Handover 22:00", shortLabel: "Handover 22:00" },
  
  { id: "window-closing", label: "Window Clearing", shortLabel: "Window Clearing" },
  { id: "opening", label: "Opening 04:00", shortLabel: "Opening 04:00" },
];
