declare module 'quibble' {
  interface Quibble {
    (modulePath: string, stub: any): void;
    reset(): void;
    esm(modulePath: string, stub: any): Promise<void>;
  }
  const quibble: Quibble;
  export = quibble;
}