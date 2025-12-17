import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CadastroPsicologoComponent } from './components/cadastro-psicologo/cadastro-psicologo';
import { ListaPsicologos } from './components/lista-psicologos/lista-psicologos';
import { WelcomeComponent } from './components/welcome/welcome';
import { DetalhesPsicologoComponent } from './components/detalhes-psicologo/detalhes-psicologo';
import { SobreNos } from './sobre-nos/sobre-nos';
import { MeusDadosComponent } from './components/meus-dados/meus-dados';
import { Login } from './components/admin/login/login';
import { AdminPsicologos } from './components/admin/psicologos/psicologos';
import { LegalPageComponent } from './legal-page/legal-page';
import { ForgotPasswordComponent } from './forgot-password-component/forgot-password-component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, data: { title: 'SociPsi | Bem-vindo' } },
  { path: 'login', component: LoginComponent, data: { title: 'SociPsi | Login' } },
  { path: 'esqueci-senha', component: ForgotPasswordComponent, data: { title: 'SociPsi | Esqueci Senha' } },

  { path: 'cadastro-psicologo', component: CadastroPsicologoComponent, data: { title: 'SociPsi | Cadastro Psicólogo' } },
  { path: 'psicologos', component: ListaPsicologos, data: { title: 'SociPsi | Psicólogos' } },
  { path: 'psicologo/:id', component: DetalhesPsicologoComponent, data: { title: 'SociPsi | Detalhes do Psicólogo' } },
  { path: 'sobre-nos', component: SobreNos, data: { title: 'SociPsi | Sobre nos' } },
  { path: 'meus-dados', component: MeusDadosComponent, data: { title: 'SociPsi | Meus dados' } },
  { path: 'admin/login', component: Login, data: { title: 'SociPsi | Admin' } },
  { path: 'admin/psicologos', component: AdminPsicologos, data: { title: 'SociPsi | Admin Psicologos' } },
  { path: 'termos-privacidade', component: LegalPageComponent, data: { title: 'SociPsi | Termos e privacidade' } },


  { path: '**', redirectTo: '/psicologos' },

  // { path: 'cadastro-paciente', component: CadastroPaciente},
  // { path: 'meus-dados', component: MeusDados, canActivate: [AuthGuard] }
];