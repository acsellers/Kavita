import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { SettingsService } from '../admin/settings.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-register-member',
  templateUrl: './register-member.component.html',
  styleUrls: ['./register-member.component.scss']
})
export class RegisterMemberComponent implements OnInit {

  @Input() firstTimeFlow = false;
  /**
   * Emits the new user created.
   */
  @Output() created = new EventEmitter<User | null>();

  adminExists = false;
  authDisabled: boolean = false;
  registerForm: FormGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', []),
      isAdmin: new FormControl(false, [])
  });
  errors: string[] = [];

  constructor(private accountService: AccountService, private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.settingsService.getAuthenticationEnabled().pipe(take(1)).subscribe(authEnabled => {
      this.authDisabled = !authEnabled;
    });
    if (this.firstTimeFlow) {
      this.registerForm.get('isAdmin')?.setValue(true);
    }
  }

  register() {
    this.accountService.register(this.registerForm.value).subscribe(user => {
      this.created.emit(user);
    }, err => {
      this.errors = err;
    });
  }

  cancel() {
    this.created.emit(null);
  }

}
