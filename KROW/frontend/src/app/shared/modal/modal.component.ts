import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-modal',
	standalone: true,
	templateUrl: './modal.component.html',
	styleUrl: './modal.component.css',
})
export class ModalComponent {
	@Input() abierto = false;
	@Input() titulo = '';
	@Input() ancho: 'sm' | 'md' | 'lg' = 'md';

	@Output() cerrar = new EventEmitter<void>();

	onFondoClick(): void {
		this.cerrar.emit();
	}

	onContenidoClick(event: MouseEvent): void {
		event.stopPropagation();
	}
}
