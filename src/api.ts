import { InstanceStatus, UDPHelper, SharedUdpSocket, SharedUdpSocketEvents, CompanionVariableValues } from '@companion-module/base'
import type { evolutionInstance } from './index.js'

export function initConnection(self: evolutionInstance): void {
	//create socket connection

	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Initializing.`)
	}

	if (self.config.host && self.config.host !== '') {
		if (self.config.port === undefined) {
			self.config.port = '53212'
		}

		self.log('info', `[Sennheiser EW][${self.config.host}] Connecting via UDP Port ${self.config.port}`)
		self.updateStatus(InstanceStatus.Connecting, 'Connecting') // Set status to Connecting

		self._socket = self.createSharedUdpSocket('udp4', responseSocketEvents)

		self._socket = new UDPHelper(self.config.host, parseInt(self.config.port), { bind_port: parseInt(self.config.port) })

		self._socket.on('error', (err: any) => {
			self.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			self.log('error', 'Network error: ' + err.message)
		})

		// If we get data, thing should be good
		self._socket.on('listening', () => {
			self.updateStatus(InstanceStatus.Ok)
			startStatusSubscription(self)
		})

		self._socket.on('data', (msg: Buffer) => {
			console.log('got data')
			processData(self, msg.toString())
		})

		self._socket.on('status_change', (status: any, message: any) => {
			console.log('status change', status, message)
		})
	}
}

export function sendCommand(self: evolutionInstance, command: string): void {
	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Sending: ${command}`)
	}

	self._socket.send(`${command}\r`, self.config.host)
}

export function startStatusSubscription(self: evolutionInstance): void {
	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Starting status subscription.`)
		self.log('debug', `[Sennheiser EW][${self.config.host}] Update rate: ${self.config.updateRate}`)
	}

	sendCommand(self, `Push 60 ${self.config.updateRate} 3`)

	if (self._pushInterval) {
		clearInterval(self._pushInterval)
	}

	self._pushInterval = setInterval(() => {
		sendCommand(self, `Push 60 ${self.config.updateRate} 3`)
	}, 60000)
}

export function processData(self: evolutionInstance, message: string): void {
	let variableObj: CompanionVariableValues = {}

	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Received: ${message}`)
	}

	let split = message.toString().split('\r')
	for (let line of split) {
		line = line.trim()
		let lineSplit = line.split(' ')
		if (line.startsWith('Msg')) {
			if (self.config.deviceType === 'SR') {
				if (line.indexOf('AF_Peak') !== -1) {
					variableObj['af_peak'] = '1'
				} else {
					variableObj['af_peak'] = '0'
				}
			} else if (self.config.deviceType === 'EM') {
				//todo
			}
			variableObj['msg'] = line.replace('Msg', '').trim()
		} else if (line.startsWith('Name')) {
			self._deviceConfig.name = lineSplit[1].trim()
			variableObj['name'] = self._deviceConfig.name
		} else if (line.startsWith('Frequency')) {
			self._deviceConfig.frequencyRaw = lineSplit[1].trim()
			self._deviceConfig.frequency = `${self._deviceConfig.frequencyRaw.substring(
				0,
				3,
			)}.${self._deviceConfig.frequencyRaw.substring(3)}`
			variableObj['frequency'] = self._deviceConfig.frequency
		} else if (line.startsWith('Config')) {
			let confVersion = parseInt(lineSplit[1].trim())
			if (confVersion !== self._deviceConfigIndex) {
				sendCommand(self, 'Frequency')
				sendCommand(self, 'Name')

				if (self.config.deviceType === 'SR') {
					sendCommand(self, 'Sensitivity')
					sendCommand(self, 'Equalizer')
					sendCommand(self, 'Mode')
				} else if (self.config.deviceType == 'EM') {
					//todo add values specific to receivers
				}
			}
		}

		if (self.config.deviceType === 'SR') {
			if (line.startsWith('AF')) {
				variableObj['af_peak_1'] = lineSplit[1]
				variableObj['af_peak_2'] = lineSplit[2]
				variableObj['af_peak_hold_1'] = lineSplit[3]
				variableObj['af_peak_hold_2'] = lineSplit[4]
			} else if (line.startsWith('States')) {
				variableObj['rf_mute'] = lineSplit[1] === '1' ? 'on' : 'off'
				variableObj['rf_mute_flags'] = lineSplit[2]

				self._muteState = lineSplit[1] === '1'
			} else if (line.startsWith('Sensitivity')) {
				let sensitivity = parseInt(lineSplit[1].trim())
				self._deviceConfig.sensitivity = sensitivity
				variableObj['sensitivity'] = sensitivity.toString()
			} else if (line.startsWith('Mode')) {
				self._deviceConfig.mode = lineSplit[1].trim() === '1' ? 'stereo' : 'mono'
				variableObj['mode'] = self._deviceConfig.mode
			} else if (line.startsWith('Equalizer')) {
				self._deviceConfig.equalizer = self._deviceConfig.equalizer || {}

				self._deviceConfig.equalizer.enabled = lineSplit[1].trim() === '1'
				self._deviceConfig.equalizer.low = parseInt(lineSplit[2].trim())
				self._deviceConfig.equalizer.lowMid = parseInt(lineSplit[3].trim())
				self._deviceConfig.equalizer.mid = parseInt(lineSplit[4].trim())
				self._deviceConfig.equalizer.midHigh = parseInt(lineSplit[5].trim())
				self._deviceConfig.equalizer.high = parseInt(lineSplit[6].trim())

				variableObj['equalizer_state'] = self._deviceConfig.equalizer.enabled ? 'on' : 'off'
				variableObj['equalizer_low'] = self._deviceConfig.equalizer.low
				variableObj['equalizer_low_mid'] = self._deviceConfig.equalizer.lowMid
				variableObj['equalizer_mid'] = self._deviceConfig.equalizer.mid
				variableObj['equalizer_mid_high'] = self._deviceConfig.equalizer.midHigh
				variableObj['equalizer_high'] = self._deviceConfig.equalizer.high
			}
		} else if (self.config.deviceType === 'EM') {
			//todo
		}
	}

	self.setVariableValues(variableObj)
}
