import * as bcrypt from 'bcrypt';


export class Hash {
  public static async hashPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pass, salt);
  }

  public static async checkPassword(password: string, hash: string ) {
    return await bcrypt.compare(password, hash)
  }
}