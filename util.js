import { exec } from 'node:child_process'
import colors from 'picocolors'

export async function awaitExec ({ command, destination }) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: destination }, (error, stdout, stderr) => {
      if (error) {
        console.log(colors.red(error))
        reject(error)
      }

      console.log('\n')
      console.log(colors.green(stdout))
      console.log(colors.yellow(stderr))
      resolve(stdout || stderr)
    }
    )
  })
}
