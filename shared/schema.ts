import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["nurse", "coordinator"] }).notNull().default("nurse"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  department: varchar("department").notNull(),
  location: varchar("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  payRate: decimal("pay_rate", { precision: 10, scale: 2 }).notNull(),
  patientRatio: varchar("patient_ratio"),
  requirements: jsonb("requirements"),
  additionalNotes: text("additional_notes"),
  priority: varchar("priority", { enum: ["normal", "urgent", "critical"] }).notNull().default("normal"),
  status: varchar("status", { enum: ["open", "claimed", "filled", "cancelled"] }).notNull().default("open"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  claimedBy: varchar("claimed_by").references(() => users.id),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shiftApplications = pgTable("shift_applications", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").references(() => shifts.id).notNull(),
  nurseId: varchar("nurse_id").references(() => users.id).notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const nurseAvailability = pgTable("nurse_availability", {
  id: serial("id").primaryKey(),
  nurseId: varchar("nurse_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("start_time").notNull(), // HH:mm format
  endTime: varchar("end_time").notNull(), // HH:mm format
  isAvailable: boolean("is_available").notNull().default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdShifts: many(shifts, { relationName: "createdShifts" }),
  claimedShifts: many(shifts, { relationName: "claimedShifts" }),
  applications: many(shiftApplications),
  availability: many(nurseAvailability),
}));

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
  creator: one(users, {
    fields: [shifts.createdBy],
    references: [users.id],
    relationName: "createdShifts",
  }),
  claimedBy: one(users, {
    fields: [shifts.claimedBy],
    references: [users.id],
    relationName: "claimedShifts",
  }),
  applications: many(shiftApplications),
}));

export const shiftApplicationsRelations = relations(shiftApplications, ({ one }) => ({
  shift: one(shifts, {
    fields: [shiftApplications.shiftId],
    references: [shifts.id],
  }),
  nurse: one(users, {
    fields: [shiftApplications.nurseId],
    references: [users.id],
  }),
}));

export const nurseAvailabilityRelations = relations(nurseAvailability, ({ one }) => ({
  nurse: one(users, {
    fields: [nurseAvailability.nurseId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  claimedBy: true,
  claimedAt: true,
  status: true,
});

export const insertShiftApplicationSchema = createInsertSchema(shiftApplications).omit({
  id: true,
  appliedAt: true,
  status: true,
});

export const insertNurseAvailabilitySchema = createInsertSchema(nurseAvailability).omit({
  id: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema> & { id: string };
export type User = typeof users.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShiftApplication = z.infer<typeof insertShiftApplicationSchema>;
export type ShiftApplication = typeof shiftApplications.$inferSelect;
export type InsertNurseAvailability = z.infer<typeof insertNurseAvailabilitySchema>;
export type NurseAvailability = typeof nurseAvailability.$inferSelect;

// Extended types with relations
export type ShiftWithDetails = Shift & {
  creator: User;
  claimedBy?: User | null;
  applications: (ShiftApplication & { nurse: User })[];
};
