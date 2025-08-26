import { Component, Input, inject, OnInit, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskService } from '../../Shared/firebase/firebase-services/task-service';
import { Firebase } from '../../Shared/firebase/firebase-services/firebase-services';
import { SuccessServices } from '../../Shared/firebase/firebase-services/success-services';
import { ContactsInterface } from '../../interfaces/contacts-interface';

@Component({
  selector: 'app-task-overlay',
 imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-overlay.html',
  styleUrl: './task-overlay.scss'
})

export class TaskOverlay implements OnInit, OnChanges{
  private success = inject(SuccessServices);
  private taskService = inject(TaskService);
  private firebase = inject(Firebase);
  public ContactsList: ContactsInterface[] = [];
  @Input() taskToEdit?: TaskInterface;
  @Input() contactToEdit?: ContactsInterface;

  // Custom dropdown state
  isDropdownOpen = false;
  isCategoryDropdownOpen = false;

form: FormGroup;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    status:'todo',
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    priority: ['medium', Validators.required],
    assignedTo: [[], Validators.required],
    category: ['', Validators.required],
    subtasks: this.fb.array([this.fb.control('', Validators.required)])
  });
}

get subtasks(): FormArray {
  return this.form.get('subtasks') as FormArray;
}

get subtaskControls(): FormControl[] {
  // explizites Mapping, damit wirklich FormControl[] zurückgegeben wird
  return (this.form.get('subtasks') as FormArray).controls.map(c => c as FormControl);
}

addSubtask() {
  const subtasks = this.form.get('subtasks') as FormArray;
  subtasks.push(this.fb.control('', Validators.required));
}

