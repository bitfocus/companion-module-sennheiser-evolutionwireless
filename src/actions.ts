import type { evolutionInstance } from './index.js'
import { CompanionActionDefinitions } from '@companion-module/base'
import { sendCommand } from './api.js'

export function UpdateActions(self: evolutionInstance): void {
	const actions: CompanionActionDefinitions = {}

	actions['sennheiser_ew_mute'] = {
		name: 'Mute',
		description: 'Set the mute status of a EW Wireless base unit',
		options: [
			{
				type: 'dropdown',
				label: 'Mute state',
				id: 'mute',
				default: 'toggle',
				choices: [
					{ id: 'mute', label: 'Mute' },
					{ id: 'unmute', label: 'Unmute' },
					{ id: 'toggle', label: 'Toggle' },
				],
			},
		],
		callback: (args) => {
			let wantedState = ''

			if (args.options.mute === 'mute') {
				wantedState = '1'
			} else if (args.options.mute === 'unmute') {
				wantedState = '0'
			} else if (args.options.mute === 'toggle') {
				if (self._muteState) {
					wantedState = '0'
				} else {
					wantedState = '1'
				}
			} else {
				throw new Error(`Unrecognized value for action mute: ${args.options.mute}`)
			}

			sendCommand(self, `Mute ${wantedState}`)
		},
	}

	actions['sennheiser_ew_name'] = {
		name: 'Name',
		options: [
			{
				type: 'textinput',
				label: 'Name',
				id: 'name',
				useVariables: true,
			},
		],
		callback: async (args) => {
			let name = await self.parseVariablesInString(String(args.options.frequency || ''))

			sendCommand(self, `Name ${name}`)
		},
		description: 'Set the name of a EW Wireless base unit',
	}

	actions['sennheiser_ew_frequency_nudge'] = {
		name: 'Nudge frequency',
		description: 'Increase or decrease the frequency of a EW Wireless base unit',
		options: [
			{
				type: 'dropdown',
				label: 'Direction',
				id: 'dir',
				default: 'up',
				choices: [
					{ id: 'up', label: 'up' },
					{ id: 'down', label: 'down' },
				],
			},
			{
				type: 'number',
				label: 'Steps',
				id: 'steps',
				default: 1,
				range: false,
				min: 1,
				max: 20,
			},
		],
		callback: (args) => {
			let cmd: string = `Frequency #${args.options.dir === 'up' ? '' : '-'}${args.options.steps}`
			sendCommand(self, cmd)
		},
	}

	actions['sennheiser_ew_frequency'] = {
		name: 'Frequency',
		description:
			'Set the frequency of a EW Wireless base unit. Include leading and trailing zeros (830.2 => 830.200)',
		options: [
			{
				type: 'textinput',
				label: 'Frequency',
				id: 'frequency',
				useVariables: true,
			},
		],
		callback: async (args) => {
			let frequency = await self.parseVariablesInString(String(args.options.frequency || ''))

			sendCommand(self, `Frequency ${frequency.toString().replace('.', '').replace(',', '')}`)
		},
	}

	if (self.config.deviceType === 'SR') {
		actions['sennheiser_ew_sensitivity_nudge'] = {
			name: 'Nudge Sensitivity',
			description: 'Increase or decrease the sensitivity of a EW Wireless SR base unit',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'dir',
					default: 'up',
					choices: [
						{ id: 'up', label: 'up' },
						{ id: 'down', label: 'down' },
					],
				},
				{
					type: 'number',
					label: 'Steps',
					id: 'steps',
					default: 1,
					range: false,
					min: 1,
					max: 20,
				},
			],
			callback: (args) => {
				sendCommand(self, `Sensitivity #${args.options.dir === 'up' ? '' : '-'}${args.options.steps}`)
			},
		}

		actions['sennheiser_ew_sensitivity'] = {
			name: 'Sensitivity',
			description: 'Set the sensitivity of a EW Wireless SR base unit',
			options: [
				{
					type: 'dropdown',
					label: 'Sensitivity',
					id: 'sensitivity',
					default: '-18',
					choices: [
						{ id: '0', label: '0' },
						{ id: '-3', label: '-3' },
						{ id: '-6', label: '-6' },
						{ id: '-9', label: '-9' },
						{ id: '-12', label: '-12' },
						{ id: '-15', label: '-15' },
						{ id: '-18', label: '-18' },
						{ id: '-21', label: '-21' },
						{ id: '-24', label: '-24' },
						{ id: '-27', label: '-27' },
						{ id: '-30', label: '-30' },
						{ id: '-33', label: '-33' },
						{ id: '-36', label: '-36' },
						{ id: '-39', label: '-39' },
						{ id: '-42', label: '-42' },
					],
				},
			],
			callback: (args) => {
				sendCommand(self, `Sensitivity ${args.options.sensitivity}`)
			},
		}

		actions['sennheiser_ew_equalizer_sr'] = {
			name: 'Equalizer',
			description: 'Set the equalizer EW Wireless SR base unit',
			options: [
				{
					type: 'checkbox',
					label: 'Enabled',
					id: 'enabled',
					default: false,
				},
				{
					type: 'number',
					label: 'Low',
					id: 'low',
					default: 0,
					range: false,
					min: -5,
					max: 5,
				},
				{
					type: 'number',
					label: 'Low Mid',
					id: 'lowMid',
					default: 0,
					range: false,
					min: -5,
					max: 5,
				},
				{
					type: 'number',
					label: 'Mid',
					id: 'mid',
					default: 0,
					range: false,
					min: -5,
					max: 5,
				},
				{
					type: 'number',
					label: 'Mid High',
					id: 'midHigh',
					default: 0,
					range: false,
					min: -5,
					max: 5,
				},
				{
					type: 'number',
					label: 'High',
					id: 'high',
					default: 0,
					range: false,
					min: -5,
					max: 5,
				},
			],
			callback: (args) => {
				sendCommand(
					self,
					`Equalizer #${args.options.enabled ? '1' : '0'} ${args.options.low} ${args.options.lowMid} ${
						args.options.mid
					} ${args.options.midHigh} ${args.options.high}`,
				)
			},
		}

		actions['sennheiser_ew_mode'] = {
			name: 'Mode',
			description: 'Set the transmission mode of a EW Wireless SR base unit',
			options: [
				{
					type: 'dropdown',
					label: 'Mode',
					id: 'mode',
					default: '1',
					choices: [
						{ id: '0', label: 'Mono' },
						{ id: '1', label: 'Stereo' },
					],
				},
			],
			callback: (args) => {
				sendCommand(self, `Mode ${args.options.mode}`)
			},
		}
	} else if (self.config.deviceType === 'EM') {
		actions['sennheiser_ew_af_out_nudge'] = {
			name: 'Nudge AfOut',
			description: 'Increase or decrease the level on the analog output',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'dir',
					default: 'up',
					choices: [
						{ id: 'up', label: 'up' },
						{ id: 'down', label: 'down' },
					],
				},
				{
					type: 'number',
					label: 'Steps',
					id: 'steps',
					default: 1,
					range: false,
					min: 1,
					max: 20,
				},
			],
			callback: (args) => {
				sendCommand(self, `AfOut #${args.options.dir === 'up' ? '' : '-'}${args.options.steps}`)
			},
		}

		actions['sennheiser_ew_af_out'] = {
			name: 'Level',
			description: 'Set the level of the analog output',
			options: [
				{
					type: 'dropdown',
					label: 'Level',
					id: 'level',
					default: '0',
					choices: [
						{ id: '18', label: '18' },
						{ id: '15', label: '15' },
						{ id: '12', label: '12' },
						{ id: '9', label: '9' },
						{ id: '6', label: '6' },
						{ id: '3', label: '3' },
						{ id: '0', label: '0' },
						{ id: '-3', label: '-3' },
						{ id: '-6', label: '-6' },
						{ id: '-9', label: '-9' },
						{ id: '-12', label: '-12' },
						{ id: '-15', label: '-15' },
						{ id: '-18', label: '-18' },
						{ id: '-21', label: '-21' },
						{ id: '-24', label: '-24' },
					],
				},
			],
			callback: (args) => {
				sendCommand(self, `AfOut ${args.options.level}`)
			},
		}

		actions['sennheiser_ew_equalizer_em'] = {
			name: 'Equalizer',
			description: 'Set the equalizer mode of the EM base unit.',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					default: '0',
					choices: [
						{ id: '0', label: 'Flat' },
						{ id: '1', label: 'Low Cut' },
						{ id: '2', label: 'Low Cut and High Boost' },
						{ id: '3', label: 'High Boost' },
					],
				},
			],
			callback: (args) => {
				sendCommand(self, `Equalizer ${args.options.type}`)
			},
		}
	}

	self.setActionDefinitions(actions)
}
