import { describe, it, expect, beforeEach } from 'vitest';
import { TodoService } from './todo.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService],
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should add a new todo with valid title', () => {
    const title = 'Test Todo';
    const userId = 1;
    const mockResponse = {
      userId: 1,
      id: 201,
      title: 'Test Todo',
      completed: false,
    };

    service.addTodo(title, userId).subscribe(() => {
      expect(service.todos().length).toBeGreaterThan(0);
      const addedTodo = service.todos().find((t) => t.id === mockResponse.id);
      expect(addedTodo?.title).toBe(title);
      expect(addedTodo?.completed).toBe(false);
      expect(service.error()).toBeNull();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe(title);
    expect(req.request.body.userId).toBe(userId);
    req.flush(mockResponse);

    httpMock.verify();
  });

  it('should reject adding todo with invalid title (empty or too long)', () => {
    const invalidTitle = ''; // empty title
    const userId = 1;

    service.addTodo(invalidTitle, userId).subscribe(
      () => {
        // Should not reach here
      },
      (error) => {
        expect(error.message).toBe('Invalid title');
      }
    );

    expect(service.error()).toBe('Description must be between 1 and 250 characters');
    httpMock.expectNone('https://jsonplaceholder.typicode.com/todos');
  });
});
