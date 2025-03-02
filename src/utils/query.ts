export type OrderDirection = "asc" | "desc";

export interface OrderByParams<T extends string> {
  field: T;
  direction: OrderDirection;
}

export const parsePagination = (
  page: string | undefined,
  limit: string | undefined
) => {
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit || "10", 10)));
  const offset = (currentPage - 1) * itemsPerPage;

  return { currentPage, itemsPerPage, offset };
};

export const parseOrderBy = <T extends string>(
  field: string | undefined,
  direction: string | undefined,
  validFields: T[]
): OrderByParams<T> => {
  const validDirections: OrderDirection[] = ["asc", "desc"];

  const inputFieldLower = field?.toLowerCase() || "";
  const validFieldsLower = validFields.map((f) => f.toLowerCase());

  const matchedIndex = validFieldsLower.findIndex((f) => f === inputFieldLower);
  const parsedField =
    matchedIndex >= 0 ? validFields[matchedIndex] : "createdAt";

  const parsedDirection = direction?.toLowerCase() as OrderDirection;
  const isValidDirection = validDirections.includes(parsedDirection);

  return {
    field: parsedField as T,
    direction: isValidDirection ? parsedDirection : "desc",
  };
};
