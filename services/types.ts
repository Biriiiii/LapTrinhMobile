// --- CATEGORY INTERFACE ---
export interface Category {
    id: number;
    name: string;
}

// --- ARTIST INTERFACE ---
export interface Artist {
    id: number;
    name: string;
    image?: string;
    albumCount?: number;
    songCount?: number;
}

// --- ALBUM INTERFACE (Cập nhật theo Java Entity của bạn) ---
export interface Album {
    id: number;
    title: string;        // Java dùng title (kế thừa từ Media)
    artistName?: string;
    coverUrl?: string;    // Java dùng cover_url
    price: number;
    releaseYear?: number; // Java dùng release_year
    categoryName?: string;
    description?: string;
}

// --- PROFILE INTERFACE (Cập nhật theo JSON Postman của bạn) ---
export interface Profile {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    walletBalance: number; // Trường quan trọng bạn vừa test thành công
    roleName?: string;
    avatar?: string;
    bio?: string;
}
