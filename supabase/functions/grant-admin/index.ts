// supabase/functions/grant-admin/index.ts
//
// Deploy with:  supabase functions deploy grant-admin
// Requires secret:
//   supabase secrets set ADMIN_ACCESS_CODE=your-real-code

import { createClient } from 'npm:@supabase/supabase-js@2';

const ADMIN_ACCESS_CODE = Deno.env.get('ADMIN_ACCESS_CODE');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!ADMIN_ACCESS_CODE || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Identify caller from auth token
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace('Bearer ', '');
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const anonClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await anonClient.auth.getUser(jwt);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  const user = userData.user;

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const submittedCode = (body?.code ?? '').trim();
  if (submittedCode !== ADMIN_ACCESS_CODE) {
    return new Response(JSON.stringify({ error: 'Invalid access code' }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  // Service role client bypasses RLS safely on server
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let { data, error } = await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!data || data.length === 0) {
    // If no existing profile row, create one
    const { data: inserted, error: insertError } = await adminClient
      .from('profiles')
      .insert([{
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        role: 'admin',
        xp: 0,
      }])
      .select();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
    data = inserted;
  }

  return new Response(JSON.stringify({ success: true, profile: data[0] }), {
    status: 200,
    headers: corsHeaders,
  });
});
