import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

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
  @Input() etiqueta = '';
  @Input() tipo: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() ayuda = '';
  @Input() requerido = false;
  @Input() autocomplete = '';

  valor: string | number = '';
  deshabilitado = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: any): void {
    this.valor = valor ?? '';
  }

  registerOnChange(fn: (v: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(estaDeshabilitado: boolean): void {
    this.deshabilitado = estaDeshabilitado;
  }

  onInput(valor: any): void {
    this.valor = valor;
    this.onChange(valor);
  }

  onBlur(): void {
    this.onTouched();
  }
}