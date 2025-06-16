class Printer {
  static notify(...args) {
    console.log("\x1b[34m", ...args, "\x1b[0m");
  }
  static warning(...args) {
    console.log("\x1b[33m", ...args, "\x1b[0m"); 
  }

  static error(...args) {
    console.log("\x1b[31m", ...args, "\x1b[0m");
  }
}
module.exports = Printer;