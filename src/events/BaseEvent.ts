import { ClientEvents } from "discord.js";
import Client from "../Client";

export default abstract class AbstractEvent {
    private _client!: Client;

    constructor() {}

    public internalSetClient(client: Client) {
        this._client = client;
    }

    public get client() {
        return this._client;
    }
}
