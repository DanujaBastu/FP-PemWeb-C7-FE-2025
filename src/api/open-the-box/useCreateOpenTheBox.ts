import api from "@/api/axios";
import toast from "react-hot-toast";

// --- 1. INTERFACES (Tipe Data) ---

// Interface untuk satu item soal (Sesuai JSON Anda)
export interface BoxItemPayload {
  text: string; // Contoh: "10"
  answer: string; // Contoh: "Ten"
  options: string[]; // Contoh: ["Ten", "Tin", "Tan"]
}

// Interface untuk data yang dikirim dari Form React
export interface CreateOpenTheBoxPayload {
  title: string; // Judul Game
  description?: string; // Deskripsi
  thumbnail: File | null; // Gambar Cover
  isPublishImmediately: boolean;
  items: BoxItemPayload[]; // Array soal-soal
}

// --- 2. FUNGSI UTAMA (HOOK) ---

export const useCreateOpenTheBox = async (payload: CreateOpenTheBoxPayload) => {
  try {
    const formData = new FormData();

    // A. Masukkan Data Metadata Game (Nama, Deskripsi, Gambar)
    formData.append("name", payload.title);

    if (payload.description) {
      formData.append("description", payload.description);
    }

    if (payload.thumbnail) {
      formData.append("thumbnail_image", payload.thumbnail);
    }

    // Status Publish
    formData.append(
      "is_publish_immediately",
      String(payload.isPublishImmediately),
    );

    // B. MENYUSUN JSON SESUAI PERMINTAAN ANDA
    // Kita lakukan mapping untuk menambahkan 'id' secara otomatis
    const itemsWithId = payload.items.map((item, index) => ({
      id: index + 1, // Generate ID: 1, 2, 3...
      text: item.text, // "10"
      answer: item.answer, // "Ten"
      options: item.options, // ["Ten", "Tin", "Tan"]
    }));

    // Bungkus dalam object { items: [...] }
    const gameJsonStructure = {
      items: itemsWithId,
      // Kita bisa tambah settings default jika perlu
      settings: {
        theme: "default",
      },
    };

    // Konversi Object jadi String JSON untuk dikirim ke Backend
    formData.append("game_json", JSON.stringify(gameJsonStructure));

    // C. Kirim ke API
    const res = await api.post("/api/game/game-type/open-the-box", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Game Open The Box berhasil dibuat!");
    return res.data;
  } catch (err: unknown) {
    console.error("Gagal membuat game:", err);
    toast.error("Gagal membuat game. Cek koneksi atau data Anda.");
    throw err;
  }
};
