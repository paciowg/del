const program = require('commander')
const request = require('request-promise-native')

const BASE_DIR = './out/fhir/guide/resources'
const DEFAULT_URL = 'localhost:8080/dstu3'

let baseUrl
program
  .usage('<host>')
  .arguments('<host>')
  .action((host) => baseUrl = host)
  .parse(process.argv)
baseUrl = baseUrl || DEFAULT_URL
if (!baseUrl.startsWith('http')) {
  baseUrl = `http://${baseUrl}`
}

main(baseUrl)

/**
 * Load the implementation guide from JSON file.
 */
function getImplementationGuide() {
  return require(`${BASE_DIR}/ig-new.json`)
}

/**
 * For each resources in the IG, try to load the corresponding JSON file.
 * @param {*} ig
 */
function getResources(ig) {
  const output = []
  for (const resource of ig.definition.resource) {
    const [type, ident] = resource.reference.reference.split('/', 2)
    const fileName = `${BASE_DIR}/${type.toLowerCase()}-${ident}.json`
    output.push(require(fileName))
  }
  return output
}

async function uploadResource(url, resource) {
  if (resource.resourceType == 'ImplementationGuide' && resource.id == 1) {
    resource.id = 'IG1'
  }
  const fullUrl = `${url}/${resource.resourceType}/${resource.id}`
  console.log('Sending', fullUrl)
  const response = await request({
    method: 'PUT',
    uri: fullUrl,
    body: JSON.stringify(resource),
    headers: {}
  })
  return response
}

/**
 * Run the main process.
 * @param {*} url
 */
async function main(url) {
  const ig = getImplementationGuide()
  const resources = getResources(ig)

  for (const resource of resources) {
    await uploadResource(url, resource)
  }

  await uploadResource(url, ig)
}
