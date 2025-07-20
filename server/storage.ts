import {
  users,
  shifts,
  shiftApplications,
  nurseAvailability,
  type User,
  type UpsertUser,
  type InsertShift,
  type Shift,
  type ShiftWithDetails,
  type InsertShiftApplication,
  type ShiftApplication,
  type InsertNurseAvailability,
  type NurseAvailability,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Shift operations
  createShift(shift: InsertShift): Promise<Shift>;
  getShifts(filters?: {
    status?: string[];
    department?: string;
    startDate?: Date;
    endDate?: Date;
    createdBy?: string;
  }): Promise<ShiftWithDetails[]>;
  getShiftById(id: number): Promise<ShiftWithDetails | undefined>;
  updateShift(id: number, updates: Partial<Shift>): Promise<Shift | undefined>;
  claimShift(shiftId: number, nurseId: string): Promise<Shift | undefined>;

  // Shift application operations
  applyForShift(application: InsertShiftApplication): Promise<ShiftApplication>;
  getShiftApplications(shiftId: number): Promise<(ShiftApplication & { nurse: User })[]>;
  getUserApplications(userId: string): Promise<(ShiftApplication & { shift: Shift })[]>;

  // Availability operations
  setNurseAvailability(availability: InsertNurseAvailability[]): Promise<NurseAvailability[]>;
  getNurseAvailability(nurseId: string): Promise<NurseAvailability[]>;

  // Analytics
  getUserShiftStats(userId: string): Promise<{
    weeklyEarnings: number;
    hoursWorked: number;
    shiftsClaimed: number;
    averageRating: number;
  }>;

  getCoordinatorStats(coordinatorId: string): Promise<{
    openShifts: number;
    fillRate: number;
    activeNurses: number;
    weeklyCost: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Shift operations
  async createShift(shiftData: InsertShift): Promise<Shift> {
    const [shift] = await db.insert(shifts).values(shiftData).returning();
    return shift;
  }

  async getShifts(filters?: {
    status?: string[];
    department?: string;
    startDate?: Date;
    endDate?: Date;
    createdBy?: string;
  }): Promise<ShiftWithDetails[]> {
    let query = db
      .select({
        shift: shifts,
        creator: users,
      })
      .from(shifts)
      .leftJoin(users, eq(shifts.createdBy, users.id))
      .orderBy(desc(shifts.createdAt));

    // Apply filters
    const conditions = [];
    if (filters?.status) {
      conditions.push(inArray(shifts.status, filters.status as any));
    }
    if (filters?.department) {
      conditions.push(eq(shifts.department, filters.department));
    }
    if (filters?.startDate) {
      conditions.push(gte(shifts.startTime, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(shifts.endTime, filters.endDate));
    }
    if (filters?.createdBy) {
      conditions.push(eq(shifts.createdBy, filters.createdBy));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query;

    // Get applications for each shift
    const shiftIds = result.map(r => r.shift.id);
    const applications = shiftIds.length > 0 ? await db
      .select({
        application: shiftApplications,
        nurse: users,
      })
      .from(shiftApplications)
      .leftJoin(users, eq(shiftApplications.nurseId, users.id))
      .where(inArray(shiftApplications.shiftId, shiftIds)) : [];

    // Group applications by shift
    const applicationsByShift = applications.reduce((acc, app) => {
      if (!acc[app.application.shiftId]) {
        acc[app.application.shiftId] = [];
      }
      acc[app.application.shiftId].push({
        ...app.application,
        nurse: app.nurse!,
      });
      return acc;
    }, {} as Record<number, (ShiftApplication & { nurse: User })[]>);

    return result.map(r => ({
      ...r.shift,
      creator: r.creator!,
      claimedBy: null, // Will be populated if needed
      applications: applicationsByShift[r.shift.id] || [],
    }));
  }

  async getShiftById(id: number): Promise<ShiftWithDetails | undefined> {
    const [result] = await db
      .select({
        shift: shifts,
        creator: users,
      })
      .from(shifts)
      .leftJoin(users, eq(shifts.createdBy, users.id))
      .where(eq(shifts.id, id));

    if (!result) return undefined;

    // Get claimed nurse if exists
    let claimedBy = null;
    if (result.shift.claimedBy) {
      [claimedBy] = await db
        .select()
        .from(users)
        .where(eq(users.id, result.shift.claimedBy));
    }

    // Get applications
    const applications = await db
      .select({
        application: shiftApplications,
        nurse: users,
      })
      .from(shiftApplications)
      .leftJoin(users, eq(shiftApplications.nurseId, users.id))
      .where(eq(shiftApplications.shiftId, id));

    return {
      ...result.shift,
      creator: result.creator!,
      claimedBy,
      applications: applications.map(app => ({
        ...app.application,
        nurse: app.nurse!,
      })),
    };
  }

  async updateShift(id: number, updates: Partial<Shift>): Promise<Shift | undefined> {
    const [shift] = await db
      .update(shifts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(shifts.id, id))
      .returning();
    return shift;
  }

  async claimShift(shiftId: number, nurseId: string): Promise<Shift | undefined> {
    const [shift] = await db
      .update(shifts)
      .set({
        claimedBy: nurseId,
        claimedAt: new Date(),
        status: "claimed",
        updatedAt: new Date(),
      })
      .where(and(eq(shifts.id, shiftId), eq(shifts.status, "open")))
      .returning();
    return shift;
  }

  // Shift application operations
  async applyForShift(application: InsertShiftApplication): Promise<ShiftApplication> {
    const [app] = await db
      .insert(shiftApplications)
      .values(application)
      .returning();
    return app;
  }

  async getShiftApplications(shiftId: number): Promise<(ShiftApplication & { nurse: User })[]> {
    const applications = await db
      .select({
        application: shiftApplications,
        nurse: users,
      })
      .from(shiftApplications)
      .leftJoin(users, eq(shiftApplications.nurseId, users.id))
      .where(eq(shiftApplications.shiftId, shiftId));

    return applications.map(app => ({
      ...app.application,
      nurse: app.nurse!,
    }));
  }

  async getUserApplications(userId: string): Promise<(ShiftApplication & { shift: Shift })[]> {
    const applications = await db
      .select({
        application: shiftApplications,
        shift: shifts,
      })
      .from(shiftApplications)
      .leftJoin(shifts, eq(shiftApplications.shiftId, shifts.id))
      .where(eq(shiftApplications.nurseId, userId));

    return applications.map(app => ({
      ...app.application,
      shift: app.shift!,
    }));
  }

  // Availability operations
  async setNurseAvailability(availability: InsertNurseAvailability[]): Promise<NurseAvailability[]> {
    if (availability.length === 0) return [];

    const nurseId = availability[0].nurseId;
    
    // Delete existing availability
    await db.delete(nurseAvailability).where(eq(nurseAvailability.nurseId, nurseId));

    // Insert new availability
    const result = await db.insert(nurseAvailability).values(availability).returning();
    return result;
  }

  async getNurseAvailability(nurseId: string): Promise<NurseAvailability[]> {
    return await db
      .select()
      .from(nurseAvailability)
      .where(eq(nurseAvailability.nurseId, nurseId));
  }

  // Analytics
  async getUserShiftStats(userId: string): Promise<{
    weeklyEarnings: number;
    hoursWorked: number;
    shiftsClaimed: number;
    averageRating: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.claimedBy, userId),
          gte(shifts.startTime, oneWeekAgo)
        )
      );

    const weeklyEarnings = weeklyShifts.reduce((total, shift) => {
      const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
      return total + (hours * parseFloat(shift.payRate));
    }, 0);

    const hoursWorked = weeklyShifts.reduce((total, shift) => {
      return total + ((shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60));
    }, 0);

    const allClaimedShifts = await db
      .select()
      .from(shifts)
      .where(eq(shifts.claimedBy, userId));

    return {
      weeklyEarnings: Math.round(weeklyEarnings),
      hoursWorked: Math.round(hoursWorked),
      shiftsClaimed: allClaimedShifts.length,
      averageRating: 4.9, // Mock rating for now
    };
  }

  async getCoordinatorStats(coordinatorId: string): Promise<{
    openShifts: number;
    fillRate: number;
    activeNurses: number;
    weeklyCost: number;
  }> {
    const openShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.createdBy, coordinatorId),
          eq(shifts.status, "open")
        )
      );

    const allShifts = await db
      .select()
      .from(shifts)
      .where(eq(shifts.createdBy, coordinatorId));

    const filledShifts = allShifts.filter(s => s.status === "claimed" || s.status === "filled");
    const fillRate = allShifts.length > 0 ? (filledShifts.length / allShifts.length) * 100 : 0;

    const activeNurses = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "nurse"),
          eq(users.isActive, true)
        )
      );

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyShifts = await db
      .select()
      .from(shifts)
      .where(
        and(
          eq(shifts.createdBy, coordinatorId),
          gte(shifts.startTime, oneWeekAgo),
          inArray(shifts.status, ["claimed", "filled"])
        )
      );

    const weeklyCost = weeklyShifts.reduce((total, shift) => {
      const hours = (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
      return total + (hours * parseFloat(shift.payRate));
    }, 0);

    return {
      openShifts: openShifts.length,
      fillRate: Math.round(fillRate),
      activeNurses: activeNurses.length,
      weeklyCost: Math.round(weeklyCost),
    };
  }
}

export const storage = new DatabaseStorage();
