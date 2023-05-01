// import needed modules
import mariadb from 'mariadb';
import { Pool } from 'mariadb';

// create a class for bank account, used for creating bank account objects
class BankAccount {
    private accountNumber: string;
    private balance: number;
    private pinCode: string;

    // constructor for bank account class
    constructor(accountNumber: string) {
        // create a new database object
        const db = new Database();
        // get the account data from the database
        const accountData = db.getAccountData(accountNumber);
        // if the account data is invalid, throw an error
        if (!accountData) {
            throw new Error(`account number: ${accountNumber} does not exist`);
        }

        // set the account number, balance and pin code
        this.accountNumber = accountNumber;
        this.balance = accountData.balance;
        this.pinCode = accountData.pinCode;
    }

    // check if the pin code is correct
    private checkPinCode(pinCode: string) {
        if (this.pinCode !== pinCode) {
            throw new Error(`Invalid pin code for account number: ${this.accountNumber}`);
        }
    }

    // get the balance of the account
    deposit(amount: number) {
        this.balance += amount;
        // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
    }

    // withdraw money from the account
    withdraw(amount: number, pinCode: string) {
        // check if the pin code is correct
        this.checkPinCode(pinCode);
        // check if the amount is valid
        if (amount < 0) {
            throw new Error(`Invalid amount: ${amount}`);
        }
        // check if the balance is enough to withdraw the amount
        if (this.balance < amount) {
            throw new Error(`Insufficient balance for account number: ${this.accountNumber}`);
        }
        // withdraw the amount from the account balance and return the new balance of the account
        this.balance -= amount;
    }

    // transfer money from one account to another account number
    transfer(amount: number, pinCode: string, toAccountNumber: string) {
        // check if the pin code is correct
        this.checkPinCode(pinCode);
        if (amount < 0) {
            throw new Error(`Invalid amount: ${amount}`);
        }

        // create a new database object and transfer the money from one account to another account
        const db = new Database();
        db.transfer(this.accountNumber, toAccountNumber, amount);
        this.balance -= amount;
    }
}

// create a class for database, used for creating database objects
class Database {
    // create a private pool object for database connection 
    private _pool: Pool;

    // constructor for database class
    constructor() {
        this._pool = mariadb.createPool({
            host: 'localhost',
            user: 'AB5',
            password: 'supersecret123',
            database: 'AB5',
            connectionLimit: 5,
        });
    }

    // execute a callback function in a transaction and return the result 
    async executeInTransaction(callback: (connection: Pool) => Promise<any>) {
        let connection;
        // try to execute the callback function in a transaction and commit the transaction if success
        try {
            connection = await this._pool.getConnection();
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        // if the callback function fails, rollback the transaction 
        } catch (error) {
            await connection.rollback();
            throw error;
        // release the connection 
        // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // get the account data from the database and return the account data
    getAccountData(accountNumber: string) {
        return this.executeInTransaction(async (connection) => {
            const rows = await connection.query(
                `SELECT account_number, balance, pin_code FROM accounts WHERE account_number = '${accountNumber}'`
            );
            return rows[0];
        });
    }

    // transfer money from one account to another account
    transfer(fromAccountNumber: string, toAccountNumber: string, amount: number) {
        return this.executeInTransaction(async (connection) => {
            const fromAccount = new BankAccount(fromAccountNumber);
            const toAccount = new BankAccount(toAccountNumber);
            fromAccount.withdraw(amount, fromAccount.pinCode);
            toAccount.deposit(amount);

            await connection.query(
                `UPDATE accounts SET balance = ${fromAccount.balance} WHERE account_number = '${fromAccountNumber}'`
            );
            await connection.query(
                `UPDATE accounts SET balance = ${toAccount.balance} WHERE account_number = '${toAccountNumber}'`
            );
        });
    }
}
