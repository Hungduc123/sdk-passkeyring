const fs = require('fs')
const path = require('path')

// Bước 1: Thay thế groupSlug trong file constants/index.ts
const constantsFilePath = path.join(__dirname, 'lib/constants/index.ts')
const newGroupSlug = 'egglepasskeywallet'

fs.readFile(constantsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading constants file:', err)
    return
  }

  const updatedData = data.replace(/export const GROUP_SLUG: SlugGroup = '.*?'/, `export const GROUP_SLUG: SlugGroup = '${newGroupSlug}'`)

  fs.writeFile(constantsFilePath, updatedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing constants file:', err)
      return
    }

    console.log('Constants file updated successfully')

    // Bước 2: Lấy giá trị của name từ package.json và sử dụng nó làm searchString
    const packageJsonPath = path.join(__dirname, 'package.json')
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading package.json:', err)
        return
      }

      const packageJson = JSON.parse(data)
      const searchString = packageJson.name
      const replaceString = `sdk-v2-${newGroupSlug}`

      const directoryPath = path.join(__dirname, 'lib')
      const filesToUpdate = [
        path.join(__dirname, 'README.md'),
        packageJsonPath,
      ]

      function replaceInFile (filePath) {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            return console.log(err)
          }
          const result = data.replace(new RegExp(searchString, 'g'), replaceString)
          fs.writeFile(filePath, result, 'utf8', (err) => {
            if (err) return console.log(err)
          })
        })
      }

      function traverseDirectory (directory) {
        fs.readdir(directory, (err, files) => {
          if (err) {
            return console.log('Unable to scan directory: ' + err)
          }
          files.forEach((file) => {
            const filePath = path.join(directory, file)
            fs.stat(filePath, (err, stat) => {
              if (err) {
                return console.log(err)
              }
              if (stat.isDirectory()) {
                traverseDirectory(filePath)
              } else {
                replaceInFile(filePath)
              }
            })
          })
        })
      }

      traverseDirectory(directoryPath)
      filesToUpdate.forEach(replaceInFile)

      // Bước 3: Chạy lệnh yarn build
      const { exec } = require('child_process')
      exec('yarn build', (err, stdout, stderr) => {
        if (err) {
          console.error('Error executing yarn build:', err)
          return
        }
        console.log('Build completed successfully')
        console.log(stdout)
        console.log(stderr)

        // Bước 4: Chạy lệnh yarn publish
        exec('yarn publish', (err, stdout, stderr) => {
          if (err) {
            console.error('Error executing yarn publish:', err)
            return
          }
          console.log('Publish completed successfully')
          console.log(stdout)
          console.log(stderr)
        })
      })
    })
  })
})