import { Request, Response } from 'express';

import { classService } from '../services/class.service';
import { success } from '../utils/api-response';
import { CreateClassInput, UpdateClassInput, ClassListQuery } from '../utils/class-validation';

export class ClassController {
  /**
   * Create a new class.
   * POST /api/classes
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateClassInput;
    const classData = await classService.create(input);
    success(res, classData, 201);
  }

  /**
   * List all classes with pagination and enrollment stats.
   * GET /api/classes
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ClassListQuery;
    const result = await classService.list(query);
    success(res, result);
  }

  /**
   * Get class by ID with students and waitlist.
   * GET /api/classes/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const classData = await classService.getById(id);
    success(res, classData);
  }

  /**
   * Update class.
   * PUT /api/classes/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateClassInput;
    const classData = await classService.update(id, input);
    success(res, classData);
  }

  /**
   * Delete class.
   * DELETE /api/classes/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await classService.delete(id);
    success(res, { message: 'Class deleted successfully' });
  }

  /**
   * Get waitlist for a class.
   * GET /api/classes/:id/waitlist
   */
  async getWaitlist(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const waitlist = await classService.getWaitlist(id);
    success(res, waitlist);
  }
}

export const classController = new ClassController();
