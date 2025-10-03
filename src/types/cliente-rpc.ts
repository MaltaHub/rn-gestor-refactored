export type RPCResponse<TData = unknown> = {
  status: "success" | "error";
  message?: string;
  data?: TData;
};

export type RPCParameters<TPayload = Record<string, unknown>> = {
  operacao: string;
  id?: string;
  dados?: TPayload;
};
