import { Component, inject } from '@angular/core';
import { Firebase } from '../../shared/services/firebase-services';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { FormsModule } from '@angular/forms';
import { VocabularyAdd } from '../../vocabulary/vocabulary-add/vocabulary-add';


@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, VocabularyAdd],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss'
})
export class Contacts implements OnInit {
    contacts$!: Observable<ContactsInterface[]>;
    firebase = inject(Firebase);
    isEdited = false;
    isSelected = false;
    selectedContactsIndex: number | null = null;
    contactsId?: string ='';
    editedContacts ={
      name:'',
      email:'',
    };
    selectedContact: ContactsInterface = {
      id: '',
      name: '',
      email: ''
    }
    openEditContact(contact: ContactsInterface): void {
      this.isEdited = true;
      this.contactsId = contact.id;
      this.selectedContact = contact;
      this.editedContacts = {
        name: contact.name,
        email: contact.email
      };
    }
    selectedContacts(letter: string, index: number) {
      const contact = this.groupedContacts[letter][index];
      if (!contact) return;
      this.isSelected = true;
      this.selectedContactsIndex = index;
      this.contactsId = contact.id;
      this.selectedContact = {
        id: contact.id,
        name: contact.name,
        email: contact.email
      };
    }
    saveEdit(){
      console.log('SPEICHERN:', this.contactsId, this.editedContacts);
      if (this.contactsId) {
        this.firebase.editContactsToDatabase(this.contactsId, this.editedContacts);
      }
      this.cancelEdit();
    }
    cancelEdit(): void {
      this.isEdited = false;
      this.selectedContactsIndex = null;
      this.contactsId = '';
      this.editedContacts = { name: '', email: '' };
    }
    constructor(private contactService: Firebase){
      this.firebase;
    }
   groupedContacts: { [letter: string]: ContactsInterface[] } = {};
    ngOnInit(): void {
      this.contacts$ = this.contactService.getAlphabeticalContacts();
      this.contacts$.subscribe((contacts) => {
        this.groupedContacts = this.groupContactsByFirstLetter(contacts);
      });
    }

    private groupContactsByFirstLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
      const grouped: { [letter: string]: ContactsInterface[] } = {};
      for (const contact of contacts) {
        const letter = contact.name.charAt(0).toUpperCase();
        if (!grouped[letter]) {
          grouped[letter] = [];
        }
        grouped[letter].push(contact);
      }
      return grouped;
    }

    get groupedKeys(): string[] {
    return Object.keys(this.groupedContacts).sort();
  }
  getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const first = parts[0]?.charAt(0).toUpperCase() || '';
  const last = parts[1]?.charAt(0).toUpperCase() || '';
  return first + last;
}

getColor(name: string): string {
  const colors = ['#FF8A00', '#6E00FF', '#009688', '#3F51B5', '#FF4081'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
}
