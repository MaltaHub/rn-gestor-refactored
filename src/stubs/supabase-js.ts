import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from "@/lib/supabase-config";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type AuthChangeEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

export type PostgrestError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export type User = {
  id: string;
  email?: string | null;
  phone?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
};

export type SignInWithPasswordCredentials = {
  email: string;
  password: string;
};

export type AuthSessionResponse = {
  data: { session: Session | null; user: User | null };
  error: { message: string } | null;
};

export type AuthUserResponse = {
  data: { user: User | null };
  error: { message: string } | null;
};

export type AuthSessionGetterResponse = {
  data: { session: Session | null };
  error: { message: string } | null;
};

export type AuthSetSessionResponse = AuthSessionResponse;

export type AuthSubscription = {
  unsubscribe: () => void;
};

export type AuthChangeResponse = {
  data: { subscription: AuthSubscription };
};

const SESSION_STORAGE_KEY = "gestor.supabase.session";

type RestResponse<T> = { data: T | null; error: PostgrestError | null };

type OrderOptions = {
  ascending?: boolean;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storage = window.localStorage;
    storage.getItem("__test__");
    return storage;
  } catch (error) {
    console.warn("Local storage indisponível", error);
    return null;
  }
}

function readStoredSession(): Session | null {
  const storage = getStorage();
  if (!storage) return null;

  const json = storage.getItem(SESSION_STORAGE_KEY);
  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as Session;
    if (!parsed.access_token || !parsed.refresh_token) {
      storage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    storage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function persistSession(session: Session | null) {
  const storage = getStorage();
  if (!storage) return;

  if (!session) {
    storage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

async function requestSupabase<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: { message: string } | null }> {
  if (!hasSupabaseConfig) {
    return { data: null, error: { message: "Supabase não configurado." } };
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    const message = errorBody.message || errorBody.error || response.statusText;
    return { data: null, error: { message } };
  }

  const data = (await response.json().catch(() => null)) as T | null;
  return { data, error: null };
}

class StubQueryBuilder<T = Json> {
  private selectColumns = "*";
  private filterFns: Array<(params: URLSearchParams) => void> = [];
  private orders: string[] = [];

  constructor(private readonly client: StubSupabaseClient, private readonly table: string) {}

  public select(columns = "*") {
    this.selectColumns = columns;
    return this;
  }

  public eq(column: string, value: unknown) {
    const encoded = encodeURIComponent(value === null ? "null" : String(value));
    this.filterFns.push((params) => {
      params.append(column, `eq.${encoded}`);
    });
    return this;
  }

  public in(column: string, values: (string | number)[]) {
    const sanitized = values.map((item) => encodeURIComponent(String(item))).join(",");
    this.filterFns.push((params) => {
      params.append(column, `in.(${sanitized})`);
    });
    return this.execute<T[]>();
  }

  public order(column: string, options: OrderOptions = {}) {
    const direction = options.ascending === false ? "desc" : "asc";
    this.orders.push(`${column}.${direction}`);
    return this.execute<T[]>();
  }

  public maybeSingle() {
    return this.execute<T | null>({ single: true });
  }

  public async execute<TResult = T>(options: { single?: boolean } = {}) {
    const params = new URLSearchParams();
    params.set("select", this.selectColumns);
    for (const fn of this.filterFns) {
      fn(params);
    }
    for (const order of this.orders) {
      params.append("order", order);
    }

    const { data, error } = await this.client.restFetch<TResult>(
      this.table,
      params,
      options.single ?? false,
    );

    if (error) {
      return { data: null, error } satisfies RestResponse<TResult>;
    }

    if ((options.single ?? false) && Array.isArray(data)) {
      const first = (data as unknown[])[0] ?? null;
      return { data: first as TResult | null, error: null } satisfies RestResponse<TResult>;
    }

    return { data, error: null } satisfies RestResponse<TResult>;
  }
}

class StubSupabaseClient {
  private session: Session | null;
  private listeners = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

  constructor() {
    this.session = readStoredSession();
  }

  private notify(event: AuthChangeEvent, session: Session | null) {
    for (const listener of this.listeners) {
      try {
        listener(event, session);
      } catch (error) {
        console.error("Erro em listener de auth Supabase", error);
      }
    }
  }

  private withAuthHeaders(headers: Record<string, string> = {}) {
    if (this.session) {
      return {
        ...headers,
        Authorization: `${this.session.token_type} ${this.session.access_token}`,
      };
    }

    return headers;
  }

  public auth = {
    signInWithPassword: async (credentials: SignInWithPasswordCredentials): Promise<AuthSessionResponse> => {
      const { email, password } = credentials;
      const { data, error } = await requestSupabase<{
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        user: User;
      }>(`/auth/v1/token?grant_type=password`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (error || !data) {
        return {
          data: { session: null, user: null },
          error: error ?? { message: "Falha ao autenticar." },
        };
      }

      const session: Session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        expires_at: Date.now() + data.expires_in * 1000,
        user: data.user,
      };

      this.session = session;
      persistSession(session);
      this.notify("SIGNED_IN", session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    },

    signOut: async (): Promise<{ error: { message: string } | null }> => {
      if (!hasSupabaseConfig) {
        this.session = null;
        persistSession(null);
        this.notify("SIGNED_OUT", null);
        return { error: null };
      }

      await requestSupabase(`/auth/v1/logout`, {
        method: "POST",
        headers: this.withAuthHeaders(),
      });

      this.session = null;
      persistSession(null);
      this.notify("SIGNED_OUT", null);
      return { error: null };
    },

    getUser: async (): Promise<AuthUserResponse> => {
      if (!hasSupabaseConfig || !this.session) {
        return { data: { user: null }, error: null };
      }

      const { data, error } = await requestSupabase<User>(`/auth/v1/user`, {
        headers: this.withAuthHeaders(),
      });

      if (error) {
        return { data: { user: null }, error };
      }

      if (data) {
        this.session = { ...this.session, user: data };
        persistSession(this.session);
      }

      return { data: { user: data ?? null }, error: null };
    },

    getSession: async (): Promise<AuthSessionGetterResponse> => {
      const current = this.session ?? readStoredSession();
      this.session = current;
      if (current) {
        persistSession(current);
      }
      return { data: { session: current ?? null }, error: null };
    },

    setSession: async ({ access_token, refresh_token }: { access_token: string; refresh_token: string }): Promise<AuthSetSessionResponse> => {
      if (!hasSupabaseConfig) {
        return {
          data: { session: null, user: null },
          error: { message: "Supabase não configurado" },
        };
      }

      const headers = {
        Authorization: `Bearer ${access_token}`,
      };

      const { data, error } = await requestSupabase<User>(`/auth/v1/user`, {
        headers,
      });

      if (error || !data) {
        return {
          data: { session: null, user: null },
          error: error ?? { message: "Não foi possível recuperar o usuário." },
        };
      }

      const session: Session = {
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
        user: data,
      };

      this.session = session;
      persistSession(session);
      this.notify("TOKEN_REFRESHED", session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    },

    onAuthStateChange: (
      callback: (event: AuthChangeEvent, session: Session | null) => void,
    ): AuthChangeResponse => {
      this.listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners.delete(callback);
            },
          },
        },
      };
    },
  };

  public async restFetch<T = Json>(
    table: string,
    params: URLSearchParams,
    single: boolean,
  ): Promise<RestResponse<T>> {
    if (!hasSupabaseConfig) {
      return {
        data: null,
        error: { message: "Supabase não configurado." },
      };
    }

    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    params.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const headers: Record<string, string> = {
      ...this.withAuthHeaders(),
      apikey: SUPABASE_ANON_KEY,
    };

    if (single) {
      headers.Prefer = "return=representation";
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as PostgrestError;
      return {
        data: null,
        error: {
          message: errorBody.message ?? response.statusText,
          code: errorBody.code,
          details: errorBody.details,
          hint: errorBody.hint,
        },
      };
    }

    const data = (await response.json().catch(() => null)) as T | null;
    return { data, error: null };
  }

  public rpc = async <T = Json>(
    functionName: string,
    args: Record<string, unknown> = {},
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    if (!hasSupabaseConfig) {
      return {
        data: null,
        error: { message: "Supabase não configurado." },
      };
    }

    const headers = this.withAuthHeaders();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: {
        ...headers,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args ?? {}),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as PostgrestError;
      return {
        data: null,
        error: {
          message: errorBody.message ?? response.statusText,
          code: errorBody.code,
          details: errorBody.details,
          hint: errorBody.hint,
        },
      };
    }

    const data = (await response.json().catch(() => null)) as T | null;
    return { data, error: null };
  };

  public from<T = Json>(table: string) {
    return new StubQueryBuilder<T>(this, table);
  }
}

let singletonClient: StubSupabaseClient | null = null;

export type SupabaseClient = StubSupabaseClient;

export function createClient(): SupabaseClient {
  if (!singletonClient) {
    singletonClient = new StubSupabaseClient();
  }

  return singletonClient;
}

export function ensureClient(): SupabaseClient {
  return createClient();
}
