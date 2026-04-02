export type PersonnelCategory = "organik" | "frontliner" | "facility-care" | "p3k" | "security";

export interface Personnel {
  id: string;
  name: string;
  nik: string;
  station: string;
  jabatan: string;
  shift: "Pagi" | "Siang" | "Malam" | "Office Hour";
  status: "Aktif" | "Cuti" | "Non-aktif";
  category: PersonnelCategory;
  phone?: string;
  email?: string;
  joinDate?: string;
}

export const PERSONNEL_DATA: Personnel[] = [
  // Organik
  { id: "1", name: "Teguh Prabowo", nik: "MRT-2023-00031", station: "Dukuh Atas BNI", jabatan: "Station Manager", shift: "Pagi", status: "Aktif", category: "organik", phone: "0812-3456-7890", email: "teguh.prabowo@mrtjakarta.co.id", joinDate: "2023-02-15" },
  { id: "2", name: "Hendra Kusuma", nik: "MRT-2023-00015", station: "Bundaran HI", jabatan: "Station Duty Section Head", shift: "Pagi", status: "Aktif", category: "organik", phone: "0813-2345-6789", email: "hendra.kusuma@mrtjakarta.co.id", joinDate: "2023-01-10" },
  { id: "3", name: "Ahmad Fauzan", nik: "MRT-2024-00142", station: "Dukuh Atas BNI", jabatan: "Station Officer", shift: "Siang", status: "Aktif", category: "organik", phone: "0857-1234-5678", email: "ahmad.fauzan@mrtjakarta.co.id", joinDate: "2024-03-01" },
  { id: "4", name: "Rina Wulandari", nik: "MRT-2023-00078", station: "Lebak Bulus Grab", jabatan: "Planner", shift: "Office Hour", status: "Aktif", category: "organik", phone: "0821-9876-5432", email: "rina.wulandari@mrtjakarta.co.id", joinDate: "2023-04-20" },
  { id: "5", name: "Bambang Setiawan", nik: "MRT-2024-00201", station: "Blok M BCA", jabatan: "Assistant Planner", shift: "Office Hour", status: "Aktif", category: "organik", phone: "0856-5432-1098", email: "bambang.setiawan@mrtjakarta.co.id", joinDate: "2024-01-15" },
  { id: "6", name: "Siti Nurhaliza", nik: "MRT-2023-00055", station: "Senayan", jabatan: "Head", shift: "Office Hour", status: "Cuti", category: "organik", phone: "0878-6543-2109", email: "siti.nurhaliza@mrtjakarta.co.id", joinDate: "2023-03-05" },
  // Frontliner
  { id: "7", name: "Dian Pratama", nik: "MRT-2024-00310", station: "Dukuh Atas BNI", jabatan: "JS Leader", shift: "Pagi", status: "Aktif", category: "frontliner", phone: "0812-1111-2222", email: "dian.pratama@mrtjakarta.co.id", joinDate: "2024-02-01" },
  { id: "8", name: "Fajar Hidayat", nik: "MRT-2024-00311", station: "Bundaran HI", jabatan: "Junior Staff", shift: "Siang", status: "Aktif", category: "frontliner", phone: "0813-3333-4444", email: "fajar.hidayat@mrtjakarta.co.id", joinDate: "2024-02-15" },
  { id: "9", name: "Lestari Dewi", nik: "MRT-2024-00312", station: "Lebak Bulus Grab", jabatan: "Junior Staff", shift: "Pagi", status: "Aktif", category: "frontliner", phone: "0857-5555-6666", email: "lestari.dewi@mrtjakarta.co.id", joinDate: "2024-03-10" },
  { id: "10", name: "Rudi Hermawan", nik: "MRT-2024-00313", station: "Blok M BCA", jabatan: "JS Leader", shift: "Malam", status: "Aktif", category: "frontliner", phone: "0821-7777-8888", email: "rudi.hermawan@mrtjakarta.co.id", joinDate: "2024-01-20" },
  { id: "11", name: "Yuni Astuti", nik: "MRT-2024-00314", station: "Senayan", jabatan: "Junior Staff", shift: "Siang", status: "Non-aktif", category: "frontliner", phone: "0856-9999-0000", email: "yuni.astuti@mrtjakarta.co.id", joinDate: "2024-04-01" },
  // Facility Care
  { id: "12", name: "Andi Saputra", nik: "MRT-2023-00401", station: "Dukuh Atas BNI", jabatan: "Facility Care Staff", shift: "Pagi", status: "Aktif", category: "facility-care", phone: "0812-4401-1001", email: "andi.saputra@mrtjakarta.co.id", joinDate: "2023-06-01" },
  { id: "13", name: "Budi Santoso", nik: "MRT-2023-00402", station: "Bundaran HI", jabatan: "Facility Care Lead", shift: "Siang", status: "Aktif", category: "facility-care", phone: "0813-4402-1002", email: "budi.santoso@mrtjakarta.co.id", joinDate: "2023-07-15" },
  { id: "14", name: "Citra Melati", nik: "MRT-2024-00403", station: "Lebak Bulus Grab", jabatan: "Facility Care Staff", shift: "Malam", status: "Aktif", category: "facility-care", phone: "0857-4403-1003", email: "citra.melati@mrtjakarta.co.id", joinDate: "2024-01-10" },
  // P3K
  { id: "15", name: "Dr. Putri Ayu", nik: "MRT-2023-00501", station: "Dukuh Atas BNI", jabatan: "Paramedis", shift: "Pagi", status: "Aktif", category: "p3k", phone: "0812-5501-2001", email: "putri.ayu@mrtjakarta.co.id", joinDate: "2023-05-01" },
  { id: "16", name: "Wahyu Pratama", nik: "MRT-2024-00502", station: "Lebak Bulus Grab", jabatan: "Paramedis", shift: "Siang", status: "Aktif", category: "p3k", phone: "0813-5502-2002", email: "wahyu.pratama@mrtjakarta.co.id", joinDate: "2024-02-20" },
  // Security
  { id: "17", name: "Agus Kurniawan", nik: "MRT-2023-00601", station: "Dukuh Atas BNI", jabatan: "Kepala Satpam", shift: "Pagi", status: "Aktif", category: "security", phone: "0812-6601-3001", email: "agus.kurniawan@mrtjakarta.co.id", joinDate: "2023-03-15" },
  { id: "18", name: "Joko Widodo", nik: "MRT-2023-00602", station: "Bundaran HI", jabatan: "Satpam", shift: "Malam", status: "Aktif", category: "security", phone: "0813-6602-3002", email: "joko.widodo@mrtjakarta.co.id", joinDate: "2023-08-01" },
  { id: "19", name: "Surya Darma", nik: "MRT-2024-00603", station: "Blok M BCA", jabatan: "Satpam", shift: "Siang", status: "Aktif", category: "security", phone: "0857-6603-3003", email: "surya.darma@mrtjakarta.co.id", joinDate: "2024-01-05" },
  { id: "20", name: "Irfan Maulana", nik: "MRT-2024-00604", station: "Senayan", jabatan: "Satpam", shift: "Pagi", status: "Cuti", category: "security", phone: "0821-6604-3004", email: "irfan.maulana@mrtjakarta.co.id", joinDate: "2024-03-20" },
];

export const CATEGORY_LABELS: Record<PersonnelCategory, string> = {
  organik: "Organik",
  frontliner: "Frontliner",
  "facility-care": "Facility Care",
  p3k: "P3K",
  security: "Security",
};
