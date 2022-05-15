import instance from "../../../instance_skel";
import {
    CompanionInputField,
    CompanionInputFieldText,
    CompanionActions, CompanionInputFieldDropdown
} from "../../../instance_skel_types";
import {SocketState, UdpSocket} from "./UdpSocket";
import {Constants} from "./Constants";

class SennheiserEvolutionWireless extends instance<{ host: string, deviceType: string, updateRate: string }> {

    private _socket: UdpSocket;
    private _pushInterval;

    constructor(system, id, config) {
        super(system, id, config);
        this._socket = UdpSocket.getInstance();
    }

    registerActions() {
        let actions: CompanionActions = {};

        actions[Constants.ActionNames.MUTE] = {
            label: "Mute",
            options: [
                {
                    type: "checkbox",
                    label: "Mute state",
                    id: "mute",
                    default: true
                }
            ],
            callback: (args) => {
                this._socket.send(`Mute ${args.options.mute ? "1" : "0"}\r`, this.config.host);
            },
            description: "Set the mute status of a EW Wireless base unit",
        };
        actions[Constants.ActionNames.NAME] = {
            label: "Name",
            options: [
                {
                    type: "textinput",
                    label: "Name",
                    id: "name",
                }
            ],
            callback: (args) => {
                this._socket.send(`Name ${args.options.name}\r`, this.config.host);
            },
            description: "Set the name of a EW Wireless base unit",
        };
        actions[Constants.ActionNames.FREQUENCY_NUDGE] = {
            label: "Nudge frequency",
            options: [
                {
                    type: "dropdown",
                    label: "Direction",
                    id: "dir",
                    default: "up",
                    choices: [
                        {id: "up", label: "up"},
                        {id: "down", label: "down"}
                    ]
                },
                {
                    type: "number",
                    label: "Steps",
                    id: "steps",
                    default: 1,
                    range: false,
                    min: 1,
                    max: 20,
                }
            ],
            callback: (args) => {
                this._socket.send(`Frequency #${args.options.dir === "up" ? "" : "-"}${args.options.steps}\r`, this.config.host);
            },
            description: "Increase or decrease the frequency of a EW Wireless base unit",
        };
        actions[Constants.ActionNames.FREQUENCY] = {
            label: "Frequency",
            options: [
                {
                    type: "textinput",
                    label: "Frequency",
                    id: "frequency"
                }
            ],
            callback: (args) => {
                this._socket.send(`Frequency ${args.options.frequency.toString().replace(".", "").replace(",", "")}\r`, this.config.host);
            },
            description: "Set the frequency of a EW Wireless base unit. Include leading and trailing zeros (830.2 => 830.200)",
        };

        if (this.config.deviceType === "SR") {
            actions[Constants.ActionNames.SENSITIVITY_NUDGE] = {
                label: "Nudge Sensitivity",
                options: [
                    {
                        type: "dropdown",
                        label: "Direction",
                        id: "dir",
                        default: "up",
                        choices: [
                            {id: "up", label: "up"},
                            {id: "down", label: "down"}
                        ]
                    },
                    {
                        type: "number",
                        label: "Steps",
                        id: "steps",
                        default: 1,
                        range: false,
                        min: 1,
                        max: 20,
                    }
                ],
                callback: (args) => {
                    this._socket.send(`Sensitivity #${args.options.dir === "up" ? "" : "-"}${args.options.steps}\r`, this.config.host);
                },
                description: "Increase or decrease the sensitivity of a EW Wireless SR base unit",
            };
            actions[Constants.ActionNames.SENSITIVITY] = {
                label: "Sensitivity",
                options: [
                    {
                        type: "dropdown",
                        label: "Sensitivity",
                        id: "sensitivity",
                        default: "-18",
                        choices: [
                            {id: "0", label: "0"},
                            {id: "-3", label: "-3"},
                            {id: "-6", label: "-6"},
                            {id: "-9", label: "-9"},
                            {id: "-12", label: "-12"},
                            {id: "-15", label: "-15"},
                            {id: "-18", label: "-18"},
                            {id: "-21", label: "-21"},
                            {id: "-24", label: "-24"},
                            {id: "-27", label: "-27"},
                            {id: "-30", label: "-30"},
                            {id: "-33", label: "-33"},
                            {id: "-36", label: "-36"},
                            {id: "-39", label: "-39"},
                            {id: "-42", label: "-42"},
                        ]
                    },
                ],
                callback: (args) => {
                    console.log(`Sensitivity #${args.options.sensitivity}`);
                    this._socket.send(`Sensitivity ${args.options.sensitivity}\r`, this.config.host);
                },
                description: "Set the sensitivity of a EW Wireless SR base unit",
            };
            actions[Constants.ActionNames.EQUALIZER_SR] = {
                label: "Equalizer",
                options: [
                    {
                        type: "checkbox",
                        label: "Enabled",
                        id: "enabled",
                        default: false
                    },
                    {
                        type: "number",
                        label: "Low",
                        id: "low",
                        default: 0,
                        range: false,
                        min: -5,
                        max: 5,
                    },
                    {
                        type: "number",
                        label: "Low Mid",
                        id: "lowMid",
                        default: 0,
                        range: false,
                        min: -5,
                        max: 5,
                    },
                    {
                        type: "number",
                        label: "Mid",
                        id: "mid",
                        default: 0,
                        range: false,
                        min: -5,
                        max: 5,
                    },
                    {
                        type: "number",
                        label: "Mid High",
                        id: "midHigh",
                        default: 0,
                        range: false,
                        min: -5,
                        max: 5,
                    },
                    {
                        type: "number",
                        label: "High",
                        id: "high",
                        default: 0,
                        range: false,
                        min: -5,
                        max: 5,
                    }
                ],
                callback: (args) => {
                    this._socket.send(`Equalizer #${args.options.enabled ? "1" : "0"} ${args.options.low} ${args.options.lowMid} ${args.options.mid} ${args.options.midHigh} ${args.options.high}\r`, this.config.host);
                },
                description: "Set the equalizer EW Wireless SR base unit",
            };
            actions[Constants.ActionNames.MODE] = {
                label: "Mode",
                options: [
                    {
                        type: "dropdown",
                        label: "Mode",
                        id: "mode",
                        default: "1",
                        choices: [
                            {id: "0", label: "Mono"},
                            {id: "1", label: "Stereo"}
                        ]
                    }
                ],
                callback: (args) => {
                    this._socket.send(`Mode ${args.options.mode}\r`, this.config.host);
                },
                description: "Set the transmission mode of a EW Wireless SR base unit",
            };
        } else {
            console.log("[Sennheiser EW] Unknown device type", this.config.deviceType);
        }


        this.setActions(actions);
    }

