import { Component, ChangeDetectorRef, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FotoObrigatoriaModalComponent } from '../../foto-obrigatoria-modal/foto-obrigatoria-modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class 
LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  tipoUsuario: 'paciente' | 'psicologo' = 'psicologo';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {

    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/meus-dados']);

    }
  }

  onSubmit() {
    if (!this.loginForm.valid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, senha } = this.loginForm.value;

    console.log('Iniciando login...', { tipo: this.tipoUsuario, email });

    this.authService.login(this.tipoUsuario, email, senha).subscribe({
      next: (res) => {
        console.log('Login SUCCESS:', res);
        if (res.success) {
          this.router.navigate(['/meus-dados']);
          // Verifica se o psicólogo tem foto após o login
          this.verificarFotoPerfil();
        }
        this.loading = false;
      },
      error: (err) => {
        console.log('Login ERROR capturado:', err);
        console.log('err.message:', err.message);
        console.log('err.error:', err.error);

        // Força execução dentro da zona do Angular
        this.ngZone.run(() => {
          // Trata diferentes tipos de erro
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else if (typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else {
            this.errorMessage = 'Email ou senha inválidos.';
          }

          console.log('errorMessage definido como:', this.errorMessage);
          this.loading = false;
          this.cdr.markForCheck();
          console.log('markForCheck chamado');
        });
      }
    });
  }

  setTipoUsuario(tipo: 'paciente' | 'psicologo') {
    this.tipoUsuario = tipo;
    this.errorMessage = '';
  }

  verificarFotoPerfil() {
    this.auth.me().subscribe({
      next: (res) => {
        if (!res.user?.foto_url) {
          setTimeout(() => {
            this.dialog.open(FotoObrigatoriaModalComponent, {
              width: '90%',
              maxWidth: '550px',
              maxHeight: '90vh',
              disableClose: false
            });
          }, 500);
        }
      }
    });
  }
}