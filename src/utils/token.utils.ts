export class Token {
  static generateToken(): string {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    return token;
  }
}