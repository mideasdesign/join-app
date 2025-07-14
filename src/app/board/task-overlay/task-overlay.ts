import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { Firebase } from '../../shared/services/firebase-services';
import { SuccessServices } from '../../shared/services/success-services';

@Component({
  standalone: true,
  selector: 'app-task-overlay',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-overlay.html',
  styleUrl: './task-overlay.scss'
})
export class TaskOverlay implements OnInit {
  private success = inject(SuccessServices);
  private fb = inject(FormBuilder);
  private firebase = inject(Firebase);
  @Input() taskToEdit?: TaskInterface;

  userList = ['peter müller', 'petra Heinz', 'Erik Huber'];

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: ['Medium', Validators.required],
    category: ['', Validators.required],
    assignedTo: this.fb.array([], Validators.required),
    subtasks: this.fb.array([]),
  });

  get assignedToArray(): FormArray {
    return this.form.get('assignedTo') as FormArray;
  }

  get subtasksArray(): FormArray {
    return this.form.get('subtasks') as FormArray;
  }

  ngOnInit() {
    if (this.taskToEdit) {
      const patch = {
        ...this.taskToEdit,
        dueDate: this.taskToEdit.dueDate?.toISOString().slice(0, 16) || ''
      };
      this.form.patchValue(patch);
      this.taskToEdit.assignedTo.forEach(user => this.assignedToArray.push(this.fb.control(user)));
      this.taskToEdit.subtasks?.forEach(st => {
        this.subtasksArray.push(this.fb.group({
          title: [st.title],
          done: [st.done]
        }));
      });
    }
  }

  onUserToggle(user: string, checked: boolean) {
    const array = this.assignedToArray;
    if (checked) {
      array.push(this.fb.control(user));
    } else {
      const i = array.controls.findIndex(ctrl => ctrl.value === user);
      if (i >= 0) array.removeAt(i);
    }
  }

  onUserCheckboxChange(event: Event, user: string) {
  const input = event.target as HTMLInputElement;
  if (input && input.checked !== undefined) {
    this.onUserToggle(user, input.checked);
  }
}

  isUserSelected(user: string): boolean {
    return this.assignedToArray.value.includes(user);
  }

  addSubtask() {
    this.subtasksArray.push(this.fb.group({
      title: [''],
      done: [false]
    }));
  }

  removeSubtask(index: number) {
    this.subtasksArray.removeAt(index);
  }

  async submit() {
    const raw = this.form.getRawValue();
    const value: TaskInterface = {
      ...raw,
      title: raw.title ?? '',
      description: raw.description ?? '',
      dueDate: new Date(raw.dueDate ?? new Date().toISOString()),
      priority: (raw.priority ?? 'Medium') as 'Low' | 'Medium' | 'High',
      category: raw.category ?? '',
      assignedTo: raw.assignedTo as string[] ?? [],
      subtasks: raw.subtasks as { title: string; done: boolean }[] ?? []
    };

    if (this.taskToEdit?.id) {
      await this.firebase.updateTask(this.taskToEdit.id, value);
      this.success.show('Task aktualisiert');
    } else {
      await this.firebase.createTask(value);
      this.success.show('Neuer Task erstellt');
    }

    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

}
