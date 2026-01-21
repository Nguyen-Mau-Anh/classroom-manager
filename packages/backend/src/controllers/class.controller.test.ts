/* eslint-disable @typescript-eslint/unbound-method */
import { Request, Response } from 'express';

import { classService } from '../services/class.service';

import { classController } from './class.controller';

// Mock the service
jest.mock('../services/class.service');

describe('ClassController', () => {
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
    it('should create a class', async () => {
      const classData = {
        id: 'class-1',
        name: '10A Math',
        gradeLevel: 10,
        capacity: 30,
        roomId: null,
      };

      mockRequest.body = {
        name: '10A Math',
        gradeLevel: 10,
        capacity: 30,
      };

      (classService.create as jest.Mock).mockResolvedValue(classData);

      await classController.create(mockRequest as Request, mockResponse as Response);

      expect(classService.create).toHaveBeenCalledWith(mockRequest.body); // eslint-disable-line @typescript-eslint/unbound-method
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: classData,
      });
    });
  });

  describe('list', () => {
    it('should list classes', async () => {
      const result = {
        classes: [
          {
            id: 'class-1',
            name: '10A Math',
            gradeLevel: 10,
            capacity: 30,
            enrollmentCount: 25,
          },
        ],
        pagination: { page: 1, pageSize: 20, total: 1 },
      };

      mockRequest.query = { page: '1', pageSize: '20' };

      (classService.list as jest.Mock).mockResolvedValue(result);

      await classController.list(mockRequest as Request, mockResponse as Response);

      expect(classService.list).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: result,
      });
    });
  });

  describe('getById', () => {
    it('should get class by id', async () => {
      const classData = {
        id: 'class-1',
        name: '10A Math',
        gradeLevel: 10,
        capacity: 30,
        students: [],
        waitlist: [],
      };

      mockRequest.params = { id: 'class-1' };

      (classService.getById as jest.Mock).mockResolvedValue(classData);

      await classController.getById(mockRequest as Request, mockResponse as Response);

      expect(classService.getById).toHaveBeenCalledWith('class-1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: classData,
      });
    });
  });

  describe('update', () => {
    it('should update a class', async () => {
      const updatedClass = {
        id: 'class-1',
        name: '10B Math',
        gradeLevel: 10,
        capacity: 35,
        roomId: null,
      };

      mockRequest.params = { id: 'class-1' };
      mockRequest.body = { name: '10B Math', capacity: 35 };

      (classService.update as jest.Mock).mockResolvedValue(updatedClass);

      await classController.update(mockRequest as Request, mockResponse as Response);

      expect(classService.update).toHaveBeenCalledWith('class-1', mockRequest.body);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: updatedClass,
      });
    });
  });

  describe('delete', () => {
    it('should delete a class', async () => {
      mockRequest.params = { id: 'class-1' };

      (classService.delete as jest.Mock).mockResolvedValue(undefined);

      await classController.delete(mockRequest as Request, mockResponse as Response);

      expect(classService.delete).toHaveBeenCalledWith('class-1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Class deleted successfully' },
      });
    });
  });

  describe('getWaitlist', () => {
    it('should get class waitlist', async () => {
      const waitlist = {
        classId: 'class-1',
        isFull: true,
        capacity: 30,
        enrolled: 30,
        waitlistCount: 5,
        waitlist: [
          {
            position: 1,
            studentId: 'student-1',
            studentName: 'John Doe',
            joinedAt: new Date(),
          },
        ],
      };

      mockRequest.params = { id: 'class-1' };

      (classService.getWaitlist as jest.Mock).mockResolvedValue(waitlist);

      await classController.getWaitlist(mockRequest as Request, mockResponse as Response);

      expect(classService.getWaitlist).toHaveBeenCalledWith('class-1');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: waitlist,
      });
    });
  });
});
