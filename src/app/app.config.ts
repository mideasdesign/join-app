import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({"projectId":"mygame-240cb","appId":"1:481217368811:web:dfff6a716ec21df70564ae","storageBucket":"mygame-240cb.firebasestorage.app","apiKey":"AIzaSyBqSs0ijeVS979iIvTp6WGhczScIvD5dPU","authDomain":"mygame-240cb.firebaseapp.com","messagingSenderId":"481217368811"})),
    provideFirestore(() => getFirestore())
  ]
};
