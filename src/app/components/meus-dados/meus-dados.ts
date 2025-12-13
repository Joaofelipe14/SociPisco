import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Loading } from '../../loading/loading';
import planosJson from './planos.json';
import { ALL_ABORDAGENS, ALL_AREAS, ALL_PUBLICOS } from '../constants';
import { S3StorageService } from '../../services/s3-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { CardModalComponent } from '../../card-modal/card-modal';
import { ordem } from '../../services/ordem';
import { ConfirmAssinaturaDialog } from '../../confirm-assinatura-dialog/confirm-assinatura-dialog';
import { RouterModule } from '@angular/router';
import { gerarSlug } from '../../utils/slug'
@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, Loading, RouterModule],
  templateUrl: './meus-dados.html',
  styleUrls: ['./meus-dados.css'],
})
export class MeusDadosComponent implements OnInit {

  loading = false;
  errorMessage = '';
  successMessage = '';
  meusDadosForm!: FormGroup;
  today: string = new Date().toISOString().split('T')[0];
  assinaturasTotais: {
    total: string,
    pagas: string,
    pendentes: string,
    vencidas: string
  }[] = [];
  // Listas completas


  // busca dos inputs
  searchAreas = '';
  searchAbordagens = '';
  searchPublicos = '';
  mensagemDeCarregamento = "Carregando seus dados...";
  showAreasDropdown = false;
  showAbordagensDropdown = false;
  showPublicosDropdown = false;

