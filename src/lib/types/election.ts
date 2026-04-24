export interface ElectionEntry {
  ElectionId: string;
  ElectionName: string;
  ElectionNameSpanish: string | null;
  IsActive: boolean;
  IsPrimary: boolean;
  Announcement: string | null;
  AnnouncementSpanish: string | null;
}

export type ElectionMap = Record<string, ElectionEntry>;
export type ElectionPayload =
  | ElectionEntry[]
  | Record<
      string,
      {
        IsActive?: boolean;
        IsPrimary?: boolean;
        ElectionNameSpanish?: string | null;
        Announcement?: string | null;
        AnnouncementSpanish?: string | null;
      }
    >;
