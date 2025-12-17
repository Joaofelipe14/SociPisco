import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-foto-obrigatoria-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './foto-obrigatoria-modal.html',
  styleUrls: ['./foto-obrigatoria-modal.css']
})
export class FotoObrigatoriaModalComponent {

  constructor(
    private dialogRef: MatDialogRef<FotoObrigatoriaModalComponent>,
    private router: Router
  ) {}

  irParaMeusDados() {
    this.dialogRef.close();
    this.router.navigate(['/meus-dados']);
  }

  fechar() {
    this.dialogRef.close();
  }
}
