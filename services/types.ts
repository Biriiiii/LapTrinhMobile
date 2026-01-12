export interface Category { id: number; name: string; }
export interface Artist {
    id: number; name: string; image?: string;
    albumCount?: number; songCount?: number;
}
export interface Album { id: number; name: string; artistName: string; image?: string; price: number; }
export interface Profile {
    id: number; username: string; email: string;
    fullName: string; avatar?: string; bio?: string;
}