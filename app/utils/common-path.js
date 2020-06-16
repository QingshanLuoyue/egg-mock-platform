const path = require('path')

const mockRootDir = path.resolve(__dirname, '../mock')
const apiSchemaDefineDir = path.resolve(mockRootDir, 'api-schema')
const mockTemplateDir = path.resolve(mockRootDir, 'mock-template')

module.exports = {
    mockRootDir,
    apiSchemaDefineDir,
    mockTemplateDir
}
