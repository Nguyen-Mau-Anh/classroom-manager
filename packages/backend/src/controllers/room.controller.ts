import { Request, Response } from 'express';

import { roomService } from '../services/room.service';
import { success } from '../utils/api-response';
import {
  CreateRoomInput,
  UpdateRoomInput,
  RoomListQuery,
  RoomScheduleQuery,
} from '../utils/room-validation';

export class RoomController {
  /**
   * Create a new room.
   * POST /api/rooms
   */
  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as CreateRoomInput;
    const room = await roomService.create(input);
    success(res, room, 201);
  }

  /**
   * List all rooms with pagination and utilization stats.
   * GET /api/rooms
   */
  async list(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as RoomListQuery;
    const result = await roomService.list(query);
    success(res, result);
  }

  /**
   * Get room by ID with details.
   * GET /api/rooms/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const room = await roomService.getById(id);
    success(res, room);
  }

  /**
   * Update room.
   * PUT /api/rooms/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const input = req.body as UpdateRoomInput;
    const room = await roomService.update(id, input);
    success(res, room);
  }

  /**
   * Delete room.
   * DELETE /api/rooms/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await roomService.delete(id);
    success(res, { message: 'Room deleted successfully' });
  }

  /**
   * Get room's weekly schedule.
   * GET /api/rooms/:id/schedule
   */
  async getSchedule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const query = req.query as unknown as RoomScheduleQuery;
    const schedule = await roomService.getRoomSchedule(id, query);
    success(res, schedule);
  }
}

export const roomController = new RoomController();
