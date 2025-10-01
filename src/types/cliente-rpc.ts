
export type RPCResponse = {
  status: "success" | "error";
  message?: string;
  data?: any;
};

export type RPCParameters = {
  operacao: string;
  id?: string;
  dados?: any;
};

export type RPCInvoker = {
  rpc: string;
  p_payload: RPCParameters;
};