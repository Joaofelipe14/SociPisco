import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { gerarSlug } from '../../../utils/slug';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-psicologos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './psicologos.html',
  styleUrls: ['./psicologos.css']
})
export class AdminPsicologos implements OnInit {
  psicologos: any[] = [];
  loading = false;
  filtroAtivo: 'todos' | 'ativo' | 'inativo' = 'todos';
  psicologoSelecionado: any = null;
  confirmTogglePsicologo: { psicologo: any; novoStatus: boolean; notificar: boolean } | null = null;
  today = new Date();

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) { }

  ngOnInit() {

    const token = localStorage.getItem('supa_access_token');
    if (!token) {
      alert('Acesso restrito a administradores.');
      this.router.navigate(['admin/login']);
    }
    this.loadPsicologos();
  }

  truncate(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  async loadPsicologos() {
    this.loading = true;
    try {
      let filtro;
      if (this.filtroAtivo === 'ativo') filtro = true;
      else if (this.filtroAtivo === 'inativo') filtro = false;
      else filtro = undefined;

      this.ngZone.runOutsideAngular(async () => {
        const psicologos = await this.supabaseService.buscarPsicologosAdmin(filtro);

        psicologos.forEach(p => {
          try { if (typeof p.abordagem_terapeutica === 'string') p.abordagem_terapeutica = JSON.parse(p.abordagem_terapeutica); } catch { p.abordagem_terapeutica = []; }
          try { if (typeof p.publico_alvo === 'string') p.publico_alvo = JSON.parse(p.publico_alvo); } catch { p.publico_alvo = []; }
        });

        this.ngZone.run(() => {
          this.psicologos = psicologos;
          this.loading = false;
          this.cdr.markForCheck();
        });
      });
    } catch (error) {
      console.error('Erro ao buscar psicólogos:', error);
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
    }
  }

  onFiltroChange(novoFiltro: 'todos' | 'ativo' | 'inativo') {
    this.filtroAtivo = novoFiltro;
    this.loadPsicologos();
  }

  abrirModal(psicologo: any) {
    this.psicologoSelecionado = psicologo;
  }

  fecharModal() {
    this.psicologoSelecionado = null;
  }

  getInicial(nome: string) {
    return nome ? nome.charAt(0).toUpperCase() : '?';
  }

  abrirConfirmToggle(psicologo: any) {
    this.confirmTogglePsicologo = { psicologo, novoStatus: !psicologo.liberado_admin, notificar: true };
  }

  fecharConfirmToggle() {
    this.confirmTogglePsicologo = null;
  }



  modalLoading = false;

  abrirWhatsApp(whatsapp: string, msg = 'Olá, sou da  Socipsi') {
    if (whatsapp) {
      const numero = whatsapp.replace(/\D/g, '');
      const texto = encodeURIComponent(msg);
      const url = `https://wa.me/${numero}?text=${texto}`;
      window.open(url, '_blank');
    }
  }

  abrimomodalLiberacao(p: any) {
    this.confirmTogglePsicologo = { psicologo: p, novoStatus: !p.liberado_admin, notificar: true };
  }

  async toggleLiberadoAdmin(p: any) {
    const novo = !p.liberado_admin;

    const resp = await this.supabaseService.toggleAtivoPsicologo(p.id, novo);
    if (resp[0].id != p.id) {
      alert('ID DIVERGENTE PARANDO AQUI')
      return;
    }

    p.liberado_admin = novo;

    // Atualiza também na lista principal
    const index = this.psicologos.findIndex(x => x.id === p.id);
    if (index !== -1) {
      this.psicologos[index].liberado_admin = novo;
    }

    if (this.confirmTogglePsicologo?.notificar) {
      this.notificarCliente(p, novo);
    }
    this.cdr.markForCheck();

    this.confirmTogglePsicologo = null;
  }
  notificarCliente(psicologo: any, novoStatus: boolean) {

    const slug = this.getSlug(psicologo);
    let mensagem = `Olá ${psicologo.nome}!
    Seu cadastro foi aprovado no SociPsi.
    Acesse o site e finalize sua assinatura para começar a divulgar seus atendimentos e atrair novos pacientes.
    Estamos prontos para impulsionar sua agenda! 🚀
    https://socipsi.com.br/piscologo/${slug}`;


    // let mensagem = `Olá ${psicologo.nome}! ⏰
    // Sua assinatura do SociPsi está chegando ao fim.
    // Entre no site e renove sua assinatura para continuar aumentando sua visibilidade e mantendo sua agenda sempre cheia.
    // https://socipsi.com.br/${slug}`;


    if (!novoStatus) {
      mensagem = `Olá ${psicologo.nome}, seu acesso foi bloqueado pela nossa equipe. Por favor, entre em contato conosco para mais informações.`;
    };


    this.abrirWhatsApp(psicologo.whatsapp || '', mensagem);
  }


  isAtivo(p: any): boolean {

    return p.liberado_admin && p.assinaturas?.some((a: { status: string; data_expiracao: string | number | Date; }) =>
      a.status === 'ativo' && new Date(a.data_expiracao) > this.today
    );
  }

  diasTeste: number = 7;
  motivoTeste: string = '';

  async liberarPeriodoGratis(p: any) {
    if (!this.diasTeste || this.diasTeste < 1) return;

    const resp = await this.supabaseService.criarAssinaturaTeste(
      p.id,
      this.diasTeste,
      this.motivoTeste || 'liberado admin - Periodo gratis'
    );

    if (!resp || !resp[0]) return;

    const nova = resp[0];

    p.assinaturas = p.assinaturas ? [...p.assinaturas] : [];
    p.assinaturas.unshift(nova);

    // Atualiza na lista principal
    const idx = this.psicologos.findIndex(x => x.id == p.id);
    if (idx !== -1) {
      this.psicologos[idx].assinaturas = this.psicologos[idx].assinaturas
        ? [...this.psicologos[idx].assinaturas]
        : [];
      this.psicologos[idx].assinaturas.unshift(nova);

    }

    this.cdr.markForCheck();
    this.fecharModal();
  }

  getSlug(psicologo: any): string {
    if (!psicologo) return '';
    return gerarSlug(psicologo.nome || '', psicologo.crp || '');
  }

}
