import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { Contacts } from './contacts-sektion/contacts/contacts';
import { summary } from './summary/summary';
import { ManageTask } from './board/manage-task/manage-task';

export const routes: Routes = [
  { path: '', component: MainPage },
  { path: 'contacts', component:Contacts },
  { path: 'summary', component:summary},
    { path: 'board', component:ManageTask},
  { path: '**', redirectTo: '' }
];
