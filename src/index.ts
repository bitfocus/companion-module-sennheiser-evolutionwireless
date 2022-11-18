import instance from "../../../instance_skel";
import {
  CompanionActions,
  CompanionInputField,
  CompanionInputFieldDropdown,
  CompanionInputFieldText,
} from "../../../instance_skel_types";
import { SocketState, UdpSocket } from "./UdpSocket";
import { Constants } from "./Constants";
import { MuteToggleUpgrade } from "./upgrade/MuteToggleUpgrade";

class SennheiserEvolutionWireless extends instance<{ host: string; deviceType: string; updateRate: string }> {
  private static Instances: Map<string, SennheiserEvolutionWireless> = new Map<string, SennheiserEvolutionWireless>();

  static GetUpgradeScripts() {
    return [MuteToggleUpgrade];
  }

  //static DEVELOPER_forceStartupUpgradeScript = 0;

  private _socket: UdpSocket;
  private _pushInterval;

  private _deviceConfig: any = {};
  private _deviceConfigIndex = -1;

  private _muteState: boolean;

  constructor(system, id, config) {
    super(system, id, config);
    SennheiserEvolutionWireless.Instances.set(this.id, this);
    this._socket = UdpSocket.getInstance();
  }

  registerActions() {
    let actions: CompanionActions = {};

    actions[Constants.ActionNames.MUTE] = {
      label: "Mute",
      options: [
        {
          type: "dropdown",
          label: "Mute state",
          id: "mute",
          default: "toggle",
          choices: [
            { id: "mute", label: "Mute" },
            { id: "unmute", label: "Unmute" },
            { id: "toggle", label: "Toggle" },
          ],
        },
      ],
      callback: (args) => {
        let wantedState = "";

        if (args.options.mute === "mute") {
          wantedState = "1";
        } else if (args.options.mute === "unmute") {
          wantedState = "0";
        } else if (args.options.mute === "toggle") {
          if (this._muteState) {
            wantedState = "0";
          } else {
            wantedState = "1";
          }
        } else {
          throw new Error(`Unrecognized value for action mute: ${args.options.mute}`);
        }

        this._socket.send(`Mute ${wantedState}\r`, this.config.host);
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
        },
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
            { id: "up", label: "up" },
            { id: "down", label: "down" },
          ],
        },
        {
          type: "number",
          label: "Steps",
          id: "steps",
          default: 1,
          range: false,
          min: 1,
          max: 20,
        },
      ],
      callback: (args) => {
        this._socket.send(
          `Frequency #${args.options.dir === "up" ? "" : "-"}${args.options.steps}\r`,
          this.config.host
        );
      },
      description: "Increase or decrease the frequency of a EW Wireless base unit",
    };
    actions[Constants.ActionNames.FREQUENCY] = {
      label: "Frequency",
      options: [
        {
          type: "textinput",
          label: "Frequency",
          id: "frequency",
        },
      ],
      callback: (args) => {
        this._socket.send(
          `Frequency ${args.options.frequency.toString().replace(".", "").replace(",", "")}\r`,
          this.config.host
        );
      },
      description:
        "Set the frequency of a EW Wireless base unit. Include leading and trailing zeros (830.2 => 830.200)",
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
              { id: "up", label: "up" },
              { id: "down", label: "down" },
            ],
          },
          {
            type: "number",
            label: "Steps",
            id: "steps",
            default: 1,
            range: false,
            min: 1,
            max: 20,
          },
        ],
        callback: (args) => {
          this._socket.send(
            `Sensitivity #${args.options.dir === "up" ? "" : "-"}${args.options.steps}\r`,
            this.config.host
          );
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
              { id: "0", label: "0" },
              { id: "-3", label: "-3" },
              { id: "-6", label: "-6" },
              { id: "-9", label: "-9" },
              { id: "-12", label: "-12" },
              { id: "-15", label: "-15" },
              { id: "-18", label: "-18" },
              { id: "-21", label: "-21" },
              { id: "-24", label: "-24" },
              { id: "-27", label: "-27" },
              { id: "-30", label: "-30" },
              { id: "-33", label: "-33" },
              { id: "-36", label: "-36" },
              { id: "-39", label: "-39" },
              { id: "-42", label: "-42" },
            ],
          },
        ],
        callback: (args) => {
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
            default: false,
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
          },
        ],
        callback: (args) => {
          this._socket.send(
            `Equalizer #${args.options.enabled ? "1" : "0"} ${args.options.low} ${args.options.lowMid} ${
              args.options.mid
            } ${args.options.midHigh} ${args.options.high}\r`,
            this.config.host
          );
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
              { id: "0", label: "Mono" },
              { id: "1", label: "Stereo" },
            ],
          },
        ],
        callback: (args) => {
          this._socket.send(`Mode ${args.options.mode}\r`, this.config.host);
        },
        description: "Set the transmission mode of a EW Wireless SR base unit",
      };
    } else if (this.config.deviceType === "EM") {
      actions[Constants.ActionNames.AF_OUT_NUDGE] = {
        label: "Nudge AfOut",
        options: [
          {
            type: "dropdown",
            label: "Direction",
            id: "dir",
            default: "up",
            choices: [
              { id: "up", label: "up" },
              { id: "down", label: "down" },
            ],
          },
          {
            type: "number",
            label: "Steps",
            id: "steps",
            default: 1,
            range: false,
            min: 1,
            max: 20,
          },
        ],
        callback: (args) => {
          this._socket.send(`AfOut #${args.options.dir === "up" ? "" : "-"}${args.options.steps}\r`, this.config.host);
        },
        description: "Increase or decrease the level on the analog output",
      };
      actions[Constants.ActionNames.AF_OUT] = {
        label: "Level",
        options: [
          {
            type: "dropdown",
            label: "Level",
            id: "level",
            default: "0",
            choices: [
              { id: "18", label: "18" },
              { id: "15", label: "15" },
              { id: "12", label: "12" },
              { id: "9", label: "9" },
              { id: "6", label: "6" },
              { id: "3", label: "3" },
              { id: "0", label: "0" },
              { id: "-3", label: "-3" },
              { id: "-6", label: "-6" },
              { id: "-9", label: "-9" },
              { id: "-12", label: "-12" },
              { id: "-15", label: "-15" },
              { id: "-18", label: "-18" },
              { id: "-21", label: "-21" },
              { id: "-24", label: "-24" },
            ],
          },
        ],
        callback: (args) => {
          this._socket.send(`AfOut ${args.options.sensitivity}\r`, this.config.host);
        },
        description: "Set the level of the analog output",
      };
      actions[Constants.ActionNames.EQUALIZER_EM] = {
        label: "Equalizer",
        options: [
          {
            type: "dropdown",
            label: "Type",
            id: "type",
            default: "0",
            choices: [
              { id: "0", label: "flat" },
              { id: "1", label: "low cut" },
              { id: "2", label: "low cut and high boost" },
              { id: "3", label: "high boost" },
            ],
          },
        ],
        callback: (args) => {
          this._socket.send(`Equalizer ${args.options.mode}\r`, this.config.host);
        },
        description: "Set the equalizer mode of the EM base unit.",
      };
    }

    this.setActions(actions);
  }

  registerVariables() {
    let variables: Array<{ label: string; name: string }> = [];

    variables.push({
      name: "msg",
      label: "Messages",
    });

    variables.push({
      name: "name",
      label: "Name",
    });
    variables.push({
      name: "frequency",
      label: "Frequency",
    });
    if (this.config.deviceType === "SR") {
      variables.push({
        name: "af_peak_1",
        label: "AF Peak 1",
      });
      variables.push({
        name: "af_peak_2",
        label: "AF Peak 2",
      });
      variables.push({
        name: "af_peak_hold_1",
        label: "AF Peak Hold 1",
      });
      variables.push({
        name: "af_peak_hold_2",
        label: "AF Peak Hold 2",
      });

      variables.push({
        name: "rf_mute",
        label: "RF Mute",
      });
      variables.push({
        name: "rf_mute_flags",
        label: "RF Mute Flags",
      });

      variables.push({
        name: "af_peak",
        label: "AF Peak",
      });

      variables.push({
        name: "sensitivity",
        label: "Analog Input Sensitivity",
      });

      variables.push({
        name: "mode",
        label: "Mode",
      });

      variables.push({
        name: "equalizer_state",
        label: "Equalizer State",
      });
      variables.push({
        name: "equalizer_low",
        label: "Equalizer Low",
      });
      variables.push({
        name: "equalizer_low_mid",
        label: "Equalizer Low Mid",
      });
      variables.push({
        name: "equalizer_mid",
        label: "Equalizer Mid",
      });
      variables.push({
        name: "equalizer_mid_high",
        label: "Equalizer Mid High",
      });
      variables.push({
        name: "equalizer_high",
        label: "Equalizer High",
      });
    }

    this.setVariableDefinitions(variables);
  }

  config_fields(): CompanionInputField[] {
    return [
      {
        type: "textinput",
        id: "host",
        label: "Target IP",
        regex: this.REGEX_IP,
      } as unknown as CompanionInputFieldText,
      {
        type: "dropdown",
        id: "deviceType",
        label: "device type",
        default: "SR",
        choices: [
          { id: "SR", label: "SR (Transmitter, IEM)" },
          { id: "EM", label: "EM (Receiver, Mic)" },
        ],
      } as CompanionInputFieldDropdown,
      {
        type: "dropdown",
        id: "updateRate",
        label: "Update rate",
        default: "500",
        choices: [
          { id: "200", label: "Fast" },
          { id: "500", label: "Medium" },
          { id: "1000", label: "Slow" },
        ],
      } as CompanionInputFieldDropdown,
    ];
  }

  destroy(): void {
    console.log(`[Sennheiser EW][${this.config.host}] Instance destroyed.`);
    SennheiserEvolutionWireless.Instances.delete(this.id);
    if (SennheiserEvolutionWireless.Instances.size < 1) {
      this._socket.close();
    }
  }

  init(): void {
    console.log(`[Sennheiser EW][${this.config.host}] Initializing.`);
    this._socket.on("state", (state) => {
      switch (state) {
        case SocketState.OPENED:
          console.log(`[Sennheiser EW][${this.config.host}] Connected.`);
          this.status(0, "Connected");
          this.startStatusSubscription();
          break;
        default:
          console.log(`[Sennheiser EW][${this.config.host}] Disconnected!`);
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

  startStatusSubscription(): void {
    if (this._socket.state !== SocketState.OPENED) {
      return;
    }
    this._socket.send(`Push 60 ${this.config.updateRate} 3\r`, this.config.host);
    if (this._pushInterval) {
      clearInterval(this._pushInterval);
    }
    this._pushInterval = setInterval(() => {
      this._socket.send(`Push 60 ${this.config.updateRate} 3\r`, this.config.host);
    }, 60000);
  }

  registerListener(): void {
    this._socket.on(`message:${this.config.host}`, (message, rinfo) => {
      if (this.config.host !== rinfo.address) {
        return;
      }
      let split = message.toString().split("\r");
      for (let line of split) {
        line = line.trim();
        let lineSplit = line.split(" ");
        if (line.startsWith("Msg")) {
          if (this.config.deviceType === "SR") {
            if (line.indexOf("AF_Peak") !== -1) {
              this.setVariable("af_peak", "1");
            } else {
              this.setVariable("af_peak", "0");
            }
          } else if (this.config.deviceType === "EM") {
            //todo
          }
          this.setVariable("msg", line.replace("Msg", "").trim());
        } else if (line.startsWith("Name")) {
          this._deviceConfig.name = lineSplit[1].trim();
          this.setVariable("name", this._deviceConfig.name);
        } else if (line.startsWith("Frequency")) {
          this._deviceConfig.frequencyRaw = lineSplit[1].trim();
          this._deviceConfig.frequency = `${this._deviceConfig.frequencyRaw.substring(
            0,
            3
          )}.${this._deviceConfig.frequencyRaw.substring(3)}`;
          this.setVariable("frequency", this._deviceConfig.frequency);
        } else if (line.startsWith("Config")) {
          let confVersion = parseInt(lineSplit[1].trim());
          if (confVersion !== this._deviceConfigIndex) {
            this._socket.send(`Frequency\r`, this.config.host);
            this._socket.send(`Name\r`, this.config.host);

            if (this.config.deviceType === "SR") {
              this._socket.send(`Sensitivity\r`, this.config.host);
              this._socket.send(`Equalizer\r`, this.config.host);
              this._socket.send(`Mode\r`, this.config.host);
            } else if (this.config.deviceType == "EM") {
              //todo add values specific to receivers
            }
          }
        }

        if (this.config.deviceType === "SR") {
          if (line.startsWith("AF")) {
            this.setVariables({
              af_peak_1: lineSplit[1],
              af_peak_2: lineSplit[2],
              af_peak_hold_1: lineSplit[3],
              af_peak_hold_2: lineSplit[4],
            });
          } else if (line.startsWith("States")) {
            this.setVariables({
              rf_mute: lineSplit[1] === "1" ? "on" : "off",
              rf_mute_flags: lineSplit[2],
            });

            this._muteState = lineSplit[1] === "1";
          } else if (line.startsWith("Sensitivity")) {
            let sensitivity = parseInt(lineSplit[1].trim());
            this._deviceConfig.sensitivity = sensitivity;
            this.setVariable("sensitivity", sensitivity.toString());
          } else if (line.startsWith("Mode")) {
            this._deviceConfig.mode = lineSplit[1].trim() === "1" ? "stereo" : "mono";
            this.setVariable("mode", this._deviceConfig.mode);
          } else if (line.startsWith("Equalizer")) {
            this._deviceConfig.equalizer = this._deviceConfig.equalizer || {};

            this._deviceConfig.equalizer.enabled = lineSplit[1].trim() === "1";
            this._deviceConfig.equalizer.low = parseInt(lineSplit[2].trim());
            this._deviceConfig.equalizer.lowMid = parseInt(lineSplit[3].trim());
            this._deviceConfig.equalizer.mid = parseInt(lineSplit[4].trim());
            this._deviceConfig.equalizer.midHigh = parseInt(lineSplit[5].trim());
            this._deviceConfig.equalizer.high = parseInt(lineSplit[6].trim());

            this.setVariables({
              equalizer_state: this._deviceConfig.equalizer.enabled ? "on" : "off",
              equalizer_low: this._deviceConfig.equalizer.low,
              equalizer_low_mid: this._deviceConfig.equalizer.lowMid,
              equalizer_mid: this._deviceConfig.equalizer.mid,
              equalizer_mid_high: this._deviceConfig.equalizer.midHigh,
              equalizer_high: this._deviceConfig.equalizer.high,
            });
          }
        } else if (this.config.deviceType === "EM") {
          //todo
        }
      }
    });
  }

  updateConfig(config: { host: string; deviceType: string; updateRate: string }): void {
    this.config = config;
    this.registerActions();
    this.registerVariables();
    this.registerListener();
    this.startStatusSubscription();
  }
}

export = SennheiserEvolutionWireless;
