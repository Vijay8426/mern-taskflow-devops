import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";

const router = Router();

router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tasks = await Task.find().sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const title =
        typeof req.body?.title === "string"
          ? req.body.title.trim()
          : "";

      if (!title || title.length > 200) {
        res.status(400).json({
          message: "Title must contain 1–200 characters",
        });
        return;
      }

      const task = await Task.create({ title });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const updates: { title?: string; completed?: boolean } = {};

      if (typeof req.body?.completed === "boolean") {
        updates.completed = req.body.completed;
      }

      if (typeof req.body?.title === "string") {
        const title = req.body.title.trim();

        if (!title || title.length > 200) {
          res.status(400).json({ message: "Invalid title" });
          return;
        }

        updates.title = title;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          message: "No valid updates provided",
        });
        return;
      }

      const task = await Task.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const task = await Task.findByIdAndDelete(id);

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

export default router;