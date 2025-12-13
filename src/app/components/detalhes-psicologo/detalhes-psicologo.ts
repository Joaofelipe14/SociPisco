
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { gerarSlug } from '../../utils/slug';
declare var gtag: Function;

@Component({
  selector: 'app-detalhes-psicologo',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './detalhes-psicologo.html',
  styleUrls: ['./detalhes-psicologo.css'],
})
export class DetalhesPsicologoComponent implements OnInit {
  psicologo: any = null;
  loading = true;
  error = false;
  faWhatsapp = faWhatsapp; // ⚠️ deve ser propriedade da classe
  shareSuccess = false;
  resumoExpandido = false;
  readonly RESUMO_LIMITE_CARACTERES = 500;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    window.scroll(0, 0)
    this.loading = true;
    this.cdr.markForCheck();

    this.route.params.subscribe(params => {
      const slug = params['id']; // O parâmetro ainda se chama 'id' na rota, mas agora recebe o slug

      this.supabaseService.buscarPsicologoPorSlug(slug)
        .then(psicologo => {
          this.ngZone.run(() => {
            this.psicologo = psicologo || null;
            this.loading = false;
            if (!psicologo) this.error = true;
            if (psicologo) {
              gtag('event', 'view_psicologo', {
                psicologo_nome: psicologo.nome,
                psicologo_slug: slug
              });
            }
            this.cdr.markForCheck();
          });
        })
        .catch(err => {
          this.ngZone.run(() => {
            console.error('Erro ao buscar psicólogo:', err);
            this.error = true;
            this.loading = false;
            this.cdr.markForCheck();
          });
        });
    });
  }

  abrirWhatsApp() {
    if (this.psicologo?.whatsapp) {
      const whatsapp = this.psicologo.whatsapp;
      const url = whatsapp.startsWith('http')
        ? whatsapp
        : `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
      window.open(url, '_blank');
    }
  }

  voltar() {
    this.router.navigate(['/psicologos']);
  }

  parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
      } catch {
        // Se não for JSON válido, trata como string simples
        return value ? [value] : [];
      }
    }
    // Se já for array, retorna direto
    if (Array.isArray(value)) {
      return value;
    }
    // Se não for string nem array, retorna array vazio
    return [];
  }

  getAbordagem(): string {
    const abordagens = this.getAbordagensArray();
    if (abordagens.length > 0) {
      return abordagens[0];
    }
    return this.psicologo?.areas_atuacao && this.psicologo.areas_atuacao.length > 0
      ? this.psicologo.areas_atuacao[0]
      : 'Psicologia';
  }

  getAbordagensArray(): string[] {
    return this.parseJson(this.psicologo?.abordagem_terapeutica);
  }

  getPublicoAlvoArray(): string[] {
    return this.parseJson(this.psicologo?.publico_alvo);
  }

  getRedesSociais(): string[] {
    const redes = this.psicologo?.redes_sociais;

    if (Array.isArray(redes)) {
      return redes.filter(r => r && r.trim() !== '');
    }

    return [];
  }

  identificarRedeSocial(url: string): string {
    if (!url) return 'website';

    const urlLower = url.toLowerCase();

    // Normalizar URL (adicionar https:// se não tiver protocolo)
    let normalizedUrl = urlLower;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Instagram
    if (normalizedUrl.includes('instagram.com') || urlLower.includes('instagram')) {
      return 'instagram';
    }

    // Facebook
    if (normalizedUrl.includes('facebook.com') || urlLower.includes('facebook')) {
      return 'facebook';
    }

    // LinkedIn
    if (normalizedUrl.includes('linkedin.com') || urlLower.includes('linkedin')) {
      return 'linkedin';
    }

    // Twitter/X
    if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com') || urlLower.includes('twitter') || urlLower.includes('x.com')) {
      return 'twitter';
    }

    // YouTube
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be') || urlLower.includes('youtube')) {
      return 'youtube';
    }

    // TikTok
    if (normalizedUrl.includes('tiktok.com') || urlLower.includes('tiktok')) {
      return 'tiktok';
    }

    // Site pessoal (padrão)
    return 'website';
  }

  normalizarUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return 'https://' + url;
  }

  getAvatarUrl(): string {
    if (this.psicologo?.foto_url) {
      return this.psicologo.foto_url;
    }
    const nome = this.psicologo?.nome || 'Psicólogo';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=14b8a6&color=fff&size=200`;
  }

  compartilharPerfil() {
    // Gera o link com slug (nome + CRP) ao invés do ID
    const nome = this.psicologo?.nome || 'Psicólogo';
    const crp = this.psicologo?.crp || '';
    const slug = gerarSlug(nome, crp);
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/psicologo/${slug}`;
    const texto = `Conheça ${nome} no SociPsi - ${this.getAbordagem()}`;

    // Tenta usar a Web Share API se disponível (mobile)
    if (navigator.share) {
      navigator.share({
        title: `${nome} - SociPsi`,
        text: texto,
        url: url
      }).catch(() => {
        // Se o usuário cancelar, não faz nada
      });
    } else {
      // Fallback: copia o link para a área de transferência
      navigator.clipboard.writeText(url).then(() => {
        this.shareSuccess = true;
        setTimeout(() => {
          this.shareSuccess = false;
        }, 2000);
      }).catch(() => {
        // Fallback adicional: mostra o link em um prompt
        prompt('Copie o link:', url);
      });
    }
  }

  getResumoCompleto(): string {
    return this.psicologo?.resumo || '';
  }

  getResumoTruncado(): string {
    const resumo = this.psicologo?.resumo || '';
    if (resumo.length <= this.RESUMO_LIMITE_CARACTERES) {
      return resumo;
    }
    // Encontra o último espaço antes do limite para não cortar palavras
    const truncado = resumo.substring(0, this.RESUMO_LIMITE_CARACTERES);
    const ultimoEspaco = truncado.lastIndexOf(' ');
    return ultimoEspaco > 0 ? truncado.substring(0, ultimoEspaco) + '...' : truncado + '...';
  }

  precisaVerMais(): boolean {
    const resumo = this.psicologo?.resumo || '';
    return resumo.length > this.RESUMO_LIMITE_CARACTERES;
  }

  toggleResumo() {
    this.resumoExpandido = !this.resumoExpandido;
  }
}
