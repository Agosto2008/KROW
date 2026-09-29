import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface OpcionSelect {
  valor: string | number;
  etiqueta: string;
}

/**
 * Selector del design system.
 * `for`↔`id` enlazados y error anunciado con `aria-invalid` + `role="alert"`.
 */
@Component({
  selector: 'app-campo-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './campo-select.component.html',
  styleUrl: './campo-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CampoSelectComponent),
      multi: true,
    },
  ],
})
export class CampoSelectComponent implements ControlValueAccessor {
  private static contador = 0;

  readonly idCampo = `campo-select-${++CampoSelectComponent.contador}`;
  readonly idError = `${this.idCampo}-error`;

  @Input() etiqueta = '';
  @Input() opciones: OpcionSelect[] = [];
  @Input() placeholder = 'Seleccionar...';
  @Input() error = '';
  @Input() requerido = false;

  valor: string | number | null = '';
  deshabilitado = false;

  private onChange: (v: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: unknown): void {
    this.valor = (valor as string | number | null) ?? '';
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

  onCambio(valor: string): void {
    this.valor = valor;
    this.onChange(valor);
  }

  onBlur(): void {
    this.onTouched();
  }
}