  showSection = {
    dadosPessoais: true,
    especializacoes: false,
    areasAbordagensPublicos: false,
    redesSociais: false,
    pagamentos: false

  };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private s3service: S3StorageService,
    private dialog: MatDialog,
    private ordem: ordem
  ) { }

  allAreas = ALL_AREAS
  allAbordagens = ALL_ABORDAGENS
  allPublicos = ALL_PUBLICOS;
  planos = planosJson;

  ngOnInit() {
    this.initForm();
    this.loadUserData();
  }
  user: any
  initForm() {
    this.meusDadosForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      crp: [{ value: '', disabled: true }, Validators.required],
      whatsapp: ['', Validators.required],
      resumo: ['', Validators.required],
      formacao: ['', Validators.required],
      areas_atuacao: [[]],
      abordagem_terapeutica: [[]],
      publico_alvo: [[]],
      redes_sociais: this.fb.array([]),
      foto_url: [''],
      cpf: ['', Validators.required]
    });
  }

  // ---------------------------
  //   GETTERS
  // ---------------------------

  get redesSociais(): FormArray {
    return this.meusDadosForm.get('redes_sociais') as FormArray;
  }

  get filteredAreas() {
    return this.allAreas.filter(a =>
      a.toLowerCase().includes(this.searchAreas.toLowerCase())
    );
  }

  get filteredAbordagens() {
    return this.allAbordagens.filter(a =>
      a.toLowerCase().includes(this.searchAbordagens.toLowerCase())
    );
  }

  get filteredPublicos() {
    return this.allPublicos.filter(a =>
      a.toLowerCase().includes(this.searchPublicos.toLowerCase())
    );
  }


  get selectedAreas(): string[] {
    return this.meusDadosForm.get('areas_atuacao')?.value || [];
  }

  get selectedAbordagens(): string[] {
    return this.meusDadosForm.get('abordagem_terapeutica')?.value || [];
  }

  get selectedPublicos(): string[] {
    return this.meusDadosForm.get('publico_alvo')?.value || [];
  }
  // ---------------------------
  //   LOADING USER DATA
  // ---------------------------
  // Função genérica para fazer parse de valores JSON
  parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        // Tenta fazer o parse da string JSON para um objeto ou array
        return JSON.parse(value);
      } catch (e) {
        // Se falhar, retorna um array vazio ou um objeto vazio, dependendo do tipo esperado
        return [];
      }
    }
    return value || []; // Se não for string, retorna o próprio valor ou um array vazio
  }

  getStatusTexto(item: any) {
    const hoje = new Date()
    const expira = item.banco?.data_expiracao ? new Date(item.banco.data_expiracao) : null
    const diff = expira ? (expira.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) : null

    if (item.banco?.status === 'ativo') {
      if (diff !== null && diff <= 5 && diff >= 0) return 'Prestes a Expirar'
      if (diff !== null && diff < 0) return 'Expirada'
      return 'Ativa'
    }

    if (item.banco?.status === 'inativo' && item.banco?.motivo_status === 'PAYMENT_OVERDUE') return 'Pagamento em Atraso'
    if (item.banco?.status === 'inativo' && diff !== null && diff < 0) return 'Expirada'
    if (item.banco?.status === 'cancelado') return 'Cancelada'

    return 'Inativa'
  }

  podeMostrarPlanos(lista: any[]) {

    if (this.user.liberado_admin !== 1) {
      return false
    }
    if (!lista || !Array.isArray(lista) || lista.length === 0) {
      return true
    }
    for (const item of lista) {
      const status = this.getStatusTexto(item)
      if (status === 'Ativa' || status === 'Pagamento em Atraso') {
        return false
      }
    }

    return true
  }

  // Parse do motivo_status (JSON string)
  getMotivoStatus(assinaturaItem: any): any {
    if (!assinaturaItem?.motivo_status) return null;

    try {
      if (typeof assinaturaItem.motivo_status === 'string') {
        return JSON.parse(assinaturaItem.motivo_status);
      }
      return assinaturaItem.motivo_status;
    } catch (e) {
      return null;
    }
  }

  // Tradução de Cycle (Frequência)
  traduzirCycle(cycle: string): string {
    const traducoes: { [key: string]: string } = {
      'WEEKLY': 'Semanal',
      'MONTHLY': 'Mensal',
      'YEARLY': 'Anual',
      'DAILY': 'Diária',
      'BIWEEKLY': 'Quinzenal',
      'QUARTERLY': 'Trimestral',
      'SEMIANNUAL': 'Semestral',
      'BIANNUAL': 'Bianual'
    };
    return traducoes[cycle] || cycle;
  }

  // Tradução de BillingType (Forma de Pagamento)
  traduzirBillingType(billingType: string): string {
    const traducoes: { [key: string]: string } = {
      'UNDEFINED': 'Indefinido',
      'CREDIT_CARD': 'Cartão de Crédito',
      'BOLETO': 'Boleto Bancário',
      'PIX': 'PIX',
      'DEBIT_CARD': 'Cartão de Débito',
      'TRANSFER': 'Transferência Bancária'
    };
    return traducoes[billingType] || billingType;
  }

  // Tradução de Status
  traduzirStatus(status: string): string {
    const traducoes: { [key: string]: string } = {
      'ACTIVE': 'Ativa',
      'INACTIVE': 'Inativa',
      'EXPIRED': 'Expirada',
      'CANCELED': 'Cancelada',
      'PENDING': 'Pendente'
    };
    return traducoes[status] || status;
  }

  // Formatar data de próximo vencimento
  getProximoVencimento(assinaturaItem: any): string {
    const motivoStatus = this.getMotivoStatus(assinaturaItem);
    if (!motivoStatus?.nextDueDate) return 'Não informado';

    try {
      const date = new Date(motivoStatus.nextDueDate);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return motivoStatus.nextDueDate;
    }
  }

  // Verifica se deve mostrar aviso de desativação
  // Mostra quando há data_expiracao e está dentro da janela de 5 dias após expiração
  deveMostrarAvisoDesativacao(assinaturaItem: any): boolean {
    const dataExpiracao = assinaturaItem?.data_expiracao;
    if (!dataExpiracao) return false;

    try {
      const dataExp = new Date(dataExpiracao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataExp.setHours(0, 0, 0, 0);

      // Calcula a diferença em dias
      const diffTime = dataExp.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Mostra aviso se já expirou ou está nos últimos 5 dias antes de expirar
      // E também mostra se já passou até 5 dias após a expiração
      const dataLimite = new Date(dataExp);
      dataLimite.setDate(dataLimite.getDate() + 5); // 5 dias após expiração
      const diffLimite = dataLimite.getTime() - hoje.getTime();
      const diasAteLimite = Math.ceil(diffLimite / (1000 * 60 * 60 * 24));

      // Mostra se está nos últimos 5 dias antes de expirar OU se já expirou mas ainda está dentro dos 5 dias após
      return (diffDays <= 5 && diffDays >= 0) || (diffDays < 0 && diasAteLimite >= 0);
    } catch (e) {
      return false;
    }
  }

  // Calcula dias até/pós expiração
  getDiasExpiracao(assinaturaItem: any): number {
    const dataExpiracao = assinaturaItem?.data_expiracao;
    if (!dataExpiracao) return 0;

    try {
      const dataExp = new Date(dataExpiracao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataExp.setHours(0, 0, 0, 0);

      const diffTime = dataExp.getTime() - hoje.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  }

  // Verifica se já expirou
  jaExpirou(assinaturaItem: any): boolean {
    return this.getDiasExpiracao(assinaturaItem) < 0;
  }

  // Formata data de expiração
  getDataExpiracaoFormatada(assinaturaItem: any): string {
    // Tenta primeiro data_expiracao, depois endDate
    const dataExpiracao = assinaturaItem?.data_expiracao || assinaturaItem?.assinatura?.endDate;
    if (!dataExpiracao) return '';

    try {
      const date = new Date(dataExpiracao);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  }

  // Verifica se é o dia do vencimento/expiração
  ehDiaVencimento(assinaturaItem: any): boolean {
    const dataExpiracao = assinaturaItem?.data_expiracao || assinaturaItem?.assinatura?.endDate;
    if (!dataExpiracao) return false;

    try {
      const dataExp = new Date(dataExpiracao);
      const hoje = new Date();

      // Compara apenas dia, mês e ano (ignora horas)
      hoje.setHours(0, 0, 0, 0);
      dataExp.setHours(0, 0, 0, 0);

      return dataExp.getTime() === hoje.getTime();
    } catch (e) {
      return false;
    }
  }

  // Calcula data limite para desativação (5 dias após expiração)
  getDataLimiteDesativacao(assinaturaItem: any): string {
    const dataExpiracao = assinaturaItem?.data_expiracao;
    if (!dataExpiracao) return 'Não informado';

    try {
      const dataExp = new Date(dataExpiracao);
      // Adiciona 5 dias
      dataExp.setDate(dataExp.getDate() + 5);
      return dataExp.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Não informado';
    }
  }

  // Expor Math para uso no template
  Math = Math;


  formatCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (!value) {
      this.meusDadosForm.patchValue({ cpf: '' });
      return;
    }

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 3) value = value.replace(/(\d{3})(\d)/, '$1.$2');
    if (value.length > 6) value = value.replace(/(\d{3})(\d)/, '$1.$2');
    if (value.length > 9) value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
    this.meusDadosForm.patchValue({ cpf: value });
  }

  loadUserData() {
    this.loading = true;

    this.auth.me().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          const user = res.user;
          this.user = user;

          if (user.cpf) {
            this.meusDadosForm.get('cpf')?.disable()

          } else {
            this.meusDadosForm.get('cpf')?.enable()

          }

          this.meusDadosForm.patchValue({
            nome: user.nome,
            email: user.email,
            crp: user.crp,
            whatsapp: user.whatsapp,
            resumo: user.resumo,
            formacao: user.formacao,
            areas_atuacao: user.areas_atuacao || [],
            abordagem_terapeutica: this.parseJson(user.abordagem_terapeutica),
            publico_alvo: this.parseJson(user.publico_alvo),
            foto_url: user.foto_url,
            cpf: user.cpf
          });


          this.fotoPreview = user.foto_url;

          this.redesSociais.clear();
          (user.redes_sociais || []).forEach((url: string) => {
            this.redesSociais.push(this.fb.control(url));
          });

          this.loading = false;
          this.cdr.markForCheck();
        });
      },

      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'Erro ao carregar seus dados.';
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }


  // ---------------------------
  //   ACTIONS
  // ---------------------------

  addItem(field: string, item: string) {
    const current = this.meusDadosForm.get(field)?.value;
    if (!current.includes(item)) {
      this.meusDadosForm.patchValue({ [field]: [...current, item] });
    }
  }

  removeItem(field: string, item: string) {
    const arr = this.meusDadosForm.get(field)?.value;
    this.meusDadosForm.patchValue({
      [field]: arr.filter((i: string) => i !== item)
    });
  }

  addRede() {
    this.redesSociais.push(this.fb.control(''));
  }

  removeRede(i: number) {
    this.redesSociais.removeAt(i);
  }

  // ---------------------------
  //   UPDATE USER
  // ---------------------------

  salvarAlteracoes() {
    if (this.meusDadosForm.invalid) {
      this.ngZone.run(() => {
        this.errorMessage = 'Preencha todos os campos obrigatórios.';
        this.cdr.markForCheck();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.auth.update(this.meusDadosForm.value).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Dados atualizados com sucesso!';
          this.loading = false;

          this.cdr.markForCheck();
          console.log('markForCheck chamado (sucesso)');
        });
      },

      error: (error) => {
        this.ngZone.run(() => {
          const msg = error?.error?.error || error?.message || '';

          if (msg.includes('psicologos_email_key')) {
            this.errorMessage = 'O e-mail informado já está cadastrado em nossa base.';
          }
          else if (msg.includes('psicologos_crp_key')) {
            this.errorMessage = 'O CRP informado já está cadastrado em nossa base.';
          }
          else {
            this.errorMessage = 'Erro ao salvar alterações. Tente novamente.';
          }

          this.loading = false;

          this.cdr.markForCheck();
        });
      }
    });
  }

  formatWhatsApp(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }

    input.value = value;
    this.meusDadosForm.patchValue({ whatsapp: value });
  }

  formatCRP(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) value = value.slice(0, 8);

    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    input.value = value;
    this.meusDadosForm.patchValue({ crp: value });
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

  // ---------------------------
  //   CONTROLADOR DAS SEÇÕES EXPANSÍVEIS
  // ---------------------------

  async toggleSection(section: keyof typeof this.showSection) {
    // Primeiro, desativa todas as seções
    Object.keys(this.showSection).forEach(key => {
      this.showSection[key as keyof typeof this.showSection] = false;
    });

    this.showSection[section] = true;
    if (section == 'pagamentos' && this.assinaturas.length == 0) {
      this.loadingPagamentos = true;
      await this.carregarAssinaturas()
    }
  }

  fotoUploadStatus = '';
  fotoPreview = '';

  async uploadFoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fotoUploadStatus = "Enviando foto...";
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      this.fotoUploadStatus = "O arquivo excede o tamanho máximo de 10 MB.";
      return;
    }
    try {
      // Mostra Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.ngZone.run(() => {
          this.fotoPreview = reader.result as string;
          this.cdr.markForCheck();
        });
      };
      reader.readAsDataURL(file);

      // Upload no Supabase
      const fotoUrl = await this.s3service.uploadFotoPerfil(this.user.id, file);

      // Salva a URL no form e na variável foto_url
      this.ngZone.run(() => {
        this.meusDadosForm.patchValue({ foto_url: fotoUrl });
        this.fotoUploadStatus = "Foto salva com sucesso!";
        this.cdr.markForCheck();
      });

    } catch (error) {
      console.error(error);
      this.ngZone.run(() => {
        this.fotoPreview = ''
        this.fotoUploadStatus = "Erro ao enviar foto.";
        this.cdr.markForCheck();
      });
    }
  }

  openCardModal(plano: any) {
    const dialogRef = this.dialog.open(CardModalComponent, {
      width: '90%',
      maxWidth: '600px',
      data: plano // passando o plano selecionado
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarAssinaturas()
        // Aqui você faz a requisição pro seu endpoint de assinatura
        // Ex: this.assinar(result)
      }
    });
  }


  assinaturas: any[] = [];
  historicoFaturas: any[] = [];
  loadingPagamentos = false;
  async carregarAssinaturas() {
    // buscar do getMe()
    const subscriptionIds = ['']; // ['30d0...', '30d1...', ...]

    if (subscriptionIds.length == 0) {
    }    // Mapeia cada ID para uma promessa que nunca rejeita
    const promises = subscriptionIds.map(id =>
      this.ordem.getMinhasAssinatura().toPromise()
        .then(res => res)
        .catch(err => {
          this.loadingPagamentos = false;
          return null; // retorna null se der erro, não quebra o Promise.all
        })
    );

    const results = await Promise.all(promises);

    this.ngZone.run(() => {
      if (results[0].assinaturas) {
        this.assinaturas = results[0].assinaturas
        if (this.assinaturas) {
          const todayTimestamp = new Date().getTime();

          this.assinaturas.forEach(item => {
            const cobrancas = item?.cobrancas || [];

            // 1 - Ordena do mais antigo para o mais novo
            const cobrancasOrdenadas = [...cobrancas].sort((a: any, b: any) => {
              if (a.installmentNumber !== undefined && b.installmentNumber !== undefined) {
                return a.installmentNumber - b.installmentNumber;
              }
              const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
              const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
              return dateA - dateB;
            });

          
            // 3 – Inverte apenas a ordem visual
            cobrancasOrdenadas.reverse();

              // 2 – Gera numeração correta
            cobrancasOrdenadas.forEach((c, index) => {
              if (!c.installmentNumber) c.installmentNumber = index + 1;
              c.totalInstallments = cobrancasOrdenadas.length;
            });


            item.cobrancas = cobrancasOrdenadas;

            const totais = {
              total: cobrancas.length,
              pagas: cobrancas.filter((c: any) => c.status === 'RECEIVED' || c.status === 'CONFIRMED').length,
              pendentes: cobrancas.filter((c: any) =>
                c.status === 'PENDING' && (!c.dueDate || new Date(c.dueDate).getTime() >= todayTimestamp)
              ).length,
              vencidas: cobrancas.filter((c: any) =>
                c.status === 'PENDING' && c.dueDate && new Date(c.dueDate).getTime() < todayTimestamp
              ).length
            };

            this.assinaturasTotais.push(totais);
          });

        }
      }
      this.loadingPagamentos = false;

      this.cdr.markForCheck();
    });
  }


  // so opção cartão por enqaunto 
  assinarPlano(plano: any) {
    const dialogRef = this.dialog.open(ConfirmAssinaturaDialog, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '95vh',
      panelClass: 'confirm-assinatura-panel',
      data: { plano }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startLoadingAndAssinar(plano);
      }
    });

    // const data = {
    //   plano,
    //   user: this.user
    // }
    // const dialogRef = this.dialog.open(CardModalComponent, {
    //   width: '90%',
    //   maxWidth: '800px',
    //   maxHeight: '95vh',
    //   data: data
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     alert( 'Assinatura realizada.')
    //   }
    // });


  }

  startLoadingAndAssinar(plano: any) {
    setTimeout(() => {
      this.loading = true;
      this.gerarAssinatura(plano);
      this.cdr.markForCheck();
    }, 100);
  }
  gerarAssinatura(plano: any) {
    this.mensagemDeCarregamento = "Criando assinatura";
    this.loading = true;
    const payload = { plano_id: plano.id };
    this.ordem.gerarOrdemAssinatura(payload).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          const mensagem = 'Assinatura realizada com sucesso!\n\n' +
            'Após a confirmação do pagamento, seu nome aparecerá na listagem pública de psicólogos.';
          alert(mensagem);
          this.carregarAssinaturas()
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          console.error('Erro na assinatura:', err);
          alert('Erro ao assinar: ' + err);
          this.loading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  atualizarPagamento(plano: any) {
    // abrir modal do cartão para atualizar card token
  }

  trocarPlano(plano: any) {
    // abrir tela/modal para escolher novo plano
  }

  cancelarPlano(assinaturaItem: any) {
    const confirmacao = confirm(
      'Tem certeza que deseja cancelar sua assinatura?\n\n' +
      'Ao cancelar, você perderá o acesso ao plano e seu perfil será removido da listagem pública.\n\n' +
      'Esta ação não pode ser desfeita.'
    );

    if (confirmacao) {
      // Implementar lógica de cancelamento aqui
      // this.ordem.cancelarAssinatura(assinaturaItem.id).subscribe(...)
    }
  }

  getPrimeiraCobranca(diasGratis: number): Date {
    const hoje = new Date();
    const primeiraCobranca = new Date(hoje);
    primeiraCobranca.setDate(hoje.getDate() + diasGratis);
    return primeiraCobranca;
  }

  getPrecoPlano(plano: any): string {
    if (plano.promocao === 1 && plano.preco_promocional) {
      return plano.parcela_preco_promocional;
    }
    return plano.parcela_preco_normal;
  }


  verDetalhes() {
    const slug = gerarSlug(this.user.nome, this.user.crp);
    return slug
  }

  getStatus(c: any) {
    const today = this.today;
    if (c?.status === 'RECEIVED' || c?.status == "CONFIRMED") return 'pago';
    if (c?.status === 'OVERDUE') return 'vencido';
    if (c?.status === 'PENDING' && c?.dueDate && c?.dueDate < today) return 'vencido';
    return 'pendente';
  }
  getStatusLabel(c: any) {
    const s = this.getStatus(c);
    if (s === 'pago') return 'Pago';
    if (s === 'vencido') return 'Vencido';
    return 'Pendente';
  }

}
