import { Component, NgZone, OnDestroy, signal, WritableSignal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContactService } from '../../../shared/services/contact.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { Contact } from '../../../shared/interfaces/contact.interface';
import { UiStateService } from '../../../shared/services/ui-state.service';

@Component({
  selector: 'app-add-contacts',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
  
  ],
  templateUrl: './add-contacts.html',
  styleUrls: ['./add-contacts.scss']
})

export class AddContacts implements OnDestroy {
  isMobile: WritableSignal<boolean> = signal(false);
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Contact>();
  contactForm: FormGroup;
  private breakpointSubscription: Subscription;
  

  constructor(
    private breakpointObserver: BreakpointObserver,
    private contactService: ContactService,
    private fb: FormBuilder,
    private ngZone: NgZone,
    public uiState: UiStateService
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

  onSubmit(): void {
    if (this.contactForm.invalid) return;
    const newcontact: Contact = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone || ''
    };
    console.log('AddContacts emitting:', newcontact);
    //this.submit.emit(newcontact); 
    this.contactService.addContact(newcontact);
    this.contactForm.reset();
    this.close.emit();          
    this.uiState.closeOverlay();
  } 

  onCancel(): void {
    this.contactForm.reset();   
    this.cancel.emit();         
    this.uiState.closeOverlay();
  }

  onClose(): void {
    this.close.emit();          
    this.uiState.closeOverlay();
  }
}