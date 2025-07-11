import { Component, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../../shared/services/contact.service';
import { ColorService } from '../../../shared/services/color.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact } from '../../../shared/interfaces/contact.interface';
import { Firestore, doc, updateDoc, deleteDoc, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { collectionData } from '@angular/fire/firestore';
import { AddContacts } from '../add-contacts/add-contacts';
import { EditContact } from '../edit-contact/edit-contact';
import { UiStateService } from '../../../shared/services/ui-state.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    AddContacts,
    EditContact
  ],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss']
})

export class Contacts implements OnInit, OnDestroy {
  contacts$: Observable<Contact[]>;
  public contacts: Contact[] = [];
  contactForm!: FormGroup;
  selectedContact: Contact | null = null;
  isMobile: WritableSignal<boolean> = signal(false);
  showMobileDetails: WritableSignal<boolean> = signal(false);
  private destroy$ = new Subject<void>();
  private breakpointSubscription: Subscription;
  groupedContacts$: Observable<Record<string, Contact[]>>;
  addContactOpen$!: Observable<boolean>;
  editContactOpen$!: Observable<boolean>;

  constructor(
    private firestore: Firestore,
    private fb: FormBuilder,
    private contactsService: ContactService,
    private colorService: ColorService,
    private breakpointObserver: BreakpointObserver,
    public uiState: UiStateService
  ) {
    this.addContactOpen$ = this.uiState.isOverlayOpen('add-contacts');
    this.editContactOpen$ = this.uiState.isOverlayOpen('edit-contact');
    const contactsRef = collection(this.firestore, 'contacts');
    this.contacts$ = collectionData(contactsRef, { idField: 'id' }) as Observable<Contact[]>;
    this.groupedContacts$ = this.contacts$.pipe(
      map(contacts => {
        return contacts.reduce((acc: Record<string, Contact[]>, contact: Contact) => {
          const letter = contact.name.charAt(0).toUpperCase();
          if (!acc[letter]) {
            acc[letter] = [];
          }
          acc[letter].push(contact);
          return acc;
        }, {});
      })
    );

    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 949px)'])
      .subscribe(result => this.isMobile.set(result.matches));
  }

  ngOnInit(): void {
    this.initForm();
    this.contacts$.subscribe(contacts => {
      this.contacts = contacts;
      this.assignColorsToContacts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.breakpointSubscription.unsubscribe();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      color: ['']
    });
  }

  get mobileClass(): string {
    if (!this.isMobile()) {
      return 'desktop';
    }
    return this.showMobileDetails() ? 'mobile show-details' : 'mobile';
  }

  onContactUpdated(updated: Contact | null) {
    this.selectedContact = updated;
  }

  openAddContact() {
    this.uiState.openOverlay('add-contacts');
  }

  closeOverlay(): void {
    this.uiState.closeOverlay();
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    if (this.isMobile()) {
      this.showMobileDetails.set(true);
    }
  }

  closeContactDetails(): void {
    this.showMobileDetails.set(false);
  }

  getInitials(name: string): string {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getContactColor(contact: Contact): string {
    return this.colorService.generateColorByString(contact.name);
  }

  private assignColorsToContacts(): void {
    this.contacts.forEach(contact => {
      contact.color = this.colorService.generateColorByString(contact.name);
    });
  }

  updateDoc(contact: Contact): void {
    if (!contact.id) return;
    const docRef = doc(this.firestore, `contacts/${contact.id}`);
    updateDoc(docRef, {
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      color: contact.color || ''
    });
  }

  deleteContact(id?: string): void {
    if (!id) return;
    this.contactsService.deleteContact(id);
  }

  getKeys(obj: Record<string, Contact[]> | null): string[] {
    return obj ? Object.keys(obj) : [];
  }

  async handleSubmit(newContact: Contact): Promise<void> {
    console.log('hello world', newContact)
    /*
    if (newContact){
    console.log('contacts.ts received:', newContact);
    (await this.contactsService.addContact(newContact)).subscribe({
      next: () => {
        console.log('Contact successfully saved by parent:', newContact);
        console.log('Calling closeOverlay now');
        this.closeOverlay();
      },
      error: (err: any) => {
        console.error('Error while saving contact in parent:', err);
      }
    });
  } // => data wont be transfered from child (add-contact) to parent
  */
  }

  handleEditClose(): void {
    this.uiState.closeOverlay();      
    this.closeContactDetails(); 
  }

  openEditContact(contact: Contact) {
    this.selectedContact = contact;
    this.uiState.openOverlay('edit-contact');
  }
}