    registerVariables() {
        let variables: Array<{ label: string, name: string }> = [];

        variables.push({
            name: "msg",
            label: "Messages"
        });

        if (this.config.deviceType === "SR") {
            variables.push({
                name: "af_peak_1",
                label: "AF Peak 1"
            });
            variables.push({
                name: "af_peak_2",
                label: "AF Peak 2"
            });
            variables.push({
                name: "af_peak_hold_1",
                label: "AF Peak Hold 1"
            });
            variables.push({
                name: "af_peak_hold_2",
                label: "AF Peak Hold 2"
            });

            variables.push({
                name: "rf_mute",
                label: "RF Mute"
            });
            variables.push({
                name: "rf_mute_flags",
                label: "RF Mute Flags"
            });


            variables.push({
                name: "af_peak",
                label: "AF Peak"
            });
        }

        this.setVariableDefinitions(variables);
    }


    config_fields(): CompanionInputField[] {
        return [
            ({
                type: "textinput",
                id: "host",
                label: "Target IP",
                regex: this.REGEX_IP
            }) as unknown as CompanionInputFieldText,
            ({
                type: "dropdown",
                id: "deviceType",
                label: "device type",
                default: "SR",
                choices: [
                    {id: "SR", label: "SR (Transmitter, IEM)"},
                    {id: "EM", label: "EM (Receiver, Mic)"}
                ]
            }) as CompanionInputFieldDropdown,
            ({
                type: "dropdown",
                id: "updateRate",
                label: "Update rate",
                default: "500",
                choices: [
                    {id: "200", label: "Fast"},
                    {id: "500", label: "Medium"},
                    {id: "1000", label: "Slow"},
                ]
            }) as CompanionInputFieldDropdown];
    }

    destroy(): void {
        console.log("[Sennheiser EW] Destroy called!");
        this._socket.close();
    }

    init(): void {
        console.log("[Sennheiser EW] Init called!");
        this._socket.on("state", state => {
            console.log("[Sennheiser EW] state update!", state);
            switch (state) {
                case SocketState.OPENED:
                    this.status(0, "Connected");
                    this._socket.send(`Push 60 ${this.config.updateRate} 3\r`, this.config.host);
                    this._pushInterval = setInterval(() => {
                        this._socket.send(`Push 60 ${this.config.updateRate} 3\r`, this.config.host);
                    }, 60000)
                    break;
                default:
                    this.status(1, "Socket error");
                    if (this._pushInterval) {
                        clearInterval(this._pushInterval);
                    }
            }
        });


        this._socket.start();
        this.registerActions();
        this.registerVariables();
        this.registerListener();
    }

    registerListener() {
        this._socket.on(`message:${this.config.host}`, (message, rinfo) => {
            if (this.config.host !== rinfo.address) {
                return;
            }
            let split = message.toString().split("\r");
            for (let line of split) {
                line = line.trim();
                console.log(line)
                if (line.startsWith("AF")) {

                    let afSplit = line.split(" ");

                    this.setVariable("af_peak_1", (afSplit[1]));
                    this.setVariable("af_peak_2", (afSplit[2]));
                    this.setVariable("af_peak_hold_1", (afSplit[3]));
                    this.setVariable("af_peak_hold_2", (afSplit[4]));
                } else if (line.startsWith("States")) {
                    let rfMuteSplit = line.split(" ");
                    this.setVariable("rf_mute", rfMuteSplit[1] === "1" ? "on" : "off");
                    this.setVariable("rf_mute_flags", rfMuteSplit[2])
                } else if (line.startsWith("Msg")) {
                    if (line.indexOf("AF_Peak") !== -1) {
                        this.setVariable("af_peak", "1");
                    } else {
                        this.setVariable("af_peak", "0");
                    }
                    this.setVariable("msg", line.replace("Msg", "").trim());
                }
            }
        });
    }

    updateConfig(config: { host: string, deviceType: string, updateRate: string }): void {
        console.log("[Sennheiser EW] Config updated", config);
        this.config = config;
        this.registerActions();
        this.registerVariables();
        this.registerListener();
    }
}

export = SennheiserEvolutionWireless;
