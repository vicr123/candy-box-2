export type CamelCased<S> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<CamelCased<U>>}` : S;
export type CamelCasedObject<T> = {
    [K in keyof T as CamelCased<K>]: T[K]
};