export interface Station {
  id: string;
  name: string;
  line: "north-south";
  order: number;
}

export interface Tenant {
  id: string;
  stationId: string;
  name: string;
}

export interface ChecklistItem {
  key: string;
  label: string;
  shortLabel: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: "beroperasi", label: "Tenant yang Beroperasi", shortLabel: "Beroperasi" },
  { key: "jamOperasional", label: "Jam Operasional OK", shortLabel: "Jam Operasional" },
  { key: "pegawaiBertugas", label: "Nama Pegawai yang Bertugas", shortLabel: "Pegawai Bertugas" },
  { key: "kesehatanPegawai", label: "Kondisi Kesehatan Pegawai OK", shortLabel: "Kesehatan Pegawai" },
  { key: "updateKebijakan", label: "Tenant diinformasikan update kebijakan", shortLabel: "Update Kebijakan" },
  { key: "infoERT", label: "Tenant diinformasikan Tim ERT", shortLabel: "Info Tim ERT" },
  { key: "protokolKesehatan", label: "Menjalankan protokol kesehatan", shortLabel: "Protokol Kesehatan" },
];

export const STATIONS: Station[] = [
  { id: "lebak-bulus", name: "Lebak Bulus Grab", line: "north-south", order: 1 },
  { id: "fatmawati", name: "Fatmawati Indomaret", line: "north-south", order: 2 },
  { id: "cipete-raya", name: "Cipete Raya", line: "north-south", order: 3 },
  { id: "haji-nawi", name: "Haji Nawi", line: "north-south", order: 4 },
  { id: "blok-a", name: "Blok A", line: "north-south", order: 5 },
  { id: "blok-m-bca", name: "Blok M BCA", line: "north-south", order: 6 },
  { id: "asean", name: "ASEAN", line: "north-south", order: 7 },
  { id: "senayan", name: "Senayan", line: "north-south", order: 8 },
  { id: "istora-mandiri", name: "Istora Mandiri", line: "north-south", order: 9 },
  { id: "bendungan-hilir", name: "Bendungan Hilir", line: "north-south", order: 10 },
  { id: "setiabudi-astra", name: "Setiabudi Astra", line: "north-south", order: 11 },
  { id: "dukuh-atas-bni", name: "Dukuh Atas BNI", line: "north-south", order: 12 },
  { id: "bundaran-hi", name: "Bundaran HI", line: "north-south", order: 13 },
];

export const TENANTS: Tenant[] = [
  { id: "t1", stationId: "senayan", name: "INDOMARET POIN" },
  { id: "t2", stationId: "senayan", name: "DOUGHLAB" },
  { id: "t3", stationId: "senayan", name: "KOPI JAGO" },
  { id: "t4", stationId: "senayan", name: "MOMS BREAD" },
  { id: "t5", stationId: "lebak-bulus", name: "LAWSON" },
  { id: "t6", stationId: "lebak-bulus", name: "STARBUCKS" },
  { id: "t7", stationId: "lebak-bulus", name: "HOKBEN" },
  { id: "t8", stationId: "blok-m-bca", name: "KOPI KENANGAN" },
  { id: "t9", stationId: "blok-m-bca", name: "CHATIME" },
  { id: "t10", stationId: "blok-m-bca", name: "ALFAMART" },
  { id: "t11", stationId: "bundaran-hi", name: "FORE COFFEE" },
  { id: "t12", stationId: "bundaran-hi", name: "INDOMARET" },
  { id: "t13", stationId: "dukuh-atas-bni", name: "POINT COFFEE" },
  { id: "t14", stationId: "dukuh-atas-bni", name: "MIXUE" },
  { id: "t15", stationId: "fatmawati", name: "MAXX COFFEE" },
  { id: "t16", stationId: "fatmawati", name: "SOLARIA" },
  { id: "t17", stationId: "istora-mandiri", name: "BURGER KING" },
  { id: "t18", stationId: "istora-mandiri", name: "KOPI JANJI JIWA" },
];
