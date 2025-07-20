import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import { insertShiftSchema, insertShiftApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Shift routes
  app.get('/api/shifts', isAuthenticated, async (req: any, res) => {
    try {
      const { status, department, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status) filters.status = Array.isArray(status) ? status : [status];
      if (department) filters.department = department;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);

      const shifts = await storage.getShifts(filters);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.get('/api/shifts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid shift ID" });
      }
      
      const shift = await storage.getShiftById(id);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      res.json(shift);
    } catch (error) {
      console.error("Error fetching shift:", error);
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  app.post('/api/shifts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'coordinator') {
        return res.status(403).json({ message: "Only coordinators can create shifts" });
      }

      const shiftData = insertShiftSchema.parse({
        ...req.body,
        createdBy: userId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      });

      const shift = await storage.createShift(shiftData);
      res.status(201).json(shift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      }
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  app.patch('/api/shifts/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'nurse') {
        return res.status(403).json({ message: "Only nurses can claim shifts" });
      }

      const shiftId = parseInt(req.params.id);
      const shift = await storage.getShiftById(shiftId);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      if (shift.status !== 'open') {
        return res.status(400).json({ message: "Shift is not available for claiming" });
      }

      // Check if shift starts within 3 hours
      const now = new Date();
      const timeDiff = shift.startTime.getTime() - now.getTime();
      const hoursUntilShift = timeDiff / (1000 * 60 * 60);

      if (hoursUntilShift < 3) {
        return res.status(400).json({ 
          message: "Cannot claim shift less than 3 hours before start time",
          hoursUntilShift: Math.round(hoursUntilShift * 100) / 100
        });
      }

      const claimedShift = await storage.claimShift(shiftId, userId);
      
      if (!claimedShift) {
        return res.status(409).json({ message: "Shift was already claimed by another nurse" });
      }

      res.json(claimedShift);
    } catch (error) {
      console.error("Error claiming shift:", error);
      res.status(500).json({ message: "Failed to claim shift" });
    }
  });

  // Shift application routes
  app.post('/api/shifts/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'nurse') {
        return res.status(403).json({ message: "Only nurses can apply for shifts" });
      }

      const shiftId = parseInt(req.params.id);
      const applicationData = insertShiftApplicationSchema.parse({
        shiftId,
        nurseId: userId,
      });

      const application = await storage.applyForShift(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      console.error("Error applying for shift:", error);
      res.status(500).json({ message: "Failed to apply for shift" });
    }
  });

  // User stats routes
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let stats;
      if (user.role === 'nurse') {
        stats = await storage.getUserShiftStats(userId);
      } else if (user.role === 'coordinator') {
        stats = await storage.getCoordinatorStats(userId);
      } else {
        return res.status(400).json({ message: "Invalid user role" });
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // My shifts route
  app.get('/api/my-shifts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let shifts;
      if (user.role === 'nurse') {
        // Get claimed shifts for nurse
        shifts = await storage.getShifts({ 
          status: ['claimed', 'filled'],
        });
        shifts = shifts.filter(shift => shift.claimedBy?.id === userId);
      } else if (user.role === 'coordinator') {
        // Get created shifts for coordinator
        shifts = await storage.getShifts({ createdBy: userId });
      } else {
        return res.status(400).json({ message: "Invalid user role" });
      }

      res.json(shifts);
    } catch (error) {
      console.error("Error fetching user shifts:", error);
      res.status(500).json({ message: "Failed to fetch user shifts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
