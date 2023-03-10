import {Component, OnInit} from '@angular/core';
import {Visibility} from '../../../../../models/quiz-creation.model';
import {Answer, Difficulty, Question, QuestionType, Quiz} from '../../../../../models/quiz.model';
import { QuizService } from 'src/services/quiz/quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import {UserService} from "../../../../../services/user/user.service";

@Component({
  selector: 'app-anim-create-quizz-homepage',
  templateUrl: './anim-create-quizz-homepage.component.html',
  styleUrls: ['./anim-create-quizz-homepage.component.scss']
})
export class AnimCreateQuizzHomepageComponent implements OnInit {
  public quiz: Quiz;

  private saving = false


  constructor(private createQuizService: QuizService, private aRoute: ActivatedRoute, private router: Router, private userService: UserService) {

    this.userService.setAllUsers();

    aRoute.params.subscribe(v => {
      const idStr = aRoute.snapshot.params['quiz']
      if(!idStr) {
        // Creating empty quiz
        this.quiz = {
          name: "",
          difficulty: Difficulty.EASY,
          questions: [{question_name: '', type: QuestionType.TEXT, id: 0, answer: [
            {
              data: "",
              id_answer: 1,
              is_correct: true
            }
          ]}],
          privacy: {
            is_public: false,
            users_access: []
          },
          id: undefined
        }
      }
      else {
        const idNum = parseInt(idStr)
        if(isNaN(idNum)) 
          // No integer found
          router.navigate(['/'])
        else {
          // Getting quiz
          createQuizService.setSelectedQuiz(idNum)
          this.quiz = createQuizService.getQuizSelected()
          this.quiz.id = idNum
        }
      }
    })
  }

  /**
   * Cette méthode va push le quiz sur le service
   */
  save(): void {

    console.log(this.userService.getUsers());

    if (!this.quiz.privacy.is_public) {

      this.quiz.privacy.users_access = this.userService.getUsers().map(u => u.id);

    }


    if(!this.quiz.name) return;
    //if(this.saving) return;
    this.saving = true;
    console.log(this.quiz)
    const subs = this.createQuizService.updateQuiz(this.quiz).subscribe({ next: (next) => {
      this.router.navigate(['animateur'])
      subs.unsubscribe()
    }, error: err => {
      alert("An error occured.\nPlease check your quiz, maybe there is some field missing")
      this.saving = false
    }})
  }

  deleteQuiz(canDelete: boolean): void {
    if (canDelete === true) {
      this.createQuizService.deleteQuiz(this.quiz);
      console.log('AnimCreateQuizzHomepageComponent : onDeleteQuiz()');
    }
  }

  ngOnInit(): void {}



  onDifficultyQuiz(event: Difficulty): void {
    console.log('HOMEPAGE : DIFFICULTY : ' + event);
    this.quiz.difficulty = event;
  }

  onThemeQuiz(event: string): void {
    console.log('HOMEPAGE : CHANGENAME : ' + event);
    this.quiz.name = event;
  }

  onVisibilityQuiz(event: Visibility): void {
    console.log('HOMEPAGE : VISIBILITY : ' + event);
    this.quiz.privacy = {
      users_access: [],
      is_public: event === Visibility.PUBLIC
    };
  }

  onDeleteQuestion(event: Question): void {
    this.quiz.questions = this.quiz.questions.filter(obj => obj.id !== event.id);
  }

  onAddAnQuestion(): void {
    if(this.quiz.questions.length < 30) {
      this.quiz.questions.push({question_name: '', type: QuestionType.TEXT, id: this.quiz.questions.length, answer: []});
    }
  }

  onDownQuestion(event: Question): void {
    console.log(event)
    const i = this.quiz.questions.findIndex(q => q.id === event.id);
    if(i >= this.quiz.questions.length - 1) return;

    // change order in list
    const c = this.quiz.questions[i]
    this.quiz.questions[i] = this.quiz.questions[i + 1]
    this.quiz.questions[i + 1] = c

    const id = this.quiz.questions[i].id
    this.quiz.questions[i].id = this.quiz.questions[i + 1].id
    this.quiz.questions[i + 1].id = id
  }

  onUpQuestion(event: Question): void {
    console.log(event)

    const i = this.quiz.questions.findIndex(q => q.id === event.id);
    if(i <= 0) return;

    const c = this.quiz.questions[i]
    this.quiz.questions[i] = this.quiz.questions[i - 1]
    this.quiz.questions[i - 1] = c

    const id = this.quiz.questions[i].id
    this.quiz.questions[i].id = this.quiz.questions[i - 1].id
    this.quiz.questions[i - 1].id = id
    
  }

  onEditListAnswer(event: Answer[], question: Question): void {
    question.answer = event;
    console.log('HOMEPAGE : UPDATE ANSWERS FOR QUESTION : ' + question.answer);
  }


}
