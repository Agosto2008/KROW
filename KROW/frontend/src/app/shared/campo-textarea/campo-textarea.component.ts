import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

/**
 * Área de texto del design system.
 * `for`↔`id` enlazados y error anunciado con `aria-invalid` + `role="alert"`.
 */
@Component({
  selector: 'app-campo-textarea',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './campo-textarea.component.html',
  styleUrl: './campo-textarea.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoTextareaComponent),
      multi: true,
    },
  ],
})
export class CampoTextareaComponent implements ControlValueAccessor {
  private static contador = 0;

  readonly idCampo = `campo-textarea-${++CampoTextareaComponent.contador}`;
  readonly idError = `${this.idCampo}-error`;
  readonly idAyuda = `${this.idCampo}-ayuda`;

  @Input() etiqueta = '';
  @Input() placeholder = '';
  @Input() filas = 4;
  @Input() error = '';
  @Input() ayuda = '';
  @Input() requerido = false;

  valor = '';
  deshabilitado = false;

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: unknown): void {
    this.valor = (v as string) ?? '';
  }

  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(d: boolean): void {
    this.deshabilitado = d;
  }

  onInput(v: string): void {
    this.valor = v;
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }
}
