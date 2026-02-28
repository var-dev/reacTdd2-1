
type SearchParamsProps = Record<string,string>

export const searchParams = (params: SearchParamsProps) => {
  const pairs =  Object.entries(params)
  .filter(([key, value]) => value !== '' && value !== undefined)
  .map(([key, value]) => (`${encodeURIComponent(key)}=${encodeURIComponent(value)}`))
  return pairs.length > 0 ? `?${(pairs.join("&"))}` : "";
};
//?searchTerm=An&limit=20&lastRowIds=123,456
export const convertParams = (params: URLSearchParams) => {
  const obj = {} as {
    searchTerm?: string;
    limit?: number;
    lastRowIds?: string[];
  };
  if (params.has("searchTerm")) {
    obj.searchTerm = params.get("searchTerm")!;
  }
  if (params.has("limit")) {
    obj.limit = parseInt(params.get("limit")!, 10);
  }
  if (params.has("lastRowIds")) {
    obj.lastRowIds = params
      .get("lastRowIds")!
      .split(",")
      .filter((id) => id !== "");
  }
  return obj;
};
