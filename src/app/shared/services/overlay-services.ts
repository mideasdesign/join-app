import { Injectable, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayConfig,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContactsOverlay } from '../../contacts-sektion/contacts/contacts-overlay/contacts-overlay';
import { ContactsInterface } from '../../interfaces/contacts-interface';
import { TaskInterface } from '../../interfaces/task-interface';
import { TaskOverlay } from '../../board/task-overlay/task-overlay';

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private overlayRef: OverlayRef | null = null;
  private overlay = inject(Overlay);

  openOverlay(dataToEdit?: ContactsInterface | TaskInterface) {
    const config = new OverlayConfig({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    this.overlayRef = this.overlay.create(config);

    if (dataToEdit) {
      if ('name' in dataToEdit) {
        const portal = new ComponentPortal(ContactsOverlay);
        const componentRef = this.overlayRef.attach(portal);
        componentRef.instance.contactToEdit = dataToEdit as ContactsInterface;
      } else {
        const portal = new ComponentPortal(TaskOverlay);
        const componentRef = this.overlayRef.attach(portal);
        componentRef.instance.taskToEdit = dataToEdit as TaskInterface;
      }
    } else {
      const portal = new ComponentPortal(TaskOverlay);
      this.overlayRef.attach(portal);
    }

    this.overlayRef.backdropClick().subscribe(() => this.close());
    document.addEventListener('closeOverlay', () => this.close(), { once: true });
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}