import { Request, Response } from 'express';

import { teacherService } from '../services/teacher.service';
import { success } from '../utils/api-response';
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  TeacherListQuery,
} from '../utils/teacher-validation';

export class TeacherController {
  /**
   * Create a new teacher.
   * POST /api/teachers
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateTeacherInput;
    const teacher = await teacherService.create(input);
    success(res, teacher, 201);
  }

  /**
   * List all teachers with pagination.
   * GET /api/teachers
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as TeacherListQuery;
    const result = await teacherService.list(query);
    success(res, result);
  }

  /**
   * Get teacher by ID.
   * GET /api/teachers/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const teacher = await teacherService.getById(id);
    success(res, teacher);
  }

  /**
   * Update teacher.
   * PUT /api/teachers/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateTeacherInput;
    const teacher = await teacherService.update(id, input);
    success(res, teacher);
  }

  /**
   * Soft delete teacher (deactivate).
   * DELETE /api/teachers/:id
   */
  async softDelete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await teacherService.softDelete(id);
    success(res, { message: 'Teacher deactivated successfully' });
  }

  /**
   * Get teacher workload.
   * GET /api/teachers/:id/workload
   */
  async getWorkload(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const workload = await teacherService.calculateWorkload(id);
    success(res, workload);
  }
}

export const teacherController = new TeacherController();
