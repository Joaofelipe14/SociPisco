import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface DocumentSection {
   id: string;
   title: string;
   icon: string;
}
@Component({
   selector: 'app-legal-page',
   standalone: true,
   imports: [CommonModule, FormsModule],
   templateUrl: './legal-page.html',
   styleUrls: ['./legal-page.css']
})
export class LegalPageComponent {

   activeSection: string = 'termos';

   sections: DocumentSection[] = [
      { id: 'termos', title: 'Termos de Uso', icon: '📋' },
      { id: 'privacidade', title: 'Privacidade', icon: '🔒' },
      { id: 'lgpd', title: 'LGPD', icon: '⚖️' },
      { id: 'cookies', title: 'Cookies', icon: '🍪' },
      { id: 'profissionais', title: 'Profissionais', icon: '👨‍⚕️' }
   ];
   constructor(private route: ActivatedRoute) {
      const showAssinatura = this.route.snapshot.queryParamMap.get('assinatura');
      if (showAssinatura === '1') {
         this.sections.splice(4, 0, { id: 'assinatura', title: 'Assinatura', icon: '💳' });
         this.activeSection = 'assinatura';
      }
   }


   dataAtualizacao: string = new Date().toLocaleDateString('pt-BR');

   setActiveSection(sectionId: string): void {
      this.activeSection = sectionId;
      // Scroll suave até o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }

   scrollToTop(): void {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   }


   // 1.1. PLANO BÁSICO
   //    - Perfil profissional completo
   //    - Listagem na plataforma
   //    - Recebimento de contatos de pacientes
   //    - 10 dias gratuitos
   //    - Valor: R$  34,99 /mês 

   // 1.2. PLANO PROFISSIONAL
   //    - Tudo do Básico +
   //    - Destaque na listagem
   //    - Estatísticas de visualizações
   //    - Suporte prioritário
   //    - 10 dias gratuitos
   //    - Valor: R$ 89,90/mês ou R$ 79,99/ano

   // 1.3. PLANO PREMIUM
   //    - Tudo do Profissional +
   //    - Selo de destaque
   //    - Agendamento integrado
   //    - Relatórios avançados
   //    - 10 dias gratuitos
   //    - Valor: R$ 149,90/mês ou R$ 1.499,00/ano

   getDocumentContent(sectionId: string): string {
      switch (sectionId) {
         case 'termos':
            return this.getTermosUso();
         case 'privacidade':
            return this.getPoliticaPrivacidade();
         case 'lgpd':
            return this.getConformidadeLGPD();
         case 'cookies':
            return this.getPoliticaCookies();
         case 'assinatura':
            return this.getTermosAssinatura();
         case 'profissionais':
            return this.getTermosProfissionais();
         default:
            return '';
      }
   }

   private getTermosAssinatura(): string {
      return `TERMOS DE ASSINATURA E PAGAMENTO - SOCIPSI

Última atualização: ${this.dataAtualizacao}

1. PLANOS DE ASSINATURA

O SociPsi oferece três planos para profissionais:

Mensal:
R$ 34,99 por mês

Trimestral:
R$ 79,99 o pacote
→ 3 parcelas de R$ 26,90

Anual:
R$ 299,99 o pacote
→ 12 parcelas de R$ 24,99 

10 dias grátis em qualquer modalidade
→ Data de cobrança inicial = hoje + 10 dias

2. PERÍODO DE TESTE GRATUITO

2.1. Todo profissional aprovado tem direito ao período gratuito.
2.2. Durante o teste, acesso completo às funcionalidades do plano.
2.3. É necessário cadastrar cartão durante o teste.
2.4. Ao fim do período, será solicitado a cobrança para continuar.

3. FORMA DE PAGAMENTO

3.1. ACEITO: Cartão de crédito (Visa, Mastercard, Elo, American Express)
3.2. Processamento via gateway seguro PCI-DSS
3.3. Dados do cartão NÃO são armazenados pelo SociPsi
3.4. Cobrança recorrente mensal ou anual
3.5. Fatura enviada por e-mail após cada cobrança

4. RENOVAÇÃO AUTOMÁTICA

4.1. Planos são renovados automaticamente.
4.2. Cobrança no mesmo dia do mês (mensal).
4.3. Notificação por e-mail 7 dias antes da renovação.
4.4. Cancelamento deve ser feito antes da data de renovação.

5. POLÍTICA DE CANCELAMENTO

5.1. Cancelamento a qualquer momento, sem multa.
5.2. Acesso permanece até o fim do período pago.
5.3. Não há reembolso proporcional.
5.4. Após cancelamento, perfil fica inativo mas dados são mantidos por 2 anos.
5.5. Reativação pode ser feita a qualquer momento.

6. POLÍTICA DE REEMBOLSO

6.1. NÃO há reembolso após processamento do pagamento.
6.2. Exceção: problemas técnicos graves (análise caso a caso).
6.3. Solicitações: socipsi1@gmail.com (até 7 dias após cobrança).

7. ALTERAÇÃO DE PLANO

7.1. Upgrade: imediato, com cobrança proporcional.
7.2. Downgrade: na próxima renovação.
7.3. Mudança de mensal para anual: desconto aplicado.

8. INADIMPLÊNCIA

8.1. Após falha no pagamento: 3 tentativas automáticas (7 dias).
8.2. Notificação por e-mail a cada tentativa.
8.3. Após 7 dias: conta suspensa temporariamente.
8.4. Após 30 dias: conta desativada.
8.5. Regularização: atualizar dados de pagamento.

9. AUMENTO DE PREÇOS

9.1. Preços podem ser alterados com 30 dias de antecedência.
9.2. Notificação por e-mail.
9.3. Planos anuais: preço mantido até o fim do período.

10. CONTATO

Dúvidas sobre pagamento: socipsi1@gmail.com
`;
   }

   private getTermosProfissionais(): string {
      return `TERMOS ESPECÍFICOS PARA PROFISSIONAIS - SOCIPSI

Última atualização: ${this.dataAtualizacao}

1. REQUISITOS PARA CADASTRO

1.1. OBRIGATÓRIOS:
   ✓ Registro ativo no CRP (Conselho Regional de Psicologia)
   ✓ CPF válido
   ✓ E-mail profissional
   ✓ Telefone/WhatsApp (formato: (XX) XXXXX-XXXX)
   ✓ Resumo profissional (mínimo 500 caracteres)
   ✓ Formação acadêmica (mínimo 20 caracteres)
   ✓ Áreas de atuação
   ✓ Abordagem terapêutica
   ✓ Público-alvo atendido

1.2. OPCIONAIS:
   - Redes sociais (Instagram, LinkedIn, Facebook)
   - Foto de perfil profissional
   - Vídeo de apresentação

2. PROCESSO DE VERIFICAÇÃO

2.1. ETAPAS:
   Passo 1: Preenchimento completo do formulário
   Passo 2: Upload de documentos comprobatórios
   Passo 3: Análise pelo Administrador (até 3 dias úteis)
   Passo 4: Verificação do CRP no site do CFP
   Passo 5: Aprovação ou rejeição (notificação por e-mail ou whatsApp)

2.2. DOCUMENTOS ACEITOS:
   - Número do CRP

2.3. MOTIVOS DE REJEIÇÃO:
   ✗ CRP inválido ou suspenso
   ✗ Documentos ilegíveis ou adulterados
   ✗ Informações inconsistentes
   ✗ CPF divergente dos documentos
   ✗ E-mail ou telefone inválidos

3. RESPONSABILIDADES DO PROFISSIONAL

3.1. ÉTICAS E LEGAIS:
   - Cumprir o Código de Ética Profissional do Psicólogo
   - Respeitar todas as resoluções do CFP/CRP
   - Manter registro CRP ativo e atualizado
   - Prestar atendimento de qualidade
   - Manter sigilo profissional

3.2. NA PLATAFORMA:
   - Manter informações de perfil atualizadas
   - Responder contatos de pacientes em até 48h
   - Não fazer propaganda enganosa
   - Não cobrar consulta através da plataforma
   - Respeitar outros profissionais e usuários

3.3. ATENDIMENTO:
   - Acordo de valores e formas de pagamento diretamente com o paciente
   - Emissão de recibos e notas fiscais quando aplicável
   - Documentação adequada dos atendimentos
   - Não realizar atendimento de emergência pela plataforma

4. PERFIL PROFISSIONAL

4.1. INFORMAÇÕES PÚBLICAS (visíveis para pacientes):
   - Nome completo
   - Número do CRP
   - Foto de perfil
   - Resumo profissional
   - Formação acadêmica
   - Áreas de atuação
   - Abordagem terapêutica
   - Público-alvo
   - Redes sociais
   - WhatsApp (apenas para contato após escolha)

4.2. INFORMAÇÕES PRIVADAS (apenas administrador):
   - CPF
   - E-mail
   - Documentos de verificação
   - Histórico de pagamentos

5. COMUNICAÇÃO COM PACIENTES

5.1. PERMITIDO:
   ✓ Responder dúvidas sobre abordagem e metodologia
   ✓ Informar valores e disponibilidade
   ✓ Agendar consultas
   ✓ Enviar informações sobre localização do consultório

5.2. PROIBIDO:
   ✗ Compartilhar dados pessoais de outros pacientes
   ✗ Solicitar pagamento antecipado sem consulta agendada
   ✗ Fazer propaganda agressiva ou enganosa
   ✗ Desrespeitar ou discriminar pacientes

6. SUSPENSÃO E DESATIVAÇÃO

6.1. SUSPENSÃO TEMPORÁRIA (7 a 30 dias):
   - Inadimplência no pagamento da assinatura
   - Reclamações de pacientes (análise caso a caso)
   - Atraso na atualização de documentos

6.2. DESATIVAÇÃO PERMANENTE:
   - CRP suspenso ou cassado
   - Fraude ou falsidade ideológica
   - Violação grave dos Termos de Uso
   - Conduta antiética comprovada
   - Múltiplas reclamações graves

7. DIREITOS DO PROFISSIONAL

7.1. Acesso completo aos recursos do plano contratado
7.2. Suporte técnico da plataforma
7.3. Proteção de dados pessoais conforme LGPD
7.4. Cancelamento de assinatura sem multa
7.5. Portabilidade de dados
7.6. Contestação de suspensão ou desativação

8. PROPRIEDADE DO CONTEÚDO

8.1. Textos, fotos e vídeos enviados permanecem de sua propriedade.
8.2. Você concede ao SociPsi licença não exclusiva para exibir esse conteúdo.
8.3. Você garante ter direito de uso sobre todo conteúdo enviado.

9. DENÚNCIAS E IRREGULARIDADES

9.1. Pacientes podem reportar condutas inadequadas.
9.2. SociPsi investigará todas as denúncias.
9.3. Profissional tem direito de defesa.
9.4. Casos graves serão comunicados ao CRP.

10. CONTATO E SUPORTE

Suporte técnico: socipsi1@gmail.com

Ao se cadastrar como profissional, você declara ter lido e concordado com estes Termos Específicos.`;
   }

   // ============================================
   // CONTEÚDO DOS DOCUMENTOS
   // ============================================

   private getTermosUso(): string {
      return `TERMOS DE USO E CONDIÇÕES GERAIS DO SOCIPSI

Última atualização: ${this.dataAtualizacao}

1. ACEITAÇÃO DOS TERMOS

Ao acessar e utilizar a plataforma SociPsi ("Plataforma"), você ("Usuário", "Paciente" ou "Profissional") concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, não utilize a Plataforma.

2. DEFINIÇÕES

2.1. SociPsi: aplicativo e plataforma web de intermediação entre pacientes e psicólogos cadastrados.
2.2. Paciente: pessoa física que busca serviços de psicologia através da Plataforma.
2.3. Profissional/Psicólogo: profissional devidamente registrado no CRP que oferece serviços através da Plataforma.
2.4. Administrador: equipe responsável pela gestão, moderação e verificação da Plataforma.

3. DESCRIÇÃO DOS SERVIÇOS

3.1. O SociPsi é uma plataforma de conexão entre pacientes e psicólogos, facilitando o agendamento de consultas e o contato inicial.
3.2. A Plataforma NÃO presta serviços de psicologia diretamente, atuando exclusivamente como intermediária.
3.3. O relacionamento terapêutico ocorre diretamente entre o paciente e o profissional escolhido.
3.4. O SociPsi não se responsabiliza pela qualidade, eficácia ou resultado dos atendimentos realizados pelos profissionais.

4. CADASTRO E CONTA

4.1. PACIENTES:
   a) Devem fornecer informações verdadeiras e completas (nome, e-mail, telefone).
   b) São responsáveis pela confidencialidade de suas credenciais de acesso.
   c) Devem ter no mínimo 18 anos ou consentimento dos responsáveis legais.
   d) Podem buscar, visualizar perfis e entrar em contato com profissionais.

4.2. PROFISSIONAIS:
   a) Devem possuir registro ativo no Conselho Regional de Psicologia (CRP).
   b) Devem fornecer informações completas e verídicas:
      - Nome completo
      - E-mail profissional
      - Número de registro CRP (formato: XX/XXXXX ou XX/XXXXXX)
      - CPF
      - WhatsApp para contato (formato: (XX) XXXXX-XXXX)
      - Resumo profissional (mínimo 500 caracteres)
      - Formação acadêmica (mínimo 20 caracteres)
      - Áreas de atuação (múltipla escolha)
      - Abordagem terapêutica (múltipla escolha)
      - Público-alvo (múltipla escolha)
      - Redes sociais (opcional)
   c) Devem anexar documentação comprobatória para verificação.
   d) Passarão por processo de aprovação do Administrador antes da ativação da conta.
   e) Comprometem-se a manter o registro CRP válido e atualizado.

4.3. Verificação de Documentos:
   a) O Administrador verificará a autenticidade do registro CRP através de consulta ao site do Conselho Federal de Psicologia.
   b) Documentos com informações inconsistentes ou fraudulentas resultarão em negação ou suspensão imediata do cadastro.
   c) O prazo para análise é de até 5 (cinco) dias úteis.
   d) O profissional será notificado por e-mail sobre a aprovação ou rejeição do cadastro.

5. PLANOS E ASSINATURA (PROFISSIONAIS)

5.1. PERÍODO DE TESTE GRATUITO:
   a) Novos profissionais têm acesso a período de teste conforme o plano escolhido.
   b) O período gratuito varia de acordo com a modalidade selecionada.
   c) Durante o período gratuito, o profissional tem acesso a todas as funcionalidades do plano escolhido.
   d) Não é necessário cadastrar cartão de crédito durante o período de teste.

5.2. PLANOS DISPONÍVEIS:
   a) Plano Mensal
   b) Plano Trimestral
   c) Plano Anual


5.3. PAGAMENTO:
   a) Aceito exclusivamente via cartão de crédito.
   b) Cobrança recorrente mensal ou anual, conforme escolha do profissional.
   c) Renovação automática ao final de cada período, salvo cancelamento prévio.
   d) Valores não são reembolsáveis após processamento do pagamento.
   e) Processamento via gateway seguro (PCI-DSS compliance).

5.4. CANCELAMENTO:
   a) Pode ser solicitado a qualquer momento através da Plataforma.
   b) O acesso permanece até o fim do período já pago.
   c) Não há cobrança proporcional ou multa por cancelamento.
   d) Após cancelamento, dados do profissional permanecem armazenados conforme Política de Privacidade.

6. USO ADEQUADO DA PLATAFORMA

6.1. É PROIBIDO:
   a) Publicar conteúdo ofensivo, discriminatório, racista, homofóbico, transfóbico ou preconceituoso.
   b) Compartilhar informações falsas ou enganosas.
   c) Violar direitos autorais, marcas registradas ou propriedade intelectual de terceiros.
   d) Utilizar a Plataforma para fins ilícitos ou ilegais.
   e) Tentar hackear, prejudicar ou sobrecarregar os sistemas.
   f) Criar contas falsas ou utilizar identidade de terceiros.
   g) Assediar, ameaçar ou intimidar outros usuários.
   h) Compartilhar dados pessoais de terceiros sem autorização.
   i) Profissionais: exercer a profissão sem registro CRP válido.
   j) Pacientes: fornecer informações falsas sobre si mesmos.

6.2. O descumprimento resultará em:
   - Advertência formal
   - Suspensão temporária ou definitiva da conta
   - Exclusão permanente da Plataforma
   - Denúncia às autoridades competentes, quando aplicável
   - Denúncia ao CRP (em caso de profissionais)

7. RESPONSABILIDADES DO USUÁRIO

7.1. Manter suas informações de cadastro atualizadas e precisas.
7.2. Proteger suas credenciais de acesso (senha).
7.3. Notificar imediatamente qualquer uso não autorizado de sua conta.
7.4. Utilizar a Plataforma em conformidade com a legislação brasileira.
7.5. Profissionais: cumprir o Código de Ética Profissional do Psicólogo e resoluções do CFP.
7.6. Respeitar a confidencialidade das informações de terceiros.

8. RESPONSABILIDADES DO SOCIPSI

8.1. Manter a Plataforma funcionando adequadamente, com disponibilidade razoável.
8.2. Proteger dados pessoais conforme LGPD e Política de Privacidade.
8.3. Realizar verificação básica dos profissionais cadastrados.
8.4. Moderar conteúdos reportados por violação dos Termos.
8.5. Garantir segurança das transações de pagamento.

9. LIMITAÇÕES DE RESPONSABILIDADE

9.1. O SociPsi NÃO é responsável por:
   a) Qualidade, eficácia ou resultados dos atendimentos psicológicos.
   b) Condutas inadequadas dos profissionais ou pacientes.
   c) Danos diretos ou indiretos decorrentes do uso da Plataforma.
   d) Problemas técnicos, interrupções ou indisponibilidade temporária.
   e) Transações, acordos ou conflitos entre pacientes e profissionais.
   f) Conteúdo publicado por usuários.
   g) Perda de dados por falhas técnicas ou ataques cibernéticos.

9.2. O relacionamento terapêutico é estabelecido exclusivamente entre paciente e profissional.
9.3. Dúvidas sobre atendimentos devem ser tratadas diretamente com o profissional.

10. PROPRIEDADE INTELECTUAL

10.1. Todo conteúdo da Plataforma (design, textos, logos, códigos) é de propriedade do SociPsi ou licenciado para uso.
10.2. É proibida reprodução, distribuição ou modificação sem autorização expressa.
10.3. Usuários concedem ao SociPsi licença não exclusiva para exibir conteúdos publicados na Plataforma.

11. MODIFICAÇÕES

11.1. O SociPsi reserva-se o direito de modificar estes Termos a qualquer momento.
11.2. Usuários serão notificados por e-mail ou através da Plataforma.
11.3. O uso continuado após modificações implica aceitação das novas condições.

12. ENCERRAMENTO

12.1. Usuários podem solicitar exclusão de conta a qualquer momento.
12.2. O SociPsi pode suspender ou encerrar contas por violação dos Termos.
12.3. Dados serão tratados conforme Política de Privacidade mesmo após encerramento.

13. LEI APLICÁVEL E FORO

13.1. Estes Termos são regidos pelas leis brasileiras.
13.2. Fica eleito o foro da comarca de São Luís/MA para dirimir quaisquer controvérsias.

14. CONTATO

Para dúvidas relacionadas a estes Termos:
E-mail: socipsi1@gmail.com
Plataforma: seção "Ajuda" ou "Contato"

Ao utilizar a Plataforma, você declara ter lido, compreendido e concordado com todos os termos e condições aqui estabelecidos.`;
   }

   private getPoliticaPrivacidade(): string {
      return `POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS - SOCIPSI

Última atualização: ${this.dataAtualizacao}

1. INTRODUÇÃO

Esta Política de Privacidade descreve como o SociPsi coleta, usa, armazena e protege os dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

2. RESPONSÁVEL PELO TRATAMENTO DE DADOS

Controlador: SociPsi
E-mail para questões de privacidade: socipsi1@gmail.com
E-mail geral: socipsi1@gmail.com

3. DADOS COLETADOS

3.1. PACIENTES:
   a) Dados de identificação: Nome completo, E-mail, Telefone/WhatsApp
   b) Dados de acesso: Endereço IP, Tipo de dispositivo, Navegador, Data e hora de acesso
   c) Dados de navegação: Páginas visitadas, Profissionais visualizados, Tempo de permanência

3.2. PROFISSIONAIS:
   a) Dados de identificação: Nome completo, CPF, E-mail, Telefone/WhatsApp, Número de registro CRP
   b) Dados profissionais: Formação acadêmica, Áreas de atuação, Abordagem terapêutica, Público-alvo, Resumo profissional, Redes sociais
   c) Dados de verificação: Documentos comprobatórios de registro, Status de aprovação
   d) Dados de pagamento: Informações de cartão de crédito (processadas por gateway terceirizado), Histórico de transações
   e) Dados de acesso e navegação

3.3. DADOS SENSÍVEIS:
   O SociPsi NÃO coleta intencionalmente dados sensíveis, exceto quando o usuário optar por incluí-los voluntariamente em campos de texto livre.

4. BASE LEGAL PARA TRATAMENTO DE DADOS

Tratamos dados pessoais com base nas seguintes hipóteses legais (Art. 7º e 11 da LGPD):

4.1. Consentimento (Art. 7º, I): quando você aceita expressamente esta Política e os Termos de Uso.
4.2. Execução de contrato (Art. 7º, V): para viabilizar o uso da Plataforma e serviços contratados.
4.3. Legítimo interesse (Art. 7º, IX): Segurança, prevenção de fraudes, melhorias.
4.4. Cumprimento de obrigação legal (Art. 7º, II): quando exigido por lei.
4.5. Exercício regular de direitos (Art. 7º, VI): defesa em processos.

5. FINALIDADES DO TRATAMENTO

5.1. Criar e gerenciar contas de usuário.
5.2. Viabilizar a conexão entre pacientes e profissionais.
5.3. Verificar autenticidade e validade de registros profissionais (CRP).
5.4. Processar pagamentos e gerenciar assinaturas.
5.5. Enviar comunicações relevantes.
5.6. Melhorar funcionalidades e experiência do usuário.
5.7. Prevenir fraudes, abusos e uso indevido.
5.8. Cumprir obrigações legais e regulatórias.
5.9. Responder solicitações e dúvidas.
5.10. Gerar estatísticas anonimizadas.

6. COMPARTILHAMENTO DE DADOS

6.1. NÃO vendemos, alugamos ou comercializamos seus dados pessoais.

6.2. Podemos compartilhar dados com:
   a) Prestadores de serviços terceirizados: Processadores de pagamento, Hospedagem, Ferramentas de análise, Serviços de e-mail
   b) Autoridades competentes: Quando exigido por lei ou ordem judicial
   c) Conselho Regional/Federal de Psicologia: Para verificação de registros
   d) Entre usuários: Profissionais têm perfil público visível para pacientes

7. ARMAZENAMENTO E SEGURANÇA

7.1. ARMAZENAMENTO:
   - Dados armazenados em servidores seguros com redundância e backups regulares.
   - Localização: Brasil e/ou países com legislação adequada de proteção de dados.

7.2. MEDIDAS DE SEGURANÇA:
   a) Criptografia de dados em trânsito (HTTPS/TLS) e em repouso.
   b) Controles de acesso baseados em função.
   c) Autenticação segura (senhas criptografadas, hash).
   d) Monitoramento e logs de segurança.
   e) Firewall e proteção contra ataques.
   f) Atualizações e patches de segurança regulares.
   g) Testes de vulnerabilidade periódicos.
   h) Política de resposta a incidentes.

7.3. RETENÇÃO DE DADOS:
   - Mantemos dados pelo tempo necessário para as finalidades descritas.
   - Dados de contas ativas: durante uso da Plataforma.
   - Dados de contas inativas: até 2 anos.
   - Dados financeiros: conforme exigências legais (5 anos).

8. COOKIES E TECNOLOGIAS SIMILARES

8.1. TIPOS DE COOKIES:
   a) Essenciais: necessários para funcionamento básico.
   b) Funcionais: melhoram experiência.
   c) Analíticos: coletam dados sobre uso (anônimos).

8.2. GERENCIAMENTO:
   - Você pode desativar cookies nas configurações do navegador.
   - Alguns cookies são essenciais; desativá-los pode afetar funcionalidades.

9. DIREITOS DO TITULAR DE DADOS (LGPD)

Você tem os seguintes direitos garantidos pela LGPD (Art. 18):

9.1. CONFIRMAÇÃO E ACESSO: confirmar se tratamos seus dados e acessá-los.
9.2. CORREÇÃO: corrigir dados incompletos, inexatos ou desatualizados.
9.3. ANONIMIZAÇÃO, BLOQUEIO OU ELIMINAÇÃO: de dados desnecessários.
9.4. PORTABILIDADE: receber seus dados em formato estruturado.
9.5. ELIMINAÇÃO: excluir dados tratados com base em consentimento.
9.6. INFORMAÇÃO: sobre compartilhamento de dados.
9.7. REVOGAÇÃO DO CONSENTIMENTO: a qualquer momento.
9.8. OPOSIÇÃO: opor-se ao tratamento em casos específicos.

COMO EXERCER SEUS DIREITOS:
   - E-mail: socipsi1@gmail.com
   - Plataforma: seção "Privacidade e Dados" nas configurações
   - Prazo de resposta: até 15 dias corridos

10. DIREITOS ESPECÍFICOS DE MENORES

10.1. A Plataforma é destinada a maiores de 18 anos.
10.2. Menores entre 16-18 anos podem usar mediante autorização dos responsáveis legais.
10.3. NÃO coletamos intencionalmente dados de menores de 16 anos.
10.4. Pais/responsáveis podem solicitar exclusão de dados de menores.

11. TRANSFERÊNCIA INTERNACIONAL DE DADOS

11.1. Dados podem ser transferidos para países com proteção adequada.
11.2. Serviços de terceiros podem estar localizados fora do Brasil.
11.3. Garantimos proteção equivalente à LGPD em todas as transferências.

12. INCIDENTES DE SEGURANÇA

12.1. Em caso de vazamento ou incidente que possa gerar risco:
   a) Notificaremos a Autoridade Nacional de Proteção de Dados (ANPD).
   b) Comunicaremos os titulares afetados em prazo adequado.
   c) Informaremos sobre medidas técnicas adotadas.

13. ALTERAÇÕES NESTA POLÍTICA

13.1. Podemos atualizar esta Política periodicamente.
13.2. Alterações substanciais serão notificadas por e-mail.
13.3. Data da última atualização sempre indicada no topo.
13.4. Recomendamos revisão periódica.

14. LEGISLAÇÃO E FORO

14.1. Esta Política é regida pela legislação brasileira, especialmente LGPD.
14.2. Foro: Comarca de São Luís/MA.

15. CONTATO

Para dúvidas ou exercício de direitos relacionados à privacidade:


Suporte geral: socipsi1@gmail.com
Resposta: até 15 dias corridos


Ao utilizar o SociPsi, você declara ter lido, compreendido e concordado com esta Política de Privacidade.`;
   }

   private getConformidadeLGPD(): string {
      return `DECLARAÇÃO DE CONFORMIDADE COM A LEI GERAL DE PROTEÇÃO DE DADOS
SOCIPSI

Data: ${this.dataAtualizacao}

1. COMPROMISSO COM A LGPD

O SociPsi declara seu compromisso integral com a Lei nº 13.709/2018 (LGPD), reconhecendo a importância da privacidade e proteção de dados pessoais de todos os usuários da Plataforma.

2. PRINCÍPIOS OBSERVADOS

O tratamento de dados pessoais no SociPsi segue rigorosamente os princípios estabelecidos no Art. 6º da LGPD:

2.1. FINALIDADE: Dados coletados para propósitos legítimos, específicos e informados.
2.2. ADEQUAÇÃO: Tratamento compatível com as finalidades informadas.
2.3. NECESSIDADE: Limitação ao mínimo necessário.
2.4. LIVRE ACESSO: Garantia de consulta facilitada e gratuita.
2.5. QUALIDADE DOS DADOS: Garantia de exatidão, clareza e atualização.
2.6. TRANSPARÊNCIA: Informações claras e acessíveis.
2.7. SEGURANÇA: Medidas técnicas e administrativas de proteção.
2.8. PREVENÇÃO: Adoção de medidas para prevenir danos.
2.9. NÃO DISCRIMINAÇÃO: Impossibilidade de tratamento discriminatório.
2.10. RESPONSABILIZAÇÃO: Demonstração de medidas eficazes de conformidade.

3. BASES LEGAIS PARA TRATAMENTO (Art. 7º e 11 da LGPD)

3.1. Consentimento do titular (inciso I)
3.2. Cumprimento de obrigação legal ou regulatória (inciso II)
3.3. Execução de contrato ou procedimentos preliminares (inciso V)
3.4. Exercício regular de direitos em processo (inciso VI)
3.5. Proteção da vida ou incolumidade física (inciso VII)
3.6. Tutela da saúde, em procedimento realizado por profissionais (inciso VII-b)
3.7. Legítimo interesse do controlador (inciso IX)
3.8. Proteção do crédito (inciso X)

4. CATEGORIAS DE DADOS TRATADOS

4.1. DADOS PESSOAIS (Art. 5º, I): Identificação, contato, cadastrais, profissionais, navegação, pagamento
4.2. DADOS SENSÍVEIS (Art. 5º, II): NÃO coletados intencionalmente
4.3. DADOS ANONIMIZADOS (Art. 5º, III): Utilizados para estatísticas

5. DIREITOS DOS TITULARES GARANTIDOS

Em conformidade com o Art. 18 da LGPD:

I - Confirmação da existência de tratamento
II - Acesso aos dados
III - Correção de dados incompletos, inexatos ou desatualizados
IV - Anonimização, bloqueio ou eliminação
V - Portabilidade dos dados
VI - Eliminação dos dados tratados com consentimento
VII - Informação sobre compartilhamento
VIII - Informação sobre possibilidade de não fornecer consentimento
IX - Revogação do consentimento

Prazo de atendimento: até 15 dias corridos
Canal: socipsi1@gmail.com

6. SEGURANÇA E BOAS PRÁTICAS

6.1. MEDIDAS TÉCNICAS:
   - Criptografia (dados em trânsito e repouso)
   - Controles de acesso (autenticação multifator)
   - Firewalls e proteção contra invasões
   - Backups regulares e redundância
   - Monitoramento contínuo de segurança
   - Testes de vulnerabilidade
   - Atualizações de segurança

6.2. MEDIDAS ORGANIZACIONAIS:
   - Política de Segurança da Informação
   - Treinamento de equipe em LGPD
   - Contratos com cláusulas de proteção de dados
   - Procedimentos de resposta a incidentes
   - Auditoria e revisão periódica
   - Registro de operações de tratamento

7. COMPARTILHAMENTO E TRANSFERÊNCIA

7.1. Dados compartilhados apenas quando necessário.
7.2. Prestadores de serviço atuam como operadores.
7.3. Transferências internacionais: apenas para países adequados.
7.4. Autoridades: atendimento a requisições legais.

8. RETENÇÃO E ELIMINAÇÃO

8.1. PRAZO DE RETENÇÃO:
   - Durante uso da Plataforma
   - Até 2 anos após inatividade (salvo obrigação legal)
   - Dados financeiros: 5 anos (legislação tributária)
   - Dados de verificação profissional: durante vínculo + prazo legal

8.2. ELIMINAÇÃO:
   - Automática após prazo de retenção
   - Mediante solicitação do titular (quando aplicável)
   - Dados anonimizados podem ser mantidos

9. TRATAMENTO DE DADOS DE CRIANÇAS E ADOLESCENTES

9.1. Plataforma para maiores de 18 anos.
9.2. Entre 16-18: mediante autorização dos responsáveis.
9.3. Menores de 16: NÃO permitido uso.
9.4. Coleta acidental: eliminação imediata após notificação.

10. ENCARREGADO DE PROTEÇÃO DE DADOS (DPO)

Responsável: Encarregado de Dados - SociPsi
E-mail: socipsi1@gmail.com
Função: Interface entre SociPsi, titulares e ANPD

11. COMUNICAÇÃO DE INCIDENTES

11.1. Em caso de incidente de segurança:
   - Notificação à ANPD em prazo razoável
   - Comunicação aos titulares afetados
   - Informações sobre natureza, dados envolvidos e medidas técnicas

12. RELATÓRIO DE IMPACTO (RIPD)

12.1. Elaborado para operações de alto risco.
12.2. Contém: descrição do tratamento, bases legais, medidas de segurança, análise de riscos.
12.3. Disponível à ANPD mediante solicitação.

13. CONFORMIDADE CONTÍNUA

13.1. Revisão periódica de políticas e procedimentos.
13.2. Treinamento contínuo da equipe.
13.3. Atualização conforme orientações da ANPD.
13.4. Auditorias internas e externas.

14. CONTATO COM A ANPD

Autoridade Nacional de Proteção de Dados
Website: www.gov.br/anpd
Canal de comunicação disponível para titulares

15. DECLARAÇÃO FINAL

O SociPsi compromete-se a manter conformidade contínua com a LGPD, protegendo os direitos fundamentais de liberdade e privacidade de todos os usuários.

Atualização: ${this.dataAtualizacao}
Versão: 1.0`;
   }

   private getPoliticaCookies(): string {
      return `POLÍTICA DE COOKIES - SOCIPSI

Última atualização: ${this.dataAtualizacao}

1. O QUE SÃO COOKIES?

Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site.

2. TIPOS DE COOKIES

2.1. ESSENCIAIS: Autenticação e segurança
2.2. FUNCIONAIS: Preferências do usuário
2.3. ANALÍTICOS: Estatísticas de uso (anônimos)
2.4. PUBLICIDADE: Marketing direcionado (se houver)

3. GERENCIAMENTO DE COOKIES

Você pode desativar cookies nas configurações do navegador. Alguns cookies essenciais não podem ser desabilitados.

4. COOKIES DE TERCEIROS

Utilizamos serviços de terceiros que podem instalar cookies:
- Google Analytics (análise de uso)
- Gateway de pagamento (segurança)

5. CONSENTIMENTO

Ao continuar navegando, você consente com o uso de cookies conforme esta política.

6. MAIS INFORMAÇÕES

Dúvidas: socipsi1@gmail.com`
   }

}