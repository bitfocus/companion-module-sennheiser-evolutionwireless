import type { evolutionInstance } from './index.js'
import { CompanionVariableDefinition } from '@companion-module/base'

export function UpdateVariableDefinitions(self: evolutionInstance): void {
	let variables: Array<CompanionVariableDefinition> = []

	variables.push({ variableId: 'msg', name: 'Messages' })
	variables.push({ variableId: 'name', name: 'Name' })
	variables.push({ variableId: 'frequency', name: 'Frequency' })

	if (self.config.deviceType === 'SR') {
		variables.push({ variableId: 'af_peak_1', name: 'AF Peak 1' })
		variables.push({ variableId: 'af_peak_2', name: 'AF Peak 2' })
		variables.push({ variableId: 'af_peak_hold_1', name: 'AF Peak Hold 1' })
		variables.push({ variableId: 'af_peak_hold_2', name: 'AF Peak Hold 2' })
		variables.push({ variableId: 'rf_mute', name: 'RF Mute' })
		variables.push({ variableId: 'rf_mute_flags', name: 'RF Mute Flags' })
		variables.push({ variableId: 'af_peak', name: 'AF Peak' })
		variables.push({ variableId: 'sensitivity', name: 'Analog Input Sensitivity' })
		variables.push({ variableId: 'mode', name: 'Mode' })
		variables.push({ variableId: 'equalizer_state', name: 'Equalizer State' })
		variables.push({ variableId: 'equalizer_low', name: 'Equalizer Low' })
		variables.push({ variableId: 'equalizer_low_mid', name: 'Equalizer Low Mid' })
		variables.push({ variableId: 'equalizer_mid', name: 'Equalizer Mid' })
		variables.push({ variableId: 'equalizer_mid_high', name: 'Equalizer Mid High' })
		variables.push({ variableId: 'equalizer_high', name: 'Equalizer High' })
	}

	self.setVariableDefinitions(variables)
}
