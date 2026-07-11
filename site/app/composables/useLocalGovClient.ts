import type { LocalGovClient } from "@b4moss/jp-local-gov-id";
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

let clientPromise: Promise<LocalGovClient> | null = null;

export function useLocalGovClient() {
  if (!clientPromise) {
    clientPromise = createLocalGovClient({ data: dataset });
  }
  return clientPromise;
}
