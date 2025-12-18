import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { gerarSlug } from '../utils/slug';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  // ==========================
  // AUTENTICAÇÃO
  // ==========================

  async signUp(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });


    if (error) throw error;
    return data.user;
  }

  async signIn(email: string, password: string): Promise<User | null> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (data.session) {
      localStorage.setItem('supa_access_token', data.session.access_token);
    }

    if (error) throw error;
    return data.user;
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }


  // ==========================
  // PSICÓLOGOS
  // ==========================

  async buscarPsicologos() {
    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  }

  async buscarPsicologosPaginado(limit: number = 10, offset: number = 0) {
    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async buscarPsicologoPorId(id: string) {
    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  extrairDadosDoSlug(slug: string): { nome: string; crp: string } | null {
    if (!slug) return null

    const idx = slug.toLowerCase().lastIndexOf('-crp-')
    if (idx === -1) return null

    const nomeSlug = slug.slice(0, idx)
    const crpSlug = slug.slice(idx + 5)

    const numeros = crpSlug.replace(/\D/g, '')
    if (numeros.length < 3) return null

    const uf = numeros.slice(0, 2)
    const numero = numeros.slice(2)

    return {
      nome: nomeSlug.replace(/-/g, ' '),
      crp: `${uf}/${numero}`
    }
  }

  async buscarPsicologoPorSlug(slug: string) {
    const dados = this.extrairDadosDoSlug(slug)
    if (!dados) return null

    const { data, error } = await this.supabase
      .from('psicologos_ativos')
      .select('*')
      .eq('crp', dados.crp)
      .single()

    if (error) throw error
    return data
  }


  async uploadFotoPerfil(usuarioId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `foto_${usuarioId}.${fileExt}`;
    const filePath = `${usuarioId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('perfil')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = this.supabase.storage
      .from('perfil')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }


  async toggleAtivoPsicologo(id: string, ativo: any) {
    const { data, error } = await this.supabase
      .from('psicologos')
      .update({ liberado_admin: ativo ? 1 : 0 })
      .eq('id', id)
      .select(); // <- obrigatório para retornar data

    if (error) throw error;
    return data;
  }


  async buscarPsicologosAdmin(filtroAtivo?: boolean) {
    let query = this.supabase
      .from('psicologos')
      .select(`
      *,
      assinaturas:assinaturas(
        status,
        motivo_status,
        data_expiracao
      )
    `)
      .order('criado_em', { ascending: false })
      .order('atualizado_em', { referencedTable: 'assinaturas', ascending: false });
    ;

    if (filtroAtivo !== undefined) {
      query = query.eq('liberado_admin', filtroAtivo ? 1 : 0);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data;
  }
  async criarAssinaturaTeste(psicologoId: string, dias: number, motivo = 'liberado admin - Periodo gratis') {
    const hoje = new Date();
    const expiracao = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await this.supabase
      .from('assinaturas')
      .insert({
        psicologo_id: psicologoId,
        status: 'ativo',
        motivo_status: motivo,
        data_pagamento: hoje.toISOString().split('T')[0],
        data_expiracao: expiracao
      })
      .select();

    if (error) throw error;
    return data;
  }


}
