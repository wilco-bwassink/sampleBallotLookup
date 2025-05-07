export interface ElectionEntry {
	IsActive: boolean;
	Announcement: string | null;
}

export type ElectionRecord = Record<string, ElectionEntry>;
