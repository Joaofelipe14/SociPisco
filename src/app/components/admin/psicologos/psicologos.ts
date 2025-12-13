import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { gerarSlug } from '../../../utils/slug';

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
    private ngZone: NgZone
  ) { }

  ngOnInit() {
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

  async confirmarToggle() {
    if (!this.confirmTogglePsicologo) return;
    const { psicologo, novoStatus, notificar } = this.confirmTogglePsicologo;

    try {
      await this.supabaseService.toggleAtivoPsicologo(psicologo.id, novoStatus);
      this.ngZone.run(() => { psicologo.liberado_admin = novoStatus; this.cdr.markForCheck(); });
      if (notificar) this.notificarCliente(psicologo, novoStatus);
    } catch (error) { console.error('Erro ao alterar status:', error); }

    this.fecharConfirmToggle();
  }

  modalLoading = false;

  abrirWhatsApp(whatsapp: string) {
    if (whatsapp) {
      const numero = whatsapp.replace(/\D/g, '');
      const texto = encodeURIComponent('Olá, sou da  Socipsi');
      const url = `https://wa.me/${numero}?text=${texto}`;
      window.open(url, '_blank');
    }
  }


  async toggleLiberadoAdmin(p: any) {
    const novo = !p.liberado_admin;

    const resp = await this.supabaseService.toggleAtivoPsicologo(p.id, novo);

    console.log(resp)
    if (resp[0].id != p.id) {
      alert('ID DIVERGENTE PARANDO AQUI')
      return;
    }

    // Atualiza no objeto (modal)
    p.liberado_admin = novo;

    // Atualiza também na lista principal
    const index = this.psicologos.findIndex(x => x.id === p.id);
    if (index !== -1) {
      this.psicologos[index].liberado_admin = novo;
    }

    this.cdr.markForCheck();
  }

  notificarCliente(psicologo: any, ativo: boolean) {
    const mensagem = `Olá ${psicologo.nome}, seu status foi alterado para ${ativo ? 'Ativo' : 'Inativo'}.`;
    console.log('Enviar notificação via WhatsApp/Email:', mensagem);
    this.abrirWhatsApp(psicologo.whatsapp || '');
  }

  isAtivo(p: any): boolean {
    if (p.crp == '12/312312') {
      console.log(p)

    }
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
