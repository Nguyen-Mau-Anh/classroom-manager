import { Request, Response } from 'express';

import { subjectService } from '../services/subject.service';
import { success } from '../utils/api-response';
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectListQuery,
  AssignTeachersInput,
} from '../utils/subject-validation';

export class SubjectController {
  /**
   * Create a new subject.
   * POST /api/subjects
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateSubjectInput;
    const subject = await subjectService.create(input);
    success(res, subject, 201);
  }

  /**
   * List all subjects with pagination and filtering.
   * GET /api/subjects
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as SubjectListQuery;
    const result = await subjectService.list(query);
    success(res, result);
  }

  /**
   * Get subject by ID with prerequisites and teachers.
   * GET /api/subjects/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const subject = await subjectService.getById(id);
    success(res, subject);
  }

  /**
   * Update subject.
   * PUT /api/subjects/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateSubjectInput;
    const subject = await subjectService.update(id, input);
    success(res, subject);
  }

  /**
   * Soft delete subject.
   * DELETE /api/subjects/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await subjectService.delete(id);
    success(res, { message: 'Subject deleted successfully' });
  }

  /**
   * Get qualified teachers for a subject.
   * GET /api/subjects/:id/teachers
   */
  async getQualifiedTeachers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await subjectService.getQualifiedTeachers(id);
    success(res, result);
  }

  /**
   * Update qualified teachers for a subject.
   * PUT /api/subjects/:id/teachers
   */
  async updateQualifiedTeachers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { teacherIds } = req.body as AssignTeachersInput;
    const result = await subjectService.updateQualifiedTeachers(id, teacherIds);
    success(res, result);
  }
}

export const subjectController = new SubjectController();
