import {Component, ElementRef, forwardRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss'
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @ViewChild('editorContent', {static: true}) editorContent!: ElementRef<HTMLDivElement>;

  private onChange: (value: string) => void = () => {
  };
  private onTouched: () => void = () => {
  };
  private innerValue: string = '';

  execCommand(command: string, arg: string = ''): void {
    document.execCommand(command, false, arg);
    this.onInput();
  }

  addLink(): void {
    const url = prompt('Nhập URL liên kết:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  addImage(): void {
    const url = prompt('Nhập URL hình ảnh:');
    if (url) {
      this.execCommand('insertImage', url);
    }
  }

  onInput(): void {
    const html = this.editorContent.nativeElement.innerHTML;
    this.innerValue = html === '<br>' ? '' : html;
    this.onChange(this.innerValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.innerValue = value || '';
    if (this.editorContent) {
      this.editorContent.nativeElement.innerHTML = this.innerValue;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editorContent) {
      this.editorContent.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }
}
