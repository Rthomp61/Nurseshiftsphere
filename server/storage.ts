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
  updateUserRole(userId: string, role: 'nurse' | 'coordinator'): Promise<User | undefined>;

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
  // Initialize with presentation mock data
  private async initializeMockData() {
    try {
      // Check if we already have shifts
      const existingShifts = await db.select().from(shifts).limit(1);
      if (existingShifts.length > 0) return;

      // Add mock shifts for presentation
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(7, 0, 0, 0);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(19, 0, 0, 0);

      const urgent = new Date();
      urgent.setDate(urgent.getDate() + 1);
      urgent.setHours(15, 0, 0, 0);

      const mockShifts = [
        {
          title: "ICU Day Shift",
          department: "ICU",
          location: "City General Hospital",
          startTime: tomorrow,
          endTime: new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000),
          payRate: "55.00",
          requirements: "ACLS, BLS, 2+ years ICU experience",
          additionalNotes: "High acuity unit, critical care experience preferred",
          status: "open" as const,
          priority: "normal" as const,
          createdBy: "demo-coordinator-1"
        },
        {
          title: "Emergency Department - Night",
          department: "Emergency",
          location: "Regional Medical Center",
          startTime: nextWeek,
          endTime: new Date(nextWeek.getTime() + 12 * 60 * 60 * 1000),
          payRate: "62.00",
          requirements: "ACLS, BLS, PALS, ER experience",
          additionalNotes: "Fast-paced environment, trauma experience a plus",
          status: "open" as const,
          priority: "high" as const,
          createdBy: "demo-coordinator-2"
        },
        {
          title: "URGENT: Med-Surg Coverage",
          department: "Medical-Surgical",
          location: "University Hospital",
          startTime: urgent,
          endTime: new Date(urgent.getTime() + 8 * 60 * 60 * 1000),
          payRate: "48.00",
          requirements: "BLS, Med-Surg experience",
          additionalNotes: "Call-out coverage needed immediately",
          status: "open" as const,
          priority: "critical" as const,
          createdBy: "demo-coordinator-1"
        },
        {
          title: "Pediatric Ward - Weekend",
          department: "Pediatrics",
          location: "Children's Hospital",
          startTime: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000),
          endTime: new Date(nextWeek.getTime() + 36 * 60 * 60 * 1000),
          payRate: "52.00",
          requirements: "BLS, PALS, Pediatric experience",
          additionalNotes: "Ages 2-17, family-centered care environment",
          status: "open" as const,
          priority: "normal" as const,
          createdBy: "demo-coordinator-2"
        }
      ];

      await db.insert(shifts).values(mockShifts);
    } catch (error) {
      console.log("Mock data initialization skipped:", error);
    }
  }

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

  async updateUserRole(userId: string, role: 'nurse' | 'coordinator'): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
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
    claimedBy?: string;
    notExpired?: boolean;
    includeExpired?: boolean;
  }): Promise<ShiftWithDetails[]> {
    // Initialize mock data for presentation
    await this.initializeMockData();
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
    if (filters?.claimedBy) {
      conditions.push(eq(shifts.claimedBy, filters.claimedBy));
    }
    // Filter out expired shifts (where start time has passed) unless includeExpired is true
    if (filters?.notExpired || (!filters?.includeExpired && filters?.notExpired !== false)) {
      conditions.push(gte(shifts.startTime, new Date()));
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
      claimedBy: r.shift.claimedBy, // Keep the actual claimedBy value
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
