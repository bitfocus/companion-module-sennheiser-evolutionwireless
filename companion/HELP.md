# companion-module-sennheiser-evolutionwireless

The unit will need firmware v1.7.0 or newer for this module to work with it.

## Configuration

| Setting     | Description                                                                               | Example       |
| ----------- | ----------------------------------------------------------------------------------------- | ------------- |
| Target IP   | IP Address of the device to be controlled                                                 | 192.168.33.86 |
| Target Port | UDP Port                                                                                  | 53212         |
| Device Type | Type of Device, either SR (transmitter for IEM) or EM (receiver for wireless microphones) |               |
| Update Rate | Rate at which meters and other values are updated from the Wireless unit                  |               |

## Actions

### Shared

| Type            | Description                                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Mute            | Set the AF Mute for EM or the RF Mute for SR units                                                                                      |
| Name            | Set the displayed names on the base units, requires IR Sync to transfer to transmitters                                                 |
| Frequency Nudge | Nudge the set frequency (Receive for EM, Send for SR) up or down one (or more) channel(s), requires IR Sync to transfer to transmitters |
| Frequency       | Set the numerical frequency (Receive for EM, Send for SR), requires IR Sync to transfer to transmitters                                 |

### Only on SR (IEM G4 transmitter)

| Type              | Description                                                                   |
| ----------------- | ----------------------------------------------------------------------------- |
| Sensitivity Nudge | Nudge the analog input sensitivity up or down one (or more) step(s)           |
| Sensitivity       | Set the numerical analog input sensitivity                                    |
| Equalizer         | Modify the equalizer on the transmitter (might not be available on ew IEM G4) |
| Mode              | Set transmitter mode to mono or stereo                                        |

## Variables

### Shared

| Label             | Name              | Description                        |
| ----------------- | ----------------- | ---------------------------------- |
| Name              | name              | Device name of the base unit       |
| Messages          | msg               | Status messages from the base unit |
| Firmware Revision | firmware_revision | Firmware revision of the base unit |
| Frequency         | frequency         | Frequency of the base unit         |

### Only on SR (IEM G4 transmitter)

| Label                    | Name               | Description                    |
| ------------------------ | ------------------ | ------------------------------ |
| AF Peak 1                | af_peak_1          | Analog Meter of input 1        |
| AF Peak 2                | af_peak_2          | Analog Meter of input 2        |
| AF Peak Hold 1           | af_peak_hold_1     | Analog Meter Peak of input 1   |
| AF Peak Hold 2           | af_peak_hold_2     | Analog Meter Peak of input 2   |
| AF Peak                  | af_peak            | Analog input(s) peaking status |
| RF Mute                  | rf_mute            | RF Mute status                 |
| RF Mute Flags            | rf_mute_flags      | RF Mute detail                 |
| Analog Input Sensitivity | sensitivity        | Analog Input Sensitivity       |
| Mode                     | mode               | Stereo/Mono mode               |
| Equalizer State          | equalizer_state    | Equalizer status               |
| Equalizer Low            | equalizer_low      | Equalizer low level            |
| Equalizer Low Mid        | equalizer_low_mid  | Equalizer low mid level        |
| Equalizer Mid            | equalizer_mid      | Equalizer mid level            |
| Equalizer Mid High       | equalizer_mid_high | Equalizer mid high level       |
| Equalizer High           | equalizer_high     | Equalizer high level           |
