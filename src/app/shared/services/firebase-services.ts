import { inject, Injectable, OnDestroy } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DocumentData, QueryDocumentSnapshot, collection, onSnapshot, Unsubscribe, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ContactsInterface } from '../../interfaces/contacts-interface';

@Injectable({
  providedIn: 'root',
})
export class Firebase implements OnDestroy {
  private firestore = inject(Firestore);
  private unsubscribe: Unsubscribe = () => {};
 ContactsList: ContactsInterface[] = [];

 
  constructor() {
    try {
      const contactsRef = collection(this.firestore, 'contacts');
      
      this.unsubscribe = onSnapshot(
        contactsRef,
        (snapshot) => {
          console.log('Snapshot received, number of documents:', snapshot.size);

          this.ContactsList = [];
          snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            console.log('Document ID:', doc.id, 'Data:', data);

            this.ContactsList.push({
                id: doc.id,
                name: data['name'],
                email: data['email'],
            });
          });
          
          console.log('Updated ContactsList:', this.ContactsList);
        },
        (error) => {
          console.error('Error getting documents:', error);
        }
      );
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
    }
  }
  async addContactsToDatabase(contacts:ContactsInterface){
    await addDoc(collection(this.firestore, 'contacts'), contacts)
  }
    async editContactsToDatabase(id: string, data: ContactsInterface){
    await updateDoc(doc(this.firestore, 'contacts', id),
    {

        name: data.name,
        email: data.email,

    });
  }
  async deleteContactsFromDatabase(id: string){
    await deleteDoc(doc(this.firestore, 'contacts', id) )
  };
setContactsObject(id: string, obj: ContactsInterface):ContactsInterface{
  return{
    id: id,
    name: obj.name,
    email: obj.email,
  };
}
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
