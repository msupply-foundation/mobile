export declare type PreparedAction<T> = {
  payload: T;
};

export declare type MacAddress = string;

export declare type UnixTimestamp = number;

export type ById<SomeTypeSortedById> = Record<string, SomeTypeSortedById>;

export interface PrepareActionReturn<SomePayload> {
  payload: SomePayload;
}

export interface FailurePayload {
  errorMessage: string;
}
