import { Request, Response } from 'express';

import { studentService } from '../services/student.service';
import { success } from '../utils/api-response';
import {
  CreateStudentInput,
  UpdateStudentInput,
  StudentListQuery,
  ImportConfirmInput,
} from '../utils/student-validation';

export class StudentController {
  /**
   * Create a new student.
   * POST /api/students
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateStudentInput;
    const student = await studentService.create(input);
    success(res, student, 201);
  }

  /**
   * List all students with pagination and filtering.
   * GET /api/students
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as StudentListQuery;
    const result = await studentService.list(query);
    success(res, result);
  }

  /**
   * Get student by ID.
   * GET /api/students/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const student = await studentService.getById(id);
    success(res, student);
  }

  /**
   * Update student.
   * PUT /api/students/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateStudentInput;
    const student = await studentService.update(id, input);
    success(res, student);
  }

  /**
   * Soft delete student (deactivate).
   * DELETE /api/students/:id
   */
  async softDelete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await studentService.softDelete(id);
    success(res, { message: 'Student deactivated successfully' });
  }

  /**
   * Upload and parse CSV file for student import.
   * POST /api/students/import
   */
  async importPreview(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded',
          details: [{ field: 'file', message: 'CSV file is required' }],
        },
      });
      return;
    }

    const result = await studentService.parseCSV(req.file.buffer);
    success(res, result);
  }

  /**
   * Confirm and bulk create students from CSV.
   * POST /api/students/import/confirm
   */
  async importConfirm(req: Request, res: Response): Promise<void> {
    const input = req.body as ImportConfirmInput;
    const result = await studentService.bulkCreate(input);
    success(res, result, 201);
  }
}

export const studentController = new StudentController();
