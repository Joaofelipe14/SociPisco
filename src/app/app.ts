import { Component, signal, PLATFORM_ID, Inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { Footer } from './footer/footer';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CommonModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-psicologia');
  showNavbar = true;

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Mostrar/ocultar Navbar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showNavbar = event.url !== '/';
      });

    // Atualizar title automaticamente
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route.snapshot.data['title'] || '';
        })
      )
      .subscribe(title => this.titleService.setTitle(title));

    // Rolar para o topo ao navegar entre páginas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          // Múltiplas tentativas para garantir que funcione
          const scrollToTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          };
          
          // Executar imediatamente
          scrollToTop();
          
          // Executar após um pequeno delay (após renderização)
          setTimeout(() => {
            scrollToTop();
          }, 10);
        }
      });
  }
}
