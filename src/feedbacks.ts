import { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { evolutionInstance } from './index.js'

export function UpdateFeedbacks(self: evolutionInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}

	self.setFeedbackDefinitions(feedbacks)
}
