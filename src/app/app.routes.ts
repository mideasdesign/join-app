
import { Routes } from '@angular/router';
import { ManageTask } from './board/manage-task/manage-task';
import { summary } from './summary/summary';
import { Contacts } from './contacts-sektion/contacts/contacts';

export const routes: Routes = [
  { path: 'board', component: ManageTask },
  { path: 'summary', component:summary},
  { path: 'contacts', component: Contacts },
  { path: '**', redirectTo: '' }
];
