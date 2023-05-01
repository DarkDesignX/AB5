"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// import needed modules
var mariadb_1 = require("mariadb");
// create a class for bank account, used for creating bank account objects
var BankAccount = /** @class */ (function () {
    // constructor for bank account class
    function BankAccount(accountNumber) {
        // create a new database object
        var db = new Database();
        // get the account data from the database
        var accountData = db.getAccountData(accountNumber);
        // if the account data is invalid, throw an error
        if (!accountData) {
            throw new Error("Invalid account number: ".concat(accountNumber));
        }
        // set the account number, balance and pin code
        this.accountNumber = accountNumber;
        this.balance = accountData.balance;
        this.pinCode = accountData.pinCode;
    }
    // check if the pin code is correct
    // if the pin code is incorrect, throw an error
    BankAccount.prototype.checkPinCode = function (pinCode) {
        if (this.pinCode !== pinCode) {
            throw new Error("Invalid pin code for account number: ".concat(this.accountNumber));
        }
    };
    // get the balance of the account
    // return the balance
    BankAccount.prototype.deposit = function (amount) {
        this.balance += amount;
    };
    // withdraw money from the account
    BankAccount.prototype.withdraw = function (amount, pinCode) {
        // check if the pin code is correct
        this.checkPinCode(pinCode);
        // check if the amount is valid
        if (amount < 0) {
            throw new Error("Invalid amount: ".concat(amount));
        }
        // check if the balance is enough to withdraw the amount
        if (this.balance < amount) {
            throw new Error("Insufficient balance for account number: ".concat(this.accountNumber));
        }
        // withdraw the amount from the account balance and return the new balance of the account
        this.balance -= amount;
    };
    // transfer money from one account to another account number
    BankAccount.prototype.transfer = function (amount, pinCode, toAccountNumber) {
        // check if the pin code is correct
        this.checkPinCode(pinCode);
        if (amount < 0) {
            throw new Error("Invalid amount: ".concat(amount));
        }
        // create a new database object and transfer the money from one account to another account
        var db = new Database();
        db.transfer(this.accountNumber, toAccountNumber, amount);
        this.balance -= amount;
    };
    return BankAccount;
}());
// create a class for database, used for creating database objects
var Database = /** @class */ (function () {
    // constructor for database class
    function Database() {
        this._pool = mariadb_1.default.createPool({
            host: 'localhost',
            user: 'AB5',
            password: 'supersecret123',
            database: 'AB5',
            connectionLimit: 5,
        });
    }
    // execute a callback function in a transaction and return the result 
    Database.prototype.executeInTransaction = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, 7, 8]);
                        return [4 /*yield*/, this._pool.getConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.beginTransaction()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, callback(connection)];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, connection.commit()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _a.sent();
                        return [4 /*yield*/, connection.rollback()];
                    case 6:
                        _a.sent();
                        throw error_1;
                    case 7:
                        if (connection) {
                            connection.release();
                        }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // get the account data from the database and return the account data
    Database.prototype.getAccountData = function (accountNumber) {
        var _this = this;
        return this.executeInTransaction(function (connection) { return __awaiter(_this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, connection.query("SELECT account_number, balance, pin_code FROM accounts WHERE account_number = '".concat(accountNumber, "'"))];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows[0]];
                }
            });
        }); });
    };
    // transfer money from one account to another account
    Database.prototype.transfer = function (fromAccountNumber, toAccountNumber, amount) {
        var _this = this;
        return this.executeInTransaction(function (connection) { return __awaiter(_this, void 0, void 0, function () {
            var fromAccount, toAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromAccount = new BankAccount(fromAccountNumber);
                        toAccount = new BankAccount(toAccountNumber);
                        fromAccount.withdraw(amount, fromAccount.pinCode);
                        toAccount.deposit(amount);
                        return [4 /*yield*/, connection.query("UPDATE accounts SET balance = ".concat(fromAccount.balance, " WHERE account_number = '").concat(fromAccountNumber, "'"))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, connection.query("UPDATE accounts SET balance = ".concat(toAccount.balance, " WHERE account_number = '").concat(toAccountNumber, "'"))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return Database;
}());
