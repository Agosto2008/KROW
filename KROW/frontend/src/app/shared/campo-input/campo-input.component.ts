import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

/**
 * Campo de texto del design system.
 *
 * Accesibilidad: cada instancia genera su propio `id` y se enlaza al
 * `<label for>`; el mensaje de error queda referenciado con
 * `aria-describedby` + `aria-invalid` para lectores de pantalla.
 */
@Component({
  selector: 'app-campo-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './campo-input.component.html',
  styleUrl: './campo-input.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoInputComponent),
      multi: true,
    },
  ],
})
export class CampoInputComponent implements ControlValueAccessor {
  private static contador = 0;

  /** id único de esta instancia: casa con el `for` del label */
  readonly idCampo = `campo-input-${++CampoInputComponent.contador}`;
  readonly idError = `${this.idCampo}-error`;
  readonly idAyuda = `${this.idCampo}-ayuda`;

  @Input() etiqueta = '';
  @Input() tipo: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() ayuda = '';
  @Input() requerido = false;
  @Input() autocomplete = '';

  valor: string | number = '';
  deshabilitado = false;

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: unknown): void {
    this.valor = (valor as string | number) ?? '';
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(estaDeshabilitado: boolean): void {
    this.deshabilitado = estaDeshabilitado;
  }

  onInput(valor: string): void {
    this.valor = valor;
    this.onChange(valor);
  }

  onBlur(): void {
    this.onTouched();
  }
}
