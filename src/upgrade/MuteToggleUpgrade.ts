import { Constants } from "../Constants";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MuteToggleUpgrade = (context, config, actions, feedbacks) => {
  let change = false;
  for (let action of actions) {
    if (action.action === Constants.ActionNames.MUTE) {
      if (action.options.mute === false) {
        action.options.mute = "unmute";
        change = true;
      } else if (action.options.mute === true) {
        action.options.mute = "mute";
        change = true;
      }
    }
  }

  return change;
};

export { MuteToggleUpgrade };
