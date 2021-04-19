import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../../../services/quiz.service";
import {getDifficultyClass, difficultyToText, Quiz, Difficulty} from "../../../models/quiz.model";
import UserPrefsService from "../../../services/userprefs.service";
import {UserAndQuizService} from "../../../services/user-and-quiz.service";
import {User} from "../../../models/user.model";
import {UserService} from "../../../services/user.service";
import {MadedQuizzesModel, UserAndQuizModel} from "../../../models/user-and-quiz.model";

@Component({
    selector: 'app-quiz-intro',
    templateUrl: './quiz-intro.component.html',
    styleUrls: ['./quiz-intro.component.scss']
})
export class QuizIntroComponent implements OnInit {

    public quizSelected: Quiz;
    public difficultyToText = difficultyToText;
    public getDifficultyClass = getDifficultyClass;

    public userSelected: User;

    public fontSizeMain: number;
    public fontSizeSecond: number;

    public currentOneUserAndQuiz: UserAndQuizModel;

    constructor(private router: Router, private route: ActivatedRoute, public userService: UserService, private quizService: QuizService, public userPref: UserPrefsService, private userAndQuizService: UserAndQuizService) {

        this.quizService.quizSelected$.subscribe((eachQuiz) => {
            this.quizSelected = eachQuiz;
        });

        this.userPref.fontSize$.subscribe((fontSiz) => {
            this.fontSizeMain =  Math.max(50, fontSiz);
            this.fontSizeSecond = Math.max(30, fontSiz - 10);
        });

        this.userService.userSelected$.subscribe((user) => {
            this.userSelected = user;
        });
        this.userSelected = this.userService.getUserSelected();

        this.userAndQuizService.oneUserQuizzes$.subscribe((elem) => {
            this.currentOneUserAndQuiz = elem;
        });
        this.currentOneUserAndQuiz = this.userAndQuizService.getOneUserQuizzes();
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        this.quizService.setSelectedQuiz(+id);
    }

    generateNameDifficultyClass(): string {
        switch (this.quizSelected.difficulty) {
            case Difficulty.EASY: return 'easy';
            case Difficulty.MEDIUM: return 'medium';
            case Difficulty.HARD: return 'hard';
            case Difficulty.EXPERT: return 'expert';
        }
    }

    initializeTheOneUseQuizzes(): void {

        if (!this.currentOneUserAndQuiz) {

            console.log("yo");
            this.userAndQuizService.addEmptyPlayedQuizOneUserQuiz();

        }

        const index = this.currentOneUserAndQuiz.played_quizzes.findIndex(pq => pq.id_quiz === this.quizSelected.id);

        // Si il n'y a pas l'élement dans le tableau, one le crée, sinon, il faut le remettre a zero
        if (index >= 0) {
            this.currentOneUserAndQuiz.played_quizzes[index].user_answers = [];
            this.currentOneUserAndQuiz.played_quizzes[index].score_user = 0;
            this.userAndQuizService.oneUserQuizzes$.next(this.currentOneUserAndQuiz);
        } else {
            const madedQuiz: MadedQuizzesModel = {id_quiz: this.quizSelected.id, score_user: 0, user_answers: []};
            this.currentOneUserAndQuiz.played_quizzes.push(madedQuiz);
            this.userAndQuizService.oneUserQuizzes$.next(this.currentOneUserAndQuiz);
        }
    }

    startQuiz(): void {
        this.initializeTheOneUseQuizzes();
        console.log(this.userAndQuizService.getOneUserQuizzes());
        this.router.navigate(['/play-quiz', this.quizSelected.id]);
    }

    homepage(): void {
        this.router.navigate(['/homepage/' + this.userService.getUserSelected().id]);
    }


}
