import { cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { intro, outro, select, text, spinner, confirm } from '@clack/prompts'

import { cancelProcess } from './exit-program.js'
import { TEMPLATES_NAMES, LABELS_MENU, LABELS_PACKAGE_MANAGER } from './templateName.js'
import colors from 'picocolors'

const messageWelcome = `${colors.bgYellow(colors.black(` ${LABELS_MENU.create.label} `))}  ${colors.bold(LABELS_MENU.create.description)}`
intro(messageWelcome)

// name project
const nameProject = await text({
  message: `${colors.bgBlue(colors.white(` ${LABELS_MENU.projectName.label} `))}  ${colors.bold(LABELS_MENU.projectName.description)} \n`,
  placeholder: './my-project',
  validate: (value) => {
    if (value.length === 0) return colors.red('Project name cannot be empty')
    if (value.match(/[^a-zA-Z0-9-_.]+/g)) {
      const message = colors.red('Project name can only contain dots, letters, numbers, dashes and underscores')
      return message
    }
  }
})
cancelProcess({ checkVariable: nameProject })

// select template
const project = await select({
  message: `${colors.bgBlue(colors.white(` ${LABELS_MENU.template.label} `))}  ${colors.bold(LABELS_MENU.template.description)} \n`,
  options: Object.entries(TEMPLATES_NAMES).map(([key, { description }]) => ({
    value: key,
    label: description
  }))
})
cancelProcess({ checkVariable: project })

// select install deps
const installDeps = await confirm({
  message: `${colors.bgBlue(colors.white(` ${LABELS_MENU.installDeps.label} `))}  ${colors.bold(LABELS_MENU.installDeps.description)} \n`
})

// pick package manager
let packageManager
if (installDeps) {
  packageManager = await select({
    message: `${colors.bgBlue(colors.white(` ${LABELS_MENU.packageManager.label} `))}  ${colors.bold(LABELS_MENU.packageManager.description)} \n`,
    options: Object.entries(LABELS_PACKAGE_MANAGER).map(([key, value]) => ({
      value: key,
      label: value
    }))
  })
}
cancelProcess({ checkVariable: packageManager })

// confirm install
const shouldContinue = await confirm({
  message: `${colors.bgBlue(colors.white(` ${LABELS_MENU.install.label} `))}  ${colors.bold(LABELS_MENU.install.description)} \n`
})
cancelProcess({ checkVariable: shouldContinue })

// get template path
const template = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'templates',
  project
)

// get destination path
const destination = path.join(process.cwd(), nameProject)

// copy template to destination
const s = spinner()
s.start(colors.bold(`Coping files to ${destination}`))
await cp(template, destination, { recursive: true })
s.stop(colors.bold('Copied files'))

// install deps with package manager picked
if (packageManager) {
  s.start(colors.bold('Installing dependencies'))

  const { exec } = await import('node:child_process')
  const command = `${packageManager} install`

  async function awaitExec () {
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
  await awaitExec()

  s.stop(colors.bold('Installed dependencies'))
}

const messageNextSteps = colors.bgGreen(colors.black('Installation complete!')) + '\n\n' +
  colors.bgYellow(colors.black('next steps:')) + '\n' +
  colors.cyan('cd ' + nameProject) + colors.gray(' (move folder project)') + '\n' +
  `${!packageManager ? colors.cyan('npm install or pnpm install') + colors.gray(' (install dependencies)') : ''}`

outro(messageNextSteps)
