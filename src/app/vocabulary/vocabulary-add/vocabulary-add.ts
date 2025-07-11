import { Component, inject} from '@angular/core';
import { Firestore, collection, collectionData, addDoc} from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Firebase } from '../../shared/services/firebase-services';

@Component({
  selector: 'app-vocabulary-add',
  imports: [FormsModule],
  templateUrl: './vocabulary-add.html',
  styleUrl: './vocabulary-add.scss'
})
export class VocabularyAdd {
  contacts = {
    name: '',
    email: '',
  };
  firebase = inject(Firebase)

    submitVocabulary(){
    console.log(this.contacts);
    this.firebase.addContactsToDatabase(this.contacts);
    this.clearInputFields();
  }


  clearInputFields() {
    this.contacts.name = '';
    this.contacts.email = '';
  }
}
