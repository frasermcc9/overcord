import { Guild, Message, User } from "discord.js";

export { Logger, LogEntry, FullLogEntry };

interface Logger {
    log(logEntry: LogEntry): Promise<void>;
}

interface FullLogEntry {
    invokingUser: User;
    reason: string;
    message: Message;
    affectedUsers: User[];
    time: Date;
    guild: Guild;
    command: string;
    importance: number;
}

type LogEntry = Partial<FullLogEntry>;
