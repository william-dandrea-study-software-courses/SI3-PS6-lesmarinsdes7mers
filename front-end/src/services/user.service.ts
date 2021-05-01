import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { User } from '../models/user.model';
import { serverUrl, httpOptionsBase } from '../configs/server.config';
import {USER_LIST} from "../mocks/user-list.mock";
import {Quiz} from "../models/quiz.model";
import UserPrefsService from "./userprefs.service";
import {UserAndQuizService} from "./user-and-quiz.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private users: User[] = [];
  public users$: BehaviorSubject<User[]> = new BehaviorSubject([]);
  private userSelected: User;
  public userSelected$: Subject<User> = new Subject();

  private publicSession = false;
  public publicSession$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.publicSession);

  private userUrl = serverUrl + '/user';
  private allUserUrl = this.userUrl + '/all';


  constructor(private http: HttpClient, private userPrefService: UserPrefsService, private userAndQuizService: UserAndQuizService) {
    this.userAndQuizService.userAndQuizs$.subscribe();
    this.userAndQuizService.oneUserQuizzes$.subscribe();
    this.retrieveUsers();
  }

  retrieveUsers(): void {
    this.http.get<any>(this.allUserUrl).subscribe((userList) => {
      this.users = userList.data;
      this.users$.next(this.users);
    });
  }

  setPublicSession(isPublic: boolean): void {
    this.publicSession = isPublic;
    this.publicSession$.next(this.publicSession);
  }
  getPublicSession(): boolean {
    return this.publicSession;
  }

  setSelectedUser(user: User): void {
    const urlUser = this.userUrl + '/' + String(user.id);
    this.http.get<any>(urlUser).subscribe((eachUser) => {
      this.userSelected = eachUser.data;
      this.userSelected$.next(eachUser.data);
    });
    if(user.size_font_configs.length > 0)
      this.userPrefService.setFontSize(user.size_font_configs.find(value => value.default)?.size || user.font_size);
    else
      this.userPrefService.setFontSize(user.font_size);
    this.userPrefService.setHandicap(user.handicap);
  }

  getUserSelected(): User {
    return this.userSelected;
  }

  addUser(user: User): void {
    this.users.push(user);
    this.users$.next(this.users);
  }


  deleteUser(user: User): void {
    this.users = this.users.filter(value => value.id !== user.id);
    this.users$.next(this.users);
  }

  getUser(id: number): User {
    return this.users.find(value => value.id === id);
  }

  getUsers(): User[] {
    return this.users;
  }

}
