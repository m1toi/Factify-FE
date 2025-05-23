import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @Input() placeholder = 'Type a message…';
  @Output() send = new EventEmitter<string>();

  message = '';

  onSend() {
    const text = this.message.trim();
    if (!text) return;
    this.send.emit(text);
    this.message = '';
  }
}
