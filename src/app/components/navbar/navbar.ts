import { Component, OnInit, Inject } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  tipoUsuario: string = '';
  menuOpen = false;
  isBrowser = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Verifica se estamos no navegador (para evitar erros no SSR ou durante o SSR)
    this.isBrowser = isPlatformBrowser(this.platformId);

    // O scroll é gerenciado centralmente no app.ts
  }

  ngOnInit() {
    // Verifica se há um usuário autenticado
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnMobile() {
    // Fecha o menu se for dispositivo móvel e rola para o topo
    if (this.isBrowser && window.innerWidth <= 768) {
      this.menuOpen = false;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolagem suave
    }
  }

  logout() {
    if (window.confirm('Deseja sair do aplicativo?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
