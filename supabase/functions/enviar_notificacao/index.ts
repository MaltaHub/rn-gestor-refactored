// supabase/functions/enviar_notificacao/index.ts
import admin from "npm:firebase-admin";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ============================
// 🔹 Inicialização Segura
// ============================
console.log("🚀 Iniciando função Edge: enviar_notificacao");
try {
  const rawServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!rawServiceAccount) throw new Error("❌ FIREBASE_SERVICE_ACCOUNT ausente nas variáveis de ambiente");
  const serviceAccount = JSON.parse(rawServiceAccount);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin inicializado com sucesso");
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("❌ Variáveis do Supabase ausentes (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log("🔗 Conexão Supabase criada");
  console.info("📡 Edge Function de Notificações iniciada e pronta para requisições!");
  serve(async (req)=>{
    console.log("📥 Nova requisição recebida:", req.method, req.url);
    // ============================
    // 🔹 CORS preflight
    // ============================
    if (req.method === "OPTIONS") {
      console.log("⚙️ Preflight recebido");
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    // ============================
    // 🔹 Processamento Principal
    // ============================
    try {
      console.log("🧾 Headers:", Object.fromEntries(req.headers.entries()));
      const contentType = req.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        console.error("❌ Requisição inválida: Content-Type incorreto");
        return new Response("Requisição inválida: content-type precisa ser application/json", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      const bodyText = await req.text();
      console.log("📦 Body recebido (raw):", bodyText);
      if (!bodyText) {
        console.error("❌ Corpo da requisição vazio");
        return new Response("Corpo da requisição vazio", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      let parsedBody;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch (parseErr) {
        console.error("❌ Falha ao parsear JSON:", parseErr);
        throw new Error("Falha ao interpretar JSON do body");
      }
      const { user_id, titulo, mensagem } = parsedBody;
      console.log("🔍 Dados parseados:", parsedBody);
      if (!user_id || !titulo || !mensagem) {
        console.error("❌ Campos obrigatórios ausentes");
        return new Response("Campos obrigatórios ausentes", {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      // ============================
      // 🔹 Busca tokens do usuário
      // ============================
      console.log(`🔎 Buscando tokens do usuário ${user_id}...`);
      const { data: tokens, error: tokensError } = await supabase.from("notificacoes_tokens").select("token").eq("user_id", user_id);
      if (tokensError) {
        console.error("❌ Erro ao buscar tokens:", tokensError);
        throw tokensError;
      }
      if (!tokens?.length) {
        console.warn("⚠️ Nenhum token encontrado para o usuário");
        return new Response("Nenhum token encontrado para o usuário", {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      console.log(`📋 ${tokens.length} token(s) encontrado(s):`, tokens.map((t)=>t.token));
      // ============================
      // 🔹 Envia notificações via FCM
      // ============================
      const resultados = {};
      for (const { token } of tokens){
        try {
          const fcmResponse = await admin.messaging().send({
            token,
            notification: {
              title: titulo,
              body: mensagem
            }
          });
          console.log(`📤 Notificação enviada com sucesso para ${token} → ID: ${fcmResponse}`);
          resultados[token] = fcmResponse;
        } catch (fcmErr) {
          console.error(`⚠️ Falha ao enviar para ${token}:`, fcmErr.message);
          resultados[token] = `ERRO: ${fcmErr.message}`;
        }
      }
      console.log("📊 Resultado final do envio:", resultados);
      return new Response(JSON.stringify({
        status: "ok",
        enviados: resultados
      }), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (innerErr) {
      console.error("💥 Erro interno durante o processamento:", innerErr);
      return new Response(JSON.stringify({
        error: String(innerErr)
      }), {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  });
} catch (fatalErr) {
  console.error("🔥 Falha fatal ao iniciar a função Edge:", fatalErr);
}
