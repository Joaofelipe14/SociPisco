import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./forgot-password-component.css'],
  templateUrl: './forgot-password-component.html'
})
export class ForgotPasswordComponent {
  step: 'email' | 'code' | 'reset' = 'email';
  resetToken = '';
  loading = false;
  error = '';

  canResend = false;
  timer = 60;
  interval: any;

  emailForm;
  codeForm;
  resetForm;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,

  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.resetForm = this.fb.group({
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]]
    });
  }

  sendEmail() {
    if (this.loading) return;

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.auth.forgotPassword(this.emailForm.value.email!).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.step = 'code';
          this.startTimer();
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = err.error?.message || 'Erro ao enviar código';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  resendCode() {
    if (this.loading || !this.canResend) return;
    this.sendEmail();
  }

  startTimer() {
    this.canResend = false;
    this.timer = 60;

    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      this.ngZone.run(() => {
        this.timer--;
        if (this.timer === 0) {
          this.canResend = true;
          clearInterval(this.interval);
        }
        this.cdr.markForCheck();
      });
    }, 1000);
  }

  verifyCode() {
    if (this.loading) return;

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.auth.verifyCode(
      this.emailForm.value.email!,
      this.codeForm.value.code!
    ).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.resetToken = res.reset_token;
          this.step = 'reset';
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = err.error?.message || 'Código inválido';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  resetPassword() {
    if (this.loading) return;

    if (this.resetForm.value.senha !== this.resetForm.value.confirmar) {
      this.error = 'Senhas não conferem';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.auth.resetPassword(this.resetToken, this.resetForm.value.senha!).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.step = 'email';
          this.resetForm.reset();
          this.codeForm.reset();
          this.loading = false;
          this.cdr.markForCheck();
          alert('Senha redefinida com sucesso! Agora você pode fazer login.');
          this.router.navigate(['/meus-dados']);

        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = err.error?.message || 'Erro ao redefinir senha';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }
}
