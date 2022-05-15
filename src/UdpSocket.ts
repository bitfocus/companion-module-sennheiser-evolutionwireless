import {EventEmitter} from "events";
import {Socket} from "dgram";
import * as dgram from "dgram";

export class UdpSocket extends EventEmitter {

    public static getInstance() {
        if (!this._instance) {
            this._instance = new UdpSocket();
        }
        return this._instance;
    }

    private static _instance;

    private _started = false;

    private _socket: Socket;

    private _state: SocketState = SocketState.CLOSED;

    constructor() {
        super();
    }

    public get state() {
        return this._state;
    }

    public start(): void {
        if (this._started && (this._state === SocketState.OPENED || this._state === SocketState.STARTING)) {
            return;
        }
        this.setState(SocketState.STARTING)
        this._started = true;

        this._socket = dgram.createSocket({
            type: "udp4",
        });

        this._socket.on("listening", () => {
            this.setState(SocketState.OPENED)
            const address = this._socket.address();
            console.log(`[Sennheiser EW] socket listening ${address.address}:${address.port}`);
        });

        this._socket.on("message", (msg, rinfo) => {
            //console.log(`[Sennheiser EW] server got: ${msg.toString().replace("\r", "\\r").replace("\n", "\\n")} from ${rinfo.address}:${rinfo.port}`);
            this.emit(`message:${rinfo.address}`, msg, rinfo);
        });

        this._socket.on("error", (err) => {
            this.setState(SocketState.ERROR);
            console.log(`[Sennheiser EW] server error:\n${err.stack}`);
        });

        this._socket.on("close", () => {
            this.setState(SocketState.CLOSED);
            console.log(`[Sennheiser EW] server closed`);
        });

        this._socket.bind({
            address: "0.0.0.0",
            port: 53212
        });

    }

    private setState(state: SocketState) {
        this._state = state;
        this.emit("state", state);
    }

    public close() {
        this.setState(SocketState.CLOSED);
        this._socket.close();
    }

    public send(message: string, target: string) {
        this._socket.send(message, 53212, target);
    }
}

export enum SocketState {
    CLOSED,
    OPENED,
    ERROR,
    STARTING
}
