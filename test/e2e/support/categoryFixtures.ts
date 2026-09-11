import type { Category } from "./e2eTypes";
import { jsonRequest, requestJson } from "./realBackendClient";

export async function createTestCategory(
  projectId: string,
  categoryData: Readonly<{ key: string; type: string; name: string }>,
): Promise<Category> {
  return requestJson<Category>(
    `/projects/${encodeURIComponent(projectId)}/categories`,
    jsonRequest("POST", {
      key: categoryData.key,
      type: categoryData.type,
      name: categoryData.name,
    }),
    201,
  );
}
