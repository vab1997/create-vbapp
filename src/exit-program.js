import { outro, isCancel } from '@clack/prompts'
import colors from 'picocolors'

export function exitProgram ({ code = 0, message = 'Have not been created template' } = {}) {
  outro(colors.bgRed(colors.white(` ${message} `)))
  process.exit(code)
}

export function cancelProcess ({ checkVariable }) {
  if (isCancel(checkVariable)) exitProgram()
}
