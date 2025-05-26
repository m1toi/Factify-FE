import {Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @Input() placeholder = 'Type a message…';
  @Output() send = new EventEmitter<string>();

  @ViewChild('emojiContainer', { static: false })
  private emojiContainer!: ElementRef<HTMLElement>;

  message = '';
  showEmojiPicker = false;

  onSend() {
    const text = this.message.trim();
    if (!text) return;
    this.send.emit(text);
    this.message = '';
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: { emoji: any; $event: MouseEvent }) {
    this.message += event.emoji.native;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.showEmojiPicker) return;

    const clickedInside = this.emojiContainer?.nativeElement.contains(target);
    if (!clickedInside) {
      this.showEmojiPicker = false;
    }
  }
}
