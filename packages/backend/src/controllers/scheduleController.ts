import { Request, Response } from 'express';

import { scheduleService } from '../services/scheduleService';
import { success } from '../utils/api-response';
import {
  CreateTimeSlotInput,
  UpdateTimeSlotInput,
  ScheduleListQuery,
  GetAvailableTeachersQuery,
  GetAvailableRoomsQuery,
} from '../utils/schedule-validation';

export class ScheduleController {
  /**
   * Create a new time slot.
   * POST /api/schedule
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateTimeSlotInput;
    const timeSlot = await scheduleService.create(input);
    success(res, timeSlot, 201);
  }

  /**
   * List all time slots with pagination and filtering.
   * GET /api/schedule
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ScheduleListQuery;
    const result = await scheduleService.list(query);
    success(res, result);
  }

  /**
   * Get time slot by ID.
   * GET /api/schedule/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const timeSlot = await scheduleService.getById(id);
    success(res, timeSlot);
  }

  /**
   * Update time slot.
   * PUT /api/schedule/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateTimeSlotInput;
    const timeSlot = await scheduleService.update(id, input);
    success(res, timeSlot);
  }

  /**
   * Delete time slot.
   * DELETE /api/schedule/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await scheduleService.delete(id);
    success(res, { message: 'Time slot deleted successfully' });
  }

  /**
   * Validate constraints without saving.
   * POST /api/schedule/validate
   */
  async validate(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateTimeSlotInput;
    const result = await scheduleService.validateOnly(input);
    success(res, result);
  }

  /**
   * Get available teachers for a time slot.
   * GET /api/schedule/available-teachers
   */
  async getAvailableTeachers(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as GetAvailableTeachersQuery;
    const result = await scheduleService.getAvailableTeachers(query);
    success(res, result);
  }

  /**
   * Get available rooms for a time slot.
   * GET /api/schedule/available-rooms
   */
  async getAvailableRooms(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as GetAvailableRoomsQuery;
    const result = await scheduleService.getAvailableRooms(query);
    success(res, result);
  }
}

export const scheduleController = new ScheduleController();
