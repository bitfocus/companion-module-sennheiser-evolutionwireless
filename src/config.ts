import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	host: string
	port: string
	deviceType: string
	updateRate: string
	verbose: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'This module is for controlling Sennheiser Evolution Wireless devices.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 4,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 2,
			default: '53212',
			regex: Regex.PORT,
		},
		{
			type: 'static-text',
			id: 'hr',
			label: '',
			width: 12,
			value: '<hr />',
		},
		{
			type: 'dropdown',
			id: 'deviceType',
			label: 'device type',
			width: 6,
			default: 'SR',
			choices: [
				{ id: 'SR', label: 'SR (Transmitter, IEM)' },
				{ id: 'EM', label: 'EM (Receiver, Mic)' },
			],
		},
		{
			type: 'static-text',
			id: 'hr2',
			label: '',
			width: 12,
			value: '<hr />',
		},
		{
			type: 'dropdown',
			id: 'updateRate',
			label: 'Update Rate',
			width: 6,
			default: '500',
			choices: [
				{ id: '200', label: 'Fast' },
				{ id: '500', label: 'Medium' },
				{ id: '1000', label: 'Slow' },
			],
		},
		{
			type: 'static-text',
			id: 'updateRateInfo',
			label: '',
			width: 6,
			value: 'The update rate is how often the module will update status from the device.',
		},
		{
			type: 'static-text',
			id: 'hr3',
			label: '',
			width: 12,
			value: '<hr />',
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Verbose logging',
			width: 4,
			default: false,
		},
		{
			type: 'static-text',
			id: 'verboseInfo',
			label: '',
			width: 8,
			value: 'Enable this to log all commands and responses to the debug log.',
		},
	]
}
