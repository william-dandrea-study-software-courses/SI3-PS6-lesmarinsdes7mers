import { Component, OnInit, Input } from '@angular/core';
import {Question, Quiz} from 'src/models/quiz.model';
import { QuizService } from 'src/services/quiz/quiz.service';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {

  @Input()
  quiz: Quiz;

  constructor(private quizService: QuizService) { }

  ngOnInit(): void {
  }

  deleteQuestion(question: Question): void {
    this.quizService.deleteQuestion(this.quiz, question);
  }

}
