import { Request, Response } from 'express';

import { roomController } from './room.controller';
import { roomService } from '../services/room.service';

// Mock the service
jest.mock('../services/room.service');

describe('RoomController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a room', async () => {
      const room = {
        id: 'room-1',
        name: 'Biology Lab 1',
        capacity: 30,
        type: 'lab',
      };

      mockRequest.body = {
        name: 'Biology Lab 1',
        capacity: 30,
        type: 'lab',
      };

      (roomService.create as jest.Mock).mockResolvedValue(room);

      await roomController.create(mockRequest as Request, mockResponse as Response);

      expect(roomService.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: room,
      });
    });
  });

  describe('list', () => {
    it('should list rooms', async () => {
      const result = {
        rooms: [
          {
            id: 'room-1',
            name: 'Biology Lab 1',
            capacity: 30,
            type: 'lab',
            bookedSlots: 10,
          },
        ],
        pagination: { page: 1, pageSize: 20, total: 1 },
      };

      mockRequest.query = { page: '1', pageSize: '20' };

      (roomService.list as jest.Mock).mockResolvedValue(result);

      await roomController.list(mockRequest as Request, mockResponse as Response);

      expect(roomService.list).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });
  });

  describe('getById', () => {
    it('should get room by id', async () => {
      const room = {
        id: 'room-1',
        name: 'Biology Lab 1',
        capacity: 30,
        type: 'lab',
        classes: [],
        timeSlots: [],
      };

      mockRequest.params = { id: 'room-1' };

      (roomService.getById as jest.Mock).mockResolvedValue(room);

      await roomController.getById(mockRequest as Request, mockResponse as Response);

      expect(roomService.getById).toHaveBeenCalledWith('room-1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: room,
      });
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const updatedRoom = {
        id: 'room-1',
        name: 'Chemistry Lab 1',
        capacity: 35,
        type: 'lab',
      };

      mockRequest.params = { id: 'room-1' };
      mockRequest.body = { name: 'Chemistry Lab 1', capacity: 35 };

      (roomService.update as jest.Mock).mockResolvedValue(updatedRoom);

      await roomController.update(mockRequest as Request, mockResponse as Response);

      expect(roomService.update).toHaveBeenCalledWith('room-1', mockRequest.body);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: updatedRoom,
      });
    });
  });

  describe('delete', () => {
    it('should delete a room', async () => {
      mockRequest.params = { id: 'room-1' };

      (roomService.delete as jest.Mock).mockResolvedValue(undefined);

      await roomController.delete(mockRequest as Request, mockResponse as Response);

      expect(roomService.delete).toHaveBeenCalledWith('room-1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Room deleted successfully' },
      });
    });
  });

  describe('getSchedule', () => {
    it('should get room schedule', async () => {
      const schedule = {
        roomId: 'room-1',
        roomName: 'Biology Lab 1',
        week: '2026-01-20',
        schedule: [
          {
            dayOfWeek: 1,
            dayName: 'Monday',
            slots: [
              {
                startTime: '08:00',
                endTime: '09:30',
                class: '10A Biology',
                subject: 'Biology',
                teacher: 'Mr. Smith',
                status: 'SCHEDULED',
              },
            ],
          },
        ],
      };

      mockRequest.params = { id: 'room-1' };
      mockRequest.query = { week: '2026-01-20' };

      (roomService.getRoomSchedule as jest.Mock).mockResolvedValue(schedule);

      await roomController.getSchedule(mockRequest as Request, mockResponse as Response);

      expect(roomService.getRoomSchedule).toHaveBeenCalledWith('room-1', mockRequest.query);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: schedule,
      });
    });
  });
});
