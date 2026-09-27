import { eq, or, ilike, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { invitations, rsvps } from './schema.ts';
import { InvitationData, RSVPRecord, RSVPReply, AttendanceStatus } from '../types/invitation';

export async function getAllInvitationsFromDb(): Promise<InvitationData[]> {
  try {
    const records = await db.select().from(invitations).orderBy(invitations.createdAt);
    return records.map((r) => {
      const data = r.data as any;
      return {
        ...data,
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category as any,
        isPublished: r.isPublished,
        viewsCount: r.viewsCount,
        createdAt: r.createdAt ? r.createdAt.toISOString() : data.createdAt,
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : data.updatedAt,
      };
    });
  } catch (error) {
    console.error('Failed to query invitations from database:', error);
    throw new Error('Database query failed for invitations.', { cause: error });
  }
}

export async function getInvitationBySlugOrIdFromDb(slugOrId: string): Promise<InvitationData | null> {
  try {
    const clean = slugOrId.trim();
    const records = await db
      .select()
      .from(invitations)
      .where(or(ilike(invitations.slug, clean), ilike(invitations.id, clean), eq(invitations.slug, clean), eq(invitations.id, clean)))
      .limit(1);

    if (records.length === 0) return null;

    const r = records[0];
    const data = r.data as any;

    // Also fetch associated RSVPs
    const rsvpRecords = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.invitationId, r.id))
      .orderBy(sql`${rsvps.createdAt} DESC`);

    const formattedRsvps: RSVPRecord[] = rsvpRecords.map((item) => {
      const mappedStatus: AttendanceStatus =
        item.kehadiran === 'tidak_hadir' || item.kehadiran === 'not_attending'
          ? 'not_attending'
          : item.kehadiran === 'ragu' || item.kehadiran === 'uncertain'
          ? 'uncertain'
          : 'attending';

      return {
        id: item.id,
        invitationId: item.invitationId,
        nama: item.nama,
        status: mappedStatus,
        jumlahTamu: item.jumlahTamu,
        pesanDoa: item.ucapan || '',
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
        replies: (item.replies as RSVPReply[]) || [],
      };
    });

    return {
      ...data,
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category as any,
      isPublished: r.isPublished,
      viewsCount: r.viewsCount,
      rsvpList: formattedRsvps,
      createdAt: r.createdAt ? r.createdAt.toISOString() : data.createdAt,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : data.updatedAt,
    };
  } catch (error) {
    console.error('Failed to query invitation by slug/id:', error);
    throw new Error('Database query failed for invitation.', { cause: error });
  }
}

