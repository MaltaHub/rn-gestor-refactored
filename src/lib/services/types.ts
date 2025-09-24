import type {
  ReadParams,
  ReadResource,
  ReadResult,
  WritePayload,
  WriteResource,
  WriteResult
} from "./operations";

export interface RequestScope {
  loja?: string | null;
  origem?: "global" | "switch" | "manual";
  [key: string]: unknown;
}

export type ReadHandler<Resource extends ReadResource = ReadResource> = (
  params: ReadParams<Resource>,
  scope: RequestScope
) => Promise<ReadResult<Resource>> | ReadResult<Resource>;

export type WriteHandler<Resource extends WriteResource = WriteResource> = (
  payload: WritePayload<Resource>,
  scope: RequestScope
) => Promise<WriteResult<Resource>> | WriteResult<Resource>;
