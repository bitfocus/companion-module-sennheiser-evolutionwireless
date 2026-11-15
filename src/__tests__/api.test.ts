// Import the necessary modules and classes
import { evolutionInstance } from '../index.js'

// Mock Companion to get the class
jest.mock('@companion-module/base', () => {
	const original = jest.requireActual('@companion-module/base')
	return {
		...original,
		InstanceBase: jest.fn(),
		runEntrypoint: jest.fn(),
	}
})

import { processData } from '../api.js'

//jest.mock()

// Define the test suite for ModuleInstance
describe('ModuleInstance', () => {
	let instance: evolutionInstance

	beforeEach(() => {
		instance = new evolutionInstance(null)
		instance.config = { host: '1.2.3.4', port: '5678', verbose: true, deviceType: 'SR', updateRate: '500' }
		instance._deviceConfigIndex = 10
		instance.log = jest.fn()
		instance.updateStatus = jest.fn()
		instance.checkFeedbacks = jest.fn()
		instance.setVariableValues = jest.fn()
		instance.setActionDefinitions = jest.fn()
		instance.setFeedbackDefinitions = jest.fn()
		instance.setPresetDefinitions = jest.fn()
		instance.setVariableDefinitions = jest.fn()
		instance._socket = jest.fn()
		instance._socket.send = jest.fn()
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('processData', () => {
		test('should handle mode response', () => {
			// Invoke the method
			const modeResponsePacket = Buffer.from([0x4d, 0x6f, 0x64, 0x65, 0x20, 0x31, 0x0d])
			processData(instance, modeResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				mode: 'stereo',
			})
		})

		// TODO(Peter): Not yet implemented in the connection
		/*test('should handle mute response', () => {
			// Invoke the method
			const muteResponsePacket = Buffer.from([0x4d, 0x75, 0x74, 0x65, 0x20, 0x31, 0x0d])
			processData(instance, muteResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				mute: 'off',
			})
		})*/

		test('should handle firmware revision response', () => {
			// Invoke the method
			const firmwareRevisionResponsePacket = Buffer.from([
				0x46, 0x69, 0x72, 0x6d, 0x77, 0x61, 0x72, 0x65, 0x52, 0x65, 0x76, 0x69, 0x73, 0x69, 0x6f, 0x6e, 0x20,
				0x31, 0x2e, 0x37, 0x2e, 0x30, 0x0d,
			])
			processData(instance, firmwareRevisionResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				firmware_revision: '1.7.0',
			})
		})

		test('should handle sensitivity response', () => {
			// Invoke the method
			const sensitivityResponsePacket = Buffer.from([
				0x53, 0x65, 0x6e, 0x73, 0x69, 0x74, 0x69, 0x76, 0x69, 0x74, 0x79, 0x20, 0x2d, 0x31, 0x38, 0x0d,
			])
			processData(instance, sensitivityResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				sensitivity: '-18',
			})
		})

		test('should handle equalizer response', () => {
			// Invoke the method
			const equalizerResponsePacket = Buffer.from([
				0x45, 0x71, 0x75, 0x61, 0x6c, 0x69, 0x7a, 0x65, 0x72, 0x20, 0x30, 0x20, 0x30, 0x20, 0x30, 0x20, 0x30,
				0x20, 0x30, 0x20, 0x30, 0x0d,
			])
			processData(instance, equalizerResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				equalizer_state: 'off',
				equalizer_low: 0,
				equalizer_low_mid: 0,
				equalizer_mid: 0,
				equalizer_mid_high: 0,
				equalizer_high: 0,
			})
		})

		test('should handle frequency response', () => {
			// Invoke the method
			const frequencyResponsePacket = Buffer.from([
				0x46, 0x72, 0x65, 0x71, 0x75, 0x65, 0x6e, 0x63, 0x79, 0x20, 0x36, 0x32, 0x36, 0x31, 0x35, 0x30, 0x20,
				0x31, 0x20, 0x31, 0x0d,
			])
			processData(instance, frequencyResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				frequency: '626.150',
			})
		})

		test('should handle config response, bigger value', () => {
			// Invoke the method
			const configResponsePacket = Buffer.from([0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x20, 0x31, 0x31, 0x0d])
			processData(instance, configResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({})
			expect(instance._socket.send).toHaveBeenNthCalledWith(1, 'Frequency\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(2, 'Name\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(3, 'FirmwareRevision\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(4, 'Sensitivity\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(5, 'Equalizer\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(6, 'Mode\r', 5678, '1.2.3.4')
			expect(instance._deviceConfigIndex).toEqual(11)
		})

		test('should handle config response, same value', () => {
			// Invoke the method
			const configResponsePacket = Buffer.from([0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x20, 0x31, 0x30, 0x0d])
			processData(instance, configResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({})
			expect(instance._socket.send).not.toHaveBeenCalled()
			expect(instance._deviceConfigIndex).toEqual(10)
		})

		test('should handle config response, smaller value', () => {
			// Invoke the method
			const configResponsePacket = Buffer.from([0x43, 0x6f, 0x6e, 0x66, 0x69, 0x67, 0x20, 0x31, 0x0d])
			processData(instance, configResponsePacket.toString())

			// Assertions
			// We need to fetch data again if it's smaller as it may have wrapped around!
			expect(instance.setVariableValues).toHaveBeenCalledWith({})
			expect(instance._socket.send).toHaveBeenNthCalledWith(1, 'Frequency\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(2, 'Name\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(3, 'FirmwareRevision\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(4, 'Sensitivity\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(5, 'Equalizer\r', 5678, '1.2.3.4')
			expect(instance._socket.send).toHaveBeenNthCalledWith(6, 'Mode\r', 5678, '1.2.3.4')
			expect(instance._deviceConfigIndex).toEqual(1)
		})

		test('should handle multiple responses in one packet', () => {
			// Invoke the method
			const multipleResponsePacket = Buffer.from([
				0x41, 0x46, 0x20, 0x30, 0x20, 0x30, 0x20, 0x30, 0x20, 0x30, 0x0d, 0x53, 0x74, 0x61, 0x74, 0x65, 0x73,
				0x20, 0x31, 0x20, 0x31, 0x0d, 0x4d, 0x73, 0x67, 0x20, 0x52, 0x46, 0x5f, 0x4d, 0x75, 0x74, 0x65, 0x0d,
			])
			processData(instance, multipleResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				af_peak: '0',
				af_peak_1: '0',
				af_peak_2: '0',
				af_peak_hold_1: '0',
				af_peak_hold_2: '0',
				msg: 'RF_Mute',
				rf_mute: 'on',
				rf_mute_flags: '1',
			})
		})

		test('should handle name response', () => {
			// Invoke the method
			const nameResponsePacket = Buffer.from([
				0x4e, 0x61, 0x6d, 0x65, 0x20, 0x2a, 0x2a, 0x32, 0x30, 0x30, 0x30, 0x2a, 0x2a, 0x0d,
			])
			processData(instance, nameResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				name: '**2000**',
			})
		})

		test('should handle name response with space', () => {
			// Invoke the method
			const nameResponsePacket = Buffer.from([
				0x4e, 0x61, 0x6d, 0x65, 0x20, 0x66, 0x6f, 0x6f, 0x20, 0x62, 0x61, 0x72, 0x0d,
			])
			processData(instance, nameResponsePacket.toString())

			// Assertions
			expect(instance.setVariableValues).toHaveBeenCalledWith({
				name: 'foo bar',
			})
		})
	})
})
