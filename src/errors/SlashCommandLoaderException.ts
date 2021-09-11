export class SlashCommandLoaderException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlashCommandLoaderException";
  }
}
