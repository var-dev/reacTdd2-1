
type SearchParamsProps = Record<string,string>

export const searchParams = (params: SearchParamsProps) => {
  const pairs =  Object.entries(params)
  .filter(([key, value]) => value !== '' && value !== undefined)
  .map(([key, value]) => (`${encodeURIComponent(key)}=${encodeURIComponent(value)}`))
  return pairs.length > 0 ? `?${(pairs.join("&"))}` : "";
}