import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges, WritableSignal, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { ContactService } from '../../../shared/services/contact.service';
import { Contact } from '../../../shared/interfaces/contact.interface';
import { UiStateService } from '../../../shared/services/ui-state.service';
import { doc, updateDoc } from 'firebase/firestore';
import { FirestoreService } from '../../../shared/services/firestore.service';



@Component({
  selector: 'app-edit-contact',
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './edit-contact.html',
  styleUrls: ['./edit-contact.scss']
})

export class EditContact implements OnDestroy, OnChanges, OnInit {
  private _selectedContact = signal<Contact | null>(null);

  @Input()
  set selectedContact(value: Contact | null) {
    this._selectedContact.set(value);
  }

  get selectedContact(): Contact | null {
    return this._selectedContact();
  }
  // @Input() selectedContact: Contact | null = null;
  isMobile: WritableSignal<boolean> = signal(false);
  @Output() contactChanged = new EventEmitter<Contact | null>();
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Contact>();
  contactForm: FormGroup;
  private breakpointSubscription: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private contactService: ContactService,
    private fb: FormBuilder,
    public uiState: UiStateService,
    private firestoreService: FirestoreService,
    private ngZone: NgZone,
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  ngOnInit(): void {
    this.editedContact$.subscribe(contact => {
      if (contact) {
        this.contactForm.patchValue({
          name: contact.name,
          email: contact.email,
          phone: contact.phone ?? ''
        });
      }
    });
  }

  private hasFieldState(fieldName: string, shouldBeValid: boolean): boolean {
    const control = this.contactForm.get(fieldName);
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
    const field = this.contactForm.get(fieldName);
    if (!field?.errors || !(field.dirty || field.touched)) {
      return '';
    }
    if (field.errors['required']) {
      return 'This field is required';
    }
    if (fieldName === 'email' && field.errors['email']) {
      return 'Please enter a valid email address';
    }
    return 'Invalid input';
  }

  get mobileClass(): string {
    return this.isMobile() ? 'mobile' : 'desktop';
  }

  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid || !this.selectedContact) return;
    const updatedContact: Contact = {
      ...this.selectedContact,
      ...this.contactForm.value
    };
    try {
      await this.contactService.updateContact(updatedContact);
      const changedContact = await firstValueFrom(this.contactService.getContactById(updatedContact.id!));

      this.ngZone.run(() => {
        this.contactForm.patchValue({
          name: changedContact.name,
          email: changedContact.email,
          phone: changedContact.phone ?? ''
        });
        this.close.emit();
        this.uiState.closeOverlay();
        this._selectedContact.set(changedContact);
        this.contactChanged.emit(this._selectedContact());
      });
    } catch (error: any) {
      console.error('Update failed:', error);
    }
  }

  onCancel(): void {
    if (this.selectedContact) {
        this.contactForm.patchValue({
          name: this.selectedContact.name,
          email: this.selectedContact.email,
          phone: this.selectedContact.phone ?? ''
        });
      } else {
        this.contactForm.reset();
      }
      this.cancel.emit();
      this.uiState.closeOverlay();
  }

  onClose(): void {
    this.close.emit();          
    this.uiState.closeOverlay();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedContact'] && this.selectedContact) {
      this.contactForm.patchValue({
        name: this.selectedContact.name,
        email: this.selectedContact.email,
        phone: this.selectedContact.phone ?? ''
      });
    }
  }
  
  private editedContactSubject = new BehaviorSubject<Contact | null>(null);
  public editedContact$ = this.editedContactSubject.asObservable();

  setEditedContact(contact: Contact | null): void {
    this.editedContactSubject.next(contact);
  }

}
