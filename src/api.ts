import { InstanceStatus, CompanionVariableValues } from '@companion-module/base'
import type { evolutionInstance } from './index.js'

function checkMessage(self: evolutionInstance, msg: Buffer, rinfo: { address: string; port: number }): void {
	try {
		if (rinfo.address == self.config.host) {
			if (self.config.verbose) {
				self.log('debug', 'Got UDP message: ' + Buffer.from(msg).toString('hex'))
			}
			processData(self, Buffer.from(msg).toString())
		} else {
			//if the remote address isn't our configured host, it's just some other device
			self.log('info', `Ignoring UDP message from unknown source: ${rinfo.address}:${rinfo.port}`)
		}
	} catch (err: any) {
		self.log('error', `UDP error: ${err.message}`)
	}
}

export function initConnection(self: evolutionInstance): void {
	//create socket connection

	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Initializing.`)
	}

	if (self.config.host && self.config.host !== '') {
			if (self.config.port === undefined) {
				self.config.port = '53212'
			}

			if (Number.isInteger(self.config.port)) {
				self.updateStatus(InstanceStatus.BadConfig, 'Port missing or not an integer')
			} else if (self.config.port === '') {
				self.updateStatus(InstanceStatus.BadConfig, 'Port empty')
			} else if (Number.isInteger(self.config.port)) {
				self.updateStatus(InstanceStatus.BadConfig, 'Port is not an integer')
			} else if (Number(self.config.port) <= 0 || Number(self.config.port) > 65535) {
				self.updateStatus(InstanceStatus.BadConfig, 'Port is out of range, should be between 1 and 65535 (inclusive)')
			} else {
				self.log('info', `[Sennheiser EW][${self.config.host}] Connecting via UDP Port ${self.config.port}`)

				self._socket = self.createSharedUdpSocket('udp4', (msg, rinfo) => checkMessage(self, msg, rinfo))
				self._socket.bind(self.config.port)

				self._socket.on('error', (err: any) => {
					self.updateStatus(InstanceStatus.ConnectionFailure, err.message)
					self.log('error', 'Network error: ' + err.message)
				})

				// If we get data, thing should be good
				self._socket.on('listening', () => {
					self.updateStatus(InstanceStatus.Connecting)
					startStatusSubscription(self)
				})

				// This is an unfiltered duplicate from to the UDP port, but possibly not for us
				// self._socket.on('message', (msg: Buffer) => {
				// 	console.log('got data: ' + msg.toString())
				// 	processData(self, msg.toString())
				// })

				self._socket.on('status_change', (status: any, message: any) => {
					console.log('status change', status, message)
				})
			}
	} else {
		self.updateStatus(InstanceStatus.BadConfig, 'Host missing or empty')
	}
}

export function sendCommand(self: evolutionInstance, command: string): void {
	if (self.config.verbose) {
		self.log('debug', `[Sennheiser EW][${self.config.host}] Sending: ${command}`)
	}

	self._socket.send(`${command}\r`, Number(self.config.port), self.config.host)
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
			self._deviceConfig.name = line.replace('Name', '').trim()
			variableObj['name'] = self._deviceConfig.name
		} else if (line.startsWith('FirmwareRevision')) {
			self._deviceConfig.firmwareRevision = lineSplit[1].trim()
			variableObj['firmware_revision'] = self._deviceConfig.firmwareRevision
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
				self.log(
					'info',
					`[Sennheiser EW][${self.config.host}] Got config index change from ${self._deviceConfigIndex} to ${confVersion}.`,
				)
				// Update our stored conf version
				self._deviceConfigIndex = confVersion
				sendCommand(self, 'Frequency')
				sendCommand(self, 'Name')
				sendCommand(self, 'FirmwareRevision')

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

	// TODO: Debounce this so we only send it on change
	if (Object.keys(variableObj).length > 0) {
		self.updateStatus(InstanceStatus.Ok)
	}
	self.setVariableValues(variableObj)
}
