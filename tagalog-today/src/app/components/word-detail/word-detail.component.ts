import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WordService } from '../../services/word.service';
import { Word } from '../../models/word';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-word-detail',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './word-detail.component.html',
  styleUrl: './word-detail.component.scss'
})
export class WordDetailComponent {
  word: Word | null = null;
  loading = false;
  error: string | null = null;
  wordId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private wordService: WordService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.wordId = +params['id'];
      if (this.wordId) {
        this.loadWord();
      }
    });
  }

  loadWord(): void {
    this.loading = true;
    this.error = null;

    this.wordService.getWordById(this.wordId).subscribe({
      next: (word) => {
        this.word = word;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load word. Please try again.';
        this.loading = false;
        console.error('Error loading word:', error);
      }
    })
  }

  loadWordById(): void {
    if (this.wordId && this.wordId > 0) {
      this.loadWord();
    }
  }

}
