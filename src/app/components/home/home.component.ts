import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog.component';
import { AuthService } from "../../services/auth.service";
import { TodoService } from "../../services/todo.service";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    HeaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly todoService = inject(TodoService);
  private readonly dialog = inject(MatDialog);

  todos = this.todoService.todos;
  isLoading = this.todoService.isLoading;
  error = this.todoService.error;

  newTodoTitle = signal('');
  editingId = signal<number | null>(null);
  editingTitle = signal('');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.todoService.fetchTodosByUserId(user.id).subscribe();
    }
  }

  onEditTitleChange(title: string): void {
    this.editingTitle.set(title);
  }

  addTodo(): void {
    const user = this.authService.currentUser();
    if (user && this.newTodoTitle().trim()) {
      this.todoService.addTodo(this.newTodoTitle(), user.id).subscribe(() => {
        this.newTodoTitle.set('');
      });
    }
  }

  startEdit(todoId: number, currentTitle: string): void {
    this.editingId.set(todoId);
    this.editingTitle.set(currentTitle);
  }

  saveEdit(todoId: number): void {
    if (this.editingTitle().trim()) {
      this.todoService.updateTodo(
        todoId,
        this.editingTitle(),
        undefined
      ).subscribe(() => {
        this.resetEdit();
      });
    }
  }

  resetEdit(): void {
    this.editingId.set(null);
    this.editingTitle.set('');
  }

  toggleTodo(todoId: number): void {
    this.todoService.toggleTodo(todoId).subscribe();
  }

  openDeleteConfirmation(todoId: number, title: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {title},
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.todoService.deleteTodo(todoId).subscribe({
          error: (error) => {
            console.error('Error deleting todo:', error);
          }
        });
      }
    });
  }

  dismissError(): void {
    this.todoService.clearError();
  }
}
