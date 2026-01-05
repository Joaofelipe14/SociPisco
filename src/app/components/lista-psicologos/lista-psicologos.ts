import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { ALL_ABORDAGENS, ALL_AREAS, ALL_PUBLICOS } from '../constants';
import { gerarSlug } from '../../utils/slug';
declare var gtag: Function;

@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './lista-psicologos.html',
  styleUrls: ['./lista-psicologos.css'],
})
export class ListaPsicologos implements OnInit {
  psicologos$!: Observable<any[]>;
  psicologosFiltrados$!: Observable<any[]>;
  psicologosExibidos: any[] = [];
  psicologosFiltrados: any[] = [];
  itemsPorPagina = 10;
  itemsExibidos = 10;
  searchTerm = '';
  viewMode: 'card' | 'list' = 'card';
  faWhatsapp = faWhatsapp;

  allAreas = ALL_AREAS;
  allAbordagens = ALL_ABORDAGENS;
  allPublicos = ALL_PUBLICOS;

  selectedAreas: string[] = [];
  selectedAbordagens: string[] = [];
  selectedPublicos: string[] = [];

  searchAreas = '';
  searchAbordagens = '';
  searchPublicos = '';

  showAreasDropdown = false;
  showAbordagensDropdown = false;
  showPublicosDropdown = false;
  filtrosExpandidos = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Recuperar preferência do localStorage apenas no browser
    if (isPlatformBrowser(this.platformId)) {
      const savedViewMode = localStorage.getItem('psicologos-view-mode');
      if (savedViewMode === 'card' || savedViewMode === 'list') {
        this.viewMode = savedViewMode;
      }
    }
  }

  ngOnInit() {
    gtag('event', 'visualizar_lista_psicologos');

    this.psicologos$ = from(this.supabaseService.buscarPsicologos());
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    gtag('event', 'aplicar_filtro_psicologo', {
      areas: this.selectedAreas.join(','),
      abordagens: this.selectedAbordagens.join(','),
      publicos: this.selectedPublicos.join(',')
    });
    this.psicologosFiltrados$ = this.psicologos$.pipe(
      map(psicologos => {
        let filtrados = psicologos;

        const term = this.searchTerm.toLowerCase();
        if (term) {
          filtrados = filtrados.filter(p => {
            const abordagens = this.parseJson(p.abordagem_terapeutica);
            const publicos = this.parseJson(p.publico_alvo);
            return (
              p.nome?.toLowerCase().includes(term) ||
              abordagens.some((a: string) => a.toLowerCase().includes(term)) ||
              p.areas_atuacao?.some((area: string) => area.toLowerCase().includes(term)) ||
              p.formacao?.toLowerCase().includes(term) ||
              publicos.some((pub: string) => pub.toLowerCase().includes(term))
            );
          });
        }

        if (this.selectedAreas.length > 0) {
          filtrados = filtrados.filter(p => {
            const areas = p.areas_atuacao || [];
            return this.selectedAreas.some(area => areas.includes(area));
          });
        }

        if (this.selectedAbordagens.length > 0) {
          filtrados = filtrados.filter(p => {
            const abordagens = this.parseJson(p.abordagem_terapeutica);
            return this.selectedAbordagens.some(ab => abordagens.includes(ab));
          });
        }

        if (this.selectedPublicos.length > 0) {
          filtrados = filtrados.filter(p => {
            const publicos = this.parseJson(p.publico_alvo);
            return this.selectedPublicos.some(pub => publicos.includes(pub));
          });
        }

        // Randomizar a ordem dos psicólogos de forma determinística (baseada na data)
        filtrados = this.randomizarOrdem(filtrados);

        // Armazenar lista filtrada e resetar paginação
        this.psicologosFiltrados = filtrados;
        this.itemsExibidos = this.itemsPorPagina;
        this.atualizarPsicologosExibidos();

        return filtrados;
      })
    );
  }

  atualizarPsicologosExibidos() {
    this.psicologosExibidos = this.psicologosFiltrados.slice(0, this.itemsExibidos);
  }

  carregarMais() {
    this.itemsExibidos += this.itemsPorPagina;
    this.atualizarPsicologosExibidos();
    gtag('event', 'carregar_mais_psicologos', {
      items_exibidos: this.itemsExibidos
    });
  }

  get temMaisParaCarregar(): boolean {
    return this.itemsExibidos < this.psicologosFiltrados.length;
  }

  onSearchChange() {
    gtag('event', 'buscar_psicologo', {
      termo_busca: this.searchTerm
    });
    this.aplicarFiltros();
  }

  verDetalhes(psicologo: any) {
    // Gera o slug a partir do nome e CRP do psicólogo
    const nome = psicologo?.nome || '';
    const crp = psicologo?.crp || '';
    const slug = gerarSlug(nome, crp);
    this.router.navigate(['/psicologo', slug]);
  }

  abrirWhatsApp(whatsapp: string, nome: string) {
    if (!whatsapp) return

    let numero = whatsapp.replace(/\D/g, '')

    if (numero.length === 11 && !numero.startsWith('55')) {
      numero = '55' + numero
    }

    gtag('event', 'click_whatsapp', {
      pessoa_nome: nome,
      numero_whatsapp: numero
    });

    const texto = encodeURIComponent('Olá, vim pela Socipsi e queria verificar disponibilidade de agendamento de horário.')
    const url = `https://wa.me/${numero}?text=${texto}`
    window.open(url, '_blank')
  }



  parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        return value ? [value] : [];
      }
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  }

  getPrimeiraArea(areas: string[]): string {
    return areas && areas.length > 0 ? areas[0] : 'Psicologia';
  }

  getPrimeiraAbordagem(psicologo: any): string {
    const abordagens = this.parseJson(psicologo?.abordagem_terapeutica);
    if (abordagens.length > 0) {
      return abordagens[0];
    }
    return this.getPrimeiraArea(psicologo?.areas_atuacao);
  }

  getPublicoAlvo(psicologo: any): string {
    const publicos = this.parseJson(psicologo?.publico_alvo);
    if (publicos.length > 0) {
      return publicos.join(', ');
    }
    return '';
  }

  getAbordagensArray(psicologo: any): string[] {
    return this.parseJson(psicologo?.abordagem_terapeutica);
  }

  getPublicoAlvoArray(psicologo: any): string[] {
    return this.parseJson(psicologo?.publico_alvo);
  }

  getResumoTruncado(psicologo: any, limite: number = 120): string {
    const resumo = psicologo?.resumo || '';
    if (!resumo || resumo.length <= limite) {
      return resumo;
    }
    // Encontra o último espaço antes do limite para não cortar palavras
    const truncado = resumo.substring(0, limite);
    const ultimoEspaco = truncado.lastIndexOf(' ');
    return ultimoEspaco > 0 ? truncado.substring(0, ultimoEspaco) + '...' : truncado + '...';
  }

  getAvatarUrl(psicologo: any): string {
    if (psicologo?.foto_url) {
      return psicologo.foto_url;
    }
    const nome = psicologo?.nome || 'Psicólogo';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=14b8a6&color=fff&size=128`;
  }

  setViewMode(mode: 'card' | 'list') {
    this.viewMode = mode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('psicologos-view-mode', mode);
    }
  }

  get filteredAreas(): string[] {
    return this.allAreas.filter(a =>
      a.toLowerCase().includes(this.searchAreas.toLowerCase()) &&
      !this.selectedAreas.includes(a)
    );
  }

  get filteredAbordagens(): string[] {
    return this.allAbordagens.filter(a =>
      a.toLowerCase().includes(this.searchAbordagens.toLowerCase()) &&
      !this.selectedAbordagens.includes(a)
    );
  }

  get filteredPublicos(): string[] {
    return this.allPublicos.filter(p =>
      p.toLowerCase().includes(this.searchPublicos.toLowerCase()) &&
      !this.selectedPublicos.includes(p)
    );
  }

  addFilter(type: 'areas' | 'abordagens' | 'publicos', item: string): void {
    if (type === 'areas') {
      if (!this.selectedAreas.includes(item)) {
        this.selectedAreas.push(item);
        this.searchAreas = '';
        this.showAreasDropdown = false;
      }
    } else if (type === 'abordagens') {
      if (!this.selectedAbordagens.includes(item)) {
        this.selectedAbordagens.push(item);
        this.searchAbordagens = '';
        this.showAbordagensDropdown = false;
      }
    } else if (type === 'publicos') {
      if (!this.selectedPublicos.includes(item)) {
        this.selectedPublicos.push(item);
        this.searchPublicos = '';
        this.showPublicosDropdown = false;
      }
    }
    // Expande os filtros automaticamente quando um novo filtro é adicionado
    if (!this.filtrosExpandidos) {
      this.filtrosExpandidos = true;
    }
    this.aplicarFiltros();
  }

  removeFilter(type: 'areas' | 'abordagens' | 'publicos', item: string): void {
    if (type === 'areas') {
      this.selectedAreas = this.selectedAreas.filter(i => i !== item);
    } else if (type === 'abordagens') {
      this.selectedAbordagens = this.selectedAbordagens.filter(i => i !== item);
    } else if (type === 'publicos') {
      this.selectedPublicos = this.selectedPublicos.filter(i => i !== item);
    }
    this.aplicarFiltros();
  }

  openDropdown(dropdown: 'areas' | 'abordagens' | 'publicos'): void {
    this.closeAllDropdowns();

    if (dropdown === 'areas') {
      this.showAreasDropdown = true;
    } else if (dropdown === 'abordagens') {
      this.showAbordagensDropdown = true;
    } else if (dropdown === 'publicos') {
      this.showPublicosDropdown = true;
    }
  }

  closeAllDropdowns(): void {
    this.showAreasDropdown = false;
    this.showAbordagensDropdown = false;
    this.showPublicosDropdown = false;
  }

  closeDropdownWithDelay(dropdown: 'areas' | 'abordagens' | 'publicos'): void {
    setTimeout(() => {
      if (dropdown === 'areas') {
        this.showAreasDropdown = false;
      } else if (dropdown === 'abordagens') {
        this.showAbordagensDropdown = false;
      } else if (dropdown === 'publicos') {
        this.showPublicosDropdown = false;
      }
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.autocomplete-wrapper')) {
      this.closeAllDropdowns();
    }
  }

  toggleFiltros() {
    this.filtrosExpandidos = !this.filtrosExpandidos;
  }

  get temFiltrosAtivos(): boolean {
    return this.selectedAreas.length > 0 ||
      this.selectedAbordagens.length > 0 ||
      this.selectedPublicos.length > 0;
  }

  /**
   * Gera uma seed numérica baseada na data atual (YYYY-MM-DD)
   * Isso garante que a ordem seja consistente durante o mesmo dia
   * mas mude diariamente de forma automática
   */
  private gerarSeedDoDia(): number {
    const hoje = new Date();
    const dataString = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    // Converte a string da data em um número hash simples
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Gerador de números pseudoaleatórios determinístico (Linear Congruential Generator)
   * Usa uma seed para garantir resultados reproduzíveis
   */
  private geradorAleatorio(seed: number): () => number {
    let valorAtual = seed;
    return () => {
      valorAtual = (valorAtual * 1664525 + 1013904223) % Math.pow(2, 32);
      return valorAtual / Math.pow(2, 32);
    };
  }

  /**
   * Randomiza a ordem de um array usando o algoritmo Fisher-Yates shuffle
   * com uma seed baseada na data, garantindo ordem consistente durante o dia
   * mas mudando diariamente
   */
  private randomizarOrdem<T>(array: T[]): T[] {
    if (array.length <= 1) return array;

    // Cria uma cópia do array para não modificar o original
    const copia = [...array];
    const seed = this.gerarSeedDoDia();
    const random = this.geradorAleatorio(seed);

    // Algoritmo Fisher-Yates shuffle
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }
}
