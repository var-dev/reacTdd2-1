import React from "react";
import { useParams, useSearchParams } from "react-router";
import { CustomerSearch, type CustomerSearchProps } from "./CustomerSearch/CustomerSearch.js";

//?searchTerm=An&limit=20&lastRowIds=123,456
  const convertParams = (params: URLSearchParams) => {
    const obj = {} as {
      searchTerm?: string;
      limit?: number;
      lastRowIds?: string[];};
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
export const CustomerSearchRoute = (props: CustomerSearchProps) => {
  const [params, setParams] = useSearchParams();
  return (
    <CustomerSearch {...props} navigate={setParams} {...convertParams(params)}/>
  );
};

