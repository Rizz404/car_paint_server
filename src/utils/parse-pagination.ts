export const parsePagination = (
  page: string | undefined,
  limit: string | undefined
) => {
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit || "10", 10)));
  const offset = (currentPage - 1) * itemsPerPage;

  return { currentPage, itemsPerPage, offset };
};