export async function upsertInvitationInDb(
  invData: InvitationData,
  userId?: string
): Promise<InvitationData> {
  try {
    const existing = await db
      .select({ id: invitations.id, viewsCount: invitations.viewsCount })
      .from(invitations)
      .where(eq(invitations.id, invData.id))
      .limit(1);

    const views = existing.length > 0 ? existing[0].viewsCount : (invData.viewsCount || 0);

    const result = await db
      .insert(invitations)
      .values({
        id: invData.id,
        slug: invData.slug,
        title: invData.title,
        category: invData.category || 'wedding',
        isPublished: invData.isPublished !== false,
        viewsCount: views,
        userId: userId || null,
        data: invData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: invitations.id,
        set: {
          slug: invData.slug,
          title: invData.title,
          category: invData.category || 'wedding',
          isPublished: invData.isPublished !== false,
          data: invData,
          updatedAt: new Date(),
        },
      })
      .returning();

    const saved = result[0];
    return {
      ...(saved.data as any),
      id: saved.id,
      slug: saved.slug,
      title: saved.title,
      viewsCount: saved.viewsCount,
      updatedAt: saved.updatedAt ? saved.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to upsert invitation:', error);
    throw new Error('Database write failed for invitation.', { cause: error });
  }
}

export async function deleteInvitationFromDb(id: string): Promise<boolean> {
  try {
    await db.delete(invitations).where(eq(invitations.id, id));
    return true;
  } catch (error) {
    console.error('Failed to delete invitation:', error);
    throw new Error('Database delete failed for invitation.', { cause: error });
  }
}

export async function deleteAllDraftsFromDb(): Promise<number> {
  try {
    const result = await db
      .delete(invitations)
      .where(eq(invitations.isPublished, false))
      .returning({ id: invitations.id });
    return result.length;
  } catch (error) {
    console.error('Failed to delete drafts from database:', error);
    throw new Error('Database delete drafts failed.', { cause: error });
  }
}

export async function deleteAllInvitationsFromDb(): Promise<number> {
  try {
    // Delete RSVPs first due to foreign-key relationship
    await db.delete(rsvps);
    const result = await db.delete(invitations).returning({ id: invitations.id });
    return result.length;
  } catch (error) {
    console.error('Failed to delete all invitations from database:', error);
    throw new Error('Database delete all invitations failed.', { cause: error });
  }
}

export async function incrementInvitationViewsInDb(slugOrId: string): Promise<number> {
  try {
    const result = await db
      .update(invitations)
      .set({
        viewsCount: sql`${invitations.viewsCount} + 1`,
      })
      .where(or(eq(invitations.slug, slugOrId), eq(invitations.id, slugOrId)))
      .returning({ viewsCount: invitations.viewsCount });

    return result[0]?.viewsCount || 0;
  } catch (error) {
    console.error('Failed to increment views:', error);
    return 0;
  }
}

export async function addRSVPToDb(invitationId: string, record: RSVPRecord): Promise<RSVPRecord> {
  try {
    const result = await db
      .insert(rsvps)
      .values({
        id: record.id,
        invitationId,
        nama: record.nama,
        kehadiran: record.status,
        jumlahTamu: record.jumlahTamu || 1,
        ucapan: record.pesanDoa || '',
        replies: record.replies || [],
      })
      .onConflictDoUpdate({
        target: rsvps.id,
        set: {
          kehadiran: record.status,
          jumlahTamu: record.jumlahTamu || 1,
          ucapan: record.pesanDoa || '',
        },
      })
      .returning();

    const saved = result[0];
    const mappedStatus: AttendanceStatus =
      saved.kehadiran === 'tidak_hadir' || saved.kehadiran === 'not_attending'
        ? 'not_attending'
        : saved.kehadiran === 'ragu' || saved.kehadiran === 'uncertain'
        ? 'uncertain'
        : 'attending';

    return {
      id: saved.id,
      invitationId: saved.invitationId,
      nama: saved.nama,
      status: mappedStatus,
      jumlahTamu: saved.jumlahTamu,
      pesanDoa: saved.ucapan || '',
      createdAt: saved.createdAt ? saved.createdAt.toISOString() : new Date().toISOString(),
      replies: (saved.replies as RSVPReply[]) || [],
    };
  } catch (error) {
    console.error('Failed to add RSVP:', error);
    throw new Error('Database write failed for RSVP.', { cause: error });
  }
}

export async function getRSVPsFromDb(invitationId: string): Promise<RSVPRecord[]> {
  try {
    const records = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.invitationId, invitationId))
      .orderBy(sql`${rsvps.createdAt} DESC`);

    return records.map((item) => {
      const mappedStatus: AttendanceStatus =
        item.kehadiran === 'tidak_hadir' || item.kehadiran === 'not_attending'
          ? 'not_attending'
          : item.kehadiran === 'ragu' || item.kehadiran === 'uncertain'
          ? 'uncertain'
          : 'attending';

      return {
        id: item.id,
        invitationId: item.invitationId,
        nama: item.nama,
        status: mappedStatus,
        jumlahTamu: item.jumlahTamu,
        pesanDoa: item.ucapan || '',
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
        replies: (item.replies as RSVPReply[]) || [],
      };
    });
  } catch (error) {
    console.error('Failed to query RSVPs:', error);
    return [];
  }
}

export async function addRSVPReplyInDb(
  _invitationId: string,
  rsvpId: string,
  reply: RSVPReply
): Promise<RSVPRecord | null> {
  try {
    const existing = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.id, rsvpId))
      .limit(1);

    if (existing.length === 0) return null;

    const currentReplies = (existing[0].replies as RSVPReply[]) || [];
    const updatedReplies = [...currentReplies, reply];

    const result = await db
      .update(rsvps)
      .set({ replies: updatedReplies })
      .where(eq(rsvps.id, rsvpId))
      .returning();

    const saved = result[0];
    const mappedStatus: AttendanceStatus =
      saved.kehadiran === 'tidak_hadir' || saved.kehadiran === 'not_attending'
        ? 'not_attending'
        : saved.kehadiran === 'ragu' || saved.kehadiran === 'uncertain'
        ? 'uncertain'
        : 'attending';

    return {
      id: saved.id,
      invitationId: saved.invitationId,
      nama: saved.nama,
      status: mappedStatus,
      jumlahTamu: saved.jumlahTamu,
      pesanDoa: saved.ucapan || '',
      createdAt: saved.createdAt ? saved.createdAt.toISOString() : new Date().toISOString(),
      replies: (saved.replies as RSVPReply[]) || [],
    };
  } catch (error) {
    console.error('Failed to add reply:', error);
    throw new Error('Database write failed for reply.', { cause: error });
  }
}
