
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
  // if (params.has("lastRowIds")) {
  //   obj.lastRowIds = params
  //     .get("lastRowIds")!
  // }
  return obj;
};

export const commaStringPush = (commaString: string|undefined|null, stringToAdd: string) => {
  if (!commaString) return stringToAdd
  if (commaString.length === 0) return stringToAdd
  return `${commaString},${stringToAdd}`
}
export const commaStringPop = (commaString: string|undefined|null):[string, string] => {
  if (!commaString) return ['','']
  if (commaString.length === 0) return ['','']
  const parts = commaString.split(",")
  if (parts.length === 1) return ['', parts.pop()!]
  const right = parts.pop() as string
  return [parts.join(","), right]
}