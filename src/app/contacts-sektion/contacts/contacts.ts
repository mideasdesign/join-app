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
    selectedContact = {
      name:'',
      email:''
    }
     editContacts(index: number) {
      if (index < 0 || index >= this.firebase.ContactsList.length) {
        console.error('Invalid index:', index);
        return;
      }
      this.isEdited = true;
      this.selectedContactsIndex = index;
      this.contactsId = this.firebase.ContactsList[index].id;
      this.editedContacts = {
        name: this.firebase.ContactsList[index].name,
        email: this.firebase.ContactsList[index].email
      };
    }
    selectedContacts(index: number) {
      if (index < 0 || index >= this.firebase.ContactsList.length) {
        console.error('Invalid index:', index);
        return;
      }
      this.isSelected = true;
      this.selectedContactsIndex = index;
      this.contactsId = this.firebase.ContactsList[index].id;
      this.selectedContact = {
        name: this.firebase.ContactsList[index].name,
        email: this.firebase.ContactsList[index].email
      };
    }
    saveEdit(){
      console.log(this.contactsId, this.editedContacts);
      if (this.contactsId) {
        this.firebase.editContactsToDatabase(this.contactsId, this.editedContacts);
      }
      this.cancelEdit();
    }
    cancelEdit(){
      this.isEdited = false;
      this.selectedContactsIndex = null;
      this.contactsId = '';
    }
    constructor(private contactService: Firebase){
      this.firebase;
    }
      ngOnInit(): void {
    this.contacts$ = this.contactService.getAlphabeticalContacts();
  }
}
