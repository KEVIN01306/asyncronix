export interface TransactionManager {
    /**
     * Executes a callback within a database transaction.
     * @param fn The callback function containing the operations to be executed atomically. The `tx` argument is the transaction context.
     */
    run<T>(fn: (tx: any) => Promise<T>): Promise<T>;
}
