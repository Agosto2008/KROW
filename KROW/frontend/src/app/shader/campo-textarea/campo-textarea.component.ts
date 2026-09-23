import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

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
  @Input() etiqueta = '';
  @Input() placeholder = '';
  @Input() filas = 4;
  @Input() error = '';
  @Input() ayuda = '';
  @Input() requerido = false;

  valor = '';
  deshabilitado = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: any): void { this.valor = v ?? ''; }
  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.deshabilitado = d; }

  onInput(v: any): void { this.valor = v; this.onChange(v); }
  onBlur(): void { this.onTouched(); }
}