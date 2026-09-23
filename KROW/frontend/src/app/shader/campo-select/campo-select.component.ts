import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface OpcionSelect {
  valor: string | number;
  etiqueta: string;
}

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
  @Input() etiqueta = '';
  @Input() opciones: OpcionSelect[] = [];
  @Input() placeholder = 'Seleccionar...';
  @Input() error = '';
  @Input() requerido = false;

  valor: string | number | null = '';
  deshabilitado = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: any): void {
    this.valor = valor ?? '';
  }
  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.deshabilitado = d; }

  onCambio(valor: any): void {
    this.valor = valor;
    this.onChange(valor);
  }
  onBlur(): void { this.onTouched(); }
}