removeSubtask(index: number) {
  const subtasks = this.form.get('subtasks') as FormArray;
  if (subtasks.length > 1) {
    subtasks.removeAt(index);
  }
}

  public isEditMode = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['taskToEdit'] && changes['taskToEdit'].currentValue) {
      // Task to edit changed, initialize edit mode
      this.initializeEditMode();
    }
  }

  ngOnInit() {
    this.taskService.getContactsRef().subscribe((contacts: ContactsInterface[]) => {
      this.ContactsList = contacts;
    });

    // Setze Edit-Mode basierend auf taskToEdit - wichtig: nach dem contacts laden
    this.initializeEditMode();
  }

  private initializeEditMode() {
    this.isEditMode = !!this.taskToEdit;
    // Initialize edit mode based on taskToEdit presence

    if (this.isEditMode && this.taskToEdit) {
      // Clear existing subtasks
      const subtasksArray = this.form.get('subtasks') as FormArray;
      subtasksArray.clear();

      // Add subtasks from taskToEdit
      if (this.taskToEdit.subtasks && this.taskToEdit.subtasks.length > 0) {
        this.taskToEdit.subtasks.forEach(subtask => {
          subtasksArray.push(this.fb.control(subtask.title, Validators.required));
        });
        // Ensure there is always an empty control at the end to serve as input row
        subtasksArray.push(this.fb.control('', Validators.required));
      } else {
        // Add at least one empty subtask
        subtasksArray.push(this.fb.control('', Validators.required));
      }

      this.form.patchValue({
        status: this.taskToEdit.status,
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        dueDate: this.taskToEdit.dueDate,
        priority: this.taskToEdit.priority,
        assignedTo: this.taskToEdit.assignedTo,
        category: this.taskToEdit.category,
      });
    }
  }

    private hasFieldState(fieldName: string, shouldBeValid: boolean): boolean {
    const control = this.form.get(fieldName);
    if (!control) {
      return false;
    }
    const touched = control.dirty || control.touched;
    return touched && (shouldBeValid ? control.valid : control.invalid);
  }

  isFieldValid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, true);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.hasFieldState(fieldName, false);
  }

  getValidationMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors || !(field.dirty || field.touched)) {
      return '';
    }
    if (field.errors['required']) {
      return 'This field is required';
    }
    return 'Invalid input';
  }

    setPriority(priority: string): void {
    this.form.get('priority')?.setValue(priority);
  };

  /**
   * Generiert Initialen aus einem Namen
   * @param name - Der vollständige Name
   * @returns Die Initialen
   */
  getInitials(name: string): string {
    return this.taskService.getInitials(name);
  }

  /**
   * Generiert eine konsistente Farbe für einen Namen
   * @param name - Der Name des Mitarbeiters
   * @returns Eine Hex-Farbe
   */
  getColor(name: string): string {
    return this.taskService.getColor(name);
  }

  /**
   * Findet einen Kontakt anhand der ID
   * @param contactId - Die ID des Kontakts
   * @returns Der Kontakt oder undefined
   */
  getContactById(contactId: string): ContactsInterface | undefined {
    return this.ContactsList.find(contact => contact.id === contactId);
  }

  // Custom dropdown methods
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: string): void {
    this.form.get('category')?.setValue(category);
    this.isCategoryDropdownOpen = false;
  }

  toggleContact(contactId: string): void {
    const currentValue = this.form.get('assignedTo')?.value || [];
    const index = currentValue.indexOf(contactId);

    if (index > -1) {
      // Contact is already selected, remove it
      currentValue.splice(index, 1);
    } else {
      // Contact is not selected, add it
      currentValue.push(contactId);
    }

    this.form.get('assignedTo')?.setValue([...currentValue]);
  }

  isContactSelected(contactId: string): boolean {
    const currentValue = this.form.get('assignedTo')?.value || [];
    return currentValue.includes(contactId);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-wrapper')) {
      this.isDropdownOpen = false;
      this.isCategoryDropdownOpen = false;
    }
  }

  async submit() {
    // Form submission started
    
    // Check if required fields are filled
    const requiredFields = ['title', 'dueDate', 'category'];
    let hasEmptyRequiredFields = false;

    for (const field of requiredFields) {
      const control = this.form.get(field);
      if (!control?.value) {
        control?.markAsTouched();
        hasEmptyRequiredFields = true;
      }
    }

    if (hasEmptyRequiredFields) {
      this.success.show('Please fill out all required fields marked with *', 3000);
      return;
    }

    const value = this.form.getRawValue();
    // Processing form value

    // Convert subtasks from string array to object array
    // Wenn im Edit-Modus, behalte den done-Status der ursprünglichen Subtasks bei
    let processedSubtasks = [];
    if (value.subtasks) {
      const filteredSubtasks = value.subtasks.filter((subtask: string) => subtask.trim() !== '');
      
      if (this.isEditMode && this.taskToEdit?.subtasks) {
        // Im Edit-Modus: behalte den done-Status bei
        processedSubtasks = filteredSubtasks.map((subtaskTitle: string, index: number) => {
          const originalSubtask = this.taskToEdit!.subtasks![index];
          return {
            title: subtaskTitle,
            done: originalSubtask ? originalSubtask.done : false
          };
        });
      } else {
        // Im Create-Modus: alle sind auf false
        processedSubtasks = filteredSubtasks.map((subtaskTitle: string) => ({
          title: subtaskTitle,
          done: false
        }));
      }
    }

    const processedValue = {
      ...value,
      subtasks: processedSubtasks
    };

    // Form value processed and ready for save

    try {
      if (this.isEditMode && this.taskToEdit?.id) {
        // Editing existing task
        await this.firebase.editTaskToDatabase(this.taskToEdit.id, processedValue as TaskInterface);
        this.success.show('Task updated successfully!', 2000);
      } else {
        // Creating new task
        await this.firebase.addTaskToDatabase(processedValue as TaskInterface);
        this.success.show('Task created successfully!', 2000);
      }
    } catch (error) {
      // Error handling already managed by try-catch
      this.success.show('Error saving task. Please try again.', 3000);
      return;
    }

    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }

  cancel() {
    document.dispatchEvent(new CustomEvent('closeOverlay'));
  }
}
