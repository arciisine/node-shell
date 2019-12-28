export type OrProm<X> = X | Promise<X>;
export type OrCall<X> = X | (() => X);
export type Gen<U> = OrProm<Iterator<U> | AsyncGenerator<U>>;
export type Reducer<U, T> = (acc: U, item: T) => OrProm<U>;
