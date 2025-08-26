import { Routes } from '@angular/router';
import { ManageTask } from './board/manage-task/manage-task';
import { summary } from './summary/summary';
import { Contacts } from './contacts-sektion/contacts/contacts';
import { Login } from './login/login';
import { SignUp } from './sign-up/sign-up';
import { Help } from './info/help/help';
import { Privacy } from './info/privacy/privacy';
import { Imprint } from './info/imprint/imprint';
import { AuthGuard } from './Shared/guards/auth.guard';
import { AddTask } from './board/add-task/add-task';
import { MobileWelcome } from './mobile-welcome/mobile-welcome';

/**
 * Application routing configuration defining all available routes and their associated components.
 * Includes authentication guards for protected routes and fallback redirects.
 * 
 * @example
 * ```typescript
 * const router = Router.createRouter([
 *   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }
 * ]);
 * ```
 */
export const routes: Routes = [
  { path: '', component: Login},
  { path: 'login', component: Login},
  { path: 'sign-up', component: SignUp},
  { path: 'mobile-welcome', component: MobileWelcome, canActivate: [AuthGuard] },
  { path: 'board', component: ManageTask, canActivate: [AuthGuard] },
  { path: 'summary', component: summary, canActivate: [AuthGuard] },
  { path: 'add-task', component: AddTask, canActivate: [AuthGuard] },
  { path: 'contacts', component: Contacts, canActivate: [AuthGuard] },
  { path: 'help', component: Help, canActivate: [AuthGuard] },
  { path: 'privacy', component: Privacy },
  { path: 'imprint', component: Imprint },
  { path: '**', redirectTo: '' }
